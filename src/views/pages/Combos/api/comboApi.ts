import request from "@/utils/request";
import type {
  SetmealVO,
  SetmealPageQuery,
  CreateSetmealRequest,
  UpdateSetmealRequest,
  PageResult,
} from "../types/combo";

export function getSetmealPage(params: SetmealPageQuery) {
  return request.get<PageResult<SetmealVO>>("/setmeal/page", { params });
}

export function getSetmealDetail(id: number) {
  return request.get<SetmealVO>(`/setmeal/${id}`);
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
  return request.post<object>(`/setmeal/status/${status}`, null, {
    params: { id },
  });
}

export function getCategoryList(type: number) {
  return request.get<{ id: number; name: string }[]>("/category/list", {
    params: { type },
  });
}

export function getFlavorList() {
  return request.get<{ id: number; flavorName: string; valueList: string }[]>(
    "/flavor/list",
  );
}
