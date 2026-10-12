# 学习记录

## 0001 - 用户定位与项目初始化

- **日期**: 2026-10-11
- **内容**:
  - 用户是后端开发者转全栈，前端基础薄弱
  - 选择 Vue 3 + TypeScript + Vite + Element Plus 技术栈
  - 项目：叮叮餐饮外卖后台管理系统
  - 学习方式：混合模式（原理+实践）
  - 已创建 USER-PROFILE.md 记录用户画像
  - 已创建 MISSION.md 明确学习目标

## 0002 - 跨会话记忆传递指南

- **日期**: 2026-10-11
- **内容**:
  - 解答如何在免费用户的会话限制下保持上下文
  - 创建文件系统作为 AI 的"长期记忆"
  - 创建 NOTES.md 记录教学进度
  - 提供新会话启动模板

## 0003 - 安装 Element Plus + Vue Router + Pinia

- **日期**: 2026-10-11
- **内容**:
  - 安装所有核心依赖（element-plus, vue-router, pinia, axios）
  - 配置 main.ts 注册所有插件
  - 创建路由配置 src/router/index.ts
  - 创建登录页面 src/views/Login.vue
  - 创建仪表盘页面 src/views/Dashboard.vue
  - 修改 App.vue 为路由出口
  - 用后端概念类比解释每个库的作用
- **项目状态**:
  - 依赖已安装成功
  - 代码文件已创建
  - 待用户启动开发服务器验证

## 0005 - 代码文件结构规范与重构

- **日期**: 2026-10-12
- **内容**:
  - 完成代码结构规范盘问（命名、目录组织、导入路径）
  - 确定命名规范：PascalCase（文件夹和组件）
  - 确定页面结构：完整结构方案 C（components/composables/types/api/utils）
  - 确定导入路径：全局模块用 @ 别名，本地模块用相对路径
  - 创建 SKILL 文档：`.trae/skills/frontend-code-structure/SKILL.md`
  - 创建学习文档：`lessons/0005-frontend-code-structure-spec.2026-10-12.md`
  - 重构项目结构：所有 Vue 文件移动到对应文件夹并重命名为 index.vue
  - 更新路由配置：使用文件夹路径导入
- **重构详情**:
  - `src/views/Login.vue` → `src/views/Login/index.vue`
  - `src/views/Layout.vue` → `src/views/Layout/index.vue`
  - `src/views/pages/Workbench.vue` → `src/views/pages/Workbench/index.vue`
  - `src/views/pages/Orders.vue` → `src/views/pages/Orders/index.vue`
  - `src/views/pages/Meals.vue` → `src/views/pages/Meals/index.vue`
  - `src/views/pages/Combos.vue` → `src/views/pages/Combos/index.vue`
  - `src/views/pages/Categories.vue` → `src/views/pages/Categories/index.vue`
  - `src/views/pages/Employees.vue` → `src/views/pages/Employees/index.vue`
  - `src/views/pages/Statistics.vue` → `src/views/pages/Statistics/index.vue`
- **项目状态**:
  - 代码结构规范已确立
  - SKILL 文档已创建（可用于约束后续代码生成）
  - 项目结构已完全符合规范
  - 开发服务器运行正常

## 0006 - 接口文档 AI 优化与 Vite 代理配置

- **日期**: 2026-10-12
- **内容**:
  - 创建完整的接口文档 AI 优化版：`叮叮餐饮接口文档/叮叮餐饮-管理端接口-AI优化版.md`
  - 对比 YAPI 原始 JSON，修正所有字段定义不一致的问题
  - 配置 Vite 开发服务器代理：`/api` → `http://localhost:8080/admin`
  - 创建 HTTP 请求封装：`src/utils/request.ts`（Axios + JWT token + 错误拦截）
  - 创建店铺状态 API：`src/api/shop.ts`
  - 创建店铺状态组合式函数：`src/composables/useShopStatus.ts`
  - 改造 Layout 侧边栏底部为可交互的店铺状态切换组件
  - 修复 API 路径重复拼接 bug（baseURL + 路径前缀导致 `/admin/api/shop/0` 错误）
