<template>
  <el-dialog v-model="visible" width="500px" @close="handleClose">
    <template #header>
      <div class="dialog-identity">
        <div class="identity-avatar" :style="{ backgroundColor: avatarColor }">
          {{ avatarText }}
        </div>
        <div class="identity-text">
          <div class="identity-title">修改密码</div>
          <div class="identity-subtitle">
            {{ employee?.name }} · {{ employee?.username }}
          </div>
        </div>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="新密码" prop="newPassword">
        <div class="field-row">
          <el-input
            v-model="formData.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
          <el-button
            class="gen-btn"
            link
            type="primary"
            @click="handleGenerate"
          >
            生成
          </el-button>
        </div>
        <div class="rule-hint">
          <span>{{ ruleHint }}</span>
          <el-button
            class="copy-btn"
            link
            type="primary"
            :disabled="!formData.newPassword"
            @click="handleCopy"
          >
            复制
          </el-button>
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
      <div class="dialog-footer">
        <el-button class="cancel-btn" @click="visible = false">取消</el-button>
        <el-button class="submit-btn" @click="handleConfirm"
          >修改密码</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { getSurnamePinyin, getAvatarColor } from "@/utils/pinyin";
import {
  PASSWORD_MIN,
  PASSWORD_MAX,
  createNewPasswordRules,
  createConfirmPasswordRules,
} from "@/utils/password";

interface TargetEmployee {
  id: number;
  name: string;
  username: string;
}

const props = defineProps<{
  modelValue: boolean;
  employee: TargetEmployee | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "submit", data: { newPassword: string }): void;
  (e: "reset"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<FormInstance>();

const formData = ref({
  newPassword: "",
  confirmPassword: "",
});

const ruleHint = `密码长度 ${PASSWORD_MIN}~${PASSWORD_MAX} 位，不能包含空格`;

const avatarText = computed(() =>
  props.employee ? getSurnamePinyin(props.employee.name).substring(0, 2) : "",
);

const avatarColor = computed(() =>
  props.employee ? getAvatarColor(props.employee.name) : "transparent",
);

const formRules: FormRules = {
  newPassword: createNewPasswordRules(),
  confirmPassword: createConfirmPasswordRules(() => formData.value.newPassword),
};

// 随机字符集：去掉易混淆的 0/O、1/l/I，避免口头告知时读错
const RANDOM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const RANDOM_LENGTH = 12;

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      formData.value.newPassword = "";
      formData.value.confirmPassword = "";
      formRef.value?.clearValidate();
    }
  },
);

function handleGenerate() {
  let password = "";
  for (let i = 0; i < RANDOM_LENGTH; i += 1) {
    password += RANDOM_CHARS.charAt(
      Math.floor(Math.random() * RANDOM_CHARS.length),
    );
  }
  formData.value.newPassword = password;
  formData.value.confirmPassword = password;
  formRef.value?.clearValidate(["newPassword", "confirmPassword"]);
}

async function handleCopy() {
  const value = formData.value.newPassword;
  if (!value) {
    ElMessage.warning("请先生成或输入密码");
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    ElMessage.success("已复制到剪贴板");
  } catch {
    ElMessage.warning("复制失败，请手动选中复制");
  }
}

function handleConfirm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit("submit", { newPassword: formData.value.newPassword });
    }
  });
}

function handleClose() {
  emit("reset");
}
</script>

<style scoped lang="scss">
@use "@/styles/common-page.scss";

/* 头部身份信息：头像 + 姓名/用户名 */
.dialog-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 40px;
}

.identity-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}

.identity-text {
  min-width: 0;
}

.identity-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.identity-subtitle {
  margin-top: 2px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 输入框与「生成」按钮同行 */
.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  :deep(.el-input) {
    flex: 1;
  }
}

.gen-btn,
.copy-btn {
  flex-shrink: 0;
}
</style>
