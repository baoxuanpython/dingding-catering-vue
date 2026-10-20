<template>
  <div class="error-placeholder">
    <div class="error-icon">⚠️</div>
    <div class="error-content">
      <h3 class="error-title">此模块加载失败</h3>
      <p class="error-message">{{ message }}</p>

      <!-- 开发环境：显示详细错误信息 -->
      <details v-if="isDev" class="error-details">
        <summary>查看完整错误信息（开发环境）</summary>
        <pre class="error-stack">{{ stack }}</pre>
      </details>
    </div>

    <button class="retry-btn" @click="handleRetry">
      <span class="retry-icon">🔄</span>
      刷新模块
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  message?: string;
  stack?: string;
  componentName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: "组件渲染异常",
  stack: "",
  componentName: "Unknown",
});

const isDev = computed(() => import.meta.env.DEV);

const emit = defineEmits<{
  (e: "retry"): void;
}>();

const handleRetry = () => {
  emit("retry");
};
</script>

<style scoped>
@use "@/styles/error-placeholder.scss";
</style>
