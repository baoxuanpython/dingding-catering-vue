<template>
  <div class="page-container">
    <div class="stats-row">
      <div
        class="stat-card"
        :class="{
          'stat-custom': isSearching,
          'stat-active': !isSearching && activeStatIndex === 0,
        }"
      >
        <el-icon class="stat-icon"><Food /></el-icon>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.total }}</span>
          <span class="stat-label">{{
            isSearching ? "指定查询结果" : "口味总数"
          }}</span>
        </div>
      </div>
    </div>

    <FlavorSearchBar
      :search-form="searchForm"
      @search="handleSearch"
      @reset="handleReset"
    />

    <FlavorTable
      :loading="loading"
      :flavor-list="flavorList"
      :pagination="pagination"
      :selected-ids="selectedIds"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @selection-change="handleSelectionChange"
      @page-change="fetchFlavors"
    />

    <FlavorFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :submit-loading="submitLoading"
      :form-data="formData"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { Food } from "@element-plus/icons-vue";
import FlavorSearchBar from "./components/FlavorSearchBar.vue";
import FlavorTable from "./components/FlavorTable.vue";
import FlavorFormDialog from "./components/FlavorFormDialog.vue";
import { useFlavors } from "./composables/useFlavors";

const {
  loading,
  submitLoading,
  flavorList,
  selectedIds,
  statistics,
  searchForm,
  pagination,
  dialogVisible,
  isEdit,
  formData,
  isSearching,
  activeStatIndex,
  fetchFlavors,
  handleSearch,
  handleReset,
  handleSelectionChange,
  handleAdd,
  handleEdit,
  handleSubmit,
  handleDelete,
  handleBatchDelete,
} = useFlavors();

fetchFlavors();
</script>

<style scoped lang="scss">
@use "@/styles/common-page.scss";
</style>
