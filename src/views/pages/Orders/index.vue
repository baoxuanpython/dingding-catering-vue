<template>
  <div class="page-container orders-page">
    <!-- 顶部统计卡片 -->
    <div class="stats-row">
      <div
        class="stat-card stat-all"
        :class="{
          'stat-active': activeStatus === undefined && !isCustomQuery,
          'stat-custom': isCustomQuery,
        }"
        @click="handleStatusFilter(undefined)"
      >
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <span class="stat-value">{{ displayCount }}</span>
          <span class="stat-label">{{
            isCustomQuery ? "指定查询订单" : "全部订单"
          }}</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
      <div
        class="stat-card stat-pending"
        :class="{ 'stat-active': activeStatus === 2 && !isCustomQuery }"
        @click="handleStatusFilter(2)"
      >
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.toBeConfirmed }}</span>
          <span class="stat-label">待接单</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
      <div
        class="stat-card stat-confirmed"
        :class="{ 'stat-active': activeStatus === 3 && !isCustomQuery }"
        @click="handleStatusFilter(3)"
      >
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.confirmed }}</span>
          <span class="stat-label">待派送</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
      <div
        class="stat-card stat-delivering"
        :class="{ 'stat-active': activeStatus === 4 && !isCustomQuery }"
        @click="handleStatusFilter(4)"
      >
        <div class="stat-icon">🚚</div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.deliveryInProgress }}</span>
          <span class="stat-label">派送中</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
      <div
        class="stat-card stat-completed"
        :class="{ 'stat-active': activeStatus === 5 && !isCustomQuery }"
        @click="handleStatusFilter(5)"
      >
        <div class="stat-icon">🎉</div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.completed }}</span>
          <span class="stat-label">已完成</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
      <div
        class="stat-card stat-cancelled"
        :class="{ 'stat-active': activeStatus === 6 && !isCustomQuery }"
        @click="handleStatusFilter(6)"
      >
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.cancelled }}</span>
          <span class="stat-label">已取消</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
      <div
        class="stat-card stat-refunded"
        :class="{ 'stat-active': activeStatus === 7 && !isCustomQuery }"
        @click="handleStatusFilter(7)"
      >
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.refunded }}</span>
          <span class="stat-label">已退款</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <div class="search-panel">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.number"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="handleSearch"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号"
            clearable
            @keyup.enter="handleSearch"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            class="search-input"
            :teleported="false"
          >
            <el-option label="待付款" :value="1" />
            <el-option label="待接单" :value="2" />
            <el-option label="已接单" :value="3" />
            <el-option label="派送中" :value="4" />
            <el-option label="已完成" :value="5" />
            <el-option label="已取消" :value="6" />
            <el-option label="已退款" :value="7" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="search-input date-input"
            :teleported="false"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" class="search-btn">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset" class="reset-btn">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 订单列表 -->
    <div class="table-panel" v-loading="loading">
      <div class="table-header">
        <span class="table-title">订单列表</span>
        <span class="table-count">共 {{ pagination.total }} 条记录</span>
      </div>

      <el-table
        :data="orderList"
        stripe
        border
        class="order-table"
        :header-cell-style="{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontWeight: '600',
          textAlign: 'center',
        }"
        :cell-style="{ textAlign: 'center' }"
      >
        <el-table-column
          prop="number"
          label="订单号"
          width="180"
          fixed
          resizable
        >
          <template #default="{ row }">
            <span class="order-number">{{ row.number }}</span>
          </template>
        </el-table-column>

        <el-table-column label="下单人" width="120" resizable align="center">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="28" class="user-avatar">
                <el-icon :size="14"><User /></el-icon>
              </el-avatar>
              <span>{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="联系电话" width="130" resizable />

        <el-table-column label="订单金额" width="110" resizable>
          <template #default="{ row }">
            <span class="amount-value">¥{{ row.amount?.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="订单状态" width="100" resizable>
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" class="status-tag">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="下单时间" width="170" resizable>
          <template #default="{ row }">
            <span class="time-text">{{ formatTime(row.orderTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="收货地址"
          min-width="200"
          resizable
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="address-text">{{ row.address }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="280"
          fixed="right"
          resizable
          align="center"
        >
          <template #default="{ row }">
            <div class="action-btns">
              <el-button
                v-if="row.status === 2"
                type="success"
                size="small"
                text
                @click="handleConfirm(row)"
              >
                接单
              </el-button>
              <el-button
                v-if="row.status === 2"
                type="danger"
                size="small"
                text
                @click="handleReject(row)"
              >
                拒单
              </el-button>
              <el-button
                v-if="row.status === 3"
                type="primary"
                size="small"
                text
                @click="handleDelivery(row)"
              >
                派送
              </el-button>
              <el-button
                v-if="row.status === 4"
                type="success"
                size="small"
                text
                @click="handleComplete(row)"
              >
                完成
              </el-button>
              <el-button
                v-if="[2, 3].includes(row.status)"
                type="warning"
                size="small"
                text
                @click="handleCancel(row)"
              >
                取消
              </el-button>
              <el-button
                type="info"
                size="small"
                text
                @click="handleViewDetail(row)"
              >
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchOrders"
          @current-change="fetchOrders"
          class="pagination"
        />
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <OrderDetailDialog v-model="detailVisible" :order-detail="orderDetail" />

    <!-- 拒单原因弹窗 -->
    <RejectDialog
      v-model="rejectVisible"
      :loading="rejectLoading"
      @confirm="submitReject"
    />

    <!-- 取消原因弹窗 -->
    <CancelDialog
      v-model="cancelVisible"
      :loading="cancelLoading"
      @confirm="submitCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, User } from "@element-plus/icons-vue";
import OrderDetailDialog from "./components/OrderDetailDialog.vue";
import RejectDialog from "./components/RejectDialog.vue";
import CancelDialog from "./components/CancelDialog.vue";
import {
  searchOrders,
  getOrderDetail,
  confirmOrder,
  rejectOrder,
  cancelOrder,
  deliveryOrder,
  completeOrder,
  getOrderStatistics,
} from "./api/orderApi";
import type {
  OrderVO,
  OrderSearchQuery,
  OrderStatistics,
} from "./api/orderApi";
import { ORDER_STATUS_MAP } from "./types/order";

const loading = ref(false);
const orderList = ref<OrderVO[]>([]);
const detailVisible = ref(false);
const orderDetail = ref<OrderVO | null>(null);
const rejectVisible = ref(false);
const rejectLoading = ref(false);
const cancelVisible = ref(false);
const cancelLoading = ref(false);
const currentOrderId = ref(0);

const dateRange = ref<[string, string] | null>(null);

const searchForm = reactive({
  number: "",
  phone: "",
  status: undefined as number | undefined,
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const allOrdersCount = ref(0);

const statistics = reactive<OrderStatistics>({
  toBeConfirmed: 0,
  confirmed: 0,
  deliveryInProgress: 0,
  completed: 0,
  cancelled: 0,
  refunded: 0,
});

// 当前选中的状态（用于高亮显示）
const activeStatus = ref<number | undefined>(undefined);

// 是否是自定义混合查询（状态 + 其他条件）
const isCustomQuery = ref(false);

// "全部订单"卡片显示的数量（正常是 allOrdersCount，混合查询时是 pagination.total）
const displayCount = ref(0);

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

async function fetchOrders() {
  loading.value = true;
  try {
    const params: OrderSearchQuery = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      number: searchForm.number || undefined,
      phone: searchForm.phone || undefined,
      status: searchForm.status,
    };

    if (dateRange.value) {
      params.beginTime = dateRange.value[0];
      params.endTime = dateRange.value[1];
    }

    const res = await searchOrders(params);
    orderList.value = res.records || [];
    pagination.total = res.total || 0;

    // 如果是自定义查询，更新"全部订单"卡片显示的数量为本次查询结果数
    if (isCustomQuery.value) {
      displayCount.value = pagination.total;
    }

    // 当没有筛选条件时，更新全部订单总数
    const hasFilter =
      searchForm.number ||
      searchForm.phone ||
      searchForm.status !== undefined ||
      dateRange.value;
    if (!hasFilter && pagination.page === 1) {
      allOrdersCount.value = res.total || 0;
      displayCount.value = allOrdersCount.value; // 同步更新显示数量
    }
  } catch {
    // 错误已在拦截器处理
  } finally {
    loading.value = false;
  }
}

async function fetchStatistics() {
  try {
    const res = await getOrderStatistics();
    Object.assign(statistics, res);
    // 初始化"全部订单"卡片的显示数量
    allOrdersCount.value =
      (statistics.toBeConfirmed || 0) +
      (statistics.confirmed || 0) +
      (statistics.deliveryInProgress || 0) +
      (statistics.completed || 0) +
      (statistics.cancelled || 0) +
      (statistics.refunded || 0);
    displayCount.value = allOrdersCount.value; // 同步更新显示数量
  } catch {
    // 错误已在拦截器处理
  }
}

function handleSearch() {
  // 判断是否有除状态外的其他查询条件
  const hasOtherConditions =
    !!searchForm.number || !!searchForm.phone || !!dateRange.value;

  // 判断是否选择了状态
  const hasStatus =
    searchForm.status !== undefined && searchForm.status !== null;

  if (hasOtherConditions && hasStatus) {
    // 混合查询：状态 + 其他条件
    isCustomQuery.value = true;
    activeStatus.value = undefined; // 不高亮状态卡片
    // displayCount 会在 fetchOrders 成功后更新为 pagination.total
  } else if (hasStatus && !hasOtherConditions) {
    // 单独状态查询
    isCustomQuery.value = false;
    activeStatus.value = searchForm.status; // 高亮对应的状态卡片
    displayCount.value = allOrdersCount.value; // 恢复显示全部订单数量
  } else if (hasOtherConditions && !hasStatus) {
    // 只有其他条件，没有状态（也算自定义查询）
    isCustomQuery.value = true;
    activeStatus.value = undefined;
    // displayCount 会在 fetchOrders 成功后更新为 pagination.total
  } else {
    // 没有任何查询条件（理论上不会走到这里，因为会走 reset）
    isCustomQuery.value = false;
    activeStatus.value = undefined;
    displayCount.value = allOrdersCount.value;
  }

  pagination.page = 1;
  fetchOrders();
}

function handleReset() {
  searchForm.number = "";
  searchForm.phone = "";
  searchForm.status = undefined;
  dateRange.value = null;
  activeStatus.value = undefined;
  isCustomQuery.value = false;
  displayCount.value = allOrdersCount.value; // 恢复显示全部订单数量
  pagination.page = 1;
  fetchOrders();
}

function handleStatusFilter(status: number | undefined) {
  if (status !== undefined) {
    // 点击状态卡片：只筛选该状态
    activeStatus.value = status;
    searchForm.status = status;
    isCustomQuery.value = false; // 不是自定义查询
    // 清空其他查询条件
    searchForm.number = "";
    searchForm.phone = "";
    dateRange.value = null;
    displayCount.value = allOrdersCount.value; // 显示全部订单数量
  } else {
    // 点击"全部订单"卡片：查看全部
    activeStatus.value = undefined;
    searchForm.status = undefined;
    isCustomQuery.value = false;
    displayCount.value = allOrdersCount.value; // 显示全部订单数量
  }

  pagination.page = 1;
  fetchOrders();
}

async function handleConfirm(row: OrderVO) {
  try {
    await ElMessageBox.confirm("确定要接此订单吗？", "确认接单", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "success",
    });
    await confirmOrder({ id: row.id, status: 3 });
    ElMessage.success("接单成功");
    fetchOrders();
    fetchStatistics();
  } catch {
    // 用户取消
  }
}

async function handleReject(row: OrderVO) {
  currentOrderId.value = row.id;
  rejectVisible.value = true;
}

async function submitReject(reason: string) {
  if (!reason.trim()) {
    ElMessage.warning("请输入拒单原因");
    return;
  }
  rejectLoading.value = true;
  try {
    await rejectOrder({
      id: currentOrderId.value,
      rejectionReason: reason,
    });
    ElMessage.success("拒单成功");
    rejectVisible.value = false;
    fetchOrders();
    fetchStatistics();
  } catch {
    // 错误已在拦截器处理
  } finally {
    rejectLoading.value = false;
  }
}

async function handleCancel(row: OrderVO) {
  currentOrderId.value = row.id;
  cancelVisible.value = true;
}

async function submitCancel(reason: string) {
  if (!reason.trim()) {
    ElMessage.warning("请输入取消原因");
    return;
  }
  cancelLoading.value = true;
  try {
    await cancelOrder({
      id: currentOrderId.value,
      cancelReason: reason,
    });
    ElMessage.success("取消成功");
    cancelVisible.value = false;
    fetchOrders();
    fetchStatistics();
  } catch {
    // 错误已在拦截器处理
  } finally {
    cancelLoading.value = false;
  }
}

async function handleDelivery(row: OrderVO) {
  try {
    await ElMessageBox.confirm("确定要派送此订单吗？", "确认派送", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    });
    await deliveryOrder(row.id);
    ElMessage.success("已派送");
    fetchOrders();
    fetchStatistics();
  } catch {
    // 用户取消
  }
}

async function handleComplete(row: OrderVO) {
  try {
    await ElMessageBox.confirm("确定要完成此订单吗？", "确认完成", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "success",
    });
    await completeOrder(row.id);
    ElMessage.success("订单已完成");
    fetchOrders();
    fetchStatistics();
  } catch {
    // 用户取消
  }
}

async function handleViewDetail(row: OrderVO) {
  try {
    const res = await getOrderDetail(row.number);
    orderDetail.value = res;
    detailVisible.value = true;
  } catch {
    // 错误已在拦截器处理
  }
}

onMounted(() => {
  fetchOrders();
  fetchStatistics();
});
</script>

<style scoped lang="scss">
@use "@/styles/common-page.scss";

/* 订单页面特有样式（如有） */
</style>
