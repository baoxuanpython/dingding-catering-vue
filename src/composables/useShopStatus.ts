import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getShopStatus, setShopStatus } from "@/api/shop";

/**
 * 店铺营业状态管理组合式函数
 * 用于获取和切换店铺营业状态
 */
export function useShopStatus() {
  const shopStatus = ref<0 | 1>(1); // 1=营业，0=打烊
  const loading = ref(false);

  /**
   * 获取店铺营业状态
   */
  async function fetchShopStatus() {
    try {
      const res = await getShopStatus();
      shopStatus.value = res.data as 0 | 1;
    } catch (error) {
      console.error("获取店铺状态失败:", error);
      // 默认营业状态
      shopStatus.value = 1;
    }
  }

  /**
   * 切换店铺营业状态（带确认弹窗）
   */
  async function toggleShopStatus() {
    const newStatus: 0 | 1 = shopStatus.value === 1 ? 0 : 1;
    const actionText = newStatus === 1 ? "营业" : "打烊";

    try {
      await ElMessageBox.confirm(
        `确定要切换为${actionText}状态吗？`,
        "确认操作",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        },
      );

      loading.value = true;
      await setShopStatus(newStatus);
      shopStatus.value = newStatus;
      ElMessage.success(`已切换为${actionText}状态`);
    } catch (error: any) {
      // 用户取消操作不提示错误
      if (error !== "cancel") {
        console.error("切换店铺状态失败:", error);
      }
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    fetchShopStatus();
  });

  return {
    shopStatus,
    loading,
    fetchShopStatus,
    toggleShopStatus,
  };
}
