<template>
  <div class="workbench-page">
    <!-- SVG 渐变定义 -->
    <svg width="0" height="0" style="position: absolute">
      <defs>
        <linearGradient id="gradient-lime" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#cddc39" />
          <stop offset="100%" stop-color="#8bc34a" />
        </linearGradient>
        <linearGradient id="gradient-mint" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00bcd4" />
          <stop offset="100%" stop-color="#26a69a" />
        </linearGradient>
        <linearGradient
          id="gradient-primary"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stop-color="#4caf50" />
          <stop offset="100%" stop-color="#81c784" />
        </linearGradient>
        <linearGradient id="gradient-rose" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f44336" />
          <stop offset="100%" stop-color="#e57373" />
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
            v-model="shopStatus"
            :active-value="1"
            :inactive-value="0"
            @change="handleShopStatusChange"
            class="shop-switch"
          />
        </div>
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
          <div class="order-stat-item waiting">
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
          <div class="order-stat-item delivering">
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
          <div class="order-stat-item completed">
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
          <div class="order-stat-item cancelled">
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
import { ref, reactive, onMounted, computed } from "vue";
import { useUserStore } from "@/stores/user";
import { useShopStore } from "@/stores/shop";
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

const userName = ref(userStore.userInfo?.username || "管理员");
const todayDate = ref("");
const shopStatus = computed(() => shopStore.shopStatus);

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
  allOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
});

