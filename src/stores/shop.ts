import { defineStore } from "pinia";
import { ref } from "vue";
import { getShopStatus, setShopStatus } from "@/api/shop";
import { ElMessage } from "element-plus";

export const useShopStore = defineStore("shop", () => {
  const shopStatus = ref<0 | 1>(1);
  const loading = ref(false);

  async function fetchShopStatus() {
    try {
      const res = await getShopStatus();
      shopStatus.value = res.data as 0 | 1;
    } catch {
      shopStatus.value = 1;
    }
  }

  async function updateShopStatus(newStatus: 0 | 1) {
    try {
      loading.value = true;
      await setShopStatus(newStatus);
      shopStatus.value = newStatus;
      ElMessage.success(newStatus === 1 ? "已营业" : "已打烊");
    } catch {
      shopStatus.value = newStatus === 1 ? 0 : 1;
    } finally {
      loading.value = false;
    }
  }

  async function initShopStatus() {
    await fetchShopStatus();
  }

  return {
    shopStatus,
    loading,
    fetchShopStatus,
    updateShopStatus,
    initShopStatus,
  };
});
