<template>
  <el-dialog
    v-model="visible"
    title="取消订单"
    width="450px"
    class="cancel-dialog"
  >
    <el-input
      v-model="cancelReason"
      type="textarea"
      :rows="4"
      placeholder="请输入取消原因"
      maxlength="200"
      show-word-limit
    />
    <template #footer>
      <el-button class="cancel-btn" @click="visible = false">取消</el-button>
      <el-button class="confirm-btn" @click="handleConfirm" :loading="loading"
        >确定取消</el-button
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

const cancelReason = ref("");

watch(
  () => props.modelValue,
  (val) => {
    if (val) cancelReason.value = "";
  },
);

function handleConfirm() {
  emit("confirm", cancelReason.value);
}
</script>

<style scoped lang="scss">
@import "@/styles/common-page.scss";

/* 取消弹窗特有样式 */
.cancel-dialog {
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}
</style>
