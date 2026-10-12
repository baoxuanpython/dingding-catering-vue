import request from "@/utils/request";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  token: string;
  userName: string;
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
