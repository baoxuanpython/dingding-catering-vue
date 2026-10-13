/**
 * 员工管理 - API 调用
 */
import request from "@/utils/request";
import type {
  EmployeeVO,
  EmployeePageQuery,
  EmployeeForm,
  EditPasswordForm,
} from "../types/employee";

/** 分页查询员工 */
export function getEmployeePage(params: EmployeePageQuery) {
  return request.get<{ total: number; records: EmployeeVO[] }>(
    "/employee/page",
    { params },
  );
}

/** 新增员工 */
export function createEmployee(data: EmployeeForm) {
  return request.post("/employee", data);
}

/** 编辑员工 */
export function updateEmployee(data: EmployeeForm) {
  return request.put("/employee", data);
}

/** 删除员工 */
export function deleteEmployee(id: number) {
  return request.delete(`/employee/${id}`);
}

/** 批量删除员工 */
export function batchDeleteEmployees(ids: number[]) {
  return request.delete("/employee", { data: { ids } });
}

/** 启用/禁用员工 */
export function updateEmployeeStatus(status: number, id: number) {
  return request.post(`/employee/status/${status}`, null, { params: { id } });
}

/** 修改密码 */
export function editPassword(data: EditPasswordForm) {
  return request.put("/employee/editPassword", data);
}
