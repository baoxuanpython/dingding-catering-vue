import request from "@/utils/request";
import type {
  SetmealVO,
  SetmealPageQuery,
  SetmealDetail,
  CreateSetmealRequest,
  UpdateSetmealRequest,
  PageResult,
} from "../types/combo";

export function getSetmealPage(params: SetmealPageQuery) {
  return request.get<PageResult<SetmealVO>>("/setmeal/page", { params });
}

export function getSetmealDetail(id: number) {
  return request.get<SetmealDetail>(`/setmeal/${id}`);
}

export function createSetmeal(data: CreateSetmealRequest) {
  return request.post<object>("/setmeal", data);
}

export function updateSetmeal(data: UpdateSetmealRequest) {
  return request.put<object>("/setmeal", data);
}

export function deleteSetmeals(ids: number[]) {
  return request.delete<object>("/setmeal", { params: { ids: ids.join(",") } });
}

export function updateSetmealStatus(id: number, status: number) {
  return request.post<object>(`/setmeal/status/${status}`, { params: { id } });
}

export function getCategoryList(type: number) {
  return request.get<{ id: number; name: string }[]>("/category/list", {
    params: { type },
  });
}