- **关键教训**:
  - API 函数中的路径**不应包含 baseURL 前缀**，因为 Axios 会自动拼接
  - 正确写法：`baseURL="/api"` + `request.get("/shop/status")` = `/api/shop/status`
  - 错误写法：`baseURL="/api"` + `request.get("/api/shop/status")` = `/api/api/shop/status`
- **项目状态**:
  - 接口文档已完全优化并验证
  - Vite 代理配置完成
  - HTTP 请求层已建立
  - 店铺状态切换功能已实现
  - 开发服务器运行正常

---

## 0007 - 订单管理页面深色主题适配与统计卡片修复（2026-10-12）

### 背景

订单管理页面在深色主题下出现大量白色背景残留问题，主要集中在：

- 搜索筛选区的 `el-select` 下拉框（订单状态选择器）
- 搜索筛选区的 `el-date-picker` 日期选择器
- 分页组件的 `el-select` 下拉框（每页条数选择器）
- 统计卡片"已完成"和"已取消"显示为 0
- 新增"已退款"统计卡片需求

---

### 踩坑一：统计卡片显示为 0

#### 问题描述

统计卡片"已完成"和"已取消"始终显示 0，但后端接口明明返回了数据。

#### 排查过程

1. 检查模板绑定：`{{ statistics.completed || 0 }}` — 看起来没问题
2. 检查 API 类型定义：`OrderStatistics` 接口中有 `completed?: number` — 也没问题
3. **关键发现**：用户查看的是 `/order/conditionSearch` 接口的响应（订单列表），但统计卡片调用的是 `/order/statistics` 接口（统计数据）！

#### 根本原因

这是**两个完全不同的接口**：

| 接口                     | 用途                   | 返回数据结构                              |
| ------------------------ | ---------------------- | ----------------------------------------- |
| `/order/conditionSearch` | 查询订单列表（分页）   | `{ total: 100, records: [...] }`          |
| `/order/statistics`      | 查询各状态订单数量统计 | `{ toBeConfirmed: 5, confirmed: 3, ... }` |

用户混淆了两个接口的响应数据，误以为统计接口没返回数据。

#### 额外发现：`statistics` 初始化缺少字段

```typescript
// 错误写法 — 缺少 refunded 字段
const statistics = reactive<OrderStatistics>({
  toBeConfirmed: 0,
  confirmed: 0,
  deliveryInProgress: 0,
  completed: 0,
  cancelled: 0,
  // 缺少 refunded: 0 ← 导致后端返回的 refunded 数据无法赋值！
});
```

#### 修复方案

```typescript
// 正确写法 — 必须包含所有字段
const statistics = reactive<OrderStatistics>({
  toBeConfirmed: 0,
  confirmed: 0,
  deliveryInProgress: 0,
  completed: 0,
  cancelled: 0,
  refunded: 0, // ← 必须初始化，否则 Object.assign 无法正确赋值
});
```

#### 教训

> **Vue 3 `reactive` 对象初始化时必须包含所有字段**，否则后续 `Object.assign` 赋值时，未初始化的字段不会触发响应式更新！

---

### 踩坑二：下拉框白色背景 — Teleport 机制陷阱

#### 问题描述

搜索筛选区的 `el-select` 下拉框在深色主题下，弹出面板背景是白色，与页面深色背景严重不协调。

#### 初步尝试（失败）

```scss
// 错误写法 — 以为下拉框在 .search-panel 内部
:deep(.search-panel .el-select-dropdown) {
  background-color: var(--bg-card) !important;
}
```

**结果**：完全无效！白色背景依然存在。

#### 深入排查

打开浏览器 DevTools 检查 DOM 结构，发现：

```html
<!-- 触发元素在 .search-panel 内部 -->
<div class="search-panel">
  <div class="el-select__wrapper">...</div>
</div>

<!-- 但下拉框弹出层被 Teleport 到了 body 根节点！ -->
<body>
  <div id="app">...</div>
  <div class="el-select__popper">
    ← 在这里！不在 .search-panel 内部！
    <div class="el-select-dropdown">...</div>
  </div>
</body>
```

