import request from "@/utils/request";

/**
 * 查询今日运营数据
 */
export function getBusinessData() {
  return request.get("/workspace/businessData");
}

/**
 * 查询套餐总览
 */
export function getOverviewSetmeals() {
  return request.get("/workspace/overviewSetmeals");
}

/**
 * 查询菜品总览
 */
export function getOverviewDishes() {
  return request.get("/workspace/overviewDishes");
}

/**
 * 查询订单管理数据
 */
export function getOverviewOrders() {
  return request.get("/workspace/overviewOrders");
}

/**
 * 获取营业状态
 */
export function getShopStatus() {
  return request.get<number>("/shop/status");
}

/**
 * 设置营业状态
 */
export function setShopStatus(status: number) {
  return request.put<string>(`/shop/${status}`);
}
