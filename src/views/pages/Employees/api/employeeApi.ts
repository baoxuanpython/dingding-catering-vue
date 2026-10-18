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

/** 启用/禁用员工 */
export function updateEmployeeStatus(status: number, id: number) {
  return request.post(`/employee/status/${status}`, null, { params: { id } });
}

/** 根据ID查询员工 */
export function getEmployeeById(id: number) {
  return request.get<EmployeeVO>(`/employee/${id}`);
}

/** 修改密码 */
export function editPassword(data: EditPasswordForm) {
  return request.put("/employee/editPassword", data);
}
