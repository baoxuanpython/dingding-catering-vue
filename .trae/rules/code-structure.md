---
alwaysApply: true
---
# 主题：前端代码文件结构规范

> 创建日期：2026-10-12
> 标签：#Vue3 #TypeScript #项目规范 #目录结构

## 内容

### 一、项目整体目录结构

```
dingding-catering-vue/
├── public/                    # 静态资源（不参与构建）
│   └── favicon.ico
├── src/
│   ├── api/                   # API 接口定义（按模块分文件）
│   │   ├── auth.ts            # 认证相关接口
│   │   ├── order.ts           # 订单相关接口
│   │   └── meal.ts            # 菜品相关接口
│   ├── assets/                # 项目级静态资源（图片、字体等）
│   ├── components/            # 全局可复用组件
│   │   ├── CommonTable.vue    # 通用表格组件
│   │   └── SearchForm.vue     # 通用搜索表单
│   ├── composables/           # 全局组合式函数（hooks）
│   │   └── useAuth.ts         # 认证相关 hooks
│   ├── router/                # 路由配置
│   │   └── index.ts
│   ├── stores/                # Pinia 状态管理
│   │   ├── theme.ts           # 主题状态
│   │   └── user.ts            # 用户状态
│   ├── styles/                # 全局样式
│   │   ├── theme.css          # 主题变量
│   │   └── global.css         # 全局基础样式
│   ├── types/                 # 全局类型定义
│   │   ├── api.ts             # API 响应类型
│   │   └── common.ts          # 通用类型
│   ├── utils/                 # 全局工具函数
│   │   ├── request.ts         # Axios 封装
│   │   └── format.ts          # 格式化工具
│   ├── views/                 # 页面组件（按模块分文件夹）
│   │   ├── Login/             # 登录模块
│   │   │   └── index.vue
│   │   ├── Layout/            # 布局模块
│   │   │   └── index.vue
│   │   └── pages/             # 业务页面
│   │       ├── Workbench/     # 工作台
│   │       │   ├── index.vue
│   │       │   ├── components/
│   │       │   ├── composables/
│   │       │   ├── types/
│   │       │   └── api/
│   │       ├── Orders/        # 订单管理
│   │       │   ├── index.vue
│   │       │   ├── components/
│   │       │   ├── composables/
│   │       │   ├── types/
│   │       │   └── api/
│   │       ├── Meals/         # 菜品管理
│   │       │   ├── index.vue
│   │       │   ├── components/
│   │       │   ├── composables/
│   │       │   ├── types/
│   │       │   └── api/
│   │       ├── Combos/        # 套餐管理
│   │       │   └── ...
│   │       ├── Categories/    # 分类管理
│   │       │   └── ...
│   │       ├── Employees/     # 员工管理
│   │       │   └── ...
│   │       └── Statistics/    # 数据统计
│   │           └── ...
│   ├── App.vue                # 根组件
│   └── main.ts                # 入口文件
├── lessons/                   # 学习资料（不参与构建）
├── learning-records/          # 学习记录
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

### 二、View 页面文件夹结构规范

每个业务页面使用**完整结构（方案 C）**，按功能分组：

```
PageName/
├── index.vue              # 主页面组件（必须）
├── components/            # 页面级子组件（按需创建）
│   ├── SearchBar.vue      # 搜索栏
│   ├── DataTable.vue      # 数据表格
│   └── EditForm.vue       # 编辑表单
├── composables/           # 页面级组合式函数（按需创建）
│   └── usePageName.ts     # 页面业务逻辑
├── types/                 # 页面级类型定义（按需创建）
│   └── pageName.ts        # 数据类型定义
├── api/                   # 页面级 API 调用（按需创建）
│   └── pageNameApi.ts     # API 接口封装
└── utils/                 # 页面级工具函数（按需创建）
    └── pageNameUtils.ts   # 工具函数
