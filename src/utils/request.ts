import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";
import { ErrorCode, HttpStatusCode } from "@/constants/errorCodes";

interface CustomAxiosRequestConfig {
  url?: string;
  method?: string;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  baseURL?: string;
  headers?: Record<string, any>;
  responseType?: string;
  showError?: boolean;
}

// 自定义 Axios 实例类型：响应拦截器已解包 data，所以直接返回 T
interface UnpackedAxiosInstance {
  get<T = any>(url: string, config?: CustomAxiosRequestConfig): Promise<T>;
  post<T = any>(
    url: string,
    data?: any,
    config?: CustomAxiosRequestConfig,
  ): Promise<T>;
  put<T = any>(
    url: string,
    data?: any,
    config?: CustomAxiosRequestConfig,
  ): Promise<T>;
  delete<T = any>(url: string, config?: CustomAxiosRequestConfig): Promise<T>;
  interceptors: {
    request: {
      use: (
        onFulfilled: (
          config: CustomAxiosRequestConfig,
        ) => CustomAxiosRequestConfig,
        onRejected?: (error: any) => any,
      ) => number;
      eject: (id: number) => void;
    };
    response: {
      use: (
        onFulfilled: (response: any) => any,
        onRejected?: (error: any) => any,
      ) => number;
      eject: (id: number) => void;
    };
  };
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
}) as unknown as UnpackedAxiosInstance;

