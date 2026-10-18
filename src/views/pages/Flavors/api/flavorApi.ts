/**
 * 口味字典管理 - API 接口
 */
import request from "@/utils/request";
import type {
  Flavor,
  FlavorPageQuery,
  FlavorDTO,
  PageResult,
} from "../types/flavor";

/**
 * 口味分页查询
 * GET /admin/flavor/page
 */
export function getFlavorPage(params: FlavorPageQuery) {
  return request.get<PageResult<Flavor>>("/flavor/page", { params });
}

/**
 * 根据 ID 查询口味详情
 * GET /admin/flavor/{id}
 */
export function getFlavorDetail(id: number) {
  return request.get<Flavor>(`/flavor/${id}`);
}

/**
 * 口味列表查询（用于下拉框）
 * GET /admin/flavor/list
 */
export function getFlavorList() {
  return request.get<Flavor[]>("/flavor/list");
}

/**
 * 新增口味
 * POST /admin/flavor
 */
export function createFlavor(data: FlavorDTO) {
  return request.post<string>("/flavor", data);
}

/**
 * 修改口味
 * PUT /admin/flavor
 */
export function updateFlavor(data: FlavorDTO) {
  return request.put<string>("/flavor", data);
}

/**
 * 删除口味
 * DELETE /admin/flavor?id=xxx
 */
export function deleteFlavor(id: number) {
  return request.delete<string>("/flavor", { params: { id } });
}
