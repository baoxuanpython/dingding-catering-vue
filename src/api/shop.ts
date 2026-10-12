import request from "@/utils/request";

/**
 * 获取店铺营业状态
 * @returns 1=营业，0=打烊
 */
export function getShopStatus() {
  return request.get<number>("/shop/status");
}

/**
 * 设置店铺营业状态
 * @param status 1=营业，0=打烊
 */
export function setShopStatus(status: 0 | 1) {
  return request.put<string>(`/shop/${status}`);
}