```

#### 文件夹创建原则

| 文件夹         | 何时创建                   | 说明                                        |
| -------------- | -------------------------- | ------------------------------------------- |
| `components/`  | 页面有 ≥2 个子组件时       | 单个子组件可直接放在根目录                  |
| `composables/` | 页面有可复用的组合式逻辑时 | 类似后端的 Service 层                       |
| `types/`       | 页面有 ≥3 个自定义类型时   | 1-2 个类型可写在 index.vue 的 `<script>` 中 |
| `api/`         | 页面有 ≥2 个 API 调用时    | 1 个 API 可直接写在 composables 中          |
| `utils/`       | 页面有纯工具函数时         | 如数据格式化、校验逻辑等                    |

---

### 三、组件命名规范

#### 1. 文件命名

- **Vue 组件**：`PascalCase.vue`（首字母大写）
  - ✅ `MealTable.vue`、`SearchBar.vue`、`EditForm.vue`
  - ❌ `meal-table.vue`、`mealTable.vue`

#### 2. 组件注册名

- **全局组件**：`PascalCase`（与文件名一致）
- **模板中使用**：`PascalCase` 或 `kebab-case`（推荐 PascalCase）

  ```vue
  <!-- 推荐 -->
  <MealTable />

  <!-- 也支持 -->
  <meal-table />
  ```

#### 3. 特殊组件命名

- **页面主组件**：统一命名为 `index.vue`
- **全局组件**：描述性名称，如 `CommonTable.vue`、`SearchForm.vue`
- **布局组件**：`Layout.vue`、`Header.vue`、`Sidebar.vue`

---

### 四、文件组织原则

#### 何时拆分组件？

1. **代码行数 > 200 行**：考虑拆分为子组件
2. **逻辑独立**：如搜索栏、表格、表单弹窗各自独立
3. **可复用**：组件可能在其他页面使用时，提升到 `src/components/`

#### 何时新建文件夹？

1. **新业务模块**：如新增"供应商管理"，创建 `src/views/pages/Suppliers/`
2. **子组件 ≥ 2 个**：创建 `components/` 文件夹
3. **类型定义 ≥ 3 个**：创建 `types/` 文件夹
4. **API 调用 ≥ 2 个**：创建 `api/` 文件夹

#### 何时不拆分？

1. **简单页面**：如"关于我们"、"帮助中心"等静态页面，单文件即可
2. **原型阶段**：快速验证功能时，可先写在一起，后期再重构

---

### 五、导入路径规范

#### 1. 路径别名

- **统一使用 `@` 别名**：指向 `src/` 目录
- **配置位置**：`vite.config.ts` 和 `tsconfig.app.json`

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
```

#### 2. 导入规则

| 导入目标                           | 使用路径       | 示例                                               |
| ---------------------------------- | -------------- | -------------------------------------------------- |
| 全局模块（api/stores/types/utils） | `@/模块名`     | `import { useUserStore } from '@/stores/user'`     |
| 同级文件                           | 相对路径       | `import MealTable from './MealTable.vue'`          |
| 子级文件                           | 相对路径       | `import { formatPrice } from './utils/format'`     |
| 父级文件                           | 相对路径       | `import { useAuth } from '../composables/useAuth'` |
| 页面主组件                         | 相对路径或别名 | `import Meals from '@/views/pages/Meals'`          |

#### 3. 导入顺序

```typescript
// 1. Vue 核心
import { ref, computed } from "vue";

// 2. 第三方库
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

// 3. 全局模块（@ 别名）
import { useUserStore } from "@/stores/user";
import { getMealList } from "@/api/meal";

// 4. 本地模块（相对路径）
import MealTable from "./MealTable.vue";
import { formatMealData } from "./utils/format";
```

---

### 六、类型文件存放位置

#### 1. 全局类型

- **位置**：`src/types/`
- **命名**：`模块名.ts`
- **内容**：跨模块共享的类型，如 API 响应、用户信息、通用枚举

```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// src/types/common.ts
export type Status = "active" | "inactive" | "deleted";
```

#### 2. 页面级类型

- **位置**：`src/views/pages/PageName/types/`
- **命名**：`模块名.ts`
- **内容**：仅该页面使用的类型

```typescript
// src/views/pages/Meals/types/meal.ts
export interface Meal {
  id: number;
  name: string;
  price: number;
  status: "on_sale" | "off_sale";
}
```

#### 3. 组件内类型

- **位置**：直接在 `.vue` 文件的 `<script setup lang="ts">` 中定义
- **适用场景**：仅该组件使用的简单类型（1-2 个）

---

### 七、API 文件存放位置

#### 1. 全局 API

- **位置**：`src/api/`
- **命名**：`模块名.ts`
- **内容**：跨模块共享的 API，如登录、用户信息

```typescript
// src/api/auth.ts
import request from "@/utils/request";

export function login(data: LoginRequest) {
  return request.post<LoginResponse>("/auth/login", data);
}
```

