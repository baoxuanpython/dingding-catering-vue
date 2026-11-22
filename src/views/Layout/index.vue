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
        <el-menu-item
          v-if="userStore.isAdmin"
          index="/employees"
          class="menu-item"
        >
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
          <el-popover
            v-model:visible="panelVisible"
            placement="bottom-end"
            :width="360"
            trigger="click"
            popper-class="message-popover"
          >
            <template #reference>
              <el-badge
                :value="messageStore.unreadCount"
                :max="99"
                :hidden="messageStore.unreadCount === 0"
                class="header-icon-btn"
              >
                <el-icon :size="20"><Bell /></el-icon>
              </el-badge>
            </template>
            <MessagePanel @select="handleMessageSelect" />
          </el-popover>

          <el-dropdown trigger="click" @command="handleThemeChange">
            <el-icon :size="20" class="header-icon-btn"
              ><Sunny v-if="!isDark" /><Moon v-else
            /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="theme in themeStore.THEMES"
                  :key="theme.name"
                  :command="theme.name"
                  :disabled="activeThemeName === theme.name"
                >
                  <el-icon>
                    <Sunny v-if="theme.name === 'light'" />
                    <Monitor v-else-if="theme.name === 'cyberpunk'" />
                    <Moon v-else />
                  </el-icon>
                  {{ theme.label }}模式
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

    <!-- 个人信息弹窗 -->
    <ProfileDialog
      v-model="profileVisible"
      :loading="profileLoading"
      :form-data="profileForm"
      @submit="handleProfileSubmit"
    />

    <!-- 修改密码弹窗 -->
    <PasswordDialog v-model="passwordVisible" @submit="handlePasswordSubmit" />
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useThemeStore, type ThemeName } from "@/stores/theme";
import { useUserStore } from "@/stores/user";
import { useShopStore } from "@/stores/shop";
import { useMessageStore } from "@/stores/message";
import { useWebSocket } from "@/composables/useWebSocket";
import { useNotificationSound } from "@/composables/useNotificationSound";
import { ElMessage } from "element-plus";
import MessagePanel from "./components/MessagePanel.vue";
import ProfileDialog from "./components/ProfileDialog.vue";
import PasswordDialog from "@/components/PasswordDialog.vue";
import type { MessageItem } from "@/api/message";
import type { EmployeeForm } from "@/views/pages/Employees/types/employee";
import {
  getEmployeeById,
  updateEmployee,
  editSelfPassword,
} from "@/views/pages/Employees/api/employeeApi";
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
const router = useRouter();
const themeStore = useThemeStore();
const userStore = useUserStore();
const shopStore = useShopStore();
const messageStore = useMessageStore();
const { play: playNotification } = useNotificationSound();

const isCollapse = ref(false);
const panelVisible = ref(false);

const { connect, disconnect } = useWebSocket({
  onMessage: (data: any) => {
    if (!data || (data.type !== 1 && data.type !== 2)) return;
    messageStore.increaseUnread();
    messageStore.bumpOrderPush();
    playNotification(data.type);
    if (panelVisible.value) {
      openMessagePanel();
    }
  },
});

/**
 * 打开面板：拉第一页 + 全部标已读（红点立即清零）
 * 拉取失败时不标记已读，避免消息未展示却清空红点
 */
async function openMessagePanel() {
  const ok = await messageStore.fetchFirstPage();
  if (!ok) return;
  await messageStore.markAllRead();
}

watch(panelVisible, (visible) => {
  if (visible) openMessagePanel();
});

/**
 * 点击消息：关闭面板并带着订单号跳转订单页
 */
function handleMessageSelect(item: MessageItem) {
  panelVisible.value = false;
  if (!item.orderNumber) {
    ElMessage.info("该消息未关联订单");
    return;
  }
  const alreadyOnSameOrder =
    route.path === "/orders" && route.query.number === item.orderNumber;
  if (alreadyOnSameOrder) {
    messageStore.bumpOrderFocus();
    return;
  }
  router.push({ path: "/orders", query: { number: item.orderNumber } });
}
const activeMenu = computed(() => route.path);
const activeThemeName = computed(() => themeStore.activeThemeName);
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

const handleThemeChange = (name: ThemeName) => {
  themeStore.applyTheme(name);
};

// ==================== 个人信息 / 修改密码 ====================
const profileVisible = ref(false);
const profileLoading = ref(false);
const passwordVisible = ref(false);

const profileForm = reactive<EmployeeForm>({
  id: undefined,
  name: "",
  username: "",
  phone: "",
  sex: "1",
  idNumber: "",
});

/**
 * 打开个人信息弹窗
 * 缓存里只有 id/name/userName，手机号等字段必须实时拉接口
 */
async function openProfile() {
  const empId = userStore.userInfo?.id;
  if (!empId) {
    ElMessage.warning("未获取到当前登录员工信息，请重新登录");
    return;
  }

  profileForm.id = empId;
  profileForm.name = userStore.userInfo?.name || "";
  profileForm.username = userStore.userInfo?.userName || "";
  profileForm.phone = "";
  profileForm.sex = "1";
  profileForm.idNumber = "";

  profileVisible.value = true;
  profileLoading.value = true;
  try {
    const res = await getEmployeeById(empId);
    Object.assign(profileForm, {
      id: res.id,
      name: res.name,
      username: res.username,
      phone: res.phone,
      sex: res.sex,
      idNumber: res.idNumber,
    });
  } catch (error) {
    console.error("获取个人信息失败:", error);
  } finally {
    profileLoading.value = false;
  }
}

async function handleProfileSubmit() {
  profileLoading.value = true;
  try {
    await updateEmployee({ ...profileForm });
    ElMessage.success("个人信息已保存");
    profileVisible.value = false;
  } catch (error) {
    console.error("保存个人信息失败:", error);
  } finally {
    profileLoading.value = false;
  }
}

async function handlePasswordSubmit(data: {
  oldPassword: string;
  newPassword: string;
}) {
  try {
    await editSelfPassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
    ElMessage.success("密码修改成功");
    passwordVisible.value = false;
  } catch (error) {
    console.error("修改密码失败:", error);
  }
}

const handleUserCommand = (command: string) => {
  if (command === "logout") {
    disconnect();
    messageStore.reset();
    userStore.logout();
    return;
  }
  if (command === "profile") {
    openProfile();
    return;
  }
  if (command === "password") {
    passwordVisible.value = true;
  }
};

onMounted(() => {
  shopStore.initShopStatus();
  messageStore.fetchFirstPage();
  connect();
});

onUnmounted(() => {
  disconnect();
});
</script>

<style lang="scss" scoped>
@use "@/styles/layout.scss";
</style>
