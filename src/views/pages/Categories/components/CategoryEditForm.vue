<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑分类' : '新增分类'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="category-form"
    >
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="form.sort"
          :min="0"
          :max="999"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="分类类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :value="1">菜品分类</el-radio>
          <el-radio :value="2">套餐分类</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button class="cancel-btn" @click="visible = false">取消</el-button>
        <el-button
          class="confirm-btn"
          :loading="submitting"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import type { Category } from "../types/category";

interface Props {
  modelValue: boolean;
  categoryData?: Category | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  categoryData: null,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (
    e: "submit",
    data: { id?: number; name: string; sort: number; type: number },
  ): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const isEdit = computed(() => !!props.categoryData?.id);

const formRef = ref<FormInstance>();
const submitting = ref(false);

const form = ref({
  id: 0,
  name: "",
  sort: 0,
  type: 1,
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
  type: [{ required: true, message: "请选择分类类型", trigger: "change" }],
};

watch(
  () => props.categoryData,
  (data) => {
    if (data) {
      form.value = {
        id: data.id,
        name: data.name,
        sort: data.sort,
        type: data.type,
      };
    } else {
      resetForm();
    }
  },
);

function resetForm() {
  form.value = { id: 0, name: "", sort: 0, type: 1 };
}

function handleClose() {
  formRef.value?.resetFields();
  resetForm();
}

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate();
  submitting.value = true;
  try {
    emit("submit", {
      id: isEdit.value ? form.value.id : undefined,
      name: form.value.name,
      sort: form.value.sort,
      type: form.value.type,
    });
    visible.value = false;
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
@import "@/styles/common-page.scss";

/* 分类编辑表单特有样式 */
.category-form {
  padding: 20px 0;
}
</style>
