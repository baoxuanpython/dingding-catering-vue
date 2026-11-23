/**
 * 业务错误码枚举
 * <p>
 * 与后端 com.dingdingcatering.enumeration.ErrorCode 保持一一镜像，
 * 新增或修改错误码时必须同步两侧，避免出现「码相同、含义不同」的排障陷阱。
 * <p>
 * 号段分配：
 * - 1xxx  认证模块
 * - 2xxx  员工模块
 * - 3xxx  分类模块
 * - 4xxx  菜品模块
 * - 5xxx  套餐模块
 * - 6xxx  订单模块
 * - 7xxx  购物车模块
 * - 8xxx  地址簿模块
 * - 9xxx  口味类型模块
 * - 99xxx 通用/系统模块
 */
export enum ErrorCode {
  // ========== 成功 ==========
  SUCCESS = 1,

  // ========== 认证模块 (1xxx) ==========
  TOKEN_EXPIRED = 1001, // 令牌已过期
  TOKEN_INVALID = 1002, // 令牌无效
  NOT_LOGGED_IN = 1003, // 用户未登录
  USER_NOT_FOUND = 1004, // 用户不存在或已被删除
  ACCOUNT_NOT_FOUND = 1005, // 账号或密码错误
  ACCOUNT_DISABLED = 1006, // 账号已被禁用
  PASSWORD_ERROR = 1007, // 账号或密码错误
  LOGIN_FAILED = 1008, // 登录失败

  // ========== 员工模块 (2xxx) ==========
  PASSWORD_CHANGE_FAILED = 2001, // 密码修改失败
  SECURITY_ERROR = 2002, // 无权进行该操作

  // ========== 分类模块 (3xxx) ==========
  CATEGORY_HAS_SETMEAL = 3001, // 当前分类关联了套餐，不能删除
  CATEGORY_HAS_DISH = 3002, // 当前分类关联了菜品，不能删除
  CATEGORY_DUPLICATE_NAME = 3003, // 分类名称已存在

  // ========== 菜品模块 (4xxx) ==========
  DISH_ON_SALE_CANNOT_DELETE = 4001, // 起售中的菜品不能删除
  DISH_HAS_SETMEAL = 4002, // 当前菜品关联了套餐，不能删除
  DISH_NOT_FOUND = 4003, // 菜品不存在

  // ========== 套餐模块 (5xxx) ==========
  SETMEAL_ON_SALE_CANNOT_DELETE = 5001, // 起售中的套餐不能删除
  SETMEAL_HAS_DISABLED_DISH = 5002, // 套餐内包含未启售菜品，无法启用
  SETMEAL_NOT_FOUND = 5003, // 套餐不存在
  SETMEAL_NO_DISHES = 5004, // 套餐未关联任何菜品

  // ========== 订单模块 (6xxx) ==========
  ORDER_STATUS_ERROR = 6001, // 订单状态错误
  ORDER_NOT_FOUND = 6002, // 订单不存在
  ORDER_BUSINESS_ERROR = 6003, // 订单业务异常
  ORDER_REMINDER_TOO_FREQUENT = 6004, // 催单过于频繁，请稍后再试

  // ========== 购物车模块 (7xxx) ==========
  CART_EMPTY = 7001, // 购物车数据为空，不能下单
  CART_BUSINESS_ERROR = 7002, // 购物车业务异常

  // ========== 地址簿模块 (8xxx) ==========
  ADDRESS_EMPTY = 8001, // 用户地址为空，不能下单
  ADDRESS_BUSINESS_ERROR = 8002, // 地址业务异常

  // ========== 口味类型模块 (9xxx) ==========
  FLAVOR_NAME_EXIST = 9001, // 口味类型名称已存在
  FLAVOR_DELETE_FAILED = 9006, // 口味类型关联了菜品，不能删除

