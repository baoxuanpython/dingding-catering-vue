/**
 * 订单状态常量
 */
export const OrderStatus = {
  PENDING: 1, // 待付款
  TO_BE_CONFIRMED: 2, // 待接单
  CONFIRMED: 3, // 已接单（待派送）
  DELIVERY_IN_PROGRESS: 4, // 派送中
  COMPLETED: 5, // 已完成
  CANCELLED: 6, // 已取消
  REFUNDED: 7, // 已退款
} as const;

/**
 * 订单状态标签映射
 */
export const ORDER_STATUS_MAP: Record<
  number,
  { text: string; type: "info" | "warning" | "success" | "danger" | "primary" }
> = {
  [OrderStatus.PENDING]: { text: "待付款", type: "info" },
  [OrderStatus.TO_BE_CONFIRMED]: { text: "待接单", type: "warning" },
  [OrderStatus.CONFIRMED]: { text: "已接单", type: "primary" },
  [OrderStatus.DELIVERY_IN_PROGRESS]: { text: "派送中", type: "primary" },
  [OrderStatus.COMPLETED]: { text: "已完成", type: "success" },
  [OrderStatus.CANCELLED]: { text: "已取消", type: "danger" },
  [OrderStatus.REFUNDED]: { text: "已退款", type: "danger" },
};

/**
 * 支付方式映射
 */
export const PAY_METHOD_MAP: Record<number, string> = {
  1: "微信支付",
  2: "支付宝",
  3: "余额支付",
};

/**
 * 支付状态映射
 */
export const PAY_STATUS_MAP: Record<number, string> = {
  0: "未支付",
  1: "已支付",
  2: "退款",
};
