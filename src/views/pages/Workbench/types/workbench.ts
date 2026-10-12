/**
 * 今日运营数据
 */
export interface BusinessData {
  newUsers: number;
  turnover: number;
  validOrderCount: number;
  orderCompletionRate: number;
  unitPrice: number;
}

/**
 * 套餐总览
 */
export interface SetmealOverview {
  sold: number;
  discontinued: number;
}

/**
 * 菜品总览
 */
export interface DishOverview {
  sold: number;
  discontinued: number;
}

/**
 * 订单管理数据
 */
export interface OrderOverview {
  waitingOrders: number;
  deliveredOrders: number;
  allOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}