  // ========== 通用/系统模块 (99xxx) ==========
  PARAM_VALIDATION_FAILED = 99001, // 参数校验失败
  DATA_ALREADY_EXISTS = 99002, // 数据已存在
  FILE_UPLOAD_FAILED = 99003, // 文件上传失败
  JSON_SERIALIZE_ERROR = 99004, // JSON 序列化/反序列化异常
  DELETE_NOT_ALLOWED = 99005, // 不允许删除
  UNKNOWN_ERROR = 99999, // 未知错误
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
  [ErrorCode.USER_NOT_FOUND]: HttpStatusCode.UNAUTHORIZED,
  [ErrorCode.ACCOUNT_NOT_FOUND]: HttpStatusCode.UNAUTHORIZED,
  [ErrorCode.ACCOUNT_DISABLED]: HttpStatusCode.UNAUTHORIZED,
  [ErrorCode.PASSWORD_ERROR]: HttpStatusCode.UNAUTHORIZED,
  [ErrorCode.LOGIN_FAILED]: HttpStatusCode.UNAUTHORIZED,

  [ErrorCode.PASSWORD_CHANGE_FAILED]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.SECURITY_ERROR]: HttpStatusCode.FORBIDDEN,

  [ErrorCode.CATEGORY_HAS_SETMEAL]: HttpStatusCode.CONFLICT,
  [ErrorCode.CATEGORY_HAS_DISH]: HttpStatusCode.CONFLICT,
  [ErrorCode.CATEGORY_DUPLICATE_NAME]: HttpStatusCode.CONFLICT,

  [ErrorCode.DISH_ON_SALE_CANNOT_DELETE]: HttpStatusCode.CONFLICT,
  [ErrorCode.DISH_HAS_SETMEAL]: HttpStatusCode.CONFLICT,
  [ErrorCode.DISH_NOT_FOUND]: HttpStatusCode.CONFLICT,

  [ErrorCode.SETMEAL_ON_SALE_CANNOT_DELETE]: HttpStatusCode.CONFLICT,
  [ErrorCode.SETMEAL_HAS_DISABLED_DISH]: HttpStatusCode.CONFLICT,
  [ErrorCode.SETMEAL_NOT_FOUND]: HttpStatusCode.CONFLICT,
  [ErrorCode.SETMEAL_NO_DISHES]: HttpStatusCode.CONFLICT,

  [ErrorCode.ORDER_STATUS_ERROR]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.ORDER_NOT_FOUND]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.ORDER_BUSINESS_ERROR]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.ORDER_REMINDER_TOO_FREQUENT]: HttpStatusCode.UNPROCESSABLE_ENTITY,

  [ErrorCode.CART_EMPTY]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.CART_BUSINESS_ERROR]: HttpStatusCode.UNPROCESSABLE_ENTITY,

  [ErrorCode.ADDRESS_EMPTY]: HttpStatusCode.UNPROCESSABLE_ENTITY,
  [ErrorCode.ADDRESS_BUSINESS_ERROR]: HttpStatusCode.UNPROCESSABLE_ENTITY,

  [ErrorCode.FLAVOR_NAME_EXIST]: HttpStatusCode.CONFLICT,
  [ErrorCode.FLAVOR_DELETE_FAILED]: HttpStatusCode.CONFLICT,

  [ErrorCode.PARAM_VALIDATION_FAILED]: HttpStatusCode.BAD_REQUEST,
  [ErrorCode.DATA_ALREADY_EXISTS]: HttpStatusCode.CONFLICT,
  [ErrorCode.FILE_UPLOAD_FAILED]: HttpStatusCode.INTERNAL_SERVER_ERROR,
  [ErrorCode.JSON_SERIALIZE_ERROR]: HttpStatusCode.INTERNAL_SERVER_ERROR,
  [ErrorCode.DELETE_NOT_ALLOWED]: HttpStatusCode.CONFLICT,
  [ErrorCode.UNKNOWN_ERROR]: HttpStatusCode.INTERNAL_SERVER_ERROR,
};
