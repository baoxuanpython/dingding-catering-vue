/**
 * 分类管理 API
 */
import request from "@/utils/request";
import type {
  Category,
  CategoryPageQuery,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PageResult,
} from "../types/category";

/**
 * 分类分页查询
 */
export function getCategoryPage(params: CategoryPageQuery) {
  return request.get<PageResult<Category>>("/category/page", { params });
}

/**
 * 根据类型查询分类列表（不分页）
 */
export function getCategoryList(type?: number) {
  return request.get<Category[]>("/category/list", { params: { type } });
}

/**
 * 新增分类
 */
export function createCategory(data: CreateCategoryRequest) {
  return request.post<string>("/category", data);
}

/**
 * 修改分类
 */
export function updateCategory(data: UpdateCategoryRequest) {
  return request.put<string>("/category", data);
}

/**
 * 启用/禁用分类
 */
export function updateCategoryStatus(id: number, status: number) {
  return request.post<string>(`/category/status/${status}`, null, {
    params: { id },
  });
}

/**
 * 根据 id 删除分类
 */
export function deleteCategory(id: number) {
  return request.delete<string>("/category", { params: { id } });
}
