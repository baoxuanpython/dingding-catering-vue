/**
 * 业务错误码枚举
 *
 * > 创建日期：2026-10-13
 * > 标签：#错误码 #API #TypeScript
 *
 * 当后端返回的 code !== 1 时，code 字段为以下枚举值之一。
 * 用于前端类型检查和错误处理参考。
 */

export enum ErrorCode {
  // ========== 成功 ==========
  SUCCESS = 1,

  // ========== 认证模块 (1xxx) ==========
  TOKEN_EXPIRED = 1001, // 令牌已过期
  TOKEN_INVALID = 1002, // 令牌无效
  NOT_LOGGED_IN = 1003, // 用户未登录
  ACCOUNT_NOT_FOUND = 1004, // 账号不存在
  ACCOUNT_LOCKED = 1005, // 账号已被锁定
  PASSWORD_WRONG = 1006, // 密码错误
  LOGIN_FAILED = 1007, // 登录失败

  // ========== 员工模块 (2xxx) ==========
  PASSWORD_CHANGE_FAILED = 2001, // 密码修改失败
  NO_PERMISSION_FOR_OTHERS = 2002, // 无权为其他用户操作数据

  // ========== 分类模块 (3xxx) ==========
  CATEGORY_HAS_SETMEAL = 3001, // 当前分类关联了套餐，不能删除
  CATEGORY_HAS_DISH = 3002, // 当前分类关联了菜品，不能删除

  // ========== 菜品模块 (4xxx) ==========
  DISH_ON_SALE_CANNOT_DELETE = 4001, // 起售中的菜品不能删除
  DISH_HAS_SETMEAL = 4002, // 当前菜品关联了套餐，不能删除
  DISH_NOT_FOUND = 4003, // 菜品不存在

  // ========== 套餐模块 (5xxx) ==========
  SETMEAL_ON_SALE_CANNOT_DELETE = 5001, // 起售中的套餐不能删除
  SETMEAL_HAS_DISABLED_DISH = 5002, // 套餐内包含未启售菜品，无法启用
  SETMEAL_NOT_FOUND = 5003, // 套餐不存在

  // ========== 订单模块 (6xxx) ==========
  ORDER_STATUS_ERROR = 6001, // 订单状态错误
  ORDER_NOT_FOUND = 6002, // 订单不存在
  ORDER_BUSINESS_ERROR = 6003, // 订单业务异常

  // ========== 购物车模块 (7xxx) ==========
  CART_EMPTY = 7001, // 购物车数据为空，不能下单
  CART_BUSINESS_ERROR = 7002, // 购物车业务异常

  // ========== 地址簿模块 (8xxx) ==========
  ADDRESS_EMPTY = 8001, // 用户地址为空，不能下单
  ADDRESS_BUSINESS_ERROR = 8002, // 地址业务异常

  // ========== 通用/系统模块 (9xxx) ==========
  PARAM_VALIDATION_FAILED = 9001, // 参数校验失败
  DATA_ALREADY_EXISTS = 9002, // 数据已存在
  FILE_UPLOAD_FAILED = 9003, // 文件上传失败
  JSON_SERIALIZE_ERROR = 9004, // JSON 序列化/反序列化异常
  DELETE_NOT_ALLOWED = 9005, // 不允许删除
  UNKNOWN_ERROR = 9999, // 未知错误
}

/**
 * HTTP 状态码枚举
 */
export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * 错误码对应的 HTTP 状态码映射
 */
export const ErrorCodeToHttpStatus: Record<number, number> = {
  [ErrorCode.TOKEN_EXPIRED]: HttpStatusCode.UNAUTHORIZED,
  [ErrorCode.TOKEN_INVALID]: HttpStatusCode.UNAUTHORIZED,
  [ErrorCode.NOT_LOGGED_IN]: HttpStatusCode.UNAUTHORIZED,
  [ErrorCode.ACCOUNT_NOT_FOUND]: HttpStatusCode.UNAUTHORIZED,
  [ErrorCode.ACCOUNT_LOCKED]: HttpStatusCode.UNAUTHORIZED,
  [ErrorCode.PASSWORD_WRONG]: HttpStatusCode.UNAUTHORIZED,
  [ErrorCode.LOGIN_FAILED]: HttpStatusCode.UNAUTHORIZED,

  [ErrorCode.PASSWORD_CHANGE_FAILED]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.NO_PERMISSION_FOR_OTHERS]: HttpStatusCode.FORBIDDEN,

  [ErrorCode.CATEGORY_HAS_SETMEAL]: HttpStatusCode.CONFLICT,
  [ErrorCode.CATEGORY_HAS_DISH]: HttpStatusCode.CONFLICT,

  [ErrorCode.DISH_ON_SALE_CANNOT_DELETE]: HttpStatusCode.CONFLICT,
  [ErrorCode.DISH_HAS_SETMEAL]: HttpStatusCode.CONFLICT,
  [ErrorCode.DISH_NOT_FOUND]: HttpStatusCode.CONFLICT,

  [ErrorCode.SETMEAL_ON_SALE_CANNOT_DELETE]: HttpStatusCode.CONFLICT,
  [ErrorCode.SETMEAL_HAS_DISABLED_DISH]: HttpStatusCode.CONFLICT,
  [ErrorCode.SETMEAL_NOT_FOUND]: HttpStatusCode.CONFLICT,

  [ErrorCode.ORDER_STATUS_ERROR]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.ORDER_NOT_FOUND]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.ORDER_BUSINESS_ERROR]: HttpStatusCode.UNPROCESSABLE_ENTITY,

  [ErrorCode.CART_EMPTY]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.CART_BUSINESS_ERROR]: HttpStatusCode.UNPROCESSABLE_ENTITY,

  [ErrorCode.ADDRESS_EMPTY]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.ADDRESS_BUSINESS_ERROR]: HttpStatusCode.UNPROCESSABLE_ENTITY,

  [ErrorCode.PARAM_VALIDATION_FAILED]: HttpStatusCode.BAD_REQUEST,
  [ErrorCode.DATA_ALREADY_EXISTS]: HttpStatusCode.CONFLICT,
  [ErrorCode.FILE_UPLOAD_FAILED]: HttpStatusCode.INTERNAL_SERVER_ERROR,
  [ErrorCode.JSON_SERIALIZE_ERROR]: HttpStatusCode.INTERNAL_SERVER_ERROR,
  [ErrorCode.DELETE_NOT_ALLOWED]: HttpStatusCode.CONFLICT,
  [ErrorCode.UNKNOWN_ERROR]: HttpStatusCode.INTERNAL_SERVER_ERROR,
};
