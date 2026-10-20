---
alwaysApply: true
---

# 主题：CSS 主题化与颜色变量规范

> 创建日期：2026-10-20（更新于 2026-10-20）
> 标签：#CSS #主题变量 #硬编码治理 #Stylelint #设计令牌 #多主题架构

## 内容

### 规则 1：业务文件中禁止一切硬编码颜色值

业务文件（`.vue` / `.scss` / `.css` 中除主题定义文件外的所有文件）中的颜色值必须通过 `var(--xxx)` 引用。

```scss
/* ❌ 禁止 */
color: #409eff;
background: rgba(76, 175, 80, 0.15);

/* ✅ 正确 */
color: var(--color-info);
background: rgba(var(--primary-rgb), 0.15);
```

主题定义文件（`src/styles/theme*.css`）自身内部允许硬编码 hex 和 rgba——它们是唯一的颜色定义源，其他文件的颜色都必须从这里派生。

---

### 规则 2：三文件主题架构

项目采用 **三文件主题架构**：

| 文件              | 选择器      | 内容                                               |       是否含硬编码       |
| ----------------- | ----------- | -------------------------------------------------- | :----------------------: |
| `theme-light.css` | `:root`     | 浅色主题基础色板 + RGB 分量                        |          ✅ 是           |
| `theme-dark.css`  | `html.dark` | 暗色主题基础色板 + RGB 分量                        |          ✅ 是           |
| `theme.css`       | `:root`     | 语义别名 + 组件变量 + Element Plus 覆盖 + 全局样式 | ❌ 否（仅 `var()` 引用） |

加载顺序（`main.ts`）：

```ts
import "./styles/theme-light.css"; // 先定义基础变量
import "./styles/theme-dark.css"; // 后定义暗色覆盖变量
import "./styles/theme.css"; // 最后派生所有上层变量
```

**`theme.css` 不定义任何色值**，它只做引用和派生。这是关键设计：新增主题时只需新建一个 `theme-xxx.css`，`theme.css` 完全不用动。

---

### 规则 3：五层变量架构（跨三文件）

变量按层级组织，**第 1 层在主题定义文件中，第 2–3 层在 `theme.css` 中**：

```scss
theme-light.css / theme-dark.css（定义源）
├─ 第 0 层：基础色板（accent-* / neutral-* / bg-* / text-* / border-*）
├─ 第 0.5 层：阴影 / 渐变（--shadow / --gradient-*，允许硬编码）
└─ 第 1 层：RGB 分量（--primary-rgb → 76, 175, 80）

theme.css（派生层）
├─ 第 2 层：语义别名（--color-danger → var(--danger)）
├─ 第 3 层：组件变量（--btn-confirm-bg / --tag-info-bg 等）
├─ 第 4 层：Element Plus 覆盖（--el-color-primary 等）
└─ 全局基础样式（reset / body / scrollbar）
```

---

### 规则 4：RGBA 透明度必须用 RGB 分量变量

需要半透明颜色时，使用 `--{key}-rgb` 变量（值为 `r, g, b` 三分量），不得直接写数字：

```css
/* ❌ 禁止 */
box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);

/* ✅ 正确 — 在主题定义文件中定义 */
--primary-rgb: 76, 175, 80;

/* ✅ 正确 — 在业务 / 组件文件中使用 */
box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.15);
```

RGB 分量变量定义在 `theme-light.css` 和 `theme-dark.css` 中，两个主题的值不同。

---

### 规则 5：变量命名规范

| 类型             | 命名格式                 | 示例                             | 定义位置  |
| ---------------- | ------------------------ | -------------------------------- | :-------: |
| 基础色           | `--{语义}`               | `--primary`, `--danger`          | 主题文件  |
| 基础色变体       | `--{语义}-{变体}`        | `--primary-light`, `--danger-bg` | 主题文件  |
| 语义别名         | `--color-{语义}`         | `--color-primary`                | theme.css |
| RGB 分量         | `--{语义}-rgb`           | `--primary-rgb`                  | 主题文件  |
| 组件变量（背景） | `--{组件}-{名称}-bg`     | `--btn-danger-bg`                | theme.css |
| 组件变量（文字） | `--{组件}-{名称}-text`   | `--btn-danger-text`              | theme.css |
| 组件变量（边框） | `--{组件}-{名称}-border` | `--tag-info-border`              | theme.css |
| 组件变量（阴影） | `--{组件}-{名称}-shadow` | `--btn-confirm-shadow`           | theme.css |

---

### 规则 6：新增颜色必须同时加入浅色和暗色主题

