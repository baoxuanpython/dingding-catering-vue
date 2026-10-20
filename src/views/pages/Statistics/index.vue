<template>
  <div class="page-container statistics-page">
    <div class="toolbar">
      <div class="time-range-group">
        <el-button
          :type="timeRange === 'today' ? 'primary' : ''"
          @click="timeRange = 'today'"
        >
          今天
        </el-button>
        <el-button
          :type="timeRange === 'yesterday' ? 'primary' : ''"
          @click="timeRange = 'yesterday'"
        >
          昨天
        </el-button>
        <el-button
          :type="timeRange === 'week' ? 'primary' : ''"
          @click="timeRange = 'week'"
        >
          本周
        </el-button>
        <el-button
          :type="timeRange === 'month' ? 'primary' : ''"
          @click="timeRange = 'month'"
        >
          本月
        </el-button>
        <el-date-picker
          v-model="customDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleCustomDateChange"
          style="width: 280px"
        />
      </div>
      <el-button type="primary" @click="showExportDialog = true">
        <el-icon class="icon-primary"><Download /></el-icon>
        导出报表
      </el-button>
    </div>

    <div class="charts-grid" v-loading="loading">
      <div class="panel chart-panel">
        <div class="chart-header">
          <span class="chart-title">营业额统计</span>
        </div>
        <div ref="turnoverChartRef" class="chart-body"></div>
      </div>

      <div class="panel chart-panel">
        <div class="chart-header">
          <span class="chart-title">订单统计</span>
          <div class="order-summary" v-if="orderData">
            <span class="summary-item">
              订单总数 <strong>{{ orderData.totalOrderCount }}</strong>
            </span>
            <span class="summary-item">
              有效订单 <strong>{{ orderData.validOrderCount }}</strong>
            </span>
            <span class="summary-item">
              完成率
              <strong>{{
                formatPercent(orderData.orderCompletionRate)
              }}</strong>
            </span>
          </div>
        </div>
        <div ref="orderChartRef" class="chart-body"></div>
      </div>

      <div class="panel chart-panel">
        <div class="chart-header">
          <span class="chart-title">用户统计</span>
        </div>
        <div ref="userChartRef" class="chart-body"></div>
      </div>

      <div class="panel chart-panel">
        <div class="chart-header">
          <span class="chart-title">销量 Top10</span>
        </div>
        <div ref="top10ChartRef" class="chart-body"></div>
      </div>
    </div>

    <el-dialog v-model="showExportDialog" title="导出运营报表" width="480px">
      <el-radio-group v-model="exportRange" class="export-range-group">
        <el-radio value="today">今天</el-radio>
        <el-radio value="yesterday">昨天</el-radio>
        <el-radio value="week">本周</el-radio>
        <el-radio value="month">本月</el-radio>
        <el-radio value="custom">自定义</el-radio>
      </el-radio-group>
      <div v-if="exportRange === 'custom'" class="export-custom-range">
        <el-date-picker
          v-model="exportCustomDate"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </div>
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleExport"
          :loading="exportLoading"
        >
          导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { Download } from "@element-plus/icons-vue";
import * as echarts from "echarts/core";
import { LineChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useStatistics } from "./composables/useStatistics";
import { exportReport } from "./api/statisticsApi";
import type { TimeRange } from "./types/statistics";
import { useThemeStore } from "@/stores/theme";

echarts.use([
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

const {
  timeRange,
  customDateRange,
  turnoverData,
  orderData,
  userData,
  top10Data,
  loading,
  computedDateRange,
} = useStatistics();

const themeStore = useThemeStore();

const turnoverChartRef = ref<HTMLElement | null>(null);
const orderChartRef = ref<HTMLElement | null>(null);
const userChartRef = ref<HTMLElement | null>(null);
const top10ChartRef = ref<HTMLElement | null>(null);

let turnoverChart: echarts.ECharts | null = null;
let orderChart: echarts.ECharts | null = null;
let userChart: echarts.ECharts | null = null;
let top10Chart: echarts.ECharts | null = null;

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

// --- 导出 ---
const showExportDialog = ref(false);
const exportRange = ref<TimeRange>("today");
const exportCustomDate = ref<[string, string]>(["", ""]);
const exportLoading = ref(false);

function handleCustomDateChange() {
  if (
    customDateRange.value &&
    customDateRange.value[0] &&
    customDateRange.value[1]
  ) {
    timeRange.value = "custom";
  }
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

// --- 图表配置 ---

const chartBaseOptions = {
  tooltip: { trigger: "axis" as const },
  grid: { left: "3%", right: "4%", bottom: "3%", top: 10, containLabel: true },
};

function buildTurnoverOption(data: typeof turnoverData.value) {
  if (!data) return {};
  const dates = data.dateList.split(",");
  const values = data.turnoverList.split(",").map(Number);
  const primary = getCssVar("--color-primary") || "#85ce61";
  const primaryRgb = getCssVar("--primary-rgb") || "133,206,97";
  return {
    ...chartBaseOptions,
    xAxis: { type: "category", data: dates },
    yAxis: { type: "value", axisLabel: { formatter: "¥{value}" } },
    series: [
      {
        type: "line",
        data: values,
        smooth: true,
        lineStyle: { color: primary },
        itemStyle: { color: primary },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `rgba(${primaryRgb},0.3)` },
            { offset: 1, color: `rgba(${primaryRgb},0.02)` },
          ]),
        },
      },
    ],
  };
}

