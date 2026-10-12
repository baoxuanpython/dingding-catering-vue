<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="layout-aside">
      <div class="logo">
        <el-icon v-if="isCollapse" :size="24" color="#67c23a"><Food /></el-icon>
        <span v-else class="logo-text">叮叮餐饮</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>工作台</template>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item index="/meals">
          <el-icon><Dish /></el-icon>
          <template #title>菜品管理</template>
        </el-menu-item>
        <el-menu-item index="/combos">
          <el-icon><TakeawayBox /></el-icon>
          <template #title>套餐管理</template>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><Menu /></el-icon>
          <template #title>分类管理</template>
        </el-menu-item>
        <el-menu-item index="/employees">
          <el-icon><UserFilled /></el-icon>
          <template #title>员工管理</template>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据统计</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
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
            <el-icon :size="20" class="header-icon-btn"><Sun v-if="!isDark" /><Moon v-else /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="light" :disabled="themeMode === 'light'">
                  <el-icon><Sun /></el-icon> 浅色模式
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
              <el-avatar :size="32" src="">
                <el-icon :size="18"><UserFilled /></el-icon>
              </el-avatar>
              <span class="username">管理员</span>
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore, type ThemeMode } from '@/stores/theme'
import {
  HomeFilled, List, Dish, TakeawayBox, Menu, UserFilled, DataAnalysis,
  Fold, Expand, Bell, Sun, Moon, Monitor, User, Food
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

const isCollapse = computed(() => false)
const activeMenu = computed(() => route.path)
const themeMode = computed(() => themeStore.themeMode)
const isDark = computed(() => themeStore.isDark)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title as string
  }))
})

const toggleCollapse = () => {
  // TODO: 实现侧边栏折叠状态管理
}

const handleThemeChange = (mode: ThemeMode) => {
  themeStore.applyTheme(mode)
}

const handleUserCommand = (command: string) => {
  if (command === 'logout') {
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--el-border-color-light);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #67c23a;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 60px);
}

.layout-header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
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

.username {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.layout-main {
  background: var(--el-bg-color-page);
  padding: 20px;
}
</style>
