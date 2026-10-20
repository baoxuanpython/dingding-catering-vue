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
  [ErrorCode.ACCOUNT_NOT_FOUND]: "账号不存在",
  [ErrorCode.ACCOUNT_LOCKED]: "账号已被锁定，请联系管理员",
  [ErrorCode.PASSWORD_WRONG]: "密码错误，请重试",
  [ErrorCode.LOGIN_FAILED]: "登录失败，请检查账号和密码",

  // 员工模块 (2xxx)
  [ErrorCode.PASSWORD_CHANGE_FAILED]: "密码修改失败",
  [ErrorCode.NO_PERMISSION_FOR_OTHERS]: "无权为其他用户操作数据",

  // 分类模块 (3xxx)
  [ErrorCode.CATEGORY_HAS_SETMEAL]: "当前分类关联了套餐，不能删除",
  [ErrorCode.CATEGORY_HAS_DISH]: "当前分类关联了菜品，不能删除",

  // 菜品模块 (4xxx)
  [ErrorCode.DISH_ON_SALE_CANNOT_DELETE]: "起售中的菜品不能删除",
  [ErrorCode.DISH_HAS_SETMEAL]: "当前菜品关联了套餐，不能删除",
  [ErrorCode.DISH_NOT_FOUND]: "菜品不存在",

  // 套餐模块 (5xxx)
  [ErrorCode.SETMEAL_ON_SALE_CANNOT_DELETE]: "起售中的套餐不能删除",
  [ErrorCode.SETMEAL_HAS_DISABLED_DISH]: "套餐内包含未启售菜品，无法启用",
  [ErrorCode.SETMEAL_NOT_FOUND]: "套餐不存在",

  // 订单模块 (6xxx)
  [ErrorCode.ORDER_STATUS_ERROR]: "订单状态错误",
  [ErrorCode.ORDER_NOT_FOUND]: "订单不存在",
  [ErrorCode.ORDER_BUSINESS_ERROR]: "订单业务异常",

  // 购物车模块 (7xxx)
  [ErrorCode.CART_EMPTY]: "购物车数据为空，不能下单",
  [ErrorCode.CART_BUSINESS_ERROR]: "购物车业务异常",

  // 地址簿模块 (8xxx)
  [ErrorCode.ADDRESS_EMPTY]: "请先添加收货地址",
  [ErrorCode.ADDRESS_BUSINESS_ERROR]: "地址业务异常",

  // 通用/系统模块 (9xxx)
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

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const config = response.config as CustomAxiosRequestConfig;

    // Blob 响应（如文件导出）：直接返回原始数据，不解析 JSON
    if (config.headers?.responseType === "blob") {
      return response.data;
    }

    const res = response.data;

    // code 优先级最高：无论 HTTP 状态如何，都以 code 为准
    if (res.code === ErrorCode.SUCCESS) {
      // 成功：只返回 data（更简洁）
      return res.data;
    }

    // 业务错误处理：优先使用后端返回的详细错误信息，其次使用业务错误码映射的提示文案
    if (config.showError !== false) {
      const businessCode = res.code;
      const preciseMessage = businessErrorMessageMap[businessCode];

      // 优先使用后端返回的详细错误信息（如关联的套餐名称），其次使用业务错误码映射的提示，最后使用默认提示
      const message = res.msg || preciseMessage || "操作失败";

      // 401 认证类错误：弹窗提示后跳转登录页
      if (authErrorCodes.includes(businessCode)) {
        ElMessage.error({
          message,
          duration: 3000,
          showClose: true,
        });
        localStorage.removeItem("token");
        const currentPath = router.currentRoute.value.path;
        if (currentPath !== "/login") {
          sessionStorage.setItem("redirectPath", currentPath);
        }
        router.push("/login");
      } else {
        // 其他业务错误：弹窗提示
        ElMessage.error(message);
      }
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
      if (config.showError !== false) {
        // 优先使用后端返回的详细错误信息（如关联的套餐名称），其次使用业务错误码映射的提示，最后使用默认提示
        const message = errorData?.msg || preciseMessage || "操作失败";

        // 401 认证类错误：弹窗提示后跳转
        if (authErrorCodes.includes(businessCode)) {
          ElMessage.error({
            message,
            duration: 3000,
            showClose: true,
          });
          localStorage.removeItem("token");
          const currentPath = router.currentRoute.value.path;
          if (currentPath !== "/login") {
            sessionStorage.setItem("redirectPath", currentPath);
          }
          router.push("/login");
        } else {
          ElMessage.error(message);
        }
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
        // 401 认证失败：弹窗提示后跳转登录页
        if (config.showError !== false) {
          ElMessage.error({
            message:
              errorData?.msg || preciseMessage || "登录已过期，请重新登录",
            duration: 3000,
            showClose: true,
          });
        }
        localStorage.removeItem("token");
        const currentPath401 = router.currentRoute.value.path;
        if (currentPath401 !== "/login") {
          sessionStorage.setItem("redirectPath", currentPath401);
        }
        router.push("/login");
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
