/**
 * 分类管理业务逻辑
 */
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getCategoryPage,
  getCategoryList,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "../api/categoryApi";
import type {
  Category,
  CategoryPageQuery,
  CategoryStats,
} from "../types/category";
import { CategoryType, CategoryStatus } from "../types/category";

export function useCategories() {
  // 当前激活的 Tab（1=菜品分类，2=套餐分类）
  const activeTab = ref<CategoryType>(CategoryType.DISH);

  // 分页数据
  const tableData = ref<Category[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(10);

  // 搜索参数
  const searchName = ref("");

  // 是否处于搜索状态
  const isSearching = computed(() => !!searchName.value);

  // 当前激活的统计卡片索引（0=总数，1=已启用，2=已禁用）
  const activeStatIndex = ref(0);

  // 统计数据
  const stats = ref<CategoryStats>({ total: 0, enabled: 0, disabled: 0 });

  // 查询参数
  const queryParams = computed<CategoryPageQuery>(() => ({
    name: searchName.value || undefined,
    page: currentPage.value,
    pageSize: pageSize.value,
    type: activeTab.value,
  }));

  /**
   * 获取分页数据
   */
  async function fetchCategories() {
    loading.value = true;
    try {
      const res = await getCategoryPage(queryParams.value);
      tableData.value = res.records;
      total.value = res.total;
    } catch (error) {
      // 错误已在 Axios 拦截器中处理
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取统计数据
   */
  async function fetchStats() {
    try {
      const list = await getCategoryList(activeTab.value);
      stats.value = {
        total: list.length,
        enabled: list.filter((item) => item.status === CategoryStatus.ENABLED)
          .length,
        disabled: list.filter((item) => item.status === CategoryStatus.DISABLED)
          .length,
      };
    } catch (error) {
      // 错误已在 Axios 拦截器中处理
    }
  }

  /**
   * 搜索
   */
  function handleSearch(name: string) {
    searchName.value = name;
    currentPage.value = 1;
    // 搜索后激活"分类总数"卡片
    activeStatIndex.value = 0;
    fetchCategories();
  }

  /**
   * 重置搜索
   */
  function handleReset() {
    searchName.value = "";
    currentPage.value = 1;
    // 重置后恢复默认激活状态
    activeStatIndex.value = 0;
    fetchCategories();
  }

  /**
   * 分页变化
   */
  function handlePageChange(page: number) {
    currentPage.value = page;
    fetchCategories();
  }

  function handleSizeChange(size: number) {
    pageSize.value = size;
    currentPage.value = 1;
    fetchCategories();
  }

  /**
   * Tab 切换
   */
  async function handleTabChange(type: CategoryType) {
    activeTab.value = type;
    currentPage.value = 1;
    searchName.value = "";
    await Promise.all([fetchCategories(), fetchStats()]);
  }

  /**
   * 新增分类
   */
  async function handleCreate(data: {
    name: string;
    sort: number;
    type: number;
  }) {
    await createCategory(data);
    ElMessage.success("新增成功");
    await Promise.all([fetchCategories(), fetchStats()]);
  }

  /**
   * 修改分类
   */
  async function handleUpdate(data: {
    id: number;
    name: string;
    sort: number;
    type: number;
  }) {
    await updateCategory(data);
    ElMessage.success("修改成功");
    await Promise.all([fetchCategories(), fetchStats()]);
  }

  /**
   * 启用/禁用分类
   */
  async function handleStatusChange(id: number, status: number) {
    const action = status === CategoryStatus.ENABLED ? "启用" : "禁用";
    try {
      await ElMessageBox.confirm(`确定要${action}该分类吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
      await updateCategoryStatus(id, status);
      ElMessage.success(`${action}成功`);
      await Promise.all([fetchCategories(), fetchStats()]);
    } catch (error) {
      if (error !== "cancel" && error !== "close") {
        throw error;
      }
    }
  }

  /**
   * 删除分类
   */
  async function handleDelete(id: number) {
    try {
      await ElMessageBox.confirm("确定要删除该分类吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
      await deleteCategory(id);
      ElMessage.success("删除成功");
      await Promise.all([fetchCategories(), fetchStats()]);
    } catch (error) {
      if (error !== "cancel" && error !== "close") {
        throw error;
      }
    }
  }

  /**
   * 点击统计卡片
   */
  function handleStatClick(index: number) {
    // 搜索状态下不允许切换
    if (isSearching.value) return;
    activeStatIndex.value = index;
  }

  // 初始化
  onMounted(async () => {
    await Promise.all([fetchCategories(), fetchStats()]);
  });

  return {
    activeTab,
    tableData,
    total,
    loading,
    currentPage,
    pageSize,
    searchName,
    isSearching,
    activeStatIndex,
    stats,
    fetchCategories,
    fetchStats,
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
  };
}
