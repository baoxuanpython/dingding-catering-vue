import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/pages/Workbench.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/pages/Orders.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'meals',
        name: 'Meals',
        component: () => import('../views/pages/Meals.vue'),
        meta: { title: '菜品管理' }
      },
      {
        path: 'combos',
        name: 'Combos',
        component: () => import('../views/pages/Combos.vue'),
        meta: { title: '套餐管理' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../views/pages/Categories.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('../views/pages/Employees.vue'),
        meta: { title: '员工管理' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('../views/pages/Statistics.vue'),
        meta: { title: '数据统计' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
