---
name: ui-page-workflow
description: 为 Vue 3 后台管理系统生成完整的页面代码。当用户提供页面名称和功能描述时，自动执行需求解析、组件选型、页面搭建、数据绑定、自查修正的完整工作流，输出可运行的 .vue 文件。技术栈固定为 Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router。
---

# UI 页面开发工作流

为后端开发者提供从需求到可运行 Vue 页面的完整开发流程。自动完成组件选型、布局设计、样式编写和代码规范检查。

## 适用场景

- 需要新建后台管理页面（列表页、表单页、详情页、统计页等）
- 不知道用 Element Plus 的哪个组件合适
- 页面布局不知道怎么排布
- 写完了但样式不好看，需要调优
- 需要检查代码是否符合项目规范

## 技术栈约束（不可更改）

| 技术 | 版本/说明 |
|------|----------|
| Vue | 3.x（Composition API，`<script setup>`） |
| 语言 | TypeScript（严格模式） |
| 构建工具 | Vite |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| HTTP 客户端 | axios（项目已有封装） |
| 样式方案 | SCSS + Element Plus 主题变量 |

## 执行流程

### 阶段 1：需求解析

从用户的描述中提取：
- **页面类型**：列表页 / 表单页 / 详情页 / 统计页 / 工作台
- **数据字段**：表格列、表单字段、展示项
- **操作按钮**：增删改查、状态变更、批量操作
- **筛选条件**：搜索框、下拉筛选、日期范围
- **权限要求**：是否需要角色权限控制

如果用户描述不完整，基于后台管理系统的常见模式自动补全合理默认值。

### 阶段 2：组件选型

根据需求匹配 Element Plus 组件：

| 需求场景 | 推荐组件 |
|---------|---------|
| 数据表格 | `el-table` + `el-pagination` |
| 搜索筛选 | `el-form`（inline）+ `el-input` / `el-select` / `el-date-picker` |
| 新增/编辑 | `el-dialog` + `el-form` + `el-input` / `el-select` / `el-upload` |
| 状态切换 | `el-switch` 或 `el-tag` + 操作按钮 |
| 删除确认 | `ElMessageBox.confirm` |
| 消息提示 | `ElMessage.success/error/warning` |
| 数据加载 | `v-loading` 指令 |
| 空状态 | `el-empty` |
| 统计卡片 | `el-card` + 自定义布局 |
| 图表展示 | `el-card` 包裹 ECharts（如项目已集成） |

### 阶段 3：页面搭建

生成完整的 `.vue` 文件，结构如下：

```vue
<template>
  <!-- 搜索区域 -->
  <!-- 操作按钮区域 -->
  <!-- 数据表格 -->
  <!-- 分页 -->
  <!-- 新增/编辑弹窗 -->
</template>

<script setup lang="ts">
// 1. 导入依赖
// 2. TypeScript 接口定义
// 3. 响应式状态
// 4. API 调用函数
// 5. 事件处理函数
// 6. 生命周期/初始化
</script>

<style scoped lang="scss">
/* 页面级样式 */
</style>
```

**布局规范：**
- 搜索表单使用 `inline` 布局，按钮右对齐
- 表格上方放置操作按钮（新增、批量操作）
- 表格操作列使用 `el-button` + `type="primary"/"danger"`，超过 3 个用下拉
- 分页固定在表格下方右侧
- 弹窗表单使用 `el-form` + `label-width`，必填项加 `required`

**样式规范：**
- 使用 `scoped` 避免样式污染
- 间距统一使用 `margin-bottom: 16px` / `20px`
- 搜索区域和表格区域用 `margin-bottom: 16px` 分隔
- 按钮组使用 `display: flex; gap: 8px`
- 表格内操作按钮使用 `text` 类型，间距 `margin-left: 8px`

### 阶段 4：数据绑定

- 定义 TypeScript 接口（DTO/VO），命名格式 `XxxQuery`、`XxxVO`、`XxxForm`
- API 调用预留位置，注释标明接口路径
- 列表查询参数使用 `reactive`，表单数据使用 `reactive` + `ref`
- 分页使用独立 `reactive` 对象（`pageNum`、`pageSize`、`total`）
- 表格数据使用 `ref<XxxVO[]>([])`

### 阶段 5：自查修正

生成代码后，自动检查以下维度并修正：

| 检查项 | 标准 |
|--------|------|
| 组件选型 | 是否使用了最合适的 Element Plus 组件 |
| TypeScript | 接口定义是否完整，类型是否正确 |
| 响应式 | `ref` 和 `reactive` 使用是否合理 |
| 事件处理 | 是否有 `async/await` 错误处理 |
| 用户体验 | 是否有 loading 状态、空状态、操作确认 |
| 代码规范 | 命名是否清晰，是否有冗余代码 |
| 样式一致性 | 间距、颜色、字体是否符合 Element Plus 规范 |

发现问题直接修正，不向用户报告中间过程。

### 阶段 6：交付

输出完整可运行的 `.vue` 文件，包含：
- 完整的 `<template>`、`<script setup lang="ts">`、`<style scoped lang="scss">`
- 所有必要的导入语句
- TypeScript 类型定义
- API 调用占位（带注释说明）
- 完整的交互逻辑（加载、成功、失败、确认）

## 输出格式

直接创建或修改项目中的 `.vue` 文件，文件路径遵循项目约定：
- 列表页：`src/views/模块名/List.vue`
- 表单页：`src/views/模块名/Form.vue`
- 详情页：`src/views/模块名/Detail.vue`
- 统计页：`src/views/模块名/Stats.vue`

如果项目结构不确定，先扫描项目现有页面目录结构，遵循已有命名和路径约定。

## 关键约束

1. **不引入新依赖**：只使用项目已有的依赖和组件
2. **不修改全局样式**：所有样式使用 `scoped`
3. **不硬编码数据**：所有数据通过 API 获取
4. **不忽略错误**：所有 API 调用必须有 `try/catch` 和用户提示
5. **不跳过类型**：所有变量、参数、返回值必须有 TypeScript 类型
6. **不复制粘贴风格**：每个页面根据需求独立设计布局和组件组合