#### 2. 页面级 API

- **位置**：`src/views/pages/PageName/api/`
- **命名**：`模块名Api.ts`
- **内容**：仅该页面使用的 API

```typescript
// src/views/pages/Meals/api/mealApi.ts
import request from "@/utils/request";

export function getMealList(params: MealQuery) {
  return request.get<MealListResponse>("/meals", { params });
}
```

#### 3. API 函数命名规范

- **查询列表**：`getXxxList`
- **查询详情**：`getXxxDetail`
- **新增**：`createXxx`
- **更新**：`updateXxx`
- **删除**：`deleteXxx`
- **状态变更**：`updateXxxStatus`

---

### 八、工具函数存放位置

#### 1. 全局工具

- **位置**：`src/utils/`
- **命名**：`功能名.ts`
- **内容**：跨模块共享的工具函数

```typescript
// src/utils/format.ts
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

// src/utils/request.ts
import axios from "axios";
const request = axios.create({ baseURL: "/api" });
export default request;
```

#### 2. 页面级工具

- **位置**：`src/views/pages/PageName/utils/`
- **命名**：`功能名.ts`
- **内容**：仅该页面使用的工具函数

#### 3. 工具函数命名规范

- **格式化**：`formatXxx`
- **校验**：`validateXxx` / `isXxx`
- **转换**：`convertXxxToYyy`
- **计算**：`calculateXxx`

---

### 九、示例：完整的 Meals 页面结构

```
src/views/pages/Meals/
├── index.vue                      # 主页面
├── components/
│   ├── MealSearchBar.vue          # 搜索栏
│   ├── MealTable.vue              # 表格
│   └── MealEditForm.vue           # 编辑表单
├── composables/
│   └── useMeals.ts                # 菜品业务逻辑
├── types/
│   └── meal.ts                    # 菜品类型定义
├── api/
│   └── mealApi.ts                 # 菜品 API 调用
└── utils/
    └── mealFormat.ts              # 菜品格式化工具
```

#### index.vue 示例

```vue
<template>
  <div class="meals-page">
    <MealSearchBar @search="handleSearch" />
    <MealTable
      :data="mealList"
      :loading="loading"
      @edit="handleEdit"
      @delete="handleDelete"
    />
    <MealEditForm
      v-model:visible="editFormVisible"
      :meal-data="currentMeal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MealSearchBar from "./components/MealSearchBar.vue";
import MealTable from "./components/MealTable.vue";
import MealEditForm from "./components/MealEditForm.vue";
import { useMeals } from "./composables/useMeals";
import type { Meal } from "./types/meal";

const { mealList, loading, fetchMeals } = useMeals();
const editFormVisible = ref(false);
const currentMeal = ref<Meal | null>(null);

const handleSearch = (params: any) => {
  fetchMeals(params);
};

const handleEdit = (meal: Meal) => {
  currentMeal.value = meal;
  editFormVisible.value = true;
};

const handleDelete = async (id: number) => {
  // 删除逻辑
};

const handleSubmit = async (data: Meal) => {
  // 提交逻辑
  editFormVisible.value = false;
  fetchMeals();
};
</script>

<style scoped>
.meals-page {
  padding: 20px;
}
</style>
```

---

### 十、快速检查清单

创建新页面时，按以下步骤检查：

- [ ] 创建 `PageName/` 文件夹（PascalCase）
- [ ] 创建 `PageName/index.vue` 主页面
- [ ] 是否需要子组件？≥2 个则创建 `components/`
- [ ] 是否有可复用逻辑？创建 `composables/usePageName.ts`
- [ ] 是否有自定义类型？≥3 个则创建 `types/`
- [ ] 是否有 API 调用？≥2 个则创建 `api/`
- [ ] 是否有工具函数？创建 `utils/`
- [ ] 更新路由配置 `src/router/index.ts`
- [ ] 所有导入使用 `@` 别名或相对路径
- [ ] 组件命名使用 PascalCase

---

## 总结

1. **统一使用 PascalCase 命名文件夹和组件**
2. **页面主组件统一命名为 `index.vue`**
3. **按功能分组：components/composables/types/api/utils**
4. **全局模块使用 `@` 别名，本地模块使用相对路径**
5. **按需创建子文件夹，避免过度设计**
6. **简单页面可单文件，复杂页面按规范拆分**
