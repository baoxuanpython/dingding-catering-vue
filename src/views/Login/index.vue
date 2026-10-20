<template>
  <div class="login-container" :class="{ 'is-dark': isDark }">
    <!-- 动态背景 -->
    <div class="bg-animation">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <!-- 主内容区 -->
    <div class="login-content">
      <!-- 左侧品牌展示 -->
      <div class="brand-panel">
        <div class="brand-inner">
          <div class="brand-icon-wrapper">
            <div class="icon-glow"></div>
            <el-icon :size="72" class="brand-icon"><Food /></el-icon>
          </div>
          <h1 class="brand-name">叮叮餐饮</h1>
          <p class="brand-en">DingDing Catering Management</p>

          <div class="brand-divider"></div>

          <div class="feature-grid">
            <div class="feature-card">
              <el-icon :size="28"><List /></el-icon>
              <span>智能订单</span>
            </div>
            <div class="feature-card">
              <el-icon :size="28"><Dish /></el-icon>
              <span>菜品管理</span>
            </div>
            <div class="feature-card">
              <el-icon :size="28"><DataAnalysis /></el-icon>
              <span>数据洞察</span>
            </div>
            <div class="feature-card">
              <el-icon :size="28"><Timer /></el-icon>
              <span>实时统计</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-panel">
        <div class="login-card">
          <div class="login-header">
            <h2>欢迎回来</h2>
            <p>登录您的管理账号</p>
          </div>

          <el-form
            :model="loginForm"
            :rules="rules"
            ref="formRef"
            class="login-form"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="username">
              <div class="input-wrapper">
                <el-icon :size="20" class="input-icon"><User /></el-icon>
                <el-input
                  v-model="loginForm.username"
                  placeholder="用户名"
                  @keyup.enter="handleLogin"
                  class="modern-input"
                  autocomplete="username"
                />
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <div class="input-wrapper">
                <el-icon :size="20" class="input-icon"><Lock /></el-icon>
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="密码"
                  show-password
                  @keyup.enter="handleLogin"
                  class="modern-input"
                  autocomplete="current-password"
                />
              </div>
            </el-form-item>

            <el-form-item class="submit-item">
              <el-button
                type="primary"
                @click="handleLogin"
                :loading="loading"
                class="login-button"
              >
                <span v-if="!loading">登 录</span>
              </el-button>
            </el-form-item>
          </el-form>

          <div class="login-footer">
            <p>© 2026 叮叮餐饮 · 让管理更简单</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useThemeStore } from "@/stores/theme";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  Food,
  User,
  Lock,
  List,
  Dish,
  DataAnalysis,
  Timer,
} from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();
const themeStore = useThemeStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

const isDark = computed(() => themeStore.isDark);

const loginForm = reactive({
  username: "",
  password: "",
});

const rules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const handleLogin = async () => {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await userStore.login(loginForm.username, loginForm.password);
    ElMessage.success("登录成功");

    // 检查是否有重定向路径（从 401 拦截器保存的）
    const redirectPath = sessionStorage.getItem("redirectPath") || "/dashboard";
    sessionStorage.removeItem("redirectPath"); // 清除已使用的路径
    router.push(redirectPath);
  } catch (error) {
    // 错误已在响应拦截器中处理
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/login.scss";
</style>
