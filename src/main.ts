import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/dist/index.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import App from "./App.vue";
import router from "./router";
import { useThemeStore } from "./stores/theme";
import { registerGlobalErrorHandlers } from "./utils/errorHandler";
import "./styles/theme-light.css";
import "./styles/theme-dark.css";
import "./styles/theme-cyberpunk.css";
import "./styles/theme.css";
import "./styles/common-page.scss";

// 创建 Vue 应用实例
const app = createApp(App);

// 注册 Pinia（全局状态管理）
const pinia = createPinia();
app.use(pinia);

// 初始化主题（必须在挂载前）
const themeStore = useThemeStore();
themeStore.initTheme();

// 注册 Vue Router（路由系统）
app.use(router);

// 注册 Element Plus（UI 组件库）并设置中文语言包
app.use(ElementPlus, {
  locale: zhCn,
});

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 注册全局异常处理体系
registerGlobalErrorHandlers(app);

// 挂载应用到 #app 元素
app.mount("#app");
