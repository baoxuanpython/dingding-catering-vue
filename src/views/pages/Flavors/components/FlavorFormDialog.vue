<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑口味' : '新增口味'"
    width="600px"
    destroy-on-close
    class="form-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="flavor-form"
    >
      <el-form-item label="口味名称" prop="flavorName">
        <el-input
          v-model="formData.flavorName"
          placeholder="请输入口味名称（如：辣度、咸度、油量）"
          maxlength="32"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="可选值列表" prop="valueList">
        <el-input
          v-model="formData.valueList"
          placeholder="请输入可选值，用逗号分隔（如：不辣,微辣,中辣,特辣）"
          maxlength="200"
          show-word-limit
        />
        <div class="input-tip">多个值用逗号分隔，支持中文或英文逗号</div>
      </el-form-item>

      <el-form-item v-if="previewValues.length > 0" label="预览">
        <div class="preview-tags">
          <el-tag
            v-for="(value, index) in previewValues"
            :key="index"
            size="default"
            type="primary"
          >
            {{ value }}
          </el-tag>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button class="cancel-btn" @click="visible = false">取消</el-button>
      <el-button
        class="submit-btn"
        @click="handleSubmit"
        :loading="submitLoading"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import type { FlavorForm } from "../types/flavor";

const props = defineProps<{
  modelValue: boolean;
  isEdit: boolean;
  submitLoading: boolean;
  formData: FlavorForm;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "submit"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<FormInstance>();

const formRules: FormRules = {
  flavorName: [{ required: true, message: "请输入口味名称", trigger: "blur" }],
  valueList: [
    { required: true, message: "请输入可选值列表", trigger: "blur" },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (!value || value.trim() === "") {
          callback(new Error("请输入可选值列表"));
        } else {
          const values = value.split(/[,，]/).filter((v) => v.trim());
          if (values.length === 0) {
            callback(new Error("至少需要输入一个可选值"));
          } else {
            callback();
          }
        }
      },
      trigger: "blur",
    },
  ],
};

const previewValues = computed(() => {
  if (!props.formData.valueList) return [];
  return props.formData.valueList
    .split(/[,，]/)
    .map((v) => v.trim())
    .filter((v) => v);
});

watch(
  () => props.modelValue,
  (val) => {
    if (val && formRef.value) {
      formRef.value.clearValidate();
    }
  },
);

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      // 统一转换为英文逗号分隔
      props.formData.valueList = props.formData.valueList
        .split(/[,，]/)
        .map((v) => v.trim())
        .filter((v) => v)
        .join(",");
      emit("submit");
    }
  });
}
</script>

<style scoped lang="scss">
@use "@/styles/common-page.scss";

/* 口味表单弹窗特有样式 */
.flavor-form {
  padding-right: 16px;
}
</style>
