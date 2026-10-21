<template>
  <div class="page-container">
    <div class="toolbar">
      <div class="btn-group">
        <el-button
          :class="timeRange === 'today' ? 'btn-primary' : 'btn-reset'"
          @click="timeRange = 'today'"
        >
          今天
        </el-button>
        <el-button
          :class="timeRange === 'yesterday' ? 'btn-primary' : 'btn-reset'"
          @click="timeRange = 'yesterday'"
        >
          昨天
        </el-button>
        <el-button
          :class="timeRange === 'week' ? 'btn-primary' : 'btn-reset'"
          @click="timeRange = 'week'"
        >
          本周
        </el-button>
        <el-button
          :class="timeRange === 'month' ? 'btn-primary' : 'btn-reset'"
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
        <el-icon ><Download /></el-icon>
        导出报表
      </el-button>
    </div>

    <div class="charts-grid" v-loading="loading">
      <div class="panel panel--chart">
        <div class="panel-header">
          <span class="panel-title">营业额统计</span>
        </div>
        <div ref="turnoverChartRef" class="chart-body"></div>
      </div>

      <div class="panel panel--chart">
        <div class="panel-header">
          <span class="panel-title">订单统计</span>
          <div class="order-summary" v-if="orderData">
            <span class="panel-total">
              订单总数 <strong>{{ orderData.totalOrderCount }}</strong>
            </span>
            <span class="panel-total">
              有效订单 <strong>{{ orderData.validOrderCount }}</strong>
            </span>
            <span class="panel-total">
              完成率
              <strong>{{
                formatPercent(orderData.orderCompletionRate)
              }}</strong>
            </span>
          </div>
        </div>
        <div ref="orderChartRef" class="chart-body"></div>
      </div>

      <div class="panel panel--chart">
        <div class="panel-header">
          <span class="panel-title">用户统计</span>
        </div>
        <div ref="userChartRef" class="chart-body"></div>
      </div>

      <div class="panel panel--chart">
        <div class="panel-header">
          <span class="panel-title">销量 Top10</span>
        </div>
        <div ref="top10ChartRef" class="chart-body"></div>
      </div>
    </div>

    <el-dialog
      v-model="showExportDialog"
      title="导出运营报表"
      width="480px"
      class="form-dialog"
    >
      <div class="dialog-form">
        <div class="dialog-form-item">
          <label class="dialog-label">时间范围</label>
          <el-select
            v-model="exportRange"
            placeholder="请选择时间范围"
            style="width: 100%"
          >
            <el-option label="今天" value="today" />
            <el-option label="昨天" value="yesterday" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </div>
        <div v-if="exportRange === 'custom'" class="dialog-form-item">
          <label class="dialog-label">自定义日期</label>
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
      </div>
      <template #footer>
        <el-button class="reset-btn" @click="showExportDialog = false"
          >取消</el-button
        >
        <el-button
          class="submit-btn"
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

// ==================== 图表工具函数 ====================

/**
 * 安全分割字符串，处理 null/undefined/空值
 */
function safeSplit(
  str: string | null | undefined,
  defaultValue: string[] = [],
): string[] {
  if (!str || typeof str !== "string") return defaultValue;
  const result = str.split(",").filter((s) => s.trim() !== "");
  return result.length > 0 ? result : defaultValue;
}

/**
 * 解析图表数据，提取公共逻辑
 */
function parseChartData(data: any) {
  if (!data) return { valid: false };
  const isHourMode = data.hourList !== null;
  const xAxisData = isHourMode
    ? safeSplit(data.hourList)
    : safeSplit(data.dateList);
  return { isHourMode, xAxisData, valid: true };
}

/**
 * 获取当前主题的颜色配置（用于主题切换时更新）
 */
function getThemeColors() {
  return {
    textPrimary: getCssVar("--text-primary"),
    textSecondary: getCssVar("--text-secondary"),
    axisLine: getCssVar("--border-color"),
    splitLine: getCssVar("--border-color-light"),
    tooltipBg: getCssVar("--bg-card"),
    tooltipBorder: getCssVar("--border-color"),
    tooltipText: getCssVar("--text-primary"),
  };
}

