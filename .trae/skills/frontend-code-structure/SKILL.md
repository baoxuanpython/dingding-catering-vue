---
name: "frontend-code-structure"
description: "Enforces Vue 3 project file structure conventions. Invoke when generating Vue components, creating new pages, organizing project directories, or when user asks about code organization. Ensures consistent PascalCase naming, index.vue as page entry, and proper subdirectory structure (components/composables/types/api/utils)."
---

# 前端代码文件结构规范

## 核心规则

### 1. 项目整体目录结构

```
src/
├── api/                   # 全局 API 接口定义（跨模块共享）
├── assets/                # 项目级静态资源
├── components/            # 全局可复用组件
├── composables/           # 全局组合式函数（hooks）
├── router/                # 路由配置
├── stores/                # Pinia 状态管理
├── styles/                # 全局样式
├── types/                 # 全局类型定义
├── utils/                 # 全局工具函数
├── views/                 # 页面组件（按模块分文件夹）
│   ├── Login/             # 登录模块
│   │   └── index.vue
│   ├── Layout/            # 布局模块
│   │   └── index.vue
│   └── pages/             # 业务页面
│       ├── Workbench/     # 工作台
│       │   ├── index.vue
│       │   ├── components/
│       │   ├── composables/
│       │   ├── types/
│       │   └── api/
│       ├── Orders/        # 订单管理
│       ├── Meals/         # 菜品管理
│       └── ...
├── App.vue
└── main.ts
```

### 2. View 页面文件夹结构

每个业务页面使用完整结构，按功能分组：

```
PageName/
├── index.vue              # 主页面组件（必须）
├── components/            # 页面级子组件（≥2 个时创建）
├── composables/           # 页面级组合式函数（有可复用逻辑时）
├── types/                 # 页面级类型定义（≥3 个时创建）
├── api/                   # 页面级 API 调用（≥2 个时创建）
└── utils/                 # 页面级工具函数（有纯工具函数时）
```

### 3. 命名规范

| 类型            | 规范           | 示例                              |
| --------------- | -------------- | --------------------------------- |
| 文件夹          | PascalCase     | `Meals/`、`Orders/`、`Workbench/` |
| Vue 组件        | PascalCase.vue | `MealTable.vue`、`SearchBar.vue`  |
| 页面主组件      | index.vue      | `Meals/index.vue`                 |
| TypeScript 文件 | camelCase.ts   | `mealApi.ts`、`useMeals.ts`       |
| CSS 文件        | kebab-case.css | `theme.css`、`global.css`         |

### 4. 导入路径规范

- **全局模块**：使用 `@` 别名（指向 `src/`）

  ```typescript
  import { useUserStore } from "@/stores/user";
  import { getMealList } from "@/api/meal";
  ```

- **本地模块**：使用相对路径

  ```typescript
  import MealTable from "./components/MealTable.vue";
  import { useMeals } from "./composables/useMeals";
  ```

- **页面主组件**：可省略 index.vue
  ```typescript
  import Meals from "@/views/pages/Meals"; // 自动解析为 Meals/index.vue
  ```

### 5. 导入顺序

```typescript
// 1. Vue 核心
import { ref, computed } from "vue";

// 2. 第三方库
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

// 3. 全局模块（@ 别名）
import { useUserStore } from "@/stores/user";

// 4. 本地模块（相对路径）
import MealTable from "./components/MealTable.vue";
```

### 6. 文件组织原则

#### 何时拆分组件？

- 代码行数 > 200 行
- 逻辑独立（搜索栏、表格、表单各自独立）
- 组件可能在其他页面复用

#### 何时新建文件夹？

- 新业务模块：创建 `src/views/pages/PageName/`
- 子组件 ≥ 2 个：创建 `components/`
- 类型定义 ≥ 3 个：创建 `types/`
- API 调用 ≥ 2 个：创建 `api/`

#### 何时不拆分？

- 简单静态页面（如"关于我们"）
- 原型阶段快速验证

### 7. 类型文件存放

| 类型范围   | 位置                              | 示例                   |
| ---------- | --------------------------------- | ---------------------- |
| 全局类型   | `src/types/`                      | `ApiResponse`、`User`  |
| 页面级类型 | `src/views/pages/PageName/types/` | `Meal`、`Order`        |
| 组件内类型 | 直接在 `<script>` 中定义          | 仅该组件使用的简单类型 |

### 8. API 文件存放

| API 范围   | 位置                            | 命名规范                    |
| ---------- | ------------------------------- | --------------------------- |
| 全局 API   | `src/api/`                      | `auth.ts`、`user.ts`        |
| 页面级 API | `src/views/pages/PageName/api/` | `mealApi.ts`、`orderApi.ts` |

#### API 函数命名

- 查询列表：`getXxxList`
- 查询详情：`getXxxDetail`
- 新增：`createXxx`
- 更新：`updateXxx`
- 删除：`deleteXxx`
- 状态变更：`updateXxxStatus`

### 9. 工具函数存放

| 工具范围   | 位置                              | 示例                      |
| ---------- | --------------------------------- | ------------------------- |
| 全局工具   | `src/utils/`                      | `request.ts`、`format.ts` |
| 页面级工具 | `src/views/pages/PageName/utils/` | `mealFormat.ts`           |

#### 工具函数命名

- 格式化：`formatXxx`
- 校验：`validateXxx` / `isXxx`
- 转换：`convertXxxToYyy`
- 计算：`calculateXxx`

## 快速检查清单

创建新页面时：

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

## 示例：完整的 Meals 页面

```
src/views/pages/Meals/
├── index.vue                      # 主页面
├── components/
│   ├── MealSearchBar.vue          # 搜索栏
│   ├── MealTable.vue              # 表格
│   └── MealEditForm.vue           # 编辑表单
├── composables/
│   └── UseMeals.ts                # 菜品业务逻辑
├── types/
│   └── Meal.ts                    # 菜品类型定义
├── api/
│   └── MealApi.ts                 # 菜品 API 调用
└── utils/
    └── MealFormat.ts              # 菜品格式化工具
```

## 注意事项

1. **禁止**在 `src/views/` 下直接放 `.vue` 文件（必须放在文件夹内）
2. **禁止**使用 `kebab-case` 命名文件夹（如 `meal-management/`）
3. **禁止**混用导入路径（全局模块必须用 `@`，本地模块用相对路径）
4. **推荐**页面主组件命名为 `index.vue`，便于路由自动解析
5. **推荐**子组件数量 < 2 时直接放在页面文件夹根目录，无需创建 `components/`
