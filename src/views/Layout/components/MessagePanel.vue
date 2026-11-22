<template>
  <div class="message-panel">
    <div class="message-panel__header">
      <span class="message-panel__title">消息通知</span>
      <div class="message-panel__actions">
        <span class="message-panel__sub">共 {{ store.total }} 条</span>
        <button
          class="message-panel__mute"
          :class="{ 'message-panel__mute--off': isMuted }"
          :title="isMuted ? '已静音，点击开启提示音' : '点击静音'"
          @click="toggleMute"
        >
          <el-icon :size="14">
            <MuteNotification v-if="isMuted" />
            <BellFilled v-else />
          </el-icon>
        </button>
      </div>
    </div>

    <div ref="listRef" class="message-panel__list" @scroll="handleScroll">
      <el-empty
        v-if="!store.loading && !store.hasMessage"
        description="暂无消息"
        :image-size="60"
      />

      <div
        v-for="item in store.messages"
        :key="item.id"
        class="message-panel__item"
        @click="handleSelect(item)"
      >
        <div
          class="message-panel__icon"
          :class="
            item.type === 2
              ? 'message-panel__icon--reminder'
              : 'message-panel__icon--order'
          "
        >
          <el-icon :size="16">
            <Bell v-if="item.type === 2" />
            <Goods v-else />
          </el-icon>
        </div>
        <div class="message-panel__body">
          <span class="message-panel__content">{{ item.content }}</span>
          <div class="message-panel__meta">
            <span class="message-panel__order">{{
              item.orderNumber || "-"
            }}</span>
            <span class="message-panel__time">{{
              formatTime(item.createTime)
            }}</span>
          </div>
        </div>
        <span v-if="item.isRead === 0" class="message-panel__unread"></span>
      </div>

      <div v-if="store.loading" class="message-panel__footer">
        <el-icon :size="14" class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div
        v-else-if="store.hasMessage && store.finished"
        class="message-panel__footer"
      >
        没有更多了
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  Bell,
  BellFilled,
  Goods,
  Loading,
  MuteNotification,
} from "@element-plus/icons-vue";
import { useMessageStore } from "@/stores/message";
import { useNotificationSound } from "@/composables/useNotificationSound";
import type { MessageItem } from "@/api/message";

const emit = defineEmits<{
  (e: "select", item: MessageItem): void;
}>();

const store = useMessageStore();
const { isMuted, toggleMute } = useNotificationSound();
const listRef = ref<HTMLDivElement | null>(null);

/**
 * 滚动到底部时加载下一页（距底 20px 触发）
 */
function handleScroll() {
  const el = listRef.value;
  if (!el || store.loading) return;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
    store.loadMore();
  }
}

function handleSelect(item: MessageItem) {
  emit("select", item);
}

/**
 * 列表被重置（回到第一页）时把滚动位置拉回顶部
 */
watch(
  () => store.page,
  (page) => {
    if (page === 1) {
      listRef.value?.scrollTo({ top: 0 });
    }
  },
);

function formatTime(time?: string | null): string {
  if (!time) return "-";
  const text = time.replace("T", " ");
  const date = text.substring(5, 10);
  const clock = text.substring(11, 16);
  const now = new Date();
  const today = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  return date === today ? clock : `${date} ${clock}`;
}
</script>
