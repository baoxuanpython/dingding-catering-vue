<template>
  <el-dialog
    v-model="visible"
    title="拒单原因"
    width="450px"
    class="reject-dialog"
  >
    <el-input
      v-model="rejectReason"
      type="textarea"
      :rows="4"
      placeholder="请输入拒单原因"
      maxlength="200"
      show-word-limit
    />
    <template #footer>
      <el-button class="cancel-btn" @click="visible = false">取消</el-button>
      <el-button class="confirm-btn" @click="handleConfirm" :loading="loading"
        >确定拒单</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  modelValue: boolean;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "confirm", reason: string): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const rejectReason = ref("");

watch(
  () => props.modelValue,
  (val) => {
    if (val) rejectReason.value = "";
  },
);

function handleConfirm() {
  emit("confirm", rejectReason.value);
}
</script>

<style scoped lang="scss">
@use "@/styles/common-page.scss";

/* 拒单弹窗特有样式 */
.reject-dialog {
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}
</style>
