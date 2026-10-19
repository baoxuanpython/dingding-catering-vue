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
            <el-select
              v-model="flavor.flavorName"
              placeholder="选择口味类型"
              style="width: 150px"
              @change="handleFlavorTypeChange(index)"
            >
              <el-option
                v-for="f in flavorDictList"
                :key="f.id"
                :label="f.flavorName"
                :value="f.flavorName"
              />
            </el-select>
            <el-select
              v-model="flavor.flavorValue"
              multiple
              placeholder="选择口味值"
              style="flex: 1; margin-left: 8px"
              :disabled="!flavor.flavorName"
            >
              <el-option
                v-for="val in getFlavorValues(flavor.flavorName)"
                :key="val"
                :label="val"
                :value="val"
              />
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
import { computed, ref, watch, onMounted } from "vue";
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

const pendingFile = ref<File | null>(null);
const previewUrl = ref<string>("");

// 口味字典列表
const flavorDictList = ref<
  { id: number; flavorName: string; valueList: string }[]
>([]);

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

// 获取口味字典
async function fetchFlavorDict() {
  try {
    const res =
      await request.get<
        { id: number; flavorName: string; valueList: string }[]
      >("/flavor/list");
    flavorDictList.value = res || [];
  } catch (error) {
    console.error("获取口味字典失败:", error);
  }
}

onMounted(() => {
  fetchFlavorDict();
});

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

function getFlavorValues(flavorName: string): string[] {
  const flavor = flavorDictList.value.find((f) => f.flavorName === flavorName);
  if (!flavor) return [];
  return flavor.valueList.split(",").map((v) => v.trim());
}

function handleFlavorTypeChange(index: number) {
  // 切换口味类型时清空已选口味值
  props.formData.flavors[index].flavorValue = "";
}

function addFlavor() {
  props.formData.flavors.push({
    flavorName: "",
    flavorValue: "",
    valueList: "",
  });
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
@import "@/styles/common-page.scss";

/* 菜品表单弹窗特有样式 */
.dish-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 16px;
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
