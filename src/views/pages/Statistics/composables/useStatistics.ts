import { ref, computed, watch } from "vue";
import type { TimeRange } from "../types/statistics";
import type {
  TurnoverReportVO,
  OrderReportVO,
  UserReportVO,
  SalesTop10ReportVO,
} from "../types/statistics";
import {
  getTurnoverStatistics,
  getOrdersStatistics,
  getUserStatistics,
  getTop10,
} from "../api/statisticsApi";

export function useStatistics() {
  const timeRange = ref<TimeRange>("today");
  const customDateRange = ref<[string, string]>(["", ""]);

  const turnoverData = ref<TurnoverReportVO | null>(null);
  const orderData = ref<OrderReportVO | null>(null);
  const userData = ref<UserReportVO | null>(null);
  const top10Data = ref<SalesTop10ReportVO | null>(null);

  const loading = ref(false);

  function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getToday(): string {
    return formatDate(new Date());
  }

  function getYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDate(d);
  }

  function getWeekStart(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diff);
    return formatDate(d);
  }

  function getMonthStart(): string {
    const d = new Date();
    d.setDate(1);
    return formatDate(d);
  }

  const computedDateRange = computed<{ begin: string; end: string }>(() => {
    switch (timeRange.value) {
      case "today": {
        const t = getToday();
        return { begin: t, end: t };
      }
      case "yesterday": {
        const y = getYesterday();
        return { begin: y, end: y };
      }
      case "week":
        return { begin: getWeekStart(), end: getToday() };
      case "month":
        return { begin: getMonthStart(), end: getToday() };
      case "custom":
        return {
          begin: customDateRange.value[0],
          end: customDateRange.value[1],
        };
      default:
        return { begin: getToday(), end: getToday() };
    }
  });

  async function fetchAll() {
    const { begin, end } = computedDateRange.value;
    if (!begin || !end) return;

    loading.value = true;
    try {
      const [turnover, orders, users, top10] = await Promise.all([
        getTurnoverStatistics(begin, end),
        getOrdersStatistics(begin, end),
        getUserStatistics(begin, end),
        getTop10(begin, end),
      ]);
      turnoverData.value = turnover;
      orderData.value = orders;
      userData.value = users;
      top10Data.value = top10;
    } catch {
      // 错误由请求拦截器统一处理
    } finally {
      loading.value = false;
    }
  }

  watch(
    [timeRange, customDateRange],
    () => {
      if (timeRange.value !== "custom") {
        fetchAll();
      }
    },
    { immediate: true },
  );

  watch(
    () => customDateRange.value,
    (val) => {
      if (timeRange.value === "custom" && val[0] && val[1]) {
        fetchAll();
      }
    },
    { deep: true },
  );

  return {
    timeRange,
    customDateRange,
    turnoverData,
    orderData,
    userData,
    top10Data,
    loading,
    computedDateRange,
  };
}
