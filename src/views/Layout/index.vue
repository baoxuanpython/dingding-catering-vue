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
            <el-icon v-if="loading" class="status-loading" :size="12"><Loading /></el-icon>
          </div>
          <div v-if="!isCollapse" class="status-text-group">
            <span class="status-text">{{ shopStatus === 1 ? '营业中' : '已打烊' }}</span>
            <span class="status-hint">点击切换状态</span>
          </div>
        </div>
      </div>
    </el-aside>

    <el-container class="layout-right">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon 
            class="collapse-btn" 
            @click="toggleCollapse"
            :size="20"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
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
            <el-icon :size="20" class="header-icon-btn"><Sunny v-if="!isDark" /><Moon v-else /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="light" :disabled="themeMode === 'light'">
                  <el-icon><Sunny /></el-icon> 浅色模式
                </el-dropdown-item>
                <el-dropdown-item command="dark" :disabled="themeMode === 'dark'">
                  <el-icon><Moon /></el-icon> 深色模式
                </el-dropdown-item>
                <el-dropdown-item command="auto" :disabled="themeMode === 'auto'">
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
              <span class="username">{{ userStore.userInfo?.name || '管理员' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
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
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore, type ThemeMode } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { useShopStore } from '@/stores/shop'
import {
  HomeFilled, List, Dish, TakeawayBox, Menu, UserFilled, DataAnalysis,
  Fold, Expand, Bell, Sunny, Moon, Monitor, Food, Loading
} from '@element-plus/icons-vue'

const route = useRoute()
const themeStore = useThemeStore()
const userStore = useUserStore()
const shopStore = useShopStore()

const isCollapse = ref(false)
const activeMenu = computed(() => route.path)
const themeMode = computed(() => themeStore.themeMode)
const isDark = computed(() => themeStore.isDark)
const shopStatus = computed(() => shopStore.shopStatus)
const loading = computed(() => shopStore.loading)

const toggleShopStatus = () => {
  const newStatus: 0 | 1 = shopStore.shopStatus === 1 ? 0 : 1
  shopStore.updateShopStatus(newStatus)
}

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title as string
  }))
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleThemeChange = (mode: ThemeMode) => {
  themeStore.applyTheme(mode)
}

const handleUserCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
  }
}

onMounted(() => {
  shopStore.initShopStatus()
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background: var(--bg-primary);
  padding: 12px;
  display: flex;
  gap: 12px;
}

.layout-aside {
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: var(--shadow);
  transition: width 0.3s;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--el-border-color-light);
  background: linear-gradient(135deg, var(--primary-bg) 0%, transparent 100%);
  position: relative;
  overflow: hidden;
}

.logo::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
  opacity: 0.05;
  animation: logoPulse 4s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% { transform: scale(1); opacity: 0.05; }
  50% { transform: scale(1.1); opacity: 0.08; }
}

.logo-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
  position: relative;
  z-index: 1;
  transition: transform 0.3s, box-shadow 0.3s;
}

.logo-icon-wrapper:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
}

.logo-icon {
  color: #fff;
}

.logo-full {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.logo-text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.logo-subtitle {
  font-size: 10px;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
  background: transparent;
  padding: 8px;
  overflow-y: auto;
}

.sidebar-menu .el-menu-item {
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.sidebar-menu .el-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%);
  transform: scaleY(0);
  transition: transform 0.3s;
}

.sidebar-menu .el-menu-item:hover::before {
  transform: scaleY(1);
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, var(--primary-bg) 0%, transparent 100%);
  color: var(--primary);
  font-weight: 600;
}

.sidebar-menu .el-menu-item.is-active::before {
  transform: scaleY(1);
}

.sidebar-menu .el-menu-item:hover {
  background: var(--primary-bg);
  transform: translateX(4px);
}

.menu-icon {
  transition: transform 0.3s;
}

.sidebar-menu .el-menu-item:hover .menu-icon {
  transform: scale(1.15) rotate(-5deg);
}

.sidebar-menu .el-menu-item.is-active .menu-icon {
  animation: iconBounce 0.5s ease;
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  flex-shrink: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.status-indicator::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary-bg) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.status-indicator:hover::before {
  opacity: 1;
}

.status-indicator:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.15);
}

.status-indicator.is-closed:hover {
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.15);
}

.status-indicator.is-loading {
  pointer-events: none;
  opacity: 0.6;
}

.status-dot-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 8px var(--primary);
  animation: statusPulse 2s ease-in-out infinite;
  transition: all 0.3s;
}

.status-indicator.is-closed .status-dot {
  background: #f56c6c;
  box-shadow: 0 0 8px #f56c6c;
  animation: statusPulseRed 2s ease-in-out infinite;
}

.status-loading {
  position: absolute;
  color: var(--primary);
  animation: spin 1s linear infinite;
}

.status-indicator.is-closed .status-loading {
  color: #f56c6c;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--primary); }
  50% { opacity: 0.6; box-shadow: 0 0 12px var(--primary); }
}

@keyframes statusPulseRed {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px #f56c6c; }
  50% { opacity: 0.6; box-shadow: 0 0 12px #f56c6c; }
}

.status-text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 1;
}

.status-text {
  font-size: 13px;
  color: var(--primary);
  font-weight: 600;
  transition: color 0.3s;
}

.status-indicator.is-closed .status-text {
  color: #f56c6c;
}

.status-hint {
  font-size: 10px;
  color: var(--text-secondary);
  opacity: 0.7;
  transition: opacity 0.3s;
}

.status-indicator:hover .status-hint {
  opacity: 1;
}

.layout-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.layout-header {
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  color: var(--el-text-color-regular);
}

.collapse-btn:hover {
  color: #67c23a;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon-btn {
  cursor: pointer;
  color: var(--el-text-color-regular);
}

.header-icon-btn:hover {
  color: #67c23a;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-avatar {
  background: var(--primary-bg);
  color: var(--primary);
}

.username {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.layout-main {
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}
</style>

<style>
/* 全局样式：侧边栏折叠 tooltip 绿色主题 */
.sidebar-tooltip {
  border: none !important;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2) !important;
  background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%) !important;
  padding: 8px 16px !important;
  border-radius: 6px !important;
}

.sidebar-tooltip .el-popper__arrow::before {
  background: #67c23a !important;
  border-color: #67c23a !important;
}

.sidebar-tooltip * {
  color: #fff !important;
  font-weight: 500 !important;
}
</style>
