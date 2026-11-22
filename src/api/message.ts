import request from "@/utils/request";

/**
 * 分页查询消息列表（含未读数）
 */
export function getMessageList(params: MessageQuery) {
  return request.get<MessagePageResult>("/message/list", {
    params,
    showError: false,
  });
}

/**
 * 全部标记为已读
 */
export function markAllRead() {
  return request.put("/message/readAll", undefined, { showError: false });
}

// ==================== 类型定义 ====================

export interface MessageQuery {
  page: number;
  pageSize: number;
}

export interface MessageItem {
  id: number;
  type: number; // 1=新订单 2=催单
  orderId?: number | null;
  orderNumber?: string | null;
  content: string;
  isRead: number; // 0=未读 1=已读
  createTime: string;
}

export interface MessagePageResult {
  total: number;
  unreadCount: number;
  records: MessageItem[];
}