#### 核心发现：Element Plus 的 Teleport 机制

> **Element Plus 的下拉框、日期选择器等弹出组件，默认通过 Vue 3 的 `Teleport` 功能渲染到 `<body>` 根节点，而不是组件内部！**

这意味着：

- `.search-panel .el-select-dropdown` 这种后代选择器**完全无效**
- 必须使用**全局样式**（不带 `scoped`）或**直接类名选择器**来覆盖

#### 解决方案

```vue
<!-- 全局样式块（无 scoped） -->
<style lang="scss">
.el-select__popper {
  background-color: var(--bg-card) !important;
}
</style>
```

---

### 踩坑三：找不到正确的类名 — 5 层容器排查

#### 问题描述

即使知道要用全局样式，但下拉框有 5 层嵌套容器，不知道哪个才是真正控制背景色的。

#### 排查方法：冻结页面 + 逐项注释

1. 打开下拉框，让弹出面板显示
2. 按 `F12` 打开 DevTools
3. 在 Console 输入：`setTimeout(() => { debugger; }, 3000)`
4. 3 秒内打开下拉框，页面自动暂停
5. 在 Elements 面板中逐层检查 DOM 结构
6. 在 Styles 面板中逐项注释样式，看哪个生效

#### Element Plus 下拉框完整 DOM 结构（从上到下 5 层）

```
el-popper el-select__popper                    ← 第 1 层：最外层弹出容器（Teleport 到 body）
└── el-select-dropdown                         ← 第 2 层：下拉框主体
    └── el-scrollbar                           ← 第 3 层：滚动容器
        └── el-select-dropdown__wrap           ← 第 4 层：外层包裹
            └── el-select-dropdown__list       ← 第 5 层：内层列表
                └── el-select-dropdown__item   ← 每个选项项
```

#### 逐项排查结果

| 层级 | 类名                       | 是否需要设置背景色 | 原因                           |
| ---- | -------------------------- | ------------------ | ------------------------------ |
| 1    | `el-select__popper`        | **是（关键！）**   | 最外层容器，白色背景的主要来源 |
| 2    | `el-select-dropdown`       | 是                 | 下拉框主体                     |
| 3    | `el-scrollbar`             | 是                 | 滚动容器                       |
| 4    | `el-select-dropdown__wrap` | 是                 | 外层包裹                       |
| 5    | `el-select-dropdown__list` | 是                 | 内层列表                       |
| -    | `el-select-dropdown__item` | 是                 | 每个选项项                     |

#### 核心发现

> **`el-select__popper` 是下拉框最外层弹出容器的正确类名！**
> 这是经过逐项排查 5 个容器层级后最终确认的**唯一正确选择器**！

#### 最终解决方案（全局样式块）

```vue
<style lang="scss">
/* 1. el-popper 最外层弹出容器 ← 这是关键！ */
.el-select__popper,
.el-popper.is-pure.is-light.el-tooltip.el-select__popper {
  background-color: var(--bg-card) !important;
}

/* 2. el-select-dropdown 下拉框主体 */
.el-select-dropdown {
  background-color: var(--bg-card) !important;
}

/* 3. el-scrollbar 滚动容器 */
.el-scrollbar {
  background-color: var(--bg-card) !important;
}

/* 4. el-select-dropdown__wrap 下拉框外层包裹 */
.el-select-dropdown__wrap,
.el-scrollbar__wrap,
.el-scrollbar__wrap--hidden-default {
  background-color: var(--bg-card) !important;
}

/* 5. el-select-dropdown__list 下拉框内层列表 */
.el-select-dropdown__list,
.el-scrollbar__view {
  background-color: var(--bg-card) !important;
}

/* el-option 选项项背景色 */
.el-select-dropdown__item {
  background-color: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

.el-select-dropdown__item:hover {
  background-color: var(--primary-bg) !important;
  color: var(--primary) !important;
}

.el-select-dropdown__item.is-selected {
  background-color: var(--primary-bg) !important;
  color: var(--primary) !important;
  font-weight: 600;
}
</style>
```

---

### 踩坑四：分页组件下拉框 — 同样的 Teleport 陷阱

