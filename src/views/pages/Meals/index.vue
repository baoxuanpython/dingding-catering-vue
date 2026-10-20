<template>
  <div class="page-container meals-page">
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
        <div class="stat-icon">🍽️</div>
        <div class="stat-content">
          <span class="stat-value">{{ displayCount }}</span>
          <span class="stat-label">{{
            isCustomQuery ? "指定查询菜品" : "全部菜品"
          }}</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
      <div
        class="stat-card stat-sold"
        :class="{ 'stat-active': activeStatus === 1 && !isCustomQuery }"
        @click="handleStatusFilter(1)"
      >
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <span class="stat-value">{{ dishStatistics.sold }}</span>
          <span class="stat-label">已启售</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
      <div
        class="stat-card stat-discontinued"
        :class="{ 'stat-active': activeStatus === 0 && !isCustomQuery }"
        @click="handleStatusFilter(0)"
      >
        <div class="stat-icon">⏸️</div>
        <div class="stat-content">
          <span class="stat-value">{{ dishStatistics.discontinued }}</span>
          <span class="stat-label">已停售</span>
        </div>
        <div class="stat-arrow"></div>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <div class="search-panel">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="菜品名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入菜品名称"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
            :teleported="false"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="菜品分类">
          <el-select
            v-model="searchForm.categoryId"
            placeholder="请选择分类"
            clearable
            class="search-input"
            :teleported="false"
          >
            <el-option
              v-for="cat in categoryList"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            class="search-input"
            :teleported="false"
          >
            <el-option label="已启售" :value="1" />
            <el-option label="已停售" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item class="action-group">
          <el-button type="primary" @click="handleSearch" class="search-btn">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset" class="reset-btn">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
          <el-button type="primary" @click="handleAdd" class="add-btn">
            <el-icon><Plus /></el-icon>
            新增菜品
          </el-button>
          <el-button
            type="danger"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
            class="batch-delete-btn"
          >
            <el-icon><Delete /></el-icon>
            批量删除
            <template v-if="selectedIds.length > 0">
              ({{ selectedIds.length }})
            </template>
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-panel" v-loading="loading">
      <div class="table-header">
        <span class="table-title">菜品列表</span>
        <span class="table-count">共 {{ pagination.total }} 条记录</span>
      </div>

      <el-table
        :data="dishList"
        stripe
        border
        class="dish-table"
        row-key="id"
        @selection-change="handleSelectionChange"
        :header-cell-style="{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontWeight: '600',
          textAlign: 'center',
        }"
      >
        <el-table-column type="selection" width="50" align="center" />

        <el-table-column label="图片" width="100" align="center" fixed>
          <template #default="{ row }">
            <el-image
              :src="row.image || defaultImage"
              :preview-src-list="[row.image]"
              fit="cover"
              class="image-thumbnail"
              preview-teleported
            >
              <template #error>
                <div class="image-error">
                  <el-icon :size="24"><PictureFilled /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column
          prop="name"
          label="菜品名称"
          min-width="150"
          resizable
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="item-name">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="categoryName"
          label="分类"
          width="120"
          resizable
          align="center"
        >
          <template #default="{ row }">
            <el-tag size="small" effect="light" class="category-tag">{{
              row.categoryName
            }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="售价" width="100" resizable align="center">
          <template #default="{ row }">
            <span class="price-value">¥{{ row.price?.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="描述"
          min-width="180"
          resizable
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="description-text">{{
              row.description || "暂无描述"
            }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120" resizable align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'info'"
              effect="dark"
              class="status-tag-clickable"
              @click="handleStatusToggle(row)"
            >
              {{ row.status === 1 ? "已启售" : "已停售" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="170" resizable align="center">
          <template #default="{ row }">
            <span class="time-text">{{ formatTime(row.updateTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="200"
          fixed="right"
          resizable
          align="center"
        >
          <template #default="{ row }">
            <div class="action-btns">
              <el-button
                type="primary"
                text
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                text
                size="small"
                @click="handleDelete(row.id)"
              >
                删除
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
          background
          @size-change="fetchDishes"
          @current-change="fetchDishes"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <DishFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :submit-loading="submitLoading"
      :form-data="formData"
      :category-list="categoryList"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, RefreshLeft, PictureFilled } from "@element-plus/icons-vue";
import DishFormDialog from "./components/DishFormDialog.vue";
import {
  getDishPage,
  getDishDetail,
  createDish,
  updateDish,
  deleteDishes,
  updateDishStatus,
  getCategoryList,
  getDishOverview,
} from "./api/dishApi";
import type {
  DishVO,
  DishPageQuery,
  DishForm,
  DishOverview,
} from "./types/dish";

const loading = ref(false);
const dishList = ref<DishVO[]>([]);
const categoryList = ref<{ id: number; name: string }[]>([]);
const selectedIds = ref<number[]>([]);

const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);

const defaultImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f5f7fa' width='100' height='100'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='14' fill='%23909399' text-anchor='middle'%3E暂无图片%3C/text%3E%3C/svg%3E";

// 菜品统计数据
const dishStatistics = reactive<DishOverview>({
  sold: 0,
  discontinued: 0,
});

const totalDishes = ref(0);

// 当前选中的状态（用于高亮显示）
const activeStatus = ref<number | undefined>(undefined);

// 是否是自定义混合查询（状态 + 其他条件）
const isCustomQuery = ref(false);

// "全部菜品"卡片显示的数量（正常是 totalDishes，混合查询时是 pagination.total）
const displayCount = ref(0);

const searchForm = reactive({
  name: "",
  categoryId: undefined as number | undefined,
  status: undefined as number | undefined,
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const formData = reactive<DishForm>({
  name: "",
  categoryId: undefined as number | undefined,
  price: 0,
  image: "",
  description: "",
  status: 1,
  flavors: [],
});

function formatTime(time?: string): string {
  if (!time) return "-";
  return time.replace("T", " ").substring(0, 19);
}

async function fetchDishStatistics() {
  try {
    const res = await getDishOverview();
    Object.assign(dishStatistics, res);
    totalDishes.value = dishStatistics.sold + dishStatistics.discontinued;
    displayCount.value = totalDishes.value; // 同步更新显示数量
  } catch (error) {
    console.error("获取菜品统计失败:", error);
  }
}

async function fetchDishes() {
  loading.value = true;
  try {
    const params: DishPageQuery = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      categoryId: searchForm.categoryId,
      status: searchForm.status,
    };
    const res = await getDishPage(params);
    dishList.value = res.records || [];
    pagination.total = res.total || 0;

    // 如果是自定义查询，更新"全部菜品"卡片显示的数量为本次查询结果数
    if (isCustomQuery.value) {
      displayCount.value = pagination.total;
    }

    // 当没有筛选条件时，更新全部菜品总数
    const hasFilter =
      searchForm.name ||
      searchForm.categoryId !== undefined ||
      searchForm.status !== undefined;
    if (!hasFilter && pagination.page === 1) {
      totalDishes.value = res.total || 0;
      displayCount.value = totalDishes.value; // 同步更新显示数量
    }
  } catch (error) {
    console.error("获取菜品列表失败:", error);
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    const res = await getCategoryList();
    categoryList.value = res || [];
  } catch (error) {
    console.error("获取分类列表失败:", error);
  }
}

function handleStatusFilter(status: number | undefined) {
  if (status !== undefined) {
    // 点击状态卡片：只筛选该状态
    activeStatus.value = status;
    searchForm.status = status;
    isCustomQuery.value = false; // 不是自定义查询
    // 清空其他查询条件
    searchForm.name = "";
    searchForm.categoryId = undefined;
    displayCount.value = totalDishes.value; // 显示全部菜品数量
  } else {
    // 点击"全部菜品"卡片：查看全部
    activeStatus.value = undefined;
    searchForm.status = undefined;
    isCustomQuery.value = false;
    displayCount.value = totalDishes.value; // 显示全部菜品数量
  }

  handleSearch();
}

function handleSearch() {
  // 判断是否有除状态外的其他查询条件
  const hasOtherConditions =
    !!searchForm.name || searchForm.categoryId !== undefined;

  // 判断是否选择了状态
  const hasStatus =
    searchForm.status !== undefined && searchForm.status !== null;

  if (hasOtherConditions && hasStatus) {
    // 混合查询：状态 + 其他条件
    isCustomQuery.value = true;
    activeStatus.value = undefined; // 不高亮状态卡片
    // displayCount 会在 fetchDishes 成功后更新为 pagination.total
  } else if (hasStatus && !hasOtherConditions) {
    // 单独状态查询
    isCustomQuery.value = false;
    activeStatus.value = searchForm.status; // 高亮对应的状态卡片
    displayCount.value = totalDishes.value; // 恢复显示全部菜品数量
  } else if (hasOtherConditions && !hasStatus) {
    // 只有其他条件，没有状态（也算自定义查询）
    isCustomQuery.value = true;
    activeStatus.value = undefined;
    // displayCount 会在 fetchDishes 成功后更新为 pagination.total
  } else {
    // 没有任何查询条件（理论上不会走到这里，因为会走 reset）
    isCustomQuery.value = false;
    activeStatus.value = undefined;
    displayCount.value = totalDishes.value;
  }

  pagination.page = 1;
  fetchDishes();
}

function handleReset() {
  searchForm.name = "";
  searchForm.categoryId = undefined;
  searchForm.status = undefined;
  activeStatus.value = undefined;
  isCustomQuery.value = false;
  displayCount.value = totalDishes.value; // 恢复显示全部菜品数量
  pagination.page = 1;
  fetchDishes();
}

function handleSelectionChange(rows: DishVO[]) {
  selectedIds.value = rows.map((row) => row.id);
}

function resetForm() {
  formData.name = "";
  formData.categoryId = undefined;
  formData.price = 0;
  formData.image = "";
  formData.description = "";
  formData.status = 1;
  formData.flavors = [];
  isEdit.value = false;
}

function handleAdd() {
  resetForm();
  dialogVisible.value = true;
}

async function handleEdit(row: DishVO) {
  try {
    resetForm();
    isEdit.value = true;
    const res = await getDishDetail(row.id);
    const data = res;
    Object.assign(formData, {
      id: data.id,
      name: data.name,
      categoryId: data.categoryId,
      price: data.price,
      image: data.image,
      description: data.description,
      flavors: (data.flavors || []).map((f: any) => ({
        id: f.id,
        flavorName: f.flavorName || "",
        flavorValue: f.flavorValue || "",
        valueList: f.valueList || "",
      })),
    });
    dialogVisible.value = true;
  } catch (error) {
    console.error("获取菜品详情失败:", error);
  }
}

async function handleSubmit(imageUrl?: string) {
  try {
    submitLoading.value = true;

    const imageData = imageUrl || formData.image;

    // 格式化口味数据：将 flavorValue 数组转换为逗号分隔的字符串
    const formattedFlavors = formData.flavors.map((f) => ({
      id: f.id,
      flavorName: f.flavorName,
      flavorValue: f.flavorValue,
      valueList: f.valueList || f.flavorValue,
    }));

    if (isEdit.value && formData.id) {
      await updateDish({
        id: formData.id,
        name: formData.name,
        categoryId: formData.categoryId!,
        price: formData.price,
        image: imageData,
        description: formData.description,
        status: formData.status,
        flavors: formattedFlavors,
      });
      ElMessage.success("修改成功");
    } else {
      await createDish({
        name: formData.name,
        categoryId: formData.categoryId!,
        price: formData.price,
        image: imageData,
        description: formData.description,
        status: formData.status,
        flavors: formattedFlavors,
      });
      ElMessage.success("新增成功");
    }

    dialogVisible.value = false;
    fetchDishes();
    fetchDishStatistics();
  } catch (error) {
    console.error("提交失败:", error);
  } finally {
    submitLoading.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm(
      "确定要删除该菜品吗？此操作不可恢复！",
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
    await deleteDishes([id]);
    ElMessage.success("删除成功");
    fetchDishes();
    fetchDishStatistics();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
    }
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请先选择要删除的菜品");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个菜品吗？此操作不可恢复！`,
      "批量删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
    await deleteDishes(selectedIds.value);
    ElMessage.success(`成功删除 ${selectedIds.value.length} 个菜品`);
    selectedIds.value = [];
    fetchDishes();
    fetchDishStatistics();
  } catch (error) {
    if (error !== "cancel") {
      console.error("批量删除失败:", error);
    }
  }
}

async function handleStatusToggle(row: DishVO) {
  const newStatus = row.status === 1 ? 0 : 1;
  const actionText = newStatus === 1 ? "启售" : "停售";

  try {
    await ElMessageBox.confirm(
      `确定要${actionText}该菜品吗？`,
      `确认${actionText}`,
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    await updateDishStatus(row.id, newStatus);
    ElMessage.success(`已${actionText}`);
    fetchDishes();
    fetchDishStatistics();
  } catch (error) {
    if (error !== "cancel") {
      console.error("更新状态失败:", error);
    }
  }
}

onMounted(() => {
  fetchDishStatistics();
  fetchDishes();
  fetchCategories();
});
</script>

<style scoped lang="scss">
@use "@/styles/common-page.scss";

/* 菜品页面特有样式（如有） */
</style>
