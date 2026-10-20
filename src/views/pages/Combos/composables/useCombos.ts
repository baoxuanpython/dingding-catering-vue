import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getSetmealPage,
  getSetmealDetail,
  createSetmeal,
  updateSetmeal,
  deleteSetmeals,
  updateSetmealStatus,
  getCategoryList,
  getFlavorList,
} from "../api/comboApi";
import type {
  SetmealVO,
  SetmealPageQuery,
  SetmealForm,
  FlavorListItem,
} from "../types/combo";

export function useCombos() {
  const loading = ref(false);
  const submitLoading = ref(false);
  const comboList = ref<SetmealVO[]>([]);
  const categoryList = ref<{ id: number; name: string }[]>([]);
  const flavorList = ref<FlavorListItem[]>([]);
  const selectedIds = ref<number[]>([]);

  const statistics = reactive({
    total: 0,
    onSale: 0,
    offSale: 0,
  });

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

  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const isDetail = ref(false);

  const formData = reactive<SetmealForm>({
    name: "",
    categoryId: undefined,
    price: 0,
    image: "",
    description: "",
    status: 1,
    setmealDishes: [],
  });

  const activeStat = ref<string>("total");
  const hasQueried = ref(false);

  const hasSearchCondition = computed(() => {
    return !!(
      searchForm.name ||
      searchForm.categoryId !== undefined ||
      searchForm.status !== undefined
    );
  });

  const isOnlyStatusFilter = computed(() => {
    return (
      searchForm.status !== undefined &&
      !searchForm.name &&
      searchForm.categoryId === undefined
    );
  });

  const statCardLabel = computed(() => {
    if (
      hasSearchCondition.value &&
      hasQueried.value &&
      !isOnlyStatusFilter.value
    ) {
      return "指定状态查询";
    }
    if (isOnlyStatusFilter.value && hasQueried.value) {
      return searchForm.status === 1 ? "已启售" : "已停售";
    }
    return "套餐总数";
  });

  const statCardValue = computed(() => {
    if (
      hasSearchCondition.value &&
      hasQueried.value &&
      !isOnlyStatusFilter.value
    ) {
      return pagination.total;
    }
    if (isOnlyStatusFilter.value && hasQueried.value) {
      return searchForm.status === 1 ? statistics.onSale : statistics.offSale;
    }
    return statistics.total;
  });

  const isStatCustom = computed(() => {
    return (
      hasSearchCondition.value &&
      hasQueried.value &&
      !isOnlyStatusFilter.value &&
      activeStat.value === "total"
    );
  });

  async function fetchStatistics() {
    try {
      const [totalRes, onSaleRes, offSaleRes] = await Promise.all([
        getSetmealPage({ page: 1, pageSize: 1 }),
        getSetmealPage({ page: 1, pageSize: 1, status: 1 }),
        getSetmealPage({ page: 1, pageSize: 1, status: 0 }),
      ]);
      statistics.total = totalRes.total || 0;
      statistics.onSale = onSaleRes.total || 0;
      statistics.offSale = offSaleRes.total || 0;
    } catch (error) {
      console.error("获取套餐统计失败:", error);
    }
  }

  async function fetchCombos() {
    loading.value = true;
    try {
      const params: SetmealPageQuery = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        name: searchForm.name || undefined,
        categoryId: searchForm.categoryId,
        status: searchForm.status,
      };
      const res = await getSetmealPage(params);
      comboList.value = res.records || [];
      pagination.total = res.total || 0;
      return true;
    } catch (error) {
      console.error("获取套餐列表失败:", error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategories() {
    try {
      const res = await getCategoryList(2);
      categoryList.value = res || [];
    } catch (error) {
      console.error("获取分类列表失败:", error);
    }
  }

  async function fetchFlavors() {
    try {
      const res = await getFlavorList();
      flavorList.value = res || [];
    } catch (error) {
      console.error("获取口味列表失败:", error);
    }
  }

  function handleSearch() {
    pagination.page = 1;
    hasQueried.value = true;
    fetchCombos();
  }

  async function handleReset() {
    searchForm.name = "";
    searchForm.categoryId = undefined;
    searchForm.status = undefined;
    pagination.page = 1;
    activeStat.value = "total";
    hasQueried.value = false;
    await fetchCombos();
  }

  function handleSelectionChange(rows: SetmealVO[]) {
    selectedIds.value = rows.map((row) => row.id);
  }

  function resetForm() {
    formData.id = undefined;
    formData.name = "";
    formData.categoryId = undefined;
    formData.price = 0;
    formData.image = "";
    formData.description = "";
    formData.status = 1;
    formData.setmealDishes = [];
    formData.createEmployeeName = undefined;
    formData.updateEmployeeName = undefined;
    formData.updateTime = undefined;
    isEdit.value = false;
    isDetail.value = false;
  }

  function handleAdd() {
    resetForm();
    dialogVisible.value = true;
  }

  async function handleEdit(row: SetmealVO) {
    try {
      resetForm();
      isEdit.value = true;
      const res = await getSetmealDetail(row.id);
      Object.assign(formData, {
        id: res.id,
        name: res.name,
        categoryId: res.categoryId,
        price: res.price,
        image: res.image,
        description: res.description,
        status: res.status,
        setmealDishes: res.setmealDishes || [],
        createEmployeeName: res.createEmployeeName,
        updateEmployeeName: res.updateEmployeeName,
        updateTime: res.updateTime,
      });
      dialogVisible.value = true;
    } catch (error) {
      console.error("获取套餐详情失败:", error);
    }
  }

  async function handleDetail(row: SetmealVO) {
    try {
      resetForm();
      isDetail.value = true;
      const res = await getSetmealDetail(row.id);
      Object.assign(formData, {
        id: res.id,
        name: res.name,
        categoryId: res.categoryId,
        price: res.price,
        image: res.image,
        description: res.description,
        status: res.status,
        setmealDishes: res.setmealDishes || [],
        createEmployeeName: res.createEmployeeName,
        updateEmployeeName: res.updateEmployeeName,
        updateTime: res.updateTime,
      });
      dialogVisible.value = true;
    } catch (error) {
      console.error("获取套餐详情失败:", error);
    }
  }

  async function handleSubmit(imageUrl?: string) {
    try {
      submitLoading.value = true;
      const imageData = imageUrl || formData.image;

      if (isEdit.value && formData.id) {
        await updateSetmeal({
          id: formData.id,
          name: formData.name,
          categoryId: formData.categoryId!,
          price: formData.price,
          image: imageData,
          description: formData.description,
          status: formData.status,
          setmealDishes: formData.setmealDishes.map((dish) => ({
            ...dish,
            setmealId: formData.id!,
          })),
        });
        ElMessage.success("修改成功");
      } else {
        await createSetmeal({
          name: formData.name,
          categoryId: formData.categoryId!,
          price: formData.price,
          image: imageData,
          description: formData.description,
          status: formData.status,
          setmealDishes: formData.setmealDishes.map((dish) => ({
            ...dish,
            setmealId: 0,
          })),
        });
        ElMessage.success("新增成功");
      }

      dialogVisible.value = false;
      fetchCombos();
      fetchStatistics();
    } catch (error) {
      console.error("提交失败:", error);
    } finally {
      submitLoading.value = false;
    }
  }

  async function handleDelete(id: number) {
    try {
      await ElMessageBox.confirm(
        "确定要删除该套餐吗？此操作不可恢复！",
        "确认删除",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        },
      );
      await deleteSetmeals([id]);
      ElMessage.success("删除成功");
      fetchCombos();
      fetchStatistics();
    } catch (error) {
      if (error !== "cancel") {
        console.error("删除失败:", error);
      }
    }
  }

  async function handleBatchDelete() {
    if (selectedIds.value.length === 0) {
      ElMessage.warning("请先选择要删除的套餐");
      return;
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedIds.value.length} 个套餐吗？此操作不可恢复！`,
        "批量删除",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        },
      );
      await deleteSetmeals(selectedIds.value);
      ElMessage.success(`成功删除 ${selectedIds.value.length} 个套餐`);
      selectedIds.value = [];
      fetchCombos();
      fetchStatistics();
    } catch (error) {
      if (error !== "cancel") {
        console.error("批量删除失败:", error);
      }
    }
  }

  async function handleStatusToggle(row: SetmealVO) {
    const newStatus = row.status === 1 ? 0 : 1;
    const actionText = newStatus === 1 ? "启售" : "停售";

    try {
      await ElMessageBox.confirm(
        `确定要${actionText}该套餐吗？`,
        `确认${actionText}`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        },
      );

      await updateSetmealStatus(row.id, newStatus);
      ElMessage.success(`已${actionText}`);
      fetchCombos();
      fetchStatistics();
    } catch (error) {
      if (error !== "cancel") {
        console.error("更新状态失败:", error);
      }
    }
  }

  async function handleStatClick(stat: string) {
    if (stat === "total") {
      if (hasSearchCondition.value) {
        searchForm.name = "";
        searchForm.categoryId = undefined;
        searchForm.status = undefined;
        pagination.page = 1;
        activeStat.value = "total";
        hasQueried.value = false;

        const success = await fetchCombos();
        if (success) {
          return;
        }
      }
    } else if (stat === "onSale" || stat === "offSale") {
      activeStat.value = stat;
      searchForm.name = "";
      searchForm.categoryId = undefined;
      searchForm.status = stat === "onSale" ? 1 : 0;
      pagination.page = 1;
      hasQueried.value = true;
      await fetchCombos();
    }
  }

  return {
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
    hasQueried,
    hasSearchCondition,
    isOnlyStatusFilter,
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
  };
}
