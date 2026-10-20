# 读取原始文件（UTF-8 BOM）
$filePath = "f:\document\GitHub\dingding-catering-vue\learning-records\conversation-memory.md"
$bytes = [System.IO.File]::ReadAllBytes($filePath)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# 找到 0019 的位置
$marker = "## 0019 -"
$idx = $content.IndexOf($marker)

if ($idx -gt 0) {
    # 截取到 0019 之前的内容
    $content = $content.Substring(0, $idx)
}

# 构建新内容（使用 here-string 保持中文）
$newEntry = @"

## 0019 - ComboFormDialog 按钮样式穿透修复与图标语义优化（2026-10-21）

### 背景

用户反馈 ComboFormDialog.vue 中多个按钮（确定/取消/添加口味）的公共样式未正确应用，需要通过 Vue 3 Scoped 样式穿透 `:deep()` 机制修复。

### 问题一：口味区域"确定/取消"按钮无颜色样式

**根本原因**：`common-page.scss` 第713-747行中，`confirm-btn` / `cancel-btn` 的颜色规则被限定在 `.dialog-footer, .el-dialog__footer` 选择器内，而口味区域按钮不在该 DOM 上下文中。

**解决方案**：在 `.form-dialog-content` 内新增 `:deep()` 块：

```scss
// ComboFormDialog.vue scoped 样式
.form-dialog-content {
  :deep(.add-btn), :deep(.confirm-btn) {
    height: 36px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    box-shadow: var(--btn-confirm-shadow);
    background: var(--btn-confirm-bg);
    color: var(--btn-confirm-text);

    &:hover {
      background: var(--btn-confirm-hover);
      box-shadow: var(--btn-confirm-shadow-hover);
      transform: translateY(-2px);
    }
  }

  :deep(.cancel-btn) { ... }  // 同理，使用 --btn-reset-* 变量
}
```

**同时修正**：`.flavor-add` 内按钮高度从 `24px` → `32px`（匹配 select 高度）。

### 问题二：主弹窗 Footer "取消/确定"按钮无样式

**根本原因**：`:deep()` 嵌套在 `.form-dialog-content` 内只能到达弹窗内容区，Footer 在外部。

**解决方案**：将 `cancel-btn` 和新增的 `submit-btn` 提升到根级 `:deep()` 块：

```scss
// 根级 :deep() 从组件根元素出发，能穿透 el-dialog 到达 footer
:deep(.cancel-btn) { ... }
:deep(.submit-btn) { ... }
```

### 问题三：内嵌"选择菜品"对话框按钮无 class

**发现过程**：用户截图显示的是带表格和分页的"选择菜品"子对话框（`append-to-body`），而非主弹窗 footer。

**根本原因**：[ComboFormDialog.vue#L372](file:///f:/document/GitHub/dingding-catering-vue/src/views/pages/Combos/components/ComboFormDialog.vue#L372) 的子弹窗 footer 按钮没有 `class` 属性。

**修复前**：
```vue
<template #footer>
  <el-button @click="showDishSelector = false">取消</el-button>
  <el-button @click="confirmAddDishes">确定</el-button>
</template>
```

**修复后**：
```vue
<template #footer>
  <el-button class="cancel-btn" @click="showDishSelector = false">取消</el-button>
  <el-button class="submit-btn" @click="confirmAddDishes">确定</el-button>
</template>
```

### 问题四："+ 添加口味"按钮图标语义色冲突

**问题**：绿色背景按钮上使用 `icon-primary`（绿色），图标融入背景不可见。

**解决方案**：
1. **theme.css 新增** [`.icon-inverse`](file:///f:/document/GitHub/dingding-catering-vue/src/styles/theme.css#L399-L403) 语义类：
   ```css
   /* 反色 — 有色按钮上的图标（绿底白字、红底白字等） */
   .icon-inverse {
     color: var(--text-inverse);  // 白色/浅色
   }
   ```

2. **ComboFormDialog.vue 两处 Plus 图标统一修改**：
   - [L99](file:///f:/document/GitHub/dingding-catering-vue/src/views/pages/Combos/components/ComboFormDialog.vue#L99)：`<el-icon class="icon-primary">` → `<el-icon class="icon-inverse">`（添加菜品）
   - [L225](file:///f:/document/GitHub/dingding-catering-vue/src/views/pages/Combos/components/ComboFormDialog.vue#L225)：`+ 添加口味` → `<el-icon class="icon-inverse"><Plus /></el-icon> 添加口味`

### 最终样式作用域映射表

| 按钮 | DOM 位置 | class | 匹配的 :deep() 块 |
|------|----------|-------|-------------------|
| 口味区「确定」 | .form-dialog-content | confirm-btn | .form-dialog-content :deep(.confirm-btn) |
| 口味区「取消」 | .form-dialog-content | cancel-btn | **根级** :deep(.cancel-btn) |
| 口味区「+ 添加」 | .form-dialog-content | add-btn | .form-dialog-content :deep(.add-btn) |
| 主弹窗「取消/关闭」 | 主弹窗 footer | cancel-btn | **根级** :deep(.cancel-btn) |
| 主弹窗「确定」 | 主弹窗 footer | submit-btn | **根级** :deep(.submit-btn) |
| 子弹窗「取消」 | 菜品选择器 footer | cancel-btn ✨ | **根级** :deep(.cancel-btn) |
| 子弹窗「确定」 | 菜品选择器 footer | submit-btn ✨ | **根级** :deep(.submit-btn) |

### 技术要点总结

1. **Scoped 样式穿透原理**：Vue 3 使用 `:deep()` 穿透子组件内部样式，嵌套位置决定作用域范围
2. **公共样式上下文限定**：`common-page.scss` 中的选择器可能有父级限制（如 `.dialog-footer`），不在该上下文的元素无法继承
3. **Element Plus 弹窗结构**：
   - 主弹窗：`el-dialog > .el-dialog__body` + `#footer` 插槽
   - 内嵌弹窗（append-to-body）：渲染在 body 下层，是独立的 DOM 节点
4. **图标语义色彩扩展**：新增 `.icon-inverse` 用于有色背景按钮上的对比色图标

### 修改文件清单

| 文件 | 改动类型 |
|------|---------|
| `src/views/pages/Combos/components/ComboFormDialog.vue` | 新增 3 个 :deep() 块、2 处 icon-inverse、2 处按钮 class |
| `src/styles/theme.css` | 新增 .icon-inverse 语义类 |

### 校验结果

- `npm run lint:style` ✅ 通过（0 硬编码违规、3 主题全部通过）
- `npx vue-tsc -b` ✅ 通过（TypeScript 类型检查无误）
"@

# 合并内容
$finalContent = $content + $newEntry

# 写入文件（UTF-8 无 BOM）
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllBytes($filePath, $utf8NoBom.GetBytes($finalContent))

Write-Host "Success! Entry 0019 appended with correct UTF-8 encoding."
Write-Host "Total file length: $($finalContent.Length) characters"
