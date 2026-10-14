import request from "@/utils/request";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id?: number; // 员工 ID
  name?: string; // 姓名
  token?: string; // JWT 令牌
  userName?: string; // 用户名（后端返回 userName 驼峰）
  username?: string; // 兼容字段
  role?: "admin" | "user"; // 角色
}

/**
 * 员工登录
 */
export function login(data: LoginRequest) {
  return request.post<LoginResponse>("/employee/login", data);
}

/**
 * 退出登录
 */
export function logout() {
  return request.post<string>("/employee/logout");
}
