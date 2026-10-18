<template>
  <el-dialog
    v-model="visible"
    title="订单详情"
    width="800px"
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
            <span class="detail-label">结账时间</span>
            <span class="detail-value">{{
              formatTime(orderDetail.checkoutTime)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">支付方式</span>
            <span class="detail-value">{{
              getPayMethodText(orderDetail.payMethod ?? 0)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">支付状态</span>
            <el-tag
              :type="getPayStatusType(orderDetail.payStatus ?? 0)"
              effect="light"
            >
              {{ getPayStatusText(orderDetail.payStatus ?? 0) }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="detail-label">订单金额</span>
            <span class="detail-value amount-highlight"
              >¥{{ (orderDetail.amount ?? 0).toFixed(2) }}</span
            >
          </div>
          <div class="detail-item">
            <span class="detail-label">打包数量</span>
            <span class="detail-value">{{
              orderDetail.packAmount ?? "-"
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">餐具数量</span>
            <span class="detail-value">{{
              orderDetail.tablewareNumber ?? "-"
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">餐具状态</span>
            <span class="detail-value">{{
              getTablewareStatusText(orderDetail.tablewareStatus ?? -1)
            }}</span>
          </div>
        </div>
      </div>

      <!-- 收货信息 -->
      <div class="detail-section">
        <h4 class="dialog-section-title">收货信息</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">收货人</span>
            <span class="detail-value">{{ orderDetail.consignee }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系电话</span>
            <span class="detail-value">{{ orderDetail.phone }}</span>
          </div>
          <div class="detail-item full-width">
            <span class="detail-label">收货地址</span>
            <span class="detail-value">{{ orderDetail.address }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">预计送达时间</span>
            <span class="detail-value">{{
              formatTime(orderDetail.estimatedDeliveryTime)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">配送状态</span>
            <span class="detail-value">{{
              getDeliveryStatusText(orderDetail.deliveryStatus ?? -1)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">送达时间</span>
            <span class="detail-value">{{
              formatTime(orderDetail.deliveryTime)
            }}</span>
          </div>
        </div>
      </div>

      <!-- 套餐区域 -->
      <div class="detail-section" v-if="setmealItems.length">
        <h4 class="dialog-section-title">套餐</h4>
        <div class="setmeal-list">
          <div
            v-for="(item, index) in setmealItems"
            :key="'setmeal-' + index"
            class="setmeal-card"
          >
            <!-- 套餐头部 -->
            <div class="setmeal-header">
              <div class="setmeal-left">
                <el-image
                  v-if="item.image"
                  :src="item.image"
                  fit="cover"
                  class="setmeal-image"
                  :preview-src-list="[item.image]"
                  preview-teleported
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon :size="20"><PictureFilled /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-else class="setmeal-image-placeholder">
                  <el-icon :size="20"><PictureFilled /></el-icon>
                </div>
                <div class="setmeal-info">
                  <span class="setmeal-name">{{ item.name }}</span>
                </div>
              </div>
              <div class="setmeal-right">
                <span class="setmeal-price"
                  >¥{{ (item.amount ?? 0).toFixed(2) }}</span
                >
                <span class="setmeal-quantity"
                  >×{{ item.setmealCopies ?? item.dishCopies }}</span
                >
              </div>
            </div>
            <!-- 套餐内菜品（始终展开） -->
            <div
              class="setmeal-dishes"
              v-if="
                item.setmealVO?.setmealDishes &&
                item.setmealVO.setmealDishes.length
              "
            >
              <div
                v-for="(dish, dIdx) in item.setmealVO.setmealDishes"
                :key="dIdx"
                class="setmeal-dish-item"
              >
                <span class="dish-name">{{ dish.name }}</span>
                <span class="dish-copies">×{{ dish.copies }}</span>
                <!-- 套餐内菜品口味（来自 setmealDishFlavors） -->
                <template v-if="dish.setmealDishFlavors?.length">
                  <div
                    v-for="(flavor, fIdx) in dish.setmealDishFlavors"
                    :key="fIdx"
                    class="flavor-pair"
                  >
                    <span class="flavor-name">{{ flavor.flavorName }}</span>
                    <span class="flavor-value">{{ flavor.flavorValue }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 单独菜品区域 -->
      <div class="detail-section" v-if="singleDishItems.length">
        <h4 class="dialog-section-title">单独菜品</h4>
        <div class="dish-list">
          <div
            v-for="(item, index) in singleDishItems"
            :key="'dish-' + index"
            class="dish-item"
          >
            <div class="dish-left">
              <el-image
                v-if="item.image"
                :src="item.image"
                fit="cover"
                class="dish-image"
                :preview-src-list="[item.image]"
                preview-teleported
              >
                <template #error>
                  <div class="image-error">
                    <el-icon :size="20"><PictureFilled /></el-icon>
                  </div>
                </template>
              </el-image>
              <div v-else class="dish-image-placeholder">
                <el-icon :size="20"><PictureFilled /></el-icon>
              </div>
              <div class="dish-info">
                <span class="dish-name">{{ item.name }}</span>
                <!-- 口味信息 -->
                <template v-if="item.flavorName && item.flavorVal">
                  <div
                    v-for="(pair, pIdx) in parseFlavorPairs(
                      item.flavorName,
                      item.flavorVal,
                    )"
                    :key="pIdx"
                    class="flavor-pair"
                  >
                    <span class="flavor-name">{{ pair.name }}</span>
                    <span class="flavor-value">{{ pair.val }}</span>
                  </div>
                </template>
              </div>
            </div>
            <div class="dish-right">
              <span class="dish-price"
                >¥{{ (item.amount ?? 0).toFixed(2) }}</span
              >
              <span class="dish-quantity">×{{ item.dishCopies }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 取消/拒单信息 -->
      <div
        class="detail-section"
        v-if="orderDetail.cancelReason || orderDetail.rejectionReason"
      >
        <h4 class="dialog-section-title">取消/拒单信息</h4>
        <div class="detail-grid">
          <div class="detail-item" v-if="orderDetail.cancelReason">
            <span class="detail-label">取消原因</span>
            <span class="detail-value cancel-text">{{
              orderDetail.cancelReason
            }}</span>
          </div>
          <div class="detail-item" v-if="orderDetail.cancelTime">
            <span class="detail-label">取消时间</span>
            <span class="detail-value">{{
              formatTime(orderDetail.cancelTime)
            }}</span>
          </div>
          <div
            class="detail-item full-width"
            v-if="orderDetail.rejectionReason"
          >
            <span class="detail-label">拒单原因</span>
            <span class="detail-value cancel-text">{{
              orderDetail.rejectionReason
            }}</span>
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
import { PictureFilled } from "@element-plus/icons-vue";
import type { OrderVO, OrderDetailItem } from "../api/orderApi";
import {
  ORDER_STATUS_MAP,
  PAY_METHOD_MAP,
  PAY_STATUS_MAP,
} from "../types/order";

const props = defineProps<{
  modelValue: boolean;
  orderDetail: OrderVO | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

// 套餐列表（dishId 为空且 setmealId 不为空）
const setmealItems = computed<OrderDetailItem[]>(() => {
  return (
    props.orderDetail?.orderDetailList?.filter(
      (item) => item.dishId == null && item.setmealId != null,
    ) ?? []
  );
});

// 单独菜品列表（dishId 不为空）
const singleDishItems = computed<OrderDetailItem[]>(() => {
  return (
    props.orderDetail?.orderDetailList?.filter((item) => item.dishId != null) ??
    []
  );
});

function getStatusText(status: number): string {
  return ORDER_STATUS_MAP[status]?.text || "未知";
}

function getStatusType(
  status: number,
): "info" | "warning" | "success" | "danger" | "primary" {
  return ORDER_STATUS_MAP[status]?.type || "info";
}

function getPayMethodText(method: number): string {
  return PAY_METHOD_MAP[method] || "未知";
}

function getPayStatusText(status: number): string {
  return PAY_STATUS_MAP[status] || "未知";
}

function getPayStatusType(
  status: number,
): "info" | "success" | "danger" | "warning" | "primary" {
  if (status === 1) return "success";
  if (status === 2) return "danger";
  return "info";
}

function getDeliveryStatusText(status: number): string {
  if (status === 1) return "立即送出";
  if (status === 0) return "指定时间";
  return "-";
}

function getTablewareStatusText(status: number): string {
  if (status === 1) return "按餐量打包";
  if (status === 0) return "自定义数量";
  return "-";
}

function formatTime(time?: string | null): string {
  if (!time) return "-";
  return time.replace("T", " ").substring(0, 19);
}

function parseFlavorPairs(
  flavorName: string,
  flavorVal: string,
): { name: string; val: string }[] {
  const names = flavorName.split(",").map((n) => n.trim());
  const vals = flavorVal.split(",").map((v) => v.trim());
  return names.map((name, i) => ({ name, val: vals[i] || "-" }));
}
</script>

<style scoped lang="scss">
.detail-dialog {
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.detail-content {
  max-height: 65vh;
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

.cancel-text {
  color: var(--danger, #f56c6c);
}

/* 套餐列表 */
.setmeal-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setmeal-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-card-hover);
}

.setmeal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--primary-bg);
  border-bottom: 1px solid var(--border-color);
}

.setmeal-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setmeal-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--primary);
    transform: scale(1.05);
  }

  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--bg-primary);
    color: var(--text-secondary);
  }
}

.setmeal-image-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.setmeal-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setmeal-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.setmeal-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.setmeal-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}

.setmeal-quantity {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 套餐内菜品 */
.setmeal-dishes {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setmeal-dish-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--bg-card) 70%, transparent);
  border-radius: 6px;
  border-left: 3px solid var(--primary);
  flex-wrap: wrap;

  /* 兼容不支持 color-mix 的浏览器 */
  @supports not (background: color-mix(in srgb, red 50%, blue)) {
    background: var(--bg-card);
    opacity: 0.7;
  }
}

.setmeal-dish-item .dish-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.setmeal-dish-item .dish-copies {
  font-size: 12px;
  color: var(--text-secondary);
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
  background: var(--bg-card-hover);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.dish-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dish-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--primary);
    transform: scale(1.05);
  }

  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--bg-primary);
    color: var(--text-secondary);
  }
}

.dish-image-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.dish-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dish-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.flavor-pair {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;

  .flavor-name {
    color: var(--text-secondary);
  }

  .flavor-value {
    color: var(--primary);
    background: var(--primary-bg);
    padding: 1px 6px;
    border-radius: 4px;
  }
}

.dish-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
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
  background: var(--bg-card-hover);
  border-radius: 8px;
  border-left: 3px solid var(--primary);
}
</style>