function buildOrderOption(data: typeof orderData.value) {
  if (!data) return {};
  const dates = data.dateList.split(",");
  const totalList = data.orderCountList.split(",").map(Number);
  const validList = data.validOrderCountList.split(",").map(Number);
  const info = getCssVar("--color-info") || "#409eff";
  const success = getCssVar("--color-success") || "#67c23a";
  return {
    ...chartBaseOptions,
    legend: { data: ["全部订单", "有效订单"], top: 0 },
    xAxis: { type: "category", data: dates },
    yAxis: { type: "value" },
    series: [
      {
        name: "全部订单",
        type: "line",
        data: totalList,
        smooth: true,
        lineStyle: { color: info },
        itemStyle: { color: info },
      },
      {
        name: "有效订单",
        type: "line",
        data: validList,
        smooth: true,
        lineStyle: { color: success },
        itemStyle: { color: success },
      },
    ],
  };
}

function buildUserOption(data: typeof userData.value) {
  if (!data) return {};
  const dates = data.dateList.split(",");
  const totalList = data.totalUserList.split(",").map(Number);
  const newList = data.newUserList.split(",").map(Number);
  const warning = getCssVar("--color-warning") || "#e6a23c";
  const info = getCssVar("--color-info") || "#409eff";
  return {
    ...chartBaseOptions,
    legend: { data: ["累计用户", "新增用户"], top: 0 },
    xAxis: { type: "category", data: dates },
    yAxis: { type: "value" },
    series: [
      {
        name: "累计用户",
        type: "line",
        data: totalList,
        smooth: true,
        lineStyle: { color: warning },
        itemStyle: { color: warning },
      },
      {
        name: "新增用户",
        type: "bar",
        data: newList,
        itemStyle: { color: info },
        barMaxWidth: 24,
      },
    ],
  };
}

function buildTop10Option(data: typeof top10Data.value) {
  if (!data) return {};
  const names = data.nameList.split(",");
  const values = data.numberList.split(",").map(Number);
  const primary = getCssVar("--color-primary") || "#409eff";
  const primaryLight = getCssVar("--color-primary-light") || "#85ce61";
  return {
    tooltip: { trigger: "axis" as const, axisPointer: { type: "shadow" } },
    grid: {
      left: "3%",
      right: "8%",
      bottom: "3%",
      top: 10,
      containLabel: true,
    },
    xAxis: { type: "value" },
    yAxis: {
      type: "category",
      data: names.reverse(),
      inverse: true,
    },
    series: [
      {
        type: "bar",
        data: values.reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: primary },
            { offset: 1, color: primaryLight },
          ]),
        },
        barMaxWidth: 20,
      },
    ],
  };
}

function initOrUpdateCharts() {
  nextTick(() => {
    if (turnoverChartRef.value && !turnoverChart) {
      turnoverChart = echarts.init(turnoverChartRef.value);
    }
    if (turnoverChart) {
      turnoverChart.setOption(buildTurnoverOption(turnoverData.value), true);
    }

    if (orderChartRef.value && !orderChart) {
      orderChart = echarts.init(orderChartRef.value);
    }
    if (orderChart) {
      orderChart.setOption(buildOrderOption(orderData.value), true);
    }

    if (userChartRef.value && !userChart) {
      userChart = echarts.init(userChartRef.value);
    }
    if (userChart) {
      userChart.setOption(buildUserOption(userData.value), true);
    }

    if (top10ChartRef.value && !top10Chart) {
      top10Chart = echarts.init(top10ChartRef.value);
    }
    if (top10Chart) {
      top10Chart.setOption(buildTop10Option(top10Data.value), true);
    }
  });
}

watch([turnoverData, orderData, userData, top10Data], () => {
  initOrUpdateCharts();
});

watch(
  () => themeStore.activeThemeName,
  () => {
    nextTick(() => initOrUpdateCharts());
  },
);

function handleResize() {
  turnoverChart?.resize();
  orderChart?.resize();
  userChart?.resize();
  top10Chart?.resize();
}

function disposeCharts() {
  turnoverChart?.dispose();
  orderChart?.dispose();
  userChart?.dispose();
  top10Chart?.dispose();
  turnoverChart = null;
  orderChart = null;
  userChart = null;
  top10Chart = null;
}

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  disposeCharts();
});

// --- 导出 ---

function computeExportDates(): { begin: string; end: string } {
  const today = computedDateRange.value;
  switch (exportRange.value) {
    case "today":
      return today;
    case "yesterday": {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const s = formatExportDate(d);
      return { begin: s, end: s };
    }
    case "week":
      return today;
    case "month":
      return today;
    case "custom":
      return {
        begin: exportCustomDate.value[0] || "",
        end: exportCustomDate.value[1] || "",
      };
    default:
      return today;
  }
}

function formatExportDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function handleExport() {
  const { begin, end } = computeExportDates();
  if (!begin || !end) {
    ElMessage.warning("请选择日期范围");
    return;
  }
  exportLoading.value = true;
  try {
    const blob = (await exportReport(begin, end)) as unknown as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `运营报表_${begin}_${end}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success("导出成功");
    showExportDialog.value = false;
  } catch {
    ElMessage.error("导出失败，请重试");
  } finally {
    exportLoading.value = false;
  }
}
</script>

<style scoped>
.statistics-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.time-range-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.chart-panel {
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.order-summary {
  display: flex;
  gap: 16px;
}

.summary-item {
  font-size: 13px;
  color: var(--text-secondary);
}

.summary-item strong {
  color: var(--text-primary);
  margin-left: 4px;
}

.chart-body {
  flex: 1;
  min-height: 220px;
}

.export-range-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.export-custom-range {
  margin-top: 12px;
  padding-left: 24px;
}
</style>