/**
 * 格式化数字为千分位显示
 */
function formatNumber(value: number): string {
  return value.toLocaleString("zh-CN");
}

/**
 * 格式化时间标签：纯数字（0-23）添加"点"后缀，其他保持原样
 */
function formatTimeLabel(label: string | number): string {
  const str = String(label);
  const num = Number(str);
  if (!isNaN(num) && num >= 0 && num <= 23) {
    return `${num}点`;
  }
  return str;
}

/**
 * 显示空状态图表配置
 */
function showEmptyChart(title?: string) {
  return {
    title: {
      text: title || "暂无数据",
      left: "center",
      top: "40%",
      textStyle: {
        fontSize: 16,
        color: getCssVar("--text-disabled"),
        fontWeight: "normal",
      },
    },
    xAxis: { show: false },
    yAxis: { show: false },
    series: [],
  };
}

// ==================== 增强的基础图表配置 ====================

function getChartBaseOptions() {
  return {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: getCssVar("--bg-card"),
      borderColor: getCssVar("--border-color"),
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: getCssVar("--text-primary"),
        fontSize: 12,
      },
      extraCssText: "border-radius: 8px;",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: 40,
      containLabel: true,
    },
    animationDurationUpdate: 600,
  };
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

// --- 图表配置构建函数 ---

