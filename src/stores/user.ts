import { defineStore } from "pinia";
import { ref } from "vue";
import { login as loginApi, logout as logoutApi } from "@/api/auth";
import type { LoginResponse } from "@/api/auth";
import router from "@/router";

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(localStorage.getItem("token") || "");
  const userInfo = ref<LoginResponse | null>(null);

  const login = async (username: string, password: string) => {
    const res = await loginApi({ username, password });
    token.value = res.data.token;
    userInfo.value = res.data;
    localStorage.setItem("token", res.data.token);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      token.value = "";
      userInfo.value = null;
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  return { token, userInfo, login, logout };
});
