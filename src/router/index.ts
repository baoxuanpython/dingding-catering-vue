import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login/index.vue"),
  },
  {
    path: "/",
    component: () => import("../views/Layout/index.vue"),
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("../views/pages/Workbench/index.vue"),
        meta: { title: "工作台", requiresAuth: true },
      },
      {
        path: "orders",
        name: "Orders",
        component: () => import("../views/pages/Orders/index.vue"),
        meta: { title: "订单管理", requiresAuth: true },
      },
      {
        path: "meals",
        name: "Meals",
        component: () => import("../views/pages/Meals/index.vue"),
        meta: { title: "菜品管理", requiresAuth: true },
      },
      {
        path: "combos",
        name: "Combos",
        component: () => import("../views/pages/Combos/index.vue"),
        meta: { title: "套餐管理", requiresAuth: true },
      },
      {
        path: "categories",
        name: "Categories",
        component: () => import("../views/pages/Categories/index.vue"),
        meta: { title: "分类管理", requiresAuth: true },
      },
      {
        path: "employees",
        name: "Employees",
        component: () => import("../views/pages/Employees/index.vue"),
        meta: { title: "员工管理", requiresAuth: true },
      },
      {
        path: "statistics",
        name: "Statistics",
        component: () => import("../views/pages/Statistics/index.vue"),
        meta: { title: "数据统计", requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫：校验 token
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      // 保存当前路径用于登录后重定向（排除 /login 本身）
      if (to.path !== "/login") {
        sessionStorage.setItem("redirectPath", to.fullPath);
      }
      next("/login");
    } else {
      next();
    }
  } else {
    if (to.path === "/login" && token) {
      next("/dashboard");
    } else {
      next();
    }
  }
});

export default router;
