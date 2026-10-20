<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="layout-aside">
      <div class="logo">
        <div v-if="isCollapse" class="logo-icon-wrapper">
          <el-icon :size="28" class="logo-icon"><Food /></el-icon>
        </div>
        <div v-else class="logo-full">
          <div class="logo-icon-wrapper">
            <el-icon :size="28" class="logo-icon"><Food /></el-icon>
          </div>
          <div class="logo-text-group">
            <span class="logo-text">叮叮餐饮</span>
            <span class="logo-subtitle">DingDing Catering</span>
          </div>
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        :popper-class="'sidebar-tooltip'"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard" class="menu-item">
          <el-icon class="menu-icon"><HomeFilled /></el-icon>
          <template #title>工作台</template>
        </el-menu-item>
        <el-menu-item index="/orders" class="menu-item">
          <el-icon class="menu-icon"><List /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item index="/meals" class="menu-item">
          <el-icon class="menu-icon"><Dish /></el-icon>
          <template #title>菜品管理</template>
        </el-menu-item>
        <el-menu-item index="/combos" class="menu-item">
          <el-icon class="menu-icon"><TakeawayBox /></el-icon>
          <template #title>套餐管理</template>
        </el-menu-item>
        <el-menu-item index="/categories" class="menu-item">
          <el-icon class="menu-icon"><Menu /></el-icon>
          <template #title>分类管理</template>
        </el-menu-item>
        <el-menu-item index="/flavors" class="menu-item">
          <el-icon class="menu-icon"><CoffeeCup /></el-icon>
          <template #title>口味管理</template>
        </el-menu-item>
        <el-menu-item index="/employees" class="menu-item">
          <el-icon class="menu-icon"><UserFilled /></el-icon>
          <template #title>员工管理</template>
        </el-menu-item>
        <el-menu-item index="/statistics" class="menu-item">
          <el-icon class="menu-icon"><DataAnalysis /></el-icon>
          <template #title>数据统计</template>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <div
          class="status-indicator"
          :class="{ 'is-closed': shopStatus === 0, 'is-loading': loading }"
          @click="toggleShopStatus"
        >
          <div class="status-dot-wrapper">
            <span class="status-dot"></span>
            <el-icon v-if="loading" class="status-loading" :size="12"
              ><Loading
            /></el-icon>
          </div>
          <div v-if="!isCollapse" class="status-text-group">
            <span class="status-text">{{
              shopStatus === 1 ? "营业中" : "已打烊"
            }}</span>
            <span class="status-hint">点击切换状态</span>
          </div>
        </div>
      </div>
    </el-aside>

    <el-container class="layout-right">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse" :size="20">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }"
              >首页</el-breadcrumb-item
            >
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-badge :value="3" :max="99" class="header-icon-btn">
            <el-icon :size="20"><Bell /></el-icon>
          </el-badge>

          <el-dropdown trigger="click" @command="handleThemeChange">
            <el-icon :size="20" class="header-icon-btn"
              ><Sunny v-if="!isDark" /><Moon v-else
            /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  command="light"
                  :disabled="themeMode === 'light'"
                >
                  <el-icon><Sunny /></el-icon> 浅色模式
                </el-dropdown-item>
                <el-dropdown-item
                  command="dark"
                  :disabled="themeMode === 'dark'"
                >
                  <el-icon><Moon /></el-icon> 深色模式
                </el-dropdown-item>
                <el-dropdown-item
                  command="auto"
                  :disabled="themeMode === 'auto'"
                >
                  <el-icon><Monitor /></el-icon> 跟随系统
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">
                <el-icon :size="18"><UserFilled /></el-icon>
              </el-avatar>
              <span class="username">{{
                userStore.userInfo?.userName || "用户"
              }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout" divided
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useThemeStore, type ThemeMode } from "@/stores/theme";
import { useUserStore } from "@/stores/user";
import { useShopStore } from "@/stores/shop";
import {
  HomeFilled,
  List,
  Dish,
  TakeawayBox,
  Menu,
  UserFilled,
  DataAnalysis,
  Fold,
  Expand,
  Bell,
  Sunny,
  Moon,
  Monitor,
  Food,
  Loading,
  CoffeeCup,
} from "@element-plus/icons-vue";

const route = useRoute();
const themeStore = useThemeStore();
const userStore = useUserStore();
const shopStore = useShopStore();

const isCollapse = ref(false);
const activeMenu = computed(() => route.path);
const themeMode = computed(() => themeStore.themeMode);
const isDark = computed(() => themeStore.isDark);
const shopStatus = computed(() => shopStore.shopStatus);
const loading = computed(() => shopStore.loading);

const toggleShopStatus = () => {
  const newStatus: 0 | 1 = shopStore.shopStatus === 1 ? 0 : 1;
  shopStore.updateShopStatus(newStatus);
};

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta?.title);
  return matched.map((item) => ({
    path: item.path,
    title: item.meta.title as string,
  }));
});

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

const handleThemeChange = (mode: ThemeMode) => {
  themeStore.applyTheme(mode);
};

const handleUserCommand = (command: string) => {
  if (command === "logout") {
    userStore.logout();
  }
};

onMounted(() => {
  shopStore.initShopStatus();
});
</script>

<style lang="scss" scoped>
@use "@/styles/layout.scss";
</style>