任何新色值都必须在 `theme-light.css`（`:root` 块）和 `theme-dark.css`（`html.dark` 块）中同时添加，变量名和结构一一对应，值可以不同。

然后在 `theme.css` 中通过 `var(--xxx)` 引用。

```css
/* theme-light.css → :root */
--new-color: #xxxxxx;

/* theme-dark.css → html.dark */
--new-color: #yyyyyy;

/* theme.css → :root */
--color-new: var(--new-color);
```

---

### 规则 7：浅色 / 暗色双主题变量必须同步

在 `theme-light.css` 中添加任何变量时，必须在 `theme-dark.css` 中添加同名变量（暗色适配值）。反之亦然。两边变量名和结构一一对应。

```css
/* theme-light.css */
:root {
  --primary: #4caf50;
  --primary-rgb: 76, 175, 80;
}

/* theme-dark.css */
html.dark {
  --primary: #85ce61;
  --primary-rgb: 133, 206, 97;
}
```

---

### 规则 8：双主题入口（通过 class 切换）

```css
/* theme-light.css — 浅色主题入口 */
:root {
  /* 浅色主题变量 */
}

/* theme-dark.css — 暗色主题入口 */
html.dark {
  /* 暗色主题变量 */
}
```

不要使用 `@media (prefers-color-scheme: dark)` —— 本项目通过 `html` 标签上的 `.dark` class 手动控制主题切换。

---

### 规则 9：Vue SFC scoped style 同样受此约束

`.vue` 文件中 `<style scoped>` 内的颜色值同样适用规则 1。优先使用全局变量。

---

### 规则 10：CI 防退化 — 双轨检测

项目使用**双轨检测**防止硬编码回流：

| 检测工具   | 命令                     | 检测目标                     | 自动排除                               |
| ---------- | ------------------------ | ---------------------------- | -------------------------------------- |
| Stylelint  | `npm run lint:style:hex` | hex 颜色 `#xxx` / `#xxxxxx`  | `theme*.css` + `style.css`（通配符）   |
| 自定义脚本 | `npm run lint:style:rgb` | 数字开头的 `rgba(r,g,b,...)` | `theme*.css` + `style.css`（模式匹配） |

```bash
# 提交前执行全量检测
npm run lint:style
```

**自动排除机制**：两个检测器均使用模式匹配（`theme*.css`），新增主题文件时无需手动修改检测配置，自动获得豁免。

---

### 规则 11：新增主题文件最低变量清单

新增主题（如 `theme-warm.css`）时，必须完整定义以下所有变量：

#### 背景色系（4 个）

```css
--bg-primary, --bg-card, --bg-card-hover, --bg-overlay
```

#### 文字色系（4 个）

```css
--text-primary, --text-secondary, --text-disabled, --text-inverse
```

#### 边框色（3 个）

```css
--border-color, --border-light, --border-dark
```

#### 主色（6 个）

```css
--primary, --primary-light, --primary-lighter, --primary-dark, --primary-darker, --primary-bg
```

#### 危险色（4 个）

```css
--danger, --danger-light, --danger-dark, --danger-bg
```

#### 警告色（4 个）

```css
--warning, --warning-light, --warning-dark, --warning-bg
```

#### 信息色（4 个）

```css
--info, --info-light, --info-dark, --info-bg
```

#### 成功色（4 个）

```css
--success, --success-light, --success-dark, --success-bg
```

#### 纯白（1 个）

```css
--white
```

#### 辅助色（5 个）

```css
--accent-lime, --accent-mint, --accent-moss, --accent-teal, --accent-purple
```

#### 中性色阶（9 个）

```css
--neutral-100, --neutral-200, --neutral-300, --neutral-400, --neutral-500,
--neutral-600, --neutral-700, --neutral-800, --neutral-900
```

#### 阴影（5 个）

```css
--shadow, --shadow-light, --shadow-heavy, --shadow-glow, --shadow-glow-strong
```

#### 渐变（3 个）

```css
--gradient-primary, --gradient-light, --gradient-card
```

#### RGB 分量（17 个）

```css
--primary-rgb, --primary-light-rgb, --primary-dark-rgb,
--danger-rgb, --danger-light-rgb,
--warning-rgb, --info-rgb, --success-rgb,
--black-rgb, --white-rgb,
--accent-lime-rgb, --accent-mint-rgb, --accent-moss-rgb, --accent-teal-rgb,
--accent-purple-rgb,
--neutral-500-rgb, --bg-primary-rgb
```

**总计：73 个变量**，漏掉任何一个都会导致 `theme.css` 中对应的 `var()` 引用静默失效。

