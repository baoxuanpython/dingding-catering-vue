<template>
  <div class="page-container categories-page">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <!-- 分类总数 -->
      <div
        class="stat-card"
        :class="
          isSearching
            ? 'stat-custom'
            : activeStatIndex === 0
              ? 'stat-active'
              : ''
        "
        @click="handleStatClick(0)"
      >
        <span class="stat-icon">📂</span>
        <div class="stat-content">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">{{
            isSearching ? "指定分类总数" : "分类总数"
          }}</span>
        </div>
      </div>
      <!-- 已启用 -->
      <div
        class="stat-card"
        :class="!isSearching && activeStatIndex === 1 ? 'stat-active' : ''"
        @click="handleStatClick(1)"
      >
        <span class="stat-icon">✅</span>
        <div class="stat-content">
          <span class="stat-value">{{ stats.enabled }}</span>
          <span class="stat-label">已启用</span>
        </div>
      </div>
      <!-- 已禁用 -->
      <div
        class="stat-card"
        :class="!isSearching && activeStatIndex === 2 ? 'stat-active' : ''"
        @click="handleStatClick(2)"
      >
        <span class="stat-icon">⏸️</span>
        <div class="stat-content">
          <span class="stat-value">{{ stats.disabled }}</span>
          <span class="stat-label">已禁用</span>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="tab-wrapper">
      <el-tabs v-model="activeTabValue" @tab-click="handleTabClick">
        <el-tab-pane label="菜品分类" :name="String(CategoryType.DISH)" />
        <el-tab-pane label="套餐分类" :name="String(CategoryType.SETMEAL)" />
      </el-tabs>
    </div>

    <!-- 搜索表单 -->
    <CategorySearchBar @search="handleSearch" @reset="handleReset" />

    <!-- 数据表格 -->
    <CategoryTable
      :data="tableData"
      :loading="loading"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @status-change="handleStatusChange"
    />

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <CategoryEditForm
      v-model="formVisible"
      :category-data="currentCategory"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { TabsPaneContext } from "element-plus";
import CategorySearchBar from "./components/CategorySearchBar.vue";
import CategoryTable from "./components/CategoryTable.vue";
import CategoryEditForm from "./components/CategoryEditForm.vue";
import { useCategories } from "./composables/useCategories";
import { CategoryType } from "./types/category";
import type { Category } from "./types/category";

const {
  activeTab,
  tableData,
  total,
  loading,
  currentPage,
  pageSize,
  isSearching,
  activeStatIndex,
  stats,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
  handleTabChange,
  handleCreate,
  handleUpdate,
  handleStatusChange,
  handleDelete,
  handleStatClick,
} = useCategories();

// Tab 值（el-tabs 需要 string 类型）
const activeTabValue = computed({
  get: () => String(activeTab.value),
  set: (val: string) => handleTabChange(Number(val) as CategoryType),
});

function handleTabClick(tab: TabsPaneContext) {
  handleTabChange(Number(tab.paneName) as CategoryType);
}

// 表单弹窗
const formVisible = ref(false);
const currentCategory = ref<Category | null>(null);

function handleAdd() {
  currentCategory.value = null;
  formVisible.value = true;
}

function handleEdit(row: Category) {
  currentCategory.value = row;
  formVisible.value = true;
}

async function handleFormSubmit(data: {
  id?: number;
  name: string;
  sort: number;
  type: number;
}) {
  if (data.id) {
    await handleUpdate({ ...data, id: data.id });
  } else {
    await handleCreate(data);
  }
}
</script>

<style scoped>
/* Tab 包装器 */
.tab-wrapper {
  margin-bottom: 20px;
  padding: 0 4px;
}

.tab-wrapper :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.tab-wrapper :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

.tab-wrapper :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  height: 3px;
  border-radius: 2px;
}

.tab-wrapper :deep(.el-tabs__item.is-active) {
  color: var(--primary);
  font-weight: 600;
}

/* 统计卡片 - 重置激活状态的永久 transform，只在 hover 时上浮 */
.stat-card.stat-active,
.stat-card.stat-custom {
  transform: none !important;

  &:hover {
    transform: translateY(-4px) !important;
  }
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 16px 24px;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-light);
}
</style>
