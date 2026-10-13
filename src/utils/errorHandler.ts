/**
 * 全局异常处理工具
 *
 * > 创建日期：2026-10-14
 * > 标签：#错误处理 #全局异常 #TypeScript
 *
 * 四层错误捕获体系：
 * 1. Vue 组件层：app.config.errorHandler
 * 2. JavaScript 运行时层：window.onerror
 * 3. Promise 层：unhandledrejection
 * 4. HTTP 请求层：Axios 响应拦截器（已在 request.ts 中实现）
 */

import { ElMessage } from "element-plus";

/**
 * 错误类型枚举
 */
export type ErrorType = "vue" | "runtime" | "promise" | "http";

/**
 * 错误报告接口（仅用于本地日志，不上报后端）
 */
export interface ErrorReport {
  type: ErrorType;
  message: string;
  stack?: string;
  url?: string;
  component?: string;
  errorCode?: number;
  timestamp: number;
}

/**
 * 格式化错误报告为可读日志
 */
function formatErrorLog(report: ErrorReport): string {
  const lines = [
    `\n========== [${report.type.toUpperCase()} ERROR] ==========`,
    `时间: ${new Date(report.timestamp).toLocaleString()}`,
    `消息: ${report.message}`,
  ];

  if (report.component) lines.push(`组件: ${report.component}`);
  if (report.url) lines.push(`URL: ${report.url}`);
  if (report.errorCode) lines.push(`业务错误码: ${report.errorCode}`);
  if (report.stack) lines.push(`堆栈:\n${report.stack}`);

  lines.push("========================================\n");
  return lines.join("\n");
}

/**
 * 记录错误到控制台（开发环境详细，生产环境简化）
 */
export function logError(report: ErrorReport): void {
  const logMessage = formatErrorLog(report);

  if (import.meta.env.DEV) {
    // 开发环境：打印完整堆栈
    console.error(logMessage);
  } else {
    // 生产环境：只打印简要信息
    console.error(`[${report.type.toUpperCase()}] ${report.message}`);
  }
}

/**
 * 处理 Vue 组件层错误
 */
export function handleVueError(
  err: unknown,
  instance: any,
  _info: string,
): void {
  const componentName =
    instance?.$options?.name || instance?.$.type?.name || "Unknown";
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;

  const report: ErrorReport = {
    type: "vue",
    message,
    stack,
    component: componentName,
    timestamp: Date.now(),
  };

  logError(report);

  // 开发环境：弹窗提示详细错误信息
  if (import.meta.env.DEV) {
    ElMessage.error({
      message: `[组件错误] ${componentName}: ${message}`,
      duration: 5000,
      showClose: true,
    });
  } else {
    // 生产环境：通用提示
    ElMessage.error("页面渲染异常，请刷新重试");
  }
}

/**
 * 处理 JavaScript 运行时错误
 */
export function handleRuntimeError(
  message: string,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error,
): void {
  const report: ErrorReport = {
    type: "runtime",
    message,
    stack: error?.stack,
    url: source ? `${source}:${lineno}:${colno}` : undefined,
    timestamp: Date.now(),
  };

  logError(report);

  // 开发环境：弹窗提示
  if (import.meta.env.DEV) {
    ElMessage.error({
      message: `[运行时错误] ${message}`,
      duration: 5000,
      showClose: true,
    });
  } else {
    // 生产环境：静默记录，不弹窗（避免干扰用户）
  }
}

/**
 * 处理未捕获的 Promise rejection
 */
export function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  const reason = event.reason;
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : undefined;

  const report: ErrorReport = {
    type: "promise",
    message,
    stack,
    url: window.location.href,
    timestamp: Date.now(),
  };

  logError(report);

  // Promise rejection 不弹窗（避免与 HTTP 层重复提示）
  // 只在控制台记录
}

/**
 * 处理 HTTP 请求层错误（已在 request.ts 中实现，此处提供辅助函数）
 */
export function handleHttpError(
  _status: number | undefined,
  message: string,
  errorCode?: number,
): void {
  const report: ErrorReport = {
    type: "http",
    message,
    errorCode,
    url: window.location.href,
    timestamp: Date.now(),
  };

  logError(report);
}

/**
 * 注册全局错误处理器
 * 在 main.ts 中调用此函数
 */
export function registerGlobalErrorHandlers(app: any): void {
  // 1. Vue 组件层错误
  app.config.errorHandler = handleVueError;

  // 2. JavaScript 运行时错误
  window.addEventListener("error", (event) => {
    handleRuntimeError(
      event.message,
      event.filename,
      event.lineno,
      event.colno,
      event.error,
    );
  });

  // 3. Promise rejection
  window.addEventListener("unhandledrejection", (event) => {
    handleUnhandledRejection(event);
    // 阻止默认的 console.error 输出（我们已自定义处理）
    event.preventDefault();
  });

  console.log("[ErrorHandler] 全局异常处理体系已注册");
}
