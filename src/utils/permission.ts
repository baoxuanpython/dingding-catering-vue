export const ROLE_ADMIN = "admin";
export const ROLE_STAFF = "user";
export const ADMIN_USERNAME = "admin";

/**
 * 读取当前登录账号的角色
 *
 * 优先使用后端下发的 userInfo.role；
 * 老缓存中缺失 role 时按 userName === "admin" 判定为管理员，其余为普通员工。
 */
export function getCurrentRole(): string {
  try {
    const raw = localStorage.getItem("userInfo");
    if (!raw) return "";
    const info = JSON.parse(raw) as { role?: string; userName?: string };
    if (info.role) return info.role;
    return info.userName === ADMIN_USERNAME ? ROLE_ADMIN : ROLE_STAFF;
  } catch {
    return "";
  }
}

/**
 * 判断当前账号是否拥有指定角色之一
 * roles 为空表示不限制角色
 */
export function hasRole(roles?: string[]): boolean {
  if (!roles || roles.length === 0) return true;
  return roles.includes(getCurrentRole());
}