// 请求拦截器
request.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.token = token;
    }
    // 默认显示错误提示（可在调用时通过 config.showError = false 关闭）
    if (config.showError === undefined) {
      config.showError = true;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 业务错误码映射到用户友好的提示文案
const businessErrorMessageMap: Record<number, string> = {
  // 认证模块 (1xxx)
  [ErrorCode.TOKEN_EXPIRED]: "登录已过期，请重新登录",
  [ErrorCode.TOKEN_INVALID]: "登录凭证无效，请重新登录",
  [ErrorCode.NOT_LOGGED_IN]: "请先登录",
  [ErrorCode.USER_NOT_FOUND]: "账号不存在或已被删除",
  [ErrorCode.ACCOUNT_NOT_FOUND]: "账号或密码错误",
  [ErrorCode.ACCOUNT_DISABLED]: "账号已被禁用，请联系管理员",
  [ErrorCode.PASSWORD_ERROR]: "账号或密码错误",
  [ErrorCode.LOGIN_FAILED]: "登录失败，请检查账号和密码",

  // 员工模块 (2xxx)
  [ErrorCode.PASSWORD_CHANGE_FAILED]: "密码修改失败",
  [ErrorCode.SECURITY_ERROR]: "无权进行该操作",

  // 分类模块 (3xxx)
  [ErrorCode.CATEGORY_HAS_SETMEAL]: "当前分类关联了套餐，不能删除",
  [ErrorCode.CATEGORY_HAS_DISH]: "当前分类关联了菜品，不能删除",
  [ErrorCode.CATEGORY_DUPLICATE_NAME]: "分类名称已存在",

  // 菜品模块 (4xxx)
  [ErrorCode.DISH_ON_SALE_CANNOT_DELETE]: "起售中的菜品不能删除",
  [ErrorCode.DISH_HAS_SETMEAL]: "当前菜品关联了套餐，不能删除",
  [ErrorCode.DISH_NOT_FOUND]: "菜品不存在",

  // 套餐模块 (5xxx)
  [ErrorCode.SETMEAL_ON_SALE_CANNOT_DELETE]: "起售中的套餐不能删除",
  [ErrorCode.SETMEAL_HAS_DISABLED_DISH]: "套餐内包含未启售菜品，无法启用",
  [ErrorCode.SETMEAL_NOT_FOUND]: "套餐不存在",
  [ErrorCode.SETMEAL_NO_DISHES]: "套餐未关联任何菜品",

  // 订单模块 (6xxx)
  [ErrorCode.ORDER_STATUS_ERROR]: "订单状态错误",
  [ErrorCode.ORDER_NOT_FOUND]: "订单不存在",
  [ErrorCode.ORDER_BUSINESS_ERROR]: "订单业务异常",
  [ErrorCode.ORDER_REMINDER_TOO_FREQUENT]: "催单过于频繁，请稍后再试",

  // 购物车模块 (7xxx)
  [ErrorCode.CART_EMPTY]: "购物车数据为空，不能下单",
  [ErrorCode.CART_BUSINESS_ERROR]: "购物车业务异常",

  // 地址簿模块 (8xxx)
  [ErrorCode.ADDRESS_EMPTY]: "请先添加收货地址",
  [ErrorCode.ADDRESS_BUSINESS_ERROR]: "地址业务异常",

  // 口味类型模块 (9xxx)
  [ErrorCode.FLAVOR_NAME_EXIST]: "口味类型名称已存在",
  [ErrorCode.FLAVOR_DELETE_FAILED]: "口味类型关联了菜品，不能删除",

  // 通用/系统模块 (99xxx)
  [ErrorCode.PARAM_VALIDATION_FAILED]: "参数校验失败",
  [ErrorCode.DATA_ALREADY_EXISTS]: "数据已存在",
  [ErrorCode.FILE_UPLOAD_FAILED]: "文件上传失败",
  [ErrorCode.JSON_SERIALIZE_ERROR]: "数据格式异常",
  [ErrorCode.DELETE_NOT_ALLOWED]: "不允许删除",
  [ErrorCode.UNKNOWN_ERROR]: "系统未知错误",
};

// 判断是否需要清除 token 并跳转登录页的业务错误码
const authErrorCodes = [
  ErrorCode.TOKEN_EXPIRED,
  ErrorCode.TOKEN_INVALID,
  ErrorCode.NOT_LOGGED_IN,
];

// 鉴权失效只处理一次：并发请求同时返回令牌失效时，只提示并跳转一次
let authFailureHandled = false;

// 鉴权失效统一提示文案：不暴露"令牌"等开发术语，只告诉用户该做什么
const AUTH_FAILURE_MESSAGE = "登录已失效，请重新登录";

/**
 * 统一处理鉴权失效：清理登录态 + 提示 + 跳转登录页
 * 并发场景下仅第一次生效，后续请求静默失败，避免重复弹窗与重复跳转
 *
 * 同时供 WebSocket 鉴权失败（关闭码 1008）复用，保证两条通道的失效提示只出现一次
 */
export function handleAuthFailure(config?: { showError?: boolean }): void {
  // 清理登录态（幂等操作，避免残留上一个用户的身份信息）
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");

  if (authFailureHandled) {
    return;
  }
  authFailureHandled = true;

  const currentPath = router.currentRoute.value.path;

  // 已经在登录页：不再提示，也不能把 /login 存成登录后的跳转目标
  if (currentPath === "/login") {
    return;
  }

  if (config?.showError !== false) {
    ElMessage.error({
      message: AUTH_FAILURE_MESSAGE,
      duration: 3000,
      showClose: true,
    });
  }

  sessionStorage.setItem("redirectPath", currentPath);
  router.push("/login");
}

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const config = response.config as CustomAxiosRequestConfig;

    // Blob 响应（如文件导出）：直接返回原始数据，不解析 JSON
    if (config.responseType === "blob") {
      return response.data;
    }

    const res = response.data;

    // code 优先级最高：无论 HTTP 状态如何，都以 code 为准
    if (res.code === ErrorCode.SUCCESS) {
      // 请求成功说明登录态已恢复，重置鉴权失效标记
      authFailureHandled = false;
      // 成功：只返回 data（更简洁）
      return res.data;
    }

    // 认证类错误：无论是否显示提示，都要清理登录态并跳转登录页（去重）
    if (authErrorCodes.includes(res.code)) {
      handleAuthFailure(config);
    } else if (config.showError !== false) {
      // 其他业务错误：优先使用后端返回的详细错误信息（如关联的套餐名称），其次使用业务错误码映射的提示
      const preciseMessage = businessErrorMessageMap[res.code];
      const message = res.msg || preciseMessage || "操作失败";
      ElMessage.error(message);
    }

    // 开发环境打印详细日志
    if (import.meta.env.DEV) {
      console.error(
        `[API Error] ${config.method?.toUpperCase()} ${config.url}`,
        "\n业务错误码:",
        res.code,
        "\n错误信息:",
        res.msg,
        "\n响应数据:",
        res,
      );
    }

    return Promise.reject(new Error(res.msg || "操作失败"));
  },
  (error) => {
    const config = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const errorData = error.response?.data;

    // code 优先级最高：即使 HTTP 报错，也优先使用业务错误码
    const businessCode = errorData?.code;
    const preciseMessage = businessErrorMessageMap[businessCode];

    // 如果有业务错误码，优先按业务错误处理
    if (businessCode && businessCode !== ErrorCode.SUCCESS) {
      // 认证类错误：无论是否显示提示，都要清理登录态并跳转登录页（去重）
      if (authErrorCodes.includes(businessCode)) {
        handleAuthFailure(config);
      } else if (config.showError !== false) {
        // 优先使用后端返回的详细错误信息（如关联的套餐名称），其次使用业务错误码映射的提示，最后使用默认提示
        const message = errorData?.msg || preciseMessage || "操作失败";
        ElMessage.error(message);
      }

      if (import.meta.env.DEV) {
        console.error(
          `[HTTP Error with Business Code] ${config?.method?.toUpperCase()} ${config?.url}`,
          "\nHTTP 状态码:",
          status,
          "\n业务错误码:",
          businessCode,
          "\n错误信息:",
          error.message,
        );
      }

      return Promise.reject(
        new Error(errorData?.msg || preciseMessage || "操作失败"),
      );
    }

    // 无业务错误码：按 HTTP 状态码处理
    switch (status) {
      case HttpStatusCode.UNAUTHORIZED:
        // 401 认证失败：统一处理（去重 + 清登录态 + 跳转登录页）
        handleAuthFailure(config);
        break;

      case HttpStatusCode.BAD_REQUEST:
        // 400 参数校验失败
        if (config.showError !== false) {
          ElMessage.error(errorData?.msg || preciseMessage || "参数错误");
        }
        break;

      case HttpStatusCode.FORBIDDEN:
        // 403 权限不足：弹窗提示，不跳转
        if (config.showError !== false) {
          ElMessage.error(errorData?.msg || preciseMessage || "无权操作");
        }
        break;

      case HttpStatusCode.CONFLICT:
        // 409 资源冲突
        if (config.showError !== false) {
          ElMessage.error(errorData?.msg || preciseMessage || "资源冲突");
        }
        break;

      case HttpStatusCode.UNPROCESSABLE_ENTITY:
        // 422 业务规则不满足
        if (config.showError !== false) {
          ElMessage.error(errorData?.msg || preciseMessage || "业务规则不满足");
        }
        break;

      case HttpStatusCode.INTERNAL_SERVER_ERROR:
        // 500 服务器内部错误
        if (config.showError !== false) {
          ElMessage.error(
            errorData?.msg || preciseMessage || "系统异常，请联系管理员",
          );
        }
        break;

      default:
        // 其他错误（网络超时、断网等）
        if (config.showError !== false) {
          ElMessage.error("网络异常，请稍后重试");
        }
    }

    // 开发环境打印详细日志
    if (import.meta.env.DEV) {
      console.error(
        `[HTTP Error] ${config?.method?.toUpperCase()} ${config?.url}`,
        "\nHTTP 状态码:",
        status,
        "\n业务错误码:",
        businessCode,
        "\n错误信息:",
        error.message,
        "\n响应数据:",
        errorData,
        "\n完整错误:",
        error,
      );
    }

    return Promise.reject(error);
  },
);

export default request;
export type { CustomAxiosRequestConfig };
