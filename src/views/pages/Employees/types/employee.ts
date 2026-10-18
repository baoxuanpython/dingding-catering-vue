/**
 * 员工管理 - 类型定义
 */

/** 员工视图对象 */
export interface EmployeeVO {
  id: number;
  name: string;
  username: string;
  phone: string;
  sex: string; // 1=男, 2=女
  idNumber: string;
  status: number; // 1=启用, 0=禁用
  createTime: string;
  updateTime: string;
  createUser: number; // 创建人ID
  updateUser: number; // 更新人ID
  createEmployeeName: string; // 创建人姓名（冗余字段）
  updateEmployeeName: string; // 更新人姓名（冗余字段）
}

/** 员工分页查询参数 */
export interface EmployeePageQuery {
  name?: string;
  page: number;
  pageSize: number;
  status?: number;
  phone?: string;
}

/** 员工表单 */
export interface EmployeeForm {
  id?: number;
  name: string;
  username: string;
  phone: string;
  sex: string;
  idNumber: string;
}

/** 修改密码表单 */
export interface EditPasswordForm {
  empId: number;
  oldPassword: string;
  newPassword: string;
}
