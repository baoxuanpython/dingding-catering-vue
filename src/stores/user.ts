import { defineStore } from "pinia";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { login as loginApi, logout as logoutApi } from "@/api/auth";
import type { LoginResponse } from "@/api/auth";
import router from "@/router";

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(localStorage.getItem("token") || "");
  const userInfo = ref<LoginResponse | null>(null);

  const login = async (username: string, password: string) => {
    const res = await loginApi({ username, password });
    token.value = res.token;
    userInfo.value = res;
    localStorage.setItem("token", res.token);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      token.value = "";
      userInfo.value = null;
      localStorage.removeItem("token");
      ElMessage.success("已退出登录");
      router.push("/login");
    }
  };

  return { token, userInfo, login, logout };
});
