/**
 * 菜品管理 - 类型定义
 */

/** 菜品分页查询参数 */
export interface DishPageQuery {
  page: number;
  pageSize: number;
  name?: string;
  categoryId?: number;
  status?: number;
}

/** 菜品 VO（列表展示） */
export interface DishVO {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  image: string;
  description: string;
  status: number;
  updateTime: string;
  createEmployeeName: string;
  updateEmployeeName: string;
  flavors: DishFlavor[];
}

/** 菜品详情 */
export interface DishDetail {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  image: string;
  description: string;
  status: number;
  updateTime: string;
  createEmployeeName: string; // 创建人姓名（冗余字段）
  updateEmployeeName: string; // 更新人姓名（冗余字段）
  flavors: DishFlavor[];
}

/** 菜品口味（与接口文档一致） */
export interface DishFlavor {
  id?: number;
  flavorName: string;
  flavorValue: string;
  valueList: string;
}

/** 新增菜品请求 */
export interface CreateDishRequest {
  name: string;
  categoryId: number;
  price: number;
  image: string;
  description?: string;
  status?: number;
  flavors?: DishFlavor[];
}

/** 修改菜品请求 */
export interface UpdateDishRequest {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  image: string;
  description?: string;
  status?: number;
  flavors?: DishFlavor[];
}

/** 分类 */
export interface Category {
  id: number;
  name: string;
  type: number;
  sort: number;
  status: number;
}

/** 简化版菜品（用于分类查询列表，无 categoryName） */
export interface Dish {
  id?: number;
  name?: string;
  categoryId?: number;
  price?: number;
  image?: string;
  description?: string;
  status?: number;
  createTime?: string;
  updateTime?: string;
  createUser?: number;
  updateUser?: number;
  createEmployeeName?: string; // 创建人姓名（冗余字段）
  updateEmployeeName?: string; // 更新人姓名（冗余字段）
}

/** 菜品总览统计 */
export interface DishOverview {
  sold: number; // 已启售菜品数量
  discontinued: number; // 已停售菜品数量
}

/** 菜品表单（用于新增/编辑） */
export interface DishForm {
  id?: number;
  name: string;
  categoryId: number | undefined;
  price: number;
  image: string;
  description: string;
  status: number;
  flavors: DishFlavor[];
}
