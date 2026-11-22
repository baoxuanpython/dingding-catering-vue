<template>
  <div class="workbench-page">
    <!-- SVG 渐变定义 -->
    <svg width="0" height="0" style="position: absolute">
      <defs>
        <linearGradient id="gradient-lime" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--accent-lime)" />
          <stop offset="100%" stop-color="var(--accent-moss)" />
        </linearGradient>
        <linearGradient id="gradient-mint" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--accent-mint)" />
          <stop offset="100%" stop-color="var(--accent-teal)" />
        </linearGradient>
        <linearGradient
          id="gradient-primary"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stop-color="var(--color-primary)" />
          <stop offset="100%" stop-color="var(--color-primary-light)" />
        </linearGradient>
        <linearGradient id="gradient-rose" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--color-danger)" />
          <stop offset="100%" stop-color="var(--color-danger-light)" />
        </linearGradient>
      </defs>
    </svg>

    <!-- 顶部欢迎区 + 营业状态 -->
    <div class="top-section">
      <div class="welcome-card">
        <div class="welcome-text">
          <h1 class="welcome-title">
            <span class="wave-emoji"></span>
            欢迎回来，{{ userName }}
          </h1>
          <p class="welcome-subtitle">今天是 {{ todayDate }}，祝您工作顺利</p>
        </div>
        <div class="shop-status-card" :class="{ 'is-open': shopStatus === 1 }">
          <div class="status-indicator">
            <div
              class="status-dot"
              :class="{ 'dot-pulse': shopStatus === 1 }"
            ></div>
            <span class="status-text">{{
              shopStatus === 1 ? "营业中" : "已打烊"
            }}</span>
          </div>
          <el-switch
            :model-value="shopStatus"
            :active-value="1"
            :inactive-value="0"
            :loading="shopLoading"
            @change="handleShopStatusChange"
            class="shop-switch"
          />
        </div>
      </div>
    </div>

    <!-- 快捷导航 - 主要业务入口 -->
    <div class="section-title">
      <span class="title-bar"></span>
      <span>快捷导航</span>
    </div>
    <div class="nav-grid">
      <div
        v-for="item in navItems"
        :key="item.key"
        class="nav-card"
        :class="`nav-card--${item.key}`"
        @click="goTo(item.path)"
      >
        <div class="nav-card-icon">
          <el-icon :size="22"><component :is="item.icon" /></el-icon>
        </div>
        <div class="nav-card-body">
          <div class="nav-card-title">{{ item.title }}</div>
          <div class="nav-card-desc">{{ item.desc }}</div>
        </div>
        <div v-if="item.value !== undefined" class="nav-card-value">
          {{ item.value }}<span class="nav-card-unit">{{ item.unit }}</span>
        </div>
        <el-icon class="nav-card-arrow"><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 今日运营数据 - 核心指标 -->
    <div class="section-title">
      <span class="title-bar"></span>
      <span>今日运营数据</span>
    </div>
    <div class="business-cards">
      <div class="biz-card turnover-card">
        <div class="biz-card-bg">
          <div class="biz-card-icon">💰</div>
          <div class="biz-card-circle"></div>
        </div>
        <div class="biz-card-content">
          <span class="biz-card-label">营业额</span>
          <span class="biz-card-value"
            >¥ {{ formatNumber(businessData.turnover) }}</span
          >
          <span class="biz-card-unit">元</span>
        </div>
      </div>
      <div class="biz-card order-card">
        <div class="biz-card-bg">
          <div class="biz-card-icon"></div>
          <div class="biz-card-circle"></div>
        </div>
        <div class="biz-card-content">
          <span class="biz-card-label">有效订单</span>
          <span class="biz-card-value">{{ businessData.validOrderCount }}</span>
          <span class="biz-card-unit">单</span>
        </div>
      </div>
      <div class="biz-card user-card">
        <div class="biz-card-bg">
          <div class="biz-card-icon">📊</div>
          <div class="biz-card-circle"></div>
        </div>
        <div class="biz-card-content">
          <span class="biz-card-label">订单完成率 </span>
          <span class="biz-card-value">{{
            businessData.orderCompletionRate
          }}</span>
          <span class="biz-card-unit">%</span>
        </div>
      </div>
      <div class="biz-card rate-card">
        <div class="biz-card-bg">
          <div class="biz-card-icon">👥</div>
          <div class="biz-card-circle"></div>
        </div>
        <div class="biz-card-content">
          <span class="biz-card-label">平均客单价 </span>
          <span class="biz-card-value"
            >¥ {{ businessData.unitPrice.toFixed(2) }}</span
          >
          <span class="biz-card-unit">元</span>
        </div>
      </div>
      <div class="biz-card price-card">
        <div class="biz-card-bg">
          <div class="biz-card-icon">🏷️</div>
          <div class="biz-card-circle"></div>
        </div>
        <div class="biz-card-content">
          <span class="biz-card-label">新增用户</span>
          <span class="biz-card-value">{{ businessData.newUsers }}</span>
          <span class="biz-card-unit">人</span>
        </div>
      </div>
    </div>

    <!-- 订单管理 + 商品总览 -->
    <div class="bottom-section">
      <!-- 订单管理数据 -->
      <div class="panel order-panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="panel-icon"></span>
            订单管理
          </div>
          <span class="panel-total">总计 {{ orderOverview.allOrders }} 单</span>
        </div>
        <div class="order-stats">
          <div
            class="order-stat-item waiting"
            @click="goToOrders(OrderStatus.TO_BE_CONFIRMED)"
          >
            <div class="order-stat-ring">
              <svg class="ring-svg" viewBox="0 0 100 100">
                <circle class="ring-bg" cx="50" cy="50" r="40" />
                <circle
                  class="ring-progress"
                  cx="50"
                  cy="50"
                  r="40"
                  :stroke-dasharray="
                    getRingDash(
                      orderOverview.waitingOrders,
                      orderOverview.allOrders,
                    )
                  "
                  stroke-dashoffset="0"
                />
              </svg>
              <span class="ring-value">{{ orderOverview.waitingOrders }}</span>
            </div>
            <span class="order-stat-label">待接单</span>
          </div>
          <div
            class="order-stat-item delivering"
            @click="goToOrders(OrderStatus.CONFIRMED)"
          >
            <div class="order-stat-ring">
              <svg class="ring-svg" viewBox="0 0 100 100">
                <circle class="ring-bg" cx="50" cy="50" r="40" />
                <circle
                  class="ring-progress"
                  cx="50"
                  cy="50"
                  r="40"
                  :stroke-dasharray="
                    getRingDash(
                      orderOverview.deliveredOrders,
                      orderOverview.allOrders,
                    )
                  "
                  stroke-dashoffset="0"
                />
              </svg>
              <span class="ring-value">{{
                orderOverview.deliveredOrders
              }}</span>
            </div>
            <span class="order-stat-label">待派送</span>
          </div>
          <div
            class="order-stat-item completed"
            @click="goToOrders(OrderStatus.COMPLETED)"
          >
            <div class="order-stat-ring">
              <svg class="ring-svg" viewBox="0 0 100 100">
                <circle class="ring-bg" cx="50" cy="50" r="40" />
                <circle
                  class="ring-progress"
                  cx="50"
                  cy="50"
                  r="40"
                  :stroke-dasharray="
                    getRingDash(
                      orderOverview.completedOrders,
                      orderOverview.allOrders,
                    )
                  "
                  stroke-dashoffset="0"
                />
              </svg>
              <span class="ring-value">{{
                orderOverview.completedOrders
              }}</span>
            </div>
            <span class="order-stat-label">已完成</span>
          </div>
          <div
            class="order-stat-item cancelled"
            @click="goToOrders(OrderStatus.CANCELLED)"
          >
            <div class="order-stat-ring">
              <svg class="ring-svg" viewBox="0 0 100 100">
                <circle class="ring-bg" cx="50" cy="50" r="40" />
                <circle
                  class="ring-progress"
                  cx="50"
                  cy="50"
                  r="40"
                  :stroke-dasharray="
                    getRingDash(
                      orderOverview.cancelledOrders,
                      orderOverview.allOrders,
                    )
                  "
                  stroke-dashoffset="0"
                />
              </svg>
              <span class="ring-value">{{
                orderOverview.cancelledOrders
              }}</span>
            </div>
            <span class="order-stat-label">已取消</span>
          </div>
        </div>
      </div>

      <!-- 商品总览 -->
      <div class="panel goods-panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="panel-icon">🍽️</span>
            商品总览
          </div>
        </div>
        <div class="goods-overview">
          <!-- 菜品 -->
          <div class="goods-category">
            <div class="goods-category-header">
              <span class="goods-category-icon dish-icon">🥘</span>
              <span class="goods-category-name">菜品</span>
            </div>
            <div class="goods-stats-row">
              <div class="goods-stat sold">
                <span class="goods-stat-value">{{ dishOverview.sold }}</span>
                <span class="goods-stat-label">已启售</span>
              </div>
              <div class="goods-stat discontinued">
                <span class="goods-stat-value">{{
                  dishOverview.discontinued
                }}</span>
                <span class="goods-stat-label">已停售</span>
              </div>
            </div>
            <div class="goods-progress">
              <div
                class="goods-progress-bar"
                :style="{
                  width:
                    getGoodsPercent(
                      dishOverview.sold,
                      dishOverview.discontinued,
                    ) + '%',
                }"
              ></div>
            </div>
          </div>
          <!-- 套餐 -->
          <div class="goods-category">
            <div class="goods-category-header">
              <span class="goods-category-icon setmeal-icon">🍱</span>
              <span class="goods-category-name">套餐</span>
            </div>
            <div class="goods-stats-row">
              <div class="goods-stat sold">
                <span class="goods-stat-value">{{ setmealOverview.sold }}</span>
                <span class="goods-stat-label">已启售</span>
              </div>
              <div class="goods-stat discontinued">
                <span class="goods-stat-value">{{
                  setmealOverview.discontinued
                }}</span>
                <span class="goods-stat-label">已停售</span>
              </div>
            </div>
            <div class="goods-progress">
              <div
                class="goods-progress-bar"
                :style="{
                  width:
                    getGoodsPercent(
                      setmealOverview.sold,
                      setmealOverview.discontinued,
                    ) + '%',
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, markRaw } from "vue";
import type { Component } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useShopStore } from "@/stores/shop";
import {
  ArrowRight,
  CoffeeCup,
  DataAnalysis,
  Dish,
  List,
  Menu,
  TakeawayBox,
  UserFilled,
} from "@element-plus/icons-vue";
import { OrderStatus } from "@/views/pages/Orders/types/order";
import {
  getBusinessData,
  getOverviewSetmeals,
  getOverviewDishes,
  getOverviewOrders,
} from "./api/workbenchApi";
import type {
  BusinessData,
  SetmealOverview,
  DishOverview,
  OrderOverview,
} from "./types/workbench";

