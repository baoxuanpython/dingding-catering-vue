<template>
  <el-dialog
    v-model="visible"
    title="修改密码"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="formData.oldPassword"
          type="password"
          placeholder="请输入旧密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="formData.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
        <div class="rule-hint">
          <span>{{ ruleHint }}</span>
        </div>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button class="cancel-btn" @click="visible = false">取消</el-button>
      <el-button class="submit-btn" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import {
  PASSWORD_MIN,
  PASSWORD_MAX,
  createNewPasswordRules,
  createConfirmPasswordRules,
} from "@/utils/password";

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "submit", data: PasswordFormData): void;
  (e: "reset"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<FormInstance>();

const formData = ref<PasswordFormData>({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const ruleHint = `密码长度 ${PASSWORD_MIN}~${PASSWORD_MAX} 位，不能包含空格`;

const formRules: FormRules = {
  oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: createNewPasswordRules({
    getOldPassword: () => formData.value.oldPassword,
  }),
  confirmPassword: createConfirmPasswordRules(() => formData.value.newPassword),
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      formData.value.oldPassword = "";
      formData.value.newPassword = "";
      formData.value.confirmPassword = "";
      formRef.value?.clearValidate();
    }
  },
);

function handleConfirm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit("submit", { ...formData.value });
    }
  });
}

function handleClose() {
  emit("reset");
}
</script>

<style scoped lang="scss">
@use "@/styles/common-page.scss";

/* 密码弹窗特有样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
