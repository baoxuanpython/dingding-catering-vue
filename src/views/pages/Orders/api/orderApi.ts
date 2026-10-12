import request from "@/utils/request";

/**
 * 订单搜索（分页查询）
 */
export function searchOrders(params: OrderSearchQuery) {
  return request.get("/order/conditionSearch", { params });
}

/**
 * 查询订单详情
 */
export function getOrderDetail(id: number) {
  return request.get(`/order/details/${id}`);
}

/**
 * 接单
 */
export function confirmOrder(data: ConfirmOrderRequest) {
  return request.put("/order/confirm", data);
}

/**
 * 拒单
 */
export function rejectOrder(data: RejectOrderRequest) {
  return request.put("/order/rejection", data);
}

/**
 * 取消订单
 */
export function cancelOrder(data: CancelOrderRequest) {
  return request.put("/order/cancel", data);
}

/**
 * 派送订单
 */
export function deliveryOrder(id: number) {
  return request.put(`/order/delivery/${id}`);
}

/**
 * 完成订单
 */
export function completeOrder(id: number) {
  return request.put(`/order/complete/${id}`);
}

/**
 * 订单状态统计
 */
export function getOrderStatistics() {
  return request.get("/order/statistics");
}

// ==================== 类型定义 ====================

export interface OrderSearchQuery {
  page: number;
  pageSize: number;
  number?: string;
  phone?: string;
  status?: number;
  beginTime?: string;
  endTime?: string;
}

export interface ConfirmOrderRequest {
  id: number;
}

export interface RejectOrderRequest {
  id: number;
  rejectionReason: string;
}

export interface CancelOrderRequest {
  id: number;
  cancelReason: string;
}

export interface OrderVO {
  id: number;
  number: string;
  status: number;
  userId: number;
  addressBookId: number;
  orderTime: string;
  checkoutTime: string | null;
  payMethod: number;
  payStatus: number;
  amount: number;
  remark: string;
  userName: string;
  phone: string;
  address: string;
  consignee: string;
  cancelReason: string;
  rejectionReason: string;
  cancelTime: string;
  estimatedDeliveryTime: string;
  deliveryStatus: number;
  deliveryTime: string;
  packAmount: number;
  tablewareNumber: number;
  tablewareStatus: number;
  orderDishes: string;
}

export interface OrderDetail {
  id?: number;
  number?: string;
  status?: number;
  userId?: number;
  addressBookId?: number;
  address?: string;
  consignee?: string;
  phone?: string;
  amount?: number;
  remark?: string;
  orderTime?: string;
  checkoutTime?: string | null;
  payMethod?: number;
  payStatus?: number;
  cancelReason?: string;
  rejectionReason?: string;
  cancelTime?: string;
  estimatedDeliveryTime?: string;
  deliveryStatus?: number;
  deliveryTime?: string;
  packAmount?: number;
  tablewareNumber?: number;
  tablewareStatus?: number;
  userName?: string;
  orderDishes?: string;
  orderDetailList?: OrderDetailItem[];
}

export interface OrderDetailItem {
  id?: number;
  name?: string;
  image?: string;
  orderId?: number;
  dishId?: number;
  setmealId?: number;
  dishFlavor?: string;
  number?: number;
  amount?: number;
}

export interface OrderStatistics {
  toBeConfirmed: number;
  confirmed: number;
  deliveryInProgress: number;
  completed?: number;
  cancelled?: number;
  refunded?: number;
}