#### 新增主题三步骤

```bash
1. 复制 theme-light.css → theme-xxx.css（light 使用 html.light 选择器，作为模板）
2. 修改选择器 html.light → html.xxx，改所有色值
3. 参考"规则 15：新增主题操作流程"完成剩余步骤
```

暗色（`theme-dark.css`）是默认主题（`:root`），新增主题始终复制浅色模板，因为浅色使用 `html.light` 激活，与新增主题的结构一致。

Stylelint 和自定义脚本使用 `theme*.css` 通配符自动排除，无需手动配置。

---

### 规则 12：暗色主题中性色阶反转约定

在浅色主题中，中性色阶遵循"数字越大、颜色越深"：

```bash
neutral-100（最浅灰 #f5f5f5）→ … → neutral-900（最深灰 #212121）
```

在暗色主题中，这个关系**反转**，以保持 `neutral-100` 在视觉上始终是"最淡的中性色"：

```bash
neutral-100（最深灰 #212121）→ … → neutral-900（最浅灰 #f5f5f5）
```

**影响范围**：`theme.css` 中的组件变量使用了中性色阶，如重置按钮：

```css
--btn-reset-bg: linear-gradient(
  135deg,
  var(--neutral-400) 0%,
  var(--neutral-500) 100%
);
```

此写法在两个主题下都能工作（按钮始终呈现灰色渐变），但渐变方向在暗色主题下可能是反的（`neutral-400` 在暗色中是 `#757575`，比 `neutral-500` 的 `#9e9e9e` 更暗）。创建新主题时，中性色阶必须同样反转。

---

### 规则 13：辅助色一律用颜色名称，不做业务语义绑定

`accent-*` 变量以颜色名称（而非业务含义）命名：

```css
/* ✅ 正确 — 颜色名称，自描述 */
--accent-lime: #cddc39;
--accent-coral: #ff6f61;
--accent-amber: #ffc107;

/* ❌ 禁止 — 业务语义绑定 */
--accent-brand: #cddc39;
--accent-highlight: #ff6f61;
--accent-promo: #ffc107;
```

**原因**：辅助色可能在完全不同的 UI 场景下复用（统计卡片、图表、标签、特殊状态），颜色名是客观事实，业务名在场景变化后会误导。

---

### 规则 14：新增样式操作流程

当需要新增项目公共样式（组件变量、全局工具类、布局样式）时，按以下流程操作：

#### 操作步骤

| 步骤 | 操作                                                 | 说明                                   |
| ---- | ---------------------------------------------------- | -------------------------------------- |
| 1    | 在 `theme.css` **公共层**定义样式                    | 使用 `var(--xxx)` 引用，禁止硬编码色值 |
| 2    | 在 `theme-dark.css`（`:root`）中定义颜色             | 暗色是默认主题，第一个定义             |
| 3    | 在 `theme-light.css`（`html.light`）中定义颜色       | 浅色通过 class 激活                    |
| 4    | 更新 `scripts/validate-theme.cjs` 的 `REQUIRED` 数组 | 新增的 CSS 变量必须加入校验清单        |
| 5    | 运行 `npm run validate:theme -- --all` 确认无遗漏    | 校验所有主题文件                       |
| 6    | 运行 `npm run gen:cheatsheet` 同步速查表             | 自动反映新增变量                       |
| 7    | 提交时 `lint:style` 全链检测自动执行                 | 确保提交不遗漏任何步骤                 |

#### 硬编码禁令

- `theme.css`：允许 `var()` 引用和 `0` / `transparent` / `none`，禁止 `#xxx` / `rgb()` / `rgba()`
- 全局 SCSS 文件（如 `common-page.scss`、`workbench.scss`）：禁止硬编码颜色，一律使用 `var(--xxx)` 或 `var(--color-xxx)`
- 页面级 scoped `<style>`：优先使用全局变量，如需页面级颜色 → 提升到 `theme.css`

#### 原则

1. **theme.css 零硬编码**：所有颜色定义必须在双主题文件中，theme.css 只做引用
2. **颜色定义始终成对**：暗色 + 浅色各一份，不可只有一侧
3. **校验清单同步更新**：新增变量不加入 `REQUIRED` 数组 = CI 通过但不被校验，属于隐患

---

### 规则 15：新增主题操作流程

新增一个完整主题（如 `theme-warm.css` 暖色主题）时，按以下流程操作：

#### 操作步骤

