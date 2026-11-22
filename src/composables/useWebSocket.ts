import { onUnmounted, ref } from "vue";
import { handleAuthFailure } from "@/utils/request";

/**
 * 管理端 WebSocket 连接（催单 / 新订单推送）
 *
 * - 连接地址：{VITE_WS_BASE_URL}/ws/{sid}
 * - 令牌通过子协议 `ws-token.<jwt>` 传递：浏览器无法自定义握手请求头，
 *   且查询参数会把令牌明文写进服务端访问日志
 * - sid 仅用于服务端日志追踪，不参与消息分发（分发按令牌解析出的角色）
 * - 鉴权通过后服务端先下发 `{"type":"connected",...}` 回执，收到它才算真正连通
 * - 关闭码 1008（策略违规）表示令牌缺失/过期/伪造，此时重连只会被反复踢下线，
 *   因此清理登录态并跳转登录页，不再重连
 */

const RECONNECT_DELAY = 5000;
const CLOSE_CODE_POLICY_VIOLATION = 1008;
const TOKEN_SUBPROTOCOL_PREFIX = "ws-token.";

export interface WebSocketHandlers {
  onMessage?: (data: any) => void;
  onConnected?: () => void;
}

function buildUrl(): string {
  const base = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080";
  const sid = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${base.replace(/\/$/, "")}/ws/${sid}`;
}

function readToken(): string {
  return localStorage.getItem("token") ?? "";
}

export function useWebSocket(handlers: WebSocketHandlers = {}) {
  const connected = ref(false);

  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closedByUser = false;

  function clearReconnectTimer() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, RECONNECT_DELAY);
  }

  function connect() {
    closedByUser = false;

    const isActive =
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING);
    if (isActive) return;

    // 未登录不建连接：后端必然以 1008 关闭
    const token = readToken();
    if (!token) return;

    // 令牌含非法字符时构造函数会抛异常，按鉴权失败处理，避免中断整个页面初始化
    try {
      socket = new WebSocket(buildUrl(), [
        `${TOKEN_SUBPROTOCOL_PREFIX}${token}`,
      ]);
    } catch {
      closedByUser = true;
      handleAuthFailure();
      return;
    }

    socket.onopen = () => {
      // TCP 握手完成，但鉴权结果尚未可知，等 connected 回执再置为已连接
    };

    socket.onmessage = (event) => {
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        // 非 JSON 报文直接忽略
        return;
      }

      if (data?.type === "connected") {
        connected.value = true;
        handlers.onConnected?.();
        return;
      }

      handlers.onMessage?.(data);
    };

    socket.onclose = (event) => {
      connected.value = false;
      socket = null;

      if (event.code === CLOSE_CODE_POLICY_VIOLATION) {
        // 令牌失效：清登录态 + 提示 + 跳登录页，且不再重连
        closedByUser = true;
        clearReconnectTimer();
        handleAuthFailure();
        return;
      }

      if (!closedByUser) scheduleReconnect();
    };

    socket.onerror = () => {
      socket?.close();
    };
  }

  function disconnect() {
    closedByUser = true;
    clearReconnectTimer();
    socket?.close();
    socket = null;
    connected.value = false;
  }

  onUnmounted(disconnect);

  return { connected, connect, disconnect };
}
