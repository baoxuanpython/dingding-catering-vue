<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑员工' : '新增员工'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          :disabled="isEdit"
        />
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
      <div class="dialog-footer">
        <el-button class="cancel-btn" @click="visible = false">取消</el-button>
        <el-button class="submit-btn" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import type { EmployeeForm } from "../types/employee";

const props = defineProps<{
  modelValue: boolean;
  isEdit: boolean;
  formData: EmployeeForm;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "submit"): void;
  (e: "reset"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<FormInstance>();

const formRules: FormRules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
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
  emit("reset");
}
</script>

<style scoped lang="scss">
@use "@/styles/common-page.scss";

/* 员工表单弹窗特有样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
