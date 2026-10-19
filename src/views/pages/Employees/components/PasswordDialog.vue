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

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "submit", data: PasswordFormData): void;
  (e: "reset"): void;
}>();

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

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

const validateConfirmPassword = (
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
) => {
  if (value !== formData.value.newPassword) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const formRules: FormRules = {
  oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
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
      emit("submit", { ...formData.value });
    }
  });
}

function handleClose() {
  emit("reset");
}
</script>

<style scoped lang="scss">
@import "@/styles/common-page.scss";

/* 密码弹窗特有样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
