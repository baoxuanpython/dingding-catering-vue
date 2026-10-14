<template>
  <el-dialog
    v-model="visible"
    title="订单详情"
    width="700px"
    class="detail-dialog"
  >
    <div v-if="orderDetail" class="detail-content">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h4 class="dialog-section-title">基本信息</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">订单号</span>
            <span class="detail-value">{{ orderDetail.number }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">订单状态</span>
            <el-tag :type="getStatusType(orderDetail.status!)" effect="light">
              {{ getStatusText(orderDetail.status!) }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="detail-label">下单人</span>
            <span class="detail-value">{{ orderDetail.userName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系电话</span>
            <span class="detail-value">{{ orderDetail.phone }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">下单时间</span>
            <span class="detail-value">{{
              formatTime(orderDetail.orderTime)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">订单金额</span>
            <span class="detail-value amount-highlight"
              >¥{{ orderDetail.amount?.toFixed(2) }}</span
            >
          </div>
        </div>
      </div>

      <!-- 收货信息 -->
      <div class="detail-section">
        <h4 class="dialog-section-title">收货信息</h4>
        <div class="detail-grid">
          <div class="detail-item full-width">
            <span class="detail-label">收货人</span>
            <span class="detail-value"
              >{{ orderDetail.consignee }} {{ orderDetail.phone }}</span
            >
          </div>
          <div class="detail-item full-width">
            <span class="detail-label">收货地址</span>
            <span class="detail-value">{{ orderDetail.address }}</span>
          </div>
        </div>
      </div>

      <!-- 订单菜品 -->
      <div class="detail-section" v-if="orderDetail.orderDetailList?.length">
        <h4 class="dialog-section-title">订单菜品</h4>
        <div class="dish-list">
          <div
            v-for="(item, index) in orderDetail.orderDetailList"
            :key="index"
            class="dish-item"
          >
            <div class="dish-info">
              <span class="dish-name">{{ item.name }}</span>
              <span v-if="item.dishFlavor" class="dish-flavor">{{
                item.dishFlavor
              }}</span>
            </div>
            <div class="dish-meta">
              <span class="dish-price">¥{{ item.amount?.toFixed(2) }}</span>
              <span class="dish-quantity">×{{ item.number }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 备注 -->
      <div class="detail-section" v-if="orderDetail.remark">
        <h4 class="dialog-section-title">备注</h4>
        <p class="remark-text">{{ orderDetail.remark }}</p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { OrderDetail } from "../api/orderApi";
import { ORDER_STATUS_MAP } from "../types/order";

const props = defineProps<{
  modelValue: boolean;
  orderDetail: OrderDetail | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

function getStatusText(status: number): string {
  return ORDER_STATUS_MAP[status]?.text || "未知";
}

function getStatusType(
  status: number,
): "info" | "warning" | "success" | "danger" | "primary" {
  return ORDER_STATUS_MAP[status]?.type || "info";
}

function formatTime(time?: string | null): string {
  if (!time) return "-";
  return time.replace("T", " ").substring(0, 19);
}
</script>

<style scoped lang="scss">
.detail-dialog {
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.detail-content {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.dialog-section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.detail-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.detail-value {
  font-size: 14px;
  color: var(--text-primary);
}

.amount-highlight {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

/* 菜品列表 */
.dish-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.dish-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dish-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.dish-flavor {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--primary-bg);
  padding: 2px 8px;
  border-radius: 4px;
}

.dish-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dish-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
}

.dish-quantity {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 备注文本 */
.remark-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border-left: 3px solid var(--primary);
}
</style>
