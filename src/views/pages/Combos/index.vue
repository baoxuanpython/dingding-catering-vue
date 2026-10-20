<template>
  <div class="combos-page">
    <div class="page-header">
      <h2 class="page-title">套餐管理</h2>
    </div>

    <div class="stats-row">
      <div
        class="stat-card stat-total"
        :class="{
          'stat-active': activeStat === 'total' && !isStatCustom,
          'stat-custom': isStatCustom,
        }"
        @click="handleStatClick('total')"
      >
        <div class="stat-icon">
          <el-icon :size="32"><Box /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statCardValue }}</div>
          <div class="stat-label">{{ statCardLabel }}</div>
        </div>
      </div>

      <div
        class="stat-card stat-on-sale"
        :class="{ 'stat-active': activeStat === 'onSale' }"
        @click="handleStatClick('onSale')"
      >
        <div class="stat-icon">
          <el-icon :size="32"><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.onSale }}</div>
          <div class="stat-label">已启售</div>
        </div>
      </div>

      <div
        class="stat-card stat-off-sale"
        :class="{ 'stat-active': activeStat === 'offSale' }"
        @click="handleStatClick('offSale')"
      >
        <div class="stat-icon">
          <el-icon :size="32"><CircleClose /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.offSale }}</div>
          <div class="stat-label">已停售</div>
        </div>
      </div>
    </div>

    <ComboSearchBar
      :search-form="searchForm"
      :category-list="categoryList"
      :selected-ids="selectedIds"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @batch-delete="handleBatchDelete"
    />

    <ComboTable
      :loading="loading"
      :combo-list="comboList"
      :pagination="pagination"
      @selection-change="handleSelectionChange"
      @status-toggle="handleStatusToggle"
      @edit="handleEdit"
      @detail="handleDetail"
      @delete="handleDelete"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <ComboFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :is-detail="isDetail"
      :submit-loading="submitLoading"
      :form-data="formData"
      :category-list="categoryList"
      :flavor-list="flavorList"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Box, CircleCheck, CircleClose } from "@element-plus/icons-vue";
import ComboSearchBar from "./components/ComboSearchBar.vue";
import ComboTable from "./components/ComboTable.vue";
import ComboFormDialog from "./components/ComboFormDialog.vue";
import { useCombos } from "./composables/useCombos";

const {
  loading,
  submitLoading,
  comboList,
  categoryList,
  flavorList,
  selectedIds,
  statistics,
  searchForm,
  pagination,
  dialogVisible,
  isEdit,
  isDetail,
  formData,
  activeStat,
  statCardLabel,
  statCardValue,
  isStatCustom,
  fetchStatistics,
  fetchCombos,
  fetchCategories,
  fetchFlavors,
  handleSearch,
  handleReset,
  handleSelectionChange,
  handleAdd,
  handleEdit,
  handleDetail,
  handleSubmit,
  handleDelete,
  handleBatchDelete,
  handleStatusToggle,
  handleStatClick,
} = useCombos();

function handleSizeChange() {
  pagination.page = 1;
  fetchCombos();
}

function handleCurrentChange() {
  fetchCombos();
}

onMounted(() => {
  fetchCategories();
  fetchFlavors();
  fetchStatistics();
  fetchCombos();
});
</script>

<style scoped lang="scss">
@use "@/styles/common-page.scss";

.combos-page {
  padding: 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
}
</style>
