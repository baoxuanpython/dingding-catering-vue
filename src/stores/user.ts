import { defineStore } from "pinia";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { login as loginApi, logout as logoutApi } from "@/api/auth";
import type { LoginResponse } from "@/api/auth";
import router from "@/router";

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(localStorage.getItem("token") || "");

  // 从 localStorage 恢复 userInfo（刷新页面时保留）
  const savedUserInfo = localStorage.getItem("userInfo");
  const userInfo = ref<LoginResponse | null>(
    savedUserInfo ? JSON.parse(savedUserInfo) : null,
  );

  const login = async (username: string, password: string) => {
    const res = await loginApi({ username, password });
    token.value = res.token;
    // 根据 userName 判断角色：admin 为管理员，其他为员工
    res.role = res.userName === "admin" ? "admin" : "user";
    userInfo.value = res;
    localStorage.setItem("token", res.token);
    localStorage.setItem("userInfo", JSON.stringify(res));
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      // 退出接口调用失败，不执行后续清理逻辑
      return;
    }

    // 退出成功，清理本地状态
    const currentPath = router.currentRoute.value.path;
    if (currentPath !== "/login") {
      sessionStorage.setItem("redirectPath", currentPath);
    }

    token.value = "";
    userInfo.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    ElMessage.success("已退出登录");
    router.push("/login");
  };

  return { token, userInfo, login, logout };
});
