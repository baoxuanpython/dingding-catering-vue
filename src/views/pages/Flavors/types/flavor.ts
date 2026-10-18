/**
 * 口味字典管理 - 类型定义
 */

/** 口味字典 */
export interface Flavor {
  id: number;
  flavorName: string;
  valueList: string;
}

/** 口味分页查询参数 */
export interface FlavorPageQuery {
  page: number;
  pageSize: number;
  flavorName?: string;
}

/** 新增/修改口味请求 */
export interface FlavorDTO {
  id?: number;
  flavorName: string;
  valueList: string;
}

/** 口味表单 */
export interface FlavorForm {
  id?: number;
  flavorName: string;
  valueList: string;
}

/** 分页结果 */
export interface PageResult<T> {
  total: number;
  records: T[];
}