function buildTurnoverOption(data: typeof turnoverData.value) {
  const { xAxisData, valid } = parseChartData(data);
  if (!valid || !data) return showEmptyChart("营业额统计");

  const values = safeSplit(data.turnoverList).map(Number);
  const baseOpts = getChartBaseOptions();
  const primary = getCssVar("--color-primary");
  const primaryRgb = getCssVar("--primary-rgb") || "133,206,97";

  return {
    ...baseOpts,
    tooltip: {
      ...baseOpts.tooltip,
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        const timeLabel = formatTimeLabel(p.name);
        return `<div style="display:flex;justify-content:space-between;align-items:center;min-width:120px;">
          <span>${timeLabel}</span>
          <span style="margin-left:16px;font-weight:600;">¥${formatNumber(p.value)}</span>
        </div>`;
      },
    },
    xAxis: { type: "category", data: xAxisData },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `¥${formatNumber(value)}`,
      },
    },
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
  const { xAxisData, valid } = parseChartData(data);
  if (!valid || !data) return showEmptyChart("订单统计");

  const totalList = safeSplit(data.orderCountList).map(Number);
  const validList = safeSplit(data.validOrderCountList).map(Number);
  const baseOpts = getChartBaseOptions();
  const info = getCssVar("--color-info");
  const success = getCssVar("--color-success");

  return {
    ...baseOpts,
    legend: {
      data: ["全部订单", "有效订单"],
      right: 0,
      top: "center",
      orient: "vertical",
      icon: "roundRect",
      itemWidth: 14,
      itemHeight: 7,
      textStyle: {
        color: getCssVar("--text-secondary"),
        fontSize: 12,
      },
    },
    tooltip: {
      ...baseOpts.tooltip,
      formatter: (params: any[]) => {
        if (!Array.isArray(params)) params = [params];
        const timeLabel = formatTimeLabel(params[0].name);
        let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-weight:600;">${timeLabel}</span>
        </div>`;
        params.forEach((p) => {
          const color = p.color;
          const value = formatNumber(p.value);
          html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
            <span>${p.marker}${p.seriesName}：</span>
            <span style="color:${color};margin-left:16px;font-weight:600;">${value} 单</span>
          </div>`;
        });
        return html;
      },
    },
    grid: {
      left: "3%",
      right: "15%",
      bottom: "3%",
      top: 40,
      containLabel: true,
    },
    xAxis: { type: "category", data: xAxisData },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `${formatNumber(value)} 单`,
      },
    },
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
  const { xAxisData, valid } = parseChartData(data);
  if (!valid || !data) return showEmptyChart("用户统计");

  const totalList = safeSplit(data.totalUserList).map(Number);
  const newList = safeSplit(data.newUserList).map(Number);
  const baseOpts = getChartBaseOptions();
  const warning = getCssVar("--color-warning");
  const info = getCssVar("--color-info");

  return {
    ...baseOpts,
    legend: {
      data: ["累计用户", "新增用户"],
      right: 0,
      top: "center",
      orient: "vertical",
      icon: "roundRect",
      itemWidth: 14,
      itemHeight: 7,
      textStyle: {
        color: getCssVar("--text-secondary"),
        fontSize: 12,
      },
    },
    tooltip: {
      ...baseOpts.tooltip,
      formatter: (params: any[]) => {
        if (!Array.isArray(params)) params = [params];
        const timeLabel = formatTimeLabel(params[0].name);
        let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-weight:600;">${timeLabel}</span>
        </div>`;
        params.forEach((p) => {
          const color = p.color;
          const value = formatNumber(p.value);
          html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
            <span>${p.marker}${p.seriesName}：</span>
            <span style="color:${color};margin-left:16px;font-weight:600;">${value} 人</span>
          </div>`;
        });
        return html;
      },
    },
    grid: {
      left: "3%",
      right: "15%",
      bottom: "3%",
      top: 40,
      containLabel: true,
    },
    xAxis: { type: "category", data: xAxisData },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `${formatNumber(value)} 人`,
      },
    },
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
  if (!data) return showEmptyChart("销量 Top10");

  const names = safeSplit(data.nameList);
  const values = safeSplit(data.numberList).map(Number);
  const baseOpts = getChartBaseOptions();
  const primary = getCssVar("--color-primary");
  const primaryLight = getCssVar("--color-primary-light");

  return {
    ...baseOpts,
    tooltip: {
      ...baseOpts.tooltip,
      axisPointer: { type: "shadow" as const },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        return `<div style="display:flex;justify-content:space-between;align-items:center;min-width:140px;">
          <span>${p.name}</span>
          <span style="margin-left:16px;font-weight:600;color:${primary}">${formatNumber(p.value)} 份</span>
        </div>`;
      },
    },
    grid: {
      left: "3%",
      right: "8%",
      bottom: "3%",
      top: 40,
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `${formatNumber(value)} 份`,
      },
    },
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
    nextTick(() => {
      const colors = getThemeColors();
      const primary = getCssVar("--color-primary");
      const primaryLight = getCssVar("--color-primary-light");
      const info = getCssVar("--color-info");
      const success = getCssVar("--color-success");
      const warning = getCssVar("--color-warning");

      if (turnoverChart) {
        const primaryRgb = getCssVar("--primary-rgb") || "133,206,97";
        turnoverChart.setOption({
          tooltip: {
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder,
            textStyle: { color: colors.tooltipText },
          },
          textStyle: { color: colors.textPrimary },
          series: [
            {
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
        });
      }

      if (orderChart) {
        orderChart.setOption({
          tooltip: {
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder,
            textStyle: { color: colors.tooltipText },
          },
          textStyle: { color: colors.textPrimary },
          legend: { textStyle: { color: colors.textSecondary } },
          series: [
            { lineStyle: { color: info }, itemStyle: { color: info } },
            { lineStyle: { color: success }, itemStyle: { color: success } },
          ],
        });
      }

      if (userChart) {
        userChart.setOption({
          tooltip: {
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder,
            textStyle: { color: colors.tooltipText },
          },
          textStyle: { color: colors.textPrimary },
          legend: { textStyle: { color: colors.textSecondary } },
          series: [
            { lineStyle: { color: warning }, itemStyle: { color: warning } },
            { itemStyle: { color: info } },
          ],
        });
      }

      if (top10Chart) {
        top10Chart.setOption({
          tooltip: {
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder,
            textStyle: { color: colors.tooltipText },
          },
          textStyle: { color: colors.textPrimary },
          series: [
            {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: primary },
                  { offset: 1, color: primaryLight },
                ]),
              },
            },
          ],
        });
      }
    });
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
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.order-summary {
  display: flex;
  gap: 16px;
}

.chart-body {
  flex: 1;
  min-height: 220px;
}
</style>
