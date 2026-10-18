import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getFlavorPage,
  createFlavor,
  updateFlavor,
  deleteFlavor,
} from "../api/flavorApi";
import type { Flavor, FlavorPageQuery, FlavorForm } from "../types/flavor";

export function useFlavors() {
  const loading = ref(false);
  const submitLoading = ref(false);
  const flavorList = ref<Flavor[]>([]);
  const selectedIds = ref<number[]>([]);

  const statistics = reactive({
    total: 0,
  });

  const searchForm = reactive({
    flavorName: "",
  });

  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const dialogVisible = ref(false);
  const isEdit = ref(false);

  const formData = reactive<FlavorForm>({
    flavorName: "",
    valueList: "",
  });

  const hasQueried = ref(false);

  // 是否处于搜索状态（手动控制，只在点击搜索按钮后切换）
  const isSearching = ref(false);

  // 当前激活的统计卡片索引（0=总数）
  const activeStatIndex = ref(0);

  const hasSearchCondition = computed(() => {
    return !!searchForm.flavorName;
  });

  async function fetchFlavors() {
    loading.value = true;
    try {
      const params: FlavorPageQuery = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        flavorName: searchForm.flavorName || undefined,
      };
      const res = await getFlavorPage(params);
      flavorList.value = res.records || [];
      pagination.total = res.total || 0;
      statistics.total = res.total || 0;
    } catch (error) {
      console.error("获取口味列表失败:", error);
    } finally {
      loading.value = false;
    }
  }

  function handleSearch() {
    pagination.page = 1;
    hasQueried.value = true;
    isSearching.value = !!searchForm.flavorName;
    activeStatIndex.value = 0;
    fetchFlavors();
  }

  async function handleReset() {
    searchForm.flavorName = "";
    pagination.page = 1;
    hasQueried.value = false;
    isSearching.value = false;
    activeStatIndex.value = 0;
    await fetchFlavors();
  }

  function handleSelectionChange(rows: Flavor[]) {
    selectedIds.value = rows.map((row) => row.id);
  }

  function resetForm() {
    formData.id = undefined;
    formData.flavorName = "";
    formData.valueList = "";
    isEdit.value = false;
  }

  function handleAdd() {
    resetForm();
    dialogVisible.value = true;
  }

  function handleEdit(row: Flavor) {
    resetForm();
    isEdit.value = true;
    formData.id = row.id;
    formData.flavorName = row.flavorName;
    formData.valueList = row.valueList;
    dialogVisible.value = true;
  }

  async function handleSubmit() {
    try {
      submitLoading.value = true;

      if (isEdit.value && formData.id) {
        await updateFlavor({
          id: formData.id,
          flavorName: formData.flavorName,
          valueList: formData.valueList,
        });
        ElMessage.success("修改成功");
      } else {
        await createFlavor({
          flavorName: formData.flavorName,
          valueList: formData.valueList,
        });
        ElMessage.success("新增成功");
      }

      dialogVisible.value = false;
      fetchFlavors();
    } catch (error) {
      console.error("提交失败:", error);
    } finally {
      submitLoading.value = false;
    }
  }

  async function handleDelete(row: Flavor) {
    try {
      await ElMessageBox.confirm(
        "确定要删除该口味吗？如果该口味已被菜品/套餐使用，将无法删除。",
        "确认删除",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        },
      );
      await deleteFlavor(row.id);
      ElMessage.success("删除成功");
      fetchFlavors();
    } catch (error) {
      if (error !== "cancel") {
        console.error("删除失败:", error);
      }
    }
  }

  async function handleBatchDelete() {
    if (selectedIds.value.length === 0) {
      ElMessage.warning("请先选择要删除的口味");
      return;
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedIds.value.length} 个口味吗？`,
        "批量删除",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        },
      );

      for (const id of selectedIds.value) {
        await deleteFlavor(id);
      }

      ElMessage.success(`成功删除 ${selectedIds.value.length} 个口味`);
      selectedIds.value = [];
      fetchFlavors();
    } catch (error) {
      if (error !== "cancel") {
        console.error("批量删除失败:", error);
      }
    }
  }

  return {
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
    hasQueried,
    hasSearchCondition,
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
  };
}
