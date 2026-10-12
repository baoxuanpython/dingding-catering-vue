/**
 * 菜品管理 - API 接口
 */
import request from "@/utils/request";
import type {
  DishPageQuery,
  DishVO,
  DishDetail,
  CreateDishRequest,
  UpdateDishRequest,
  Category,
  Dish,
  DishOverview,
} from "../types/dish";

/**
 * 菜品分页查询
 * GET /admin/dish/page
 */
export function getDishPage(params: DishPageQuery) {
  return request.get<{ total: number; records: DishVO[] }>("/dish/page", {
    params,
  });
}

/**
 * 根据分类 ID 查询菜品列表
 * GET /admin/dish/list
 */
export function getDishListByCategory(categoryId: number) {
  return request.get<Dish[]>("/dish/list", { params: { categoryId } });
}

/**
 * 根据 ID 查询菜品详情
 * GET /admin/dish/{id}
 */
export function getDishDetail(id: number) {
  return request.get<DishDetail>(`/dish/${id}`);
}

/**
 * 新增菜品
 * POST /admin/dish
 */
export function createDish(data: CreateDishRequest) {
  return request.post<string>("/dish", data);
}

/**
 * 修改菜品
 * PUT /admin/dish
 */
export function updateDish(data: UpdateDishRequest) {
  return request.put<string>("/dish", data);
}

/**
 * 批量删除菜品
 * DELETE /admin/dish?ids=1,2,3
 */
export function deleteDishes(ids: number[]) {
  return request.delete<string>("/dish", { params: { ids: ids.join(",") } });
}

/**
 * 菜品起售/停售
 * POST /admin/dish/status/{status}?id=xxx
 */
export function updateDishStatus(id: number, status: number) {
  return request.post<string>(`/dish/status/${status}`, null, {
    params: { id },
  });
}

/**
 * 根据类型查询分类列表
 * GET /admin/category/list?type=1
 */
export function getCategoryList(type?: number) {
  return request.get<Category[]>("/category/list", { params: { type } });
}

/**
 * 查询菜品总览统计
 * GET /admin/workspace/overviewDishes
 */
export function getDishOverview() {
  return request.get<DishOverview>("/workspace/overviewDishes");
}