| 步骤 | 操作                                                            | 文件/命令                                               |
| ---- | --------------------------------------------------------------- | ------------------------------------------------------- |
| 1    | 复制 `theme-light.css` → `theme-xxx.css`                        | `src/styles/theme-xxx.css`                              |
| 2    | 修改选择器 `html.light` → `html.xxx`                            | 替换文件内的 CSS 选择器                                 |
| 3    | 修改文件头注释，标注主题名 + 激活方式                           | 文件第 1 行注释                                         |
| 4    | 逐个修改颜色值，保持变量名不变                                  | 73 个变量逐一改色值                                     |
| 5    | 运行 `node scripts/validate-theme.cjs src/styles/theme-xxx.css` | 校验 73 个变量无遗漏                                    |
| 6    | 在 `src/main.ts` 中 `import "./styles/theme-xxx.css"`           | 主题 CSS 注册到全局                                     |
| 7    | 在 `src/stores/theme.ts` 的 `THEMES` 数组中新增条目             | 格式：`{ name: "xxx", label: "暖色", cssClass: "xxx" }` |
| 8    | 运行 `npm run gen:cheatsheet`                                   | 重新生成速查表，自动包含新主题                          |
| 9    | 运行 `npm run lint:style` 全链校验                              | 确保 hex/rgba/变量/速查表全部通过                       |

#### 模板文件选择

| 复制源            | 适用场景                                 |
| ----------------- | ---------------------------------------- |
| `theme-light.css` | 推荐。使用 `html.xxx` 选择器，非默认主题 |
| `theme-dark.css`  | 不推荐。使用 `:root`，会与默认主题冲突   |

#### 不修改的文件

以下文件零改动，新增主题自动生效：

- `src/styles/theme.css`：公共层，仅使用 `var()` 引用
- `.stylelintrc.json`：使用 `theme*.css` 通配符
- `scripts/check-hardcoded-colors.cjs`：自动豁免 `theme` 开头文件
- `scripts/generate-cheatsheet.cjs`：自动扫描 `theme-*.css`
- `scripts/validate-theme.cjs`：通过 `--all` 参数批量扫描（lint:style 链中使用）

#### Store 集成

`stores/theme.ts` 使用 `THEMES` 数组驱动：

```typescript
export const THEMES: ThemeDef[] = [
  { name: "dark", label: "深色", cssClass: null }, // 默认主题
  { name: "light", label: "浅色", cssClass: "light" }, // html.light
  { name: "warm", label: "暖色", cssClass: "warm" }, // html.warm（新增）
];
```

- `cssClass: null` 表示默认主题（`:root`），不需要额外 class
- `cssClass: "xxx"` 对应 `html.xxx` 选择器
- `toggleTheme()` 自动三向循环：dark → light → warm → dark ...

---

## 附录 A：快速参考

### 校验命令

| 命令                               | 作用                                                          |
| ---------------------------------- | ------------------------------------------------------------- |
| `npm run lint:style`               | **全量 CI**：hex + rgba + 所有主题变量完整性 + 速查表同步检测 |
| `npm run lint:style:hex`           | 仅 hex 颜色检测                                               |
| `npm run lint:style:rgb`           | 仅 rgb / rgba 颜色检测                                        |
| `npm run validate:theme -- <file>` | 校验指定主题文件的 73 变量完整性                              |
| `npm run validate:theme -- --all`  | 校验所有 theme-\*.css 文件                                    |
| `npm run gen:cheatsheet`           | 从 CSS 文件自动生成变量速查表（自动扫描所有主题）             |

### 相关文件

| 文件                                      | 说明                                       |
| ----------------------------------------- | ------------------------------------------ |
| `src/styles/theme-dark.css`               | 暗色主题基础色板（`:root` 默认）           |
| `src/styles/theme-light.css`              | 浅色主题基础色板（`html.light` 激活）      |
| `src/styles/theme-warm.css`               | 暖色主题基础色板（`html.warm` 激活，新增） |
| `src/styles/theme.css`                    | 公共派生变量 + 全局样式（零硬编码）        |
| `src/stores/theme.ts`                     | 主题状态管理（N 主题通用，三向循环切换）   |
| `.stylelintrc.json`                       | Stylelint hex 检测配置                     |
| `scripts/check-hardcoded-colors.cjs`      | 自定义 rgba 检测脚本                       |
| `scripts/validate-theme.cjs`              | 主题变量完整性校验脚本（支持 `--all`）     |
| `scripts/generate-cheatsheet.cjs`         | 速查表自动生成脚本（自动扫描主题）         |
| `reference/css-variables-cheatsheet.html` | 变量速查表（打印友好）                     |