#### 问题描述

修复了搜索筛选区的下拉框后，发现分页组件的"每页条数"下拉框仍然是白色背景。

#### 错误尝试

```scss
// 错误写法 — 以为下拉框在 .el-pagination 内部
:deep(.el-pagination .el-select-dropdown) {
  background-color: var(--bg-card) !important;
}
```

**结果**：完全无效！

#### 根本原因

分页组件的下拉框**同样通过 Teleport 渲染到 body**，不在 `.el-pagination` 内部！

#### 正确写法

```vue
<!-- 全局样式块（无 scoped）— 不能用 .el-pagination 前缀！ -->
<style lang="scss">
.el-select__popper {
  background-color: var(--bg-card) !important;
}
</style>
```

#### 教训

> **所有 Element Plus 的弹出组件（下拉框、日期选择器、弹窗等）都通过 Teleport 渲染到 body，不能用父组件类名作为后代选择器的前缀！**

---

### 踩坑五：el-select\_\_wrapper — 输入框本身的背景色

#### 问题描述

下拉框弹出面板修复后，发现输入框本身（未展开时）的背景色也需要适配深色主题。

#### 排查过程

通过 DevTools 检查发现，`el-select` 组件实际渲染的输入框容器类名是 `el-select__wrapper`，而不是 `.el-input__wrapper`。

#### 解决方案

```scss
:deep(.el-select__wrapper) {
  background-color: var(--bg-primary) !important;
}
```

---

### 其他修复项汇总

#### 1. 统计卡片点击筛选逻辑优化

```typescript
// 点击统计卡片时，清空其他筛选条件
function handleStatusFilter(status: number | undefined) {
  searchForm.status = status;
  searchForm.number = ""; // 清空订单号
  searchForm.phone = ""; // 清空手机号
  dateRange.value = null; // 清空日期范围
  pagination.page = 1; // 重置页码
  fetchOrders();
}
```

#### 2. 新增"已退款"统计卡片

- 模板：添加状态 7 的统计卡片
- 样式：`.stat-refunded` 类，粉色主题
- 数据：`refunded` 字段绑定

#### 3. enum 语法兼容 erasableSyntaxOnly 模式

```typescript
// 错误写法 — TypeScript 5.5+ erasableSyntaxOnly 模式不支持 enum
enum OrderStatus {
  PENDING = 1,
  ...
}

// 正确写法 — 使用 const 对象 + as const
export const OrderStatus = {
  PENDING: 1,
  ...
} as const;
```

#### 4. 移除未使用的导入和变量

- 移除 `OrderStatus` 导入（未使用）
- 移除 `loading` 变量声明（未使用）

#### 5. 日期选择器深色主题适配

- 选中范围背景色：`var(--primary-bg)`
- 起始/结束日期背景色：`var(--primary)`
- 面板背景色：`var(--bg-card)`

---

### 完整解决方案总结

#### 深色主题适配核心原则

1. **Teleport 组件必须用全局样式**
   - 下拉框、日期选择器、弹窗等弹出组件通过 Teleport 渲染到 body
   - 不能用 `scoped` 样式或父组件后代选择器
   - 必须使用全局样式块（`<style lang="scss">` 无 scoped）

2. **5 层容器全部设置背景色**
   - `el-select__popper`（最外层）
   - `el-select-dropdown`
   - `el-scrollbar`
   - `el-select-dropdown__wrap`
   - `el-select-dropdown__list`

3. **输入框本身单独处理**
   - `el-select__wrapper` 类名控制输入框背景色

4. **reactive 对象初始化必须包含所有字段**
   - 否则 `Object.assign` 赋值时未初始化的字段不会触发响应式更新

#### 调试技巧

```javascript
// 冻结页面，方便检查弹出组件的 DOM 结构
setTimeout(() => {
  debugger;
}, 3000);
```

---

### 项目状态

- 订单管理页面深色主题完全适配
- 统计卡片数据绑定正确
- 所有下拉框、日期选择器无白色残留
- 分页组件下拉框样式统一
- 代码规范：移除未使用导入，enum 改用 const 对象