const userStore = useUserStore();
const shopStore = useShopStore();
const router = useRouter();

const userName = ref(userStore.userInfo?.name || "管理员");
const todayDate = ref("");
const shopStatus = computed(() => shopStore.shopStatus);
const shopLoading = computed(() => shopStore.loading);

const businessData = reactive<BusinessData>({
  turnover: 0,
  validOrderCount: 0,
  orderCompletionRate: 0,
  unitPrice: 0,
  newUsers: 0,
});

const setmealOverview = reactive<SetmealOverview>({
  sold: 0,
  discontinued: 0,
});

const dishOverview = reactive<DishOverview>({
  sold: 0,
  discontinued: 0,
});

const orderOverview = reactive<OrderOverview>({
  waitingOrders: 0,
  deliveredOrders: 0,
  deliveryInProgress: 0,
  allOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
  refunded: 0,
});

const today = new Date();
const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
todayDate.value = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 星期${weekDays[today.getDay()]}`;

/**
 * 快捷导航卡片图标
 * 与侧边栏保持同一套 Element Plus 图标，用 markRaw 避免被 Vue 深度代理
 */
const NAV_ICONS = {
  order: markRaw(List),
  meal: markRaw(Dish),
  combo: markRaw(TakeawayBox),
  category: markRaw(Menu),
  flavor: markRaw(CoffeeCup),
  employee: markRaw(UserFilled),
  statistics: markRaw(DataAnalysis),
};

interface NavItem {
  key: string;
  path: string;
  title: string;
  desc: string;
  icon: Component;
  value?: number;
  unit?: string;
  adminOnly?: boolean;
}

/**
 * 快捷导航项
 * 只有订单/菜品/套餐有工作台级统计接口，其余卡片只展示入口信息
 */
const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [
    {
      key: "order",
      path: "/orders",
      title: "订单管理",
      desc: "接单与派送",
      icon: NAV_ICONS.order,
      value: orderOverview.allOrders,
      unit: "单",
    },
    {
      key: "meal",
      path: "/meals",
      title: "菜品管理",
      desc: "上架与停售",
      icon: NAV_ICONS.meal,
      value: dishOverview.sold + dishOverview.discontinued,
      unit: "道",
    },
    {
      key: "combo",
      path: "/combos",
      title: "套餐管理",
      desc: "组合与上架",
      icon: NAV_ICONS.combo,
      value: setmealOverview.sold + setmealOverview.discontinued,
      unit: "个",
    },
    {
      key: "category",
      path: "/categories",
      title: "分类管理",
      desc: "分类维护",
      icon: NAV_ICONS.category,
    },
    {
      key: "flavor",
      path: "/flavors",
      title: "口味管理",
      desc: "口味配置",
      icon: NAV_ICONS.flavor,
    },
    {
      key: "employee",
      path: "/employees",
      title: "员工管理",
      desc: "账号与权限",
      icon: NAV_ICONS.employee,
      adminOnly: true,
    },
    {
      key: "statistics",
      path: "/statistics",
      title: "数据统计",
      desc: "营业与订单",
      icon: NAV_ICONS.statistics,
    },
  ];
  return items.filter((item) => !item.adminOnly || userStore.isAdmin);
});

function goTo(path: string) {
  router.push(path);
}

/**
 * 点击订单环形图直达订单页，并携带状态筛选
 */
function goToOrders(status: number) {
  router.push({ path: "/orders", query: { status: String(status) } });
}

function formatNumber(num: number): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getRingDash(current: number, total: number): string {
  if (total === 0) return "0 251.2";
  const percent = current / total;
  const circumference = 2 * Math.PI * 40;
  const dashLength = percent * circumference;
  return `${dashLength} ${circumference}`;
}

function getGoodsPercent(sold: number, discontinued: number): number {
  const total = sold + discontinued;
  if (total === 0) return 0;
  return Math.round((sold / total) * 100);
}

async function handleShopStatusChange(val: number) {
  await shopStore.updateShopStatus(val as 0 | 1);
}

async function fetchBusinessData() {
  try {
    const res = await getBusinessData();
    Object.assign(businessData, res);
  } catch {
    // 错误已在拦截器处理
  }
}

async function fetchOverviewSetmeals() {
  try {
    const res = await getOverviewSetmeals();
    Object.assign(setmealOverview, res);
  } catch {
    // 错误已在拦截器处理
  }
}

async function fetchOverviewDishes() {
  try {
    const res = await getOverviewDishes();
    Object.assign(dishOverview, res);
  } catch {
    // 错误已在拦截器处理
  }
}

async function fetchOverviewOrders() {
  try {
    const res = await getOverviewOrders();
    Object.assign(orderOverview, res);
  } catch {
    // 错误已在拦截器处理
  }
}

onMounted(() => {
  shopStore.initShopStatus();
  fetchBusinessData();
  fetchOverviewSetmeals();
  fetchOverviewDishes();
  fetchOverviewOrders();
});
</script>

<style scoped lang="scss">
@use "@/styles/common-page.scss";
@use "@/styles/workbench.scss";

.workbench-page {
  padding: 24px;
  min-height: 100vh;
  background: var(--bg-primary);
  transition: background 0.3s;
}
</style>
