<template>
  <el-dialog
    v-model="visible"
    title="个人信息"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="loading"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="用户名">
        <div class="readonly-field">{{ formData.username }}</div>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="身份证号" prop="idNumber">
        <el-input v-model="formData.idNumber" placeholder="请输入身份证号" />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio value="1">男</el-radio>
          <el-radio value="2">女</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button class="cancel-btn" @click="visible = false">取消</el-button>
      <el-button class="submit-btn" :loading="loading" @click="handleConfirm">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import type { EmployeeForm } from "@/views/pages/Employees/types/employee";

const props = defineProps<{
  modelValue: boolean;
  loading?: boolean;
  formData: EmployeeForm;
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
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  idNumber: [
    { required: true, message: "请输入身份证号", trigger: "blur" },
    {
      pattern: /^\d{17}[\dXx]$/,
      message: "请输入正确的身份证号",
      trigger: "blur",
    },
  ],
  sex: [{ required: true, message: "请选择性别", trigger: "change" }],
};

watch(
  () => props.modelValue,
  (val) => {
    if (val && formRef.value) {
      formRef.value.clearValidate();
    }
  },
);

function handleConfirm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit("submit");
    }
  });
}

function handleClose() {
  formRef.value?.clearValidate();
}
</script>

<style scoped lang="scss">
@use "@/styles/common-page.scss";

/* 用户名只读展示：外观与输入框一致，但不产生光标、不可编辑 */
.readonly-field {
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  padding: 0 11px;
  border-radius: 4px;
  background-color: var(--bg-primary);
  box-shadow: 0 0 0 1px var(--border-color) inset;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: default;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
