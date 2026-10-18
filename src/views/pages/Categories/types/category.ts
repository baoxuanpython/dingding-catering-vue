/**
 * 分类管理类型定义
 */

/**
 * 分类类型枚举
 */
export enum CategoryType {
  DISH = 1, // 菜品分类
  SETMEAL = 2, // 套餐分类
}

/**
 * 分类状态枚举
 */
export enum CategoryStatus {
  DISABLED = 0, // 禁用
  ENABLED = 1, // 启用
}

/**
 * 分类实体
 */
export interface Category {
  id: number;
  type: number;
  name: string;
  sort: number;
  status: number;
  createTime: string;
  updateTime: string;
  createUser: number;
  updateUser: number;
  createEmployeeName: string; // 创建人姓名（冗余字段）
  updateEmployeeName: string; // 更新人姓名（冗余字段）
}

/**
 * 分页查询参数
 */
export interface CategoryPageQuery {
  name?: string;
  page: number;
  pageSize: number;
  type?: number;
}

/**
 * 新增分类请求
 */
export interface CreateCategoryRequest {
  name: string;
  sort: number;
  type: number;
}

/**
 * 修改分类请求
 */
export interface UpdateCategoryRequest {
  id: number;
  name: string;
  sort: number;
  type: number;
}

/**
 * 分页响应数据
 */
export interface PageResult<T> {
  total: number;
  records: T[];
}

/**
 * 统计卡片数据
 */
export interface CategoryStats {
  total: number;
  enabled: number;
  disabled: number;
}