const today = new Date();
const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
todayDate.value = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 星期${weekDays[today.getDay()]}`;

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
.workbench-page {
  padding: 24px;
  min-height: 100vh;
  background: var(--bg-primary);
  transition: background 0.3s;
}

/* 顶部欢迎区 */
.top-section {
  margin-bottom: 24px;
}

.welcome-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  background: linear-gradient(135deg, #e8f5e9 0%, #f0f7f4 50%, #ffffff 100%);
  border-radius: 16px;
  box-shadow:
    var(--shadow-light),
    0 0 30px rgba(76, 175, 80, 0.1);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      rgba(76, 175, 80, 0.08) 0%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
  }

  &:hover {
    box-shadow:
      var(--shadow),
      0 0 40px rgba(76, 175, 80, 0.15);
    transform: translateY(-2px);
  }
}

.welcome-text {
  .welcome-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wave-emoji {
    display: inline-block;
    animation: wave 2.5s ease-in-out infinite;
    transform-origin: 70% 70%;
  }

  .welcome-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
  }
}

.shop-status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &.is-open {
    background: rgba(103, 194, 58, 0.1);
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #909399;
    transition: background 0.3s;

    &.dot-pulse {
      background: var(--primary);
      animation: pulse 2s ease-in-out infinite;
    }
  }

  .status-text {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .shop-switch {
    :deep(.el-switch__core) {
      --el-switch-on-color: var(--primary);
    }
  }
}

/* 区块标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.title-bar {
  width: 4px;
  height: 20px;
  border-radius: 2px;
  background: var(--primary);
}

/* 今日运营数据卡片 */
.business-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.biz-card {
  position: relative;
  padding: 24px 20px;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: default;
  border: 1px solid transparent;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(76, 175, 80, 0.3) 50%,
      transparent 100%
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-glow);

    &::before {
      opacity: 1;
    }
  }

  .biz-card-bg {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;

    .biz-card-icon {
      position: absolute;
      top: 12px;
      right: 16px;
      font-size: 28px;
      opacity: 0.15;
      transition: all 0.3s;
    }

    .biz-card-circle {
      position: absolute;
      bottom: -30px;
      right: -30px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      opacity: 0.08;
      transition: all 0.3s;
    }
  }

  .biz-card-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .biz-card-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .biz-card-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
  }

  .biz-card-unit {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.turnover-card {
  background: linear-gradient(
    135deg,
    rgba(103, 194, 58, 0.12) 0%,
    rgba(103, 194, 58, 0.04) 100%
  );
  border: 1px solid rgba(103, 194, 58, 0.15);

  .biz-card-value {
    color: var(--primary);
  }

  .biz-card-circle {
    background: var(--primary);
  }
}

.order-card {
  background: linear-gradient(
    135deg,
    rgba(64, 158, 255, 0.12) 0%,
    rgba(64, 158, 255, 0.04) 100%
  );
  border: 1px solid rgba(64, 158, 255, 0.15);

  .biz-card-value {
    color: #409eff;
  }

  .biz-card-circle {
    background: #409eff;
  }
}

.user-card {
  background: linear-gradient(
    135deg,
    rgba(230, 162, 60, 0.12) 0%,
    rgba(230, 162, 60, 0.04) 100%
  );
  border: 1px solid rgba(230, 162, 60, 0.15);

  .biz-card-value {
    color: #e6a23c;
  }

  .biz-card-circle {
    background: #e6a23c;
  }
}

.rate-card {
  background: linear-gradient(
    135deg,
    rgba(144, 147, 153, 0.12) 0%,
    rgba(144, 147, 153, 0.04) 100%
  );
  border: 1px solid rgba(144, 147, 153, 0.15);

  .biz-card-value {
    color: #909399;
  }

  .biz-card-circle {
    background: #909399;
  }
}

.price-card {
  background: linear-gradient(
    135deg,
    rgba(103, 194, 58, 0.12) 0%,
    rgba(82, 155, 46, 0.04) 100%
  );
  border: 1px solid rgba(82, 155, 46, 0.15);

  .biz-card-value {
    color: var(--primary-dark);
  }

  .biz-card-circle {
    background: var(--primary-dark);
  }
}

/* 底部面板区域 */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.panel {
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fdf9 100%);
  border-radius: 16px;
  box-shadow:
    var(--shadow-light),
    0 0 20px rgba(76, 175, 80, 0.05);
  transition: all 0.3s;
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      var(--primary) 0%,
      var(--primary-light) 50%,
      var(--accent-mint) 100%
    );
    background-size: 200% 100%;
    animation: gradient-flow 4s ease infinite;
  }

  &:hover {
    box-shadow:
      var(--shadow),
      0 0 30px rgba(76, 175, 80, 0.1);
    transform: translateY(-2px);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);

  .panel-icon {
    font-size: 20px;
  }
}

.panel-total {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 订单统计环形图 */
.order-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.order-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);

    .ring-svg {
      filter: drop-shadow(0 0 8px currentColor);
    }
  }
}

.order-stat-ring {
  position: relative;
  width: 90px;
  height: 90px;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(76, 175, 80, 0.05) 0%,
      transparent 70%
    );
    animation: breathe 3s ease-in-out infinite;
  }
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  transition: all 0.3s;
}

.ring-bg {
  fill: none;
  stroke: var(--border-color);
  stroke-width: 8;
  opacity: 0.3;
}

.ring-progress {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease;
  animation: ring-pulse 2s ease-in-out infinite;
}

.ring-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  transition: all 0.3s;
}

.order-stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.3s;
}

/* 环形图颜色 - 清新薄荷风 */
.waiting .ring-progress {
  stroke: url(#gradient-lime);
  animation: ring-pulse-lime 2s ease-in-out infinite;
}

.delivering .ring-progress {
  stroke: url(#gradient-mint);
  animation: ring-pulse-mint 2s ease-in-out infinite;
}

.completed .ring-progress {
  stroke: url(#gradient-primary);
  animation: ring-pulse-green 2s ease-in-out infinite;
}

.cancelled .ring-progress {
  stroke: url(#gradient-rose);
  animation: ring-pulse-rose 2s ease-in-out infinite;
}

/* 商品总览 */
.goods-overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.goods-category {
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fdf9 100%);
  border: 1px solid var(--border-light);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(
      180deg,
      var(--primary) 0%,
      var(--primary-light) 100%
    );
    border-radius: 2px;
  }

  &:hover {
    border-color: var(--primary-lighter);
    box-shadow: var(--shadow-light);
    transform: translateX(4px);

    .goods-category-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }
}

.goods-category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.goods-category-icon {
  font-size: 24px;
  transition: all 0.3s;
}

.goods-category-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.goods-stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.goods-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.goods-stat-value {
  font-size: 24px;
  font-weight: 700;
}

.goods-stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.goods-stat.sold .goods-stat-value {
  color: var(--primary);
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.2);
}

.goods-stat.discontinued .goods-stat-value {
  color: #f44336;
  text-shadow: 0 0 10px rgba(244, 67, 54, 0.2);
}

.goods-progress {
  height: 8px;
  border-radius: 4px;
  background: var(--bg-card);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

.goods-progress-bar {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--primary),
    var(--primary-light),
    var(--accent-mint)
  );
  background-size: 200% 100%;
  animation: gradient-flow 3s ease infinite;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    animation: shimmer 2.5s ease-in-out infinite;
  }
}

/* 动画 */
@keyframes wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(14deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  30% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(10deg);
  }
  60%,
  100% {
    transform: rotate(0deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

/* 呼吸动画 */
@keyframes breathe {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}

/* 环形图脉冲动画 - 青柠色 */
@keyframes ring-pulse-lime {
  0%,
  100% {
    opacity: 1;
    filter: drop-shadow(0 0 4px rgba(205, 220, 57, 0.6));
  }
  50% {
    opacity: 0.85;
    filter: drop-shadow(0 0 8px rgba(205, 220, 57, 0.8));
  }
}

/* 环形图脉冲动画 - 薄荷色 */
@keyframes ring-pulse-mint {
  0%,
  100% {
    opacity: 1;
    filter: drop-shadow(0 0 4px rgba(0, 188, 212, 0.6));
  }
  50% {
    opacity: 0.85;
    filter: drop-shadow(0 0 8px rgba(0, 188, 212, 0.8));
  }
}

/* 环形图脉冲动画 - 绿色 */
@keyframes ring-pulse-green {
  0%,
  100% {
    opacity: 1;
    filter: drop-shadow(0 0 4px rgba(76, 175, 80, 0.6));
  }
  50% {
    opacity: 0.85;
    filter: drop-shadow(0 0 8px rgba(76, 175, 80, 0.8));
  }
}

/* 环形图脉冲动画 - 玫瑰色 */
@keyframes ring-pulse-rose {
  0%,
  100% {
    opacity: 1;
    filter: drop-shadow(0 0 4px rgba(244, 67, 54, 0.6));
  }
  50% {
    opacity: 0.85;
    filter: drop-shadow(0 0 8px rgba(244, 67, 54, 0.8));
  }
}

/* 流光动画 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 渐变流动动画 */
@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 深色主题适配 */
:deep(.el-switch__core) {
  --el-switch-on-color: var(--primary);
}

/* 响应式 */
@media (max-width: 1400px) {
  .business-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1000px) {
  .business-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .bottom-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .workbench-page {
    padding: 16px;
  }

  .welcome-card {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .business-cards {
    grid-template-columns: 1fr;
  }

  .order-stats {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>

<!-- 深色主题全局样式 -->
<style lang="scss">
html.dark {
  .workbench-page {
    .welcome-card {
      background: linear-gradient(
        135deg,
        #1e3a1e 0%,
        #16213e 50%,
        #1a1a2e 100%
      );
      box-shadow:
        var(--shadow-light),
        0 0 30px rgba(133, 206, 97, 0.1);

      &::before {
        background: radial-gradient(
          circle,
          rgba(133, 206, 97, 0.1) 0%,
          transparent 70%
        );
      }

      &:hover {
        box-shadow:
          var(--shadow),
          0 0 40px rgba(133, 206, 97, 0.15);
      }
    }

    .shop-status-card {
      background: rgba(255, 255, 255, 0.05);

      &.is-open {
        background: rgba(133, 206, 97, 0.15);
      }

      .status-dot {
        background: #909399;

        &.dot-pulse {
          background: var(--primary);
        }
      }

      .status-text {
        color: var(--text-primary);
      }
    }

    .biz-card {
      &::before {
        background: linear-gradient(
          135deg,
          transparent 0%,
          rgba(133, 206, 97, 0.4) 50%,
          transparent 100%
        );
      }

      &:hover {
        box-shadow: var(--shadow-glow);
      }

      .biz-card-icon {
        opacity: 0.2;
      }

      .biz-card-circle {
        opacity: 0.12;
      }
    }

    .turnover-card {
      background: linear-gradient(
        135deg,
        rgba(133, 206, 97, 0.15) 0%,
        rgba(133, 206, 97, 0.05) 100%
      );
      border-color: rgba(133, 206, 97, 0.2);
    }

    .order-card {
      background: linear-gradient(
        135deg,
        rgba(0, 188, 212, 0.15) 0%,
        rgba(0, 188, 212, 0.05) 100%
      );
      border-color: rgba(0, 188, 212, 0.2);

      .biz-card-value {
        color: #26c6da !important;
      }

      .biz-card-circle {
        background: #26c6da !important;
      }
    }

    .user-card {
      background: linear-gradient(
        135deg,
        rgba(255, 152, 0, 0.15) 0%,
        rgba(255, 152, 0, 0.05) 100%
      );
      border-color: rgba(255, 152, 0, 0.2);

      .biz-card-value {
        color: #ffa726 !important;
      }

      .biz-card-circle {
        background: #ffa726 !important;
      }
    }

    .rate-card {
      background: linear-gradient(
        135deg,
        rgba(158, 158, 158, 0.15) 0%,
        rgba(158, 158, 158, 0.05) 100%
      );
      border-color: rgba(158, 158, 158, 0.2);

      .biz-card-value {
        color: #bdbdbd !important;
      }

      .biz-card-circle {
        background: #bdbdbd !important;
      }
    }

    .price-card {
      background: linear-gradient(
        135deg,
        rgba(133, 206, 97, 0.15) 0%,
        rgba(103, 194, 58, 0.05) 100%
      );
      border-color: rgba(103, 194, 58, 0.2);

      .biz-card-value {
        color: var(--primary-light) !important;
      }

      .biz-card-circle {
        background: var(--primary-light) !important;
      }
    }

    .panel {
      background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
      border-color: var(--border-color);
      box-shadow:
        var(--shadow-light),
        0 0 20px rgba(133, 206, 97, 0.05);

      &::before {
        background: linear-gradient(
          90deg,
          var(--primary) 0%,
          var(--primary-light) 50%,
          var(--accent-mint) 100%
        );
      }

      &:hover {
        box-shadow:
          var(--shadow),
          0 0 30px rgba(133, 206, 97, 0.1);
      }
    }

    .goods-category {
      background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
      border-color: var(--border-color);

      &::before {
        background: linear-gradient(
          180deg,
          var(--primary) 0%,
          var(--primary-light) 100%
        );
      }

      &:hover {
        border-color: var(--primary);
      }
    }

    .goods-stat.sold .goods-stat-value {
      color: var(--primary);
      text-shadow: 0 0 10px rgba(133, 206, 97, 0.3);
    }

    .goods-stat.discontinued .goods-stat-value {
      color: #ef5350;
      text-shadow: 0 0 10px rgba(239, 83, 80, 0.3);
    }

    .goods-progress {
      background: var(--bg-card);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .order-stat-ring::before {
      background: radial-gradient(
        circle,
        rgba(133, 206, 97, 0.08) 0%,
        transparent 70%
      );
    }

    .ring-bg {
      stroke: var(--border-color);
      opacity: 0.2;
    }

    .ring-value {
      color: var(--text-primary);
    }

    .order-stat-label {
      color: var(--text-secondary);
    }

    /* 环形图深色主题光晕 */
    .waiting .ring-progress {
      filter: drop-shadow(0 0 4px rgba(205, 220, 57, 0.5));
    }

    .delivering .ring-progress {
      filter: drop-shadow(0 0 4px rgba(38, 198, 218, 0.5));
    }

    .completed .ring-progress {
      filter: drop-shadow(0 0 4px rgba(133, 206, 97, 0.5));
    }

    .cancelled .ring-progress {
      filter: drop-shadow(0 0 4px rgba(239, 83, 80, 0.5));
    }
  }
}
</style>
