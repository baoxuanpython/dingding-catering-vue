import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getMessageList, markAllRead as markAllReadApi } from "@/api/message";
import type { MessageItem } from "@/api/message";

const PAGE_SIZE = 20;

/**
 * 消息通知状态
 *
 * - 列表采用滚动加载：每次 20 条，滚到底再拉下一页
 * - 未读数驱动头部铃铛红点
 * - 已读状态全店共享（打开面板即视为全部知会）
 */
export const useMessageStore = defineStore("message", () => {
  const messages = ref<MessageItem[]>([]);
  const total = ref(0);
  const unreadCount = ref(0);
  const page = ref(1);
  const loading = ref(false);
  const orderPushTick = ref(0);
  const orderFocusTick = ref(0);

  let inflightFetch: Promise<boolean> | null = null;

  const finished = computed(() => messages.value.length >= total.value);
  const hasMessage = computed(() => messages.value.length > 0);

  /**
   * 拉取第一页（重置列表）
   * 面板打开、实时收到消息、下拉刷新均复用此方法
   */
  async function fetchFirstPage(): Promise<boolean> {
    if (inflightFetch) return inflightFetch;
    loading.value = true;
    inflightFetch = (async () => {
      try {
        const res = await getMessageList({ page: 1, pageSize: PAGE_SIZE });
        messages.value = res.records ?? [];
        total.value = res.total ?? 0;
        unreadCount.value = res.unreadCount ?? 0;
        page.value = 1;
        return true;
      } catch {
        // 错误提示已由请求拦截器统一处理
        return false;
      } finally {
        loading.value = false;
        inflightFetch = null;
      }
    })();
    return inflightFetch;
  }

  /**
   * 滚动到底部时追加下一页
   */
  async function loadMore() {
    if (loading.value || finished.value) return;
    loading.value = true;
    try {
      const nextPage = page.value + 1;
      const res = await getMessageList({
        page: nextPage,
        pageSize: PAGE_SIZE,
      });
      messages.value = [...messages.value, ...(res.records ?? [])];
      total.value = res.total ?? 0;
      unreadCount.value = res.unreadCount ?? 0;
      page.value = nextPage;
    } catch {
      // 错误提示已由请求拦截器统一处理
    } finally {
      loading.value = false;
    }
  }

  /**
   * 全部标记为已读：清空红点并把本地列表刷成已读态
   */
  async function markAllRead() {
    const allRead =
      unreadCount.value === 0 && messages.value.every((m) => m.isRead === 1);
    if (allRead) return;

    try {
      await markAllReadApi();
      unreadCount.value = 0;
      messages.value = messages.value.map((m) => ({ ...m, isRead: 1 }));
    } catch {
      // 错误提示已由请求拦截器统一处理
    }
  }

  /**
   * 实时收到推送：未读数 +1
   * 列表是否重拉由调用方根据面板是否打开决定
   */
  function increaseUnread() {
    unreadCount.value = Math.min(unreadCount.value + 1, 99);
  }

  /**
   * 收到新订单 / 催单推送时递增，订单页监听后触发局部刷新
   */
  function bumpOrderPush() {
    orderPushTick.value += 1;
  }

  /**
   * 再次点击同一条消息（路由 query 不变）时递增，订单页据此重新查询
   */
  function bumpOrderFocus() {
    orderFocusTick.value += 1;
  }

  function reset() {
    messages.value = [];
    total.value = 0;
    unreadCount.value = 0;
    page.value = 1;
    loading.value = false;
    orderPushTick.value = 0;
    orderFocusTick.value = 0;
    inflightFetch = null;
  }

  return {
    messages,
    total,
    unreadCount,
    page,
    loading,
    finished,
    hasMessage,
    orderPushTick,
    orderFocusTick,
    fetchFirstPage,
    loadMore,
    markAllRead,
    increaseUnread,
    bumpOrderPush,
    bumpOrderFocus,
    reset,
  };
});
