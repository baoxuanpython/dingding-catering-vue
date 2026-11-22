import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";
import { hasRole, ROLE_ADMIN } from "@/utils/permission";

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
        path: "flavors",
        name: "Flavors",
        component: () => import("../views/pages/Flavors/index.vue"),
        meta: { title: "口味管理", requiresAuth: true },
      },
      {
        path: "employees",
        name: "Employees",
        component: () => import("../views/pages/Employees/index.vue"),
        meta: { title: "员工管理", requiresAuth: true, roles: [ROLE_ADMIN] },
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

// 路由守卫：校验 token 与角色
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      // 保存当前路径用于登录后重定向（排除 /login 本身）
      if (to.path !== "/login") {
        sessionStorage.setItem("redirectPath", to.fullPath);
      }
      next("/login");
      return;
    }

    const roles = to.meta.roles as string[] | undefined;
    if (!hasRole(roles)) {
      ElMessage.warning("当前账号无权访问该页面");
      next("/dashboard");
      return;
    }

    next();
  } else {
    if (to.path === "/login" && token) {
      next("/dashboard");
    } else {
      next();
    }
  }
});

export default router;

/**
 * 判断目标路径对当前登录账号是否可访问
 * 用于登录后校验重定向路径，避免把员工导向仅管理员可进的页面
 * 未匹配到任何路由时返回 false，防止跳到不存在的地址
 */
export function canAccessPath(path: string): boolean {
  const resolved = router.resolve(path);
  if (resolved.matched.length === 0) return false;
  return resolved.matched.every((record) =>
    hasRole(record.meta?.roles as string[] | undefined),
  );
}
