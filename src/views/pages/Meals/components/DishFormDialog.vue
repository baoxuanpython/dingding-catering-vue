<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑菜品' : '新增菜品'"
    width="650px"
    destroy-on-close
    class="form-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="dish-form"
    >
      <el-form-item label="菜品名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入菜品名称"
          maxlength="32"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="菜品分类" prop="categoryId">
        <el-select
          v-model="formData.categoryId"
          placeholder="请选择分类"
          style="width: 100%"
        >
          <el-option
            v-for="cat in categoryList"
            :key="cat.id"
            :label="cat.name"
            :value="cat.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="售价" prop="price">
        <el-input-number
          v-model="formData.price"
          :min="0"
          :precision="2"
          :step="0.5"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="菜品图片" prop="image">
        <el-upload
          class="avatar-uploader"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          accept=".jpg,.jpeg,.png,.webp"
        >
          <img v-if="previewUrl" :src="previewUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="upload-tip">支持 jpg、png、webp 格式，大小不超过 2MB</div>
      </el-form-item>

      <el-form-item label="菜品口味" prop="flavors">
        <div class="flavor-list">
          <div
            v-for="(flavor, index) in formData.flavors"
            :key="index"
            class="flavor-item"
          >
            <el-input
              v-model="flavor.name"
              placeholder="口味名（如：辣度）"
              style="width: 150px"
            />
            <el-select
              v-model="flavor.value"
              multiple
              placeholder="选择选项"
              style="flex: 1; margin-left: 8px"
            >
              <el-option label="微辣" value="微辣" />
              <el-option label="中辣" value="中辣" />
              <el-option label="重辣" value="重辣" />
              <el-option label="不辣" value="不辣" />
            </el-select>
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="removeFlavor(index)"
              style="margin-left: 8px"
            />
          </div>
          <el-button
            type="primary"
            plain
            @click="addFlavor"
            style="margin-top: 8px"
          >
            <el-icon><Plus /></el-icon> 添加口味
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="菜品描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入菜品描述"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button class="cancel-btn" @click="visible = false">取消</el-button>
      <el-button
        class="submit-btn"
        @click="handleConfirm"
        :loading="submitLoading"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules, UploadProps } from "element-plus";
import type { DishForm } from "../types/dish";
import request from "@/utils/request";

const props = defineProps<{
  modelValue: boolean;
  isEdit: boolean;
  submitLoading: boolean;
  formData: DishForm;
  categoryList: { id: number; name: string }[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "submit", imageUrl?: string): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<FormInstance>();

// 暂存待上传的文件和预览 URL
const pendingFile = ref<File | null>(null);
const previewUrl = ref<string>("");

const formRules: FormRules = {
  name: [{ required: true, message: "请输入菜品名称", trigger: "blur" }],
  categoryId: [
    { required: true, message: "请选择菜品分类", trigger: "change" },
  ],
  price: [
    { required: true, message: "请输入售价", trigger: "blur" },
    { type: "number", min: 0, message: "售价不能为负数", trigger: "blur" },
  ],
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initPreview();
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    } else {
      cleanupPreview();
    }
  },
);

function initPreview() {
  cleanupPreview();
  if (props.formData.image) {
    previewUrl.value = props.formData.image;
    pendingFile.value = null;
  } else {
    previewUrl.value = "";
    pendingFile.value = null;
  }
}

function cleanupPreview() {
  if (pendingFile.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  pendingFile.value = null;
  previewUrl.value = "";
}

function handleFileChange(file: any) {
  const rawFile = file.raw as File;
  if (!rawFile) return;

  const isImage = rawFile.type.startsWith("image/");
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("只能上传 JPG、PNG、WebP 格式的图片！");
    return;
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB！");
    return;
  }

  cleanupPreview();
  pendingFile.value = rawFile;
  previewUrl.value = URL.createObjectURL(rawFile);
}

const beforeUpload: UploadProps["beforeUpload"] = () => {
  return false;
};

async function uploadImage(): Promise<string | null> {
  if (!pendingFile.value) {
    return props.formData.image || null;
  }

  const uploadFormData = new FormData();
  uploadFormData.append("file", pendingFile.value);

  try {
    const imageUrl = await request.post<string>(
      "/common/upload",
      uploadFormData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return imageUrl;
  } catch {
    ElMessage.error("图片上传失败，请重试");
    return null;
  }
}

function addFlavor() {
  props.formData.flavors.push({ name: "", value: [] });
}

function removeFlavor(index: number) {
  props.formData.flavors.splice(index, 1);
}

async function handleConfirm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return;

    const imageUrl = await uploadImage();
    if (imageUrl === null && pendingFile.value) {
      return;
    }

    emit("submit", imageUrl || undefined);
  });
}
</script>

<style scoped lang="scss">
.form-dialog {
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.dish-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 16px;
}

/* 图片上传 */
.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--primary);
    }
  }
}

.avatar {
  width: 148px;
  height: 148px;
  display: block;
  object-fit: cover;
  border-radius: 8px;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: var(--text-secondary);
  width: 148px;
  height: 148px;
  text-align: center;
  line-height: 148px;
  border-radius: 8px;
  background: var(--input-bg);
}

.upload-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
}

/* 口味列表 */
.flavor-list {
  width: 100%;
}

.flavor-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
</style>
