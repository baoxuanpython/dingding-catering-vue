#!/usr/bin/env node

// ==================== 变量速查表生成脚本 ====================
// 用法：node scripts/generate-cheatsheet.cjs
// 自动扫描 src/styles/theme-*.css，生成 reference/css-variables-cheatsheet.html

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const STYLES = path.join(ROOT, "src", "styles");
const OUTPUT = path.join(ROOT, "reference", "css-variables-cheatsheet.html");

function extractVars(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const vars = {};
  const regex = /^\s*(--[a-zA-Z][a-zA-Z0-9-]*)\s*:\s*(.+?);\s*$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

function detectSelector(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  if (/^\s*:root\s*\{/m.test(content)) return ":root";
  const m = content.match(/^\s*html\.(\w+)\s*\{/m);
  return m ? `html.${m[1]}` : "unknown";
}

// 扫描所有 theme-*.css 文件
const files = fs
  .readdirSync(STYLES)
  .filter((f) => /^theme-.+\.css$/.test(f) && f !== "theme.css")
  .sort();

if (files.length === 0) {
  console.error("❌ 未找到 theme-*.css 文件");
  process.exit(1);
}

const themes = files.map((f) => {
  const filePath = path.join(STYLES, f);
  const selector = detectSelector(filePath);
  const name = f.replace(/^theme-/, "").replace(/\.css$/, "");
  const isDefault = selector === ":root";
  const vars = extractVars(filePath);
  return {
    name,
    label: isDefault ? `${name}（默认）` : name,
    selector,
    isDefault,
    filePath,
    vars,
  };
});

const defaultTheme = themes.find((t) => t.isDefault);
const otherThemes = themes.filter((t) => !t.isDefault);

console.log(`📋 扫描到 ${themes.length} 个主题：`);
themes.forEach((t) => console.log(`   ${t.label} → ${t.selector}`));

function v(theme, name) {
  return theme.vars[name] || "—";
}

function swatch(hex) {
  if (!hex || !hex.startsWith("#")) return "";
  return `<span class="cs" style="background:${hex}"></span>`;
}

// 一行：变量名 + 各主题值
function row(varName, label = "") {
  const labelCol = label ? `<td>${label}</td>` : "";
  const cells = themes
    .map((t) => {
      const val = v(t, varName);
      return `<td>${val.startsWith("#") ? swatch(val) + val : val}</td>`;
    })
    .join("");
  return `<tr><td><code>${varName}</code></td>${labelCol}${cells}</tr>`;
}

const COLSPAN = themes.length + 1 + (themes.some(() => true) ? 0 : 0);
const HEADERS = themes.map((t) => `<th>${t.label}</th>`).join("");

// 公共层变量
const ALIASES = [
  ["--color-primary", "var(--primary)"],
  ["--color-primary-light", "var(--primary-light)"],
  ["--color-primary-lighter", "var(--primary-lighter)"],
  ["--color-primary-dark", "var(--primary-dark)"],
  ["--color-primary-darker", "var(--primary-darker)"],
  ["--color-primary-bg", "var(--primary-bg)"],
  ["--color-danger", "var(--danger)"],
  ["--color-danger-light", "var(--danger-light)"],
  ["--color-danger-dark", "var(--danger-dark)"],
  ["--color-danger-bg", "var(--danger-bg)"],
  ["--color-warning", "var(--warning)"],
  ["--color-warning-light", "var(--warning-light)"],
  ["--color-warning-dark", "var(--warning-dark)"],
  ["--color-warning-bg", "var(--warning-bg)"],
  ["--color-info", "var(--info)"],
  ["--color-info-light", "var(--info-light)"],
  ["--color-info-dark", "var(--info-dark)"],
  ["--color-info-bg", "var(--info-bg)"],
  ["--color-success", "var(--success)"],
  ["--color-success-light", "var(--success-light)"],
  ["--color-success-dark", "var(--success-dark)"],
  ["--color-success-bg", "var(--success-bg)"],
  ["--color-custom-purple", "var(--accent-purple)"],
  ["--color-white", "var(--white)"],
];

const COMPONENTS = [
  ["按钮·确认", "--btn-confirm-bg", "渐变主色"],
  ["按钮·危险", "--btn-danger-bg", "渐变危险色"],
  ["按钮·警告", "--btn-warning-bg", "渐变警告色"],
  ["按钮·重置", "--btn-reset-bg", "中性色阶"],
  ["按钮·派送", "--btn-delivery-bg", "信息色"],
  ["标签", "--tag-info-bg", "5 语义 × 3 属性"],
  ["操作按钮", "--action-confirm-bg", "6 操作 × 2 状态"],
  ["统计卡片", "--stat-card-bg", "4 状态 + 自定义"],
  ["表格", "--table-header-bg", "6 变量"],
  ["输入框", "--input-bg", "8 变量"],
  ["弹窗", "--dialog-bg", "5 变量"],
  ["分页", "--pagination-bg", "6 变量"],
  ["下拉", "--select-bg", "5 变量"],
  ["日期", "--datepicker-bg", "7 变量"],
  ["加载", "--loading-bg", "2 变量"],
  ["开关", "--switch-on-bg", "2 变量 × 2 状态"],
  ["复选框", "--checkbox-bg", "1 变量"],
];

const EL_COVERS = [
  ["--el-color-primary", "var(--color-primary)"],
  ["--el-color-primary-light-3", "var(--color-primary-light)"],
  ["--el-color-primary-dark-2", "var(--color-primary-dark)"],
  ["--el-menu-active-color", "var(--color-primary)"],
  ["--el-menu-hover-bg-color", "var(--color-primary-bg)"],
  ["--el-bg-color", "var(--bg-card)"],
  ["--el-bg-color-page", "var(--bg-primary)"],
  ["--el-text-color-primary", "var(--text-primary)"],
  ["--el-text-color-regular", "var(--text-secondary)"],
  ["--el-border-color", "var(--border-color)"],
  ["--el-border-color-light", "var(--border-light)"],
];

const PATTERNS = [
  ["主色文字", "color: var(--color-primary)"],
  ["红色错误提示", "color: var(--color-danger)"],
  ["主色 15% 透明背景", "background: rgba(var(--primary-rgb), 0.15)"],
  ["红色 30% 透明阴影", "box-shadow: 0 4px 12px rgba(var(--danger-rgb), 0.3)"],
  ["黑色 5% 遮罩", "background: rgba(var(--black-rgb), 0.05)"],
  ["白色 80% 透明前景", "color: rgba(var(--white-rgb), 0.8)"],
  ["灰底卡片", "background: var(--bg-card)"],
  ["品牌渐变按钮", "background: var(--btn-confirm-bg)"],
];

const VAR_GROUPS = [
  {
    title: "背景 / 文字 / 边框",
    vars: [
      "--bg-primary",
      "--bg-card",
      "--bg-card-hover",
      "--bg-overlay",
      "--text-primary",
      "--text-secondary",
      "--text-disabled",
      "--text-inverse",
      "--border-color",
      "--border-light",
      "--border-dark",
    ],
    labels: [
      "页面背景",
      "卡片背景",
      "卡片悬停",
      "遮罩层",
      "主文字",
      "辅助文字",
      "禁用文字",
      "反色文字",
      "边框",
      "浅边框",
      "深边框",
    ],
  },
  {
    title: "语义色",
    vars: [
      "--primary",
      "--primary-light",
      "--primary-lighter",
      "--primary-dark",
      "--primary-darker",
      "--primary-bg",
      "--danger",
      "--danger-light",
      "--danger-dark",
      "--danger-bg",
      "--warning",
      "--warning-light",
      "--warning-dark",
      "--warning-bg",
      "--info",
      "--info-light",
      "--info-dark",
      "--info-bg",
      "--success",
      "--success-light",
      "--success-dark",
      "--success-bg",
      "--white",
    ],
    labels: [
      "主色",
      "主浅",
      "主更浅",
      "主深",
      "主更深",
      "主背景",
      "危险",
      "危浅",
      "危深",
      "危背景",
      "警告",
      "警浅",
      "警深",
      "警背景",
      "信息",
      "信浅",
      "信深",
      "信背景",
      "成功",
      "成浅",
      "成深",
      "成背景",
      "纯白",
    ],
  },
  {
    title: "辅助色",
    vars: [
      "--accent-lime",
      "--accent-mint",
      "--accent-moss",
      "--accent-teal",
      "--accent-purple",
    ],
    labels: [],
  },
  {
    title: "中性色阶",
    vars: [
      "--neutral-100",
      "--neutral-200",
      "--neutral-300",
      "--neutral-400",
      "--neutral-500",
      "--neutral-600",
      "--neutral-700",
      "--neutral-800",
      "--neutral-900",
    ],
    labels: [],
  },
  {
    title: "阴影 / 渐变",
    vars: [
      "--shadow",
      "--shadow-light",
      "--shadow-heavy",
      "--shadow-glow",
      "--shadow-glow-strong",
      "--gradient-primary",
      "--gradient-light",
      "--gradient-card",
    ],
    labels: [],
  },
  {
    title: "RGB 分量",
    vars: [
      "--primary-rgb",
      "--primary-light-rgb",
      "--primary-dark-rgb",
      "--danger-rgb",
      "--danger-light-rgb",
      "--warning-rgb",
      "--info-rgb",
      "--success-rgb",
      "--black-rgb",
      "--white-rgb",
      "--accent-lime-rgb",
      "--accent-mint-rgb",
      "--accent-moss-rgb",
      "--accent-teal-rgb",
      "--accent-purple-rgb",
      "--neutral-500-rgb",
      "--bg-primary-rgb",
    ],
    labels: [],
  },
];

function buildCompareTab() {
  let html = "";
  for (const group of VAR_GROUPS) {
    html += `<h2>${group.title}</h2>\n<table>\n<tr><th>变量名</th>${HEADERS}</tr>\n`;
    group.vars.forEach((varName, i) => {
      const label = group.labels[i] || "";
      html += row(varName, label);
    });
    html += "</table>\n";
  }
  return html;
}

function buildAliasRows() {
  return ALIASES.map(([name, ref]) => {
    const refVar = ref.replace("var(", "").replace(")", "");
    const vals = themes
      .map((t) => {
        const val = v(t, refVar);
        return val.startsWith("#") ? `${swatch(val)}${val}` : val;
      })
      .join(" / ");
    return `<tr><td><code>${name}</code></td><td><code>${ref}</code> → ${vals}</td></tr>`;
  }).join("\n");
}

function buildCompRows() {
  return COMPONENTS.map(([comp, varName, desc]) => {
    return `<tr><td>${comp}</td><td><code>${varName}</code></td><td>${desc}</td></tr>`;
  }).join("\n");
}

function buildElRows() {
  return EL_COVERS.map(
    ([name, val]) =>
      `<tr><td><code>${name}</code></td><td><code>${val}</code></td></tr>`,
  ).join("\n");
}

function buildPatternRows() {
  return PATTERNS.map(
    ([need, code]) => `<tr><td>${need}</td><td><code>${code}</code></td></tr>`,
  ).join("\n");
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CSS 变量速查表 — 叮叮餐饮</title>
<style>
:root{--tbg:#1a1a2e;--tcard:#16213e;--tt:#e0e0e0;--tt2:#a0a0a0;--tbd:#2a2a4a;--tcode:#1e2a4a;--tpri:#85ce61;--tpad:40px}
html.light{--tbg:#fafafa;--tcard:#fff;--tt:#333;--tt2:#666;--tbd:#e0e0e0;--tcode:#f5f5f5;--tpri:#4caf50;--tpad:40px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,sans-serif;background:var(--tbg);color:var(--tt);padding:var(--tpad) 20px}
.c{max-width:1200px;margin:0 auto}
.h{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;margin-bottom:16px}
h1{font-size:28px;border-bottom:3px solid var(--tpri);padding-bottom:12px;flex:1}
.tabs{display:flex;border-bottom:2px solid var(--tbd);flex-wrap:wrap}
.tab{padding:10px 20px;cursor:pointer;font-size:14px;font-weight:600;color:var(--tt2);border:none;background:none;border-bottom:2px solid transparent;margin-bottom:-2px}
.tab:hover{color:var(--tpri)}
.tab.active{color:var(--tpri);border-bottom-color:var(--tpri)}
.panel{display:none;padding-top:20px}
.panel.active{display:block}
h2{font-size:18px;margin:28px 0 12px;color:var(--tpri)}
h2:first-child{margin-top:0}
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:13px}
th,td{border:1px solid var(--tbd);padding:6px 10px;text-align:left;vertical-align:middle}
th{background:var(--tcode);font-weight:600;font-size:12px}
td code{background:var(--tcode);padding:2px 6px;border-radius:3px;font-size:12px}
td{word-break:break-all}
.cs{display:inline-block;width:14px;height:14px;border-radius:2px;vertical-align:-2px;margin-right:4px;border:1px solid rgba(128,128,128,.3)}
.ft{margin-top:40px;padding-top:16px;border-top:1px solid var(--tbd);color:var(--tt2);font-size:13px;display:flex;gap:20px;flex-wrap:wrap}
.ft a{color:var(--tpri)}
@media print{body{padding:0}.tabs{display:none}.panel{display:block!important;page-break-before:always}}
</style>
</head>
<body>
<div class="c">
<div class="h"><h1>CSS 变量速查表</h1><span style="color:var(--tt2)">${themes.length} 个主题 · ${new Date().toISOString().slice(0, 10)}</span></div>

<div class="tabs">
  <button class="tab active" onclick="switchTab('compare')">对比视图</button>
  ${themes.map((t) => `<button class="tab" onclick="switchTab('${t.name}')">${t.label}</button>`).join("\n  ")}
  <button class="tab" onclick="switchTab('common')">公共层</button>
</div>

<div id="tab-compare" class="panel active">
${buildCompareTab()}
</div>

${themes
  .map(
    (t) => `
<div id="tab-${t.name}" class="panel">
<p style="color:var(--tt2);margin-bottom:16px">选择器：<code>${t.selector}</code> · ${t.isDefault ? "默认主题" : "通过 class 激活"}</p>
${VAR_GROUPS.map((g) => {
  let html2 = `<h2>${g.title}</h2>\n<table>\n<tr><th>变量名</th><th>值</th></tr>\n`;
  g.vars.forEach((varName) => {
    const val = v(t, varName);
    html2 += `<tr><td><code>${varName}</code></td><td>${val.startsWith("#") ? swatch(val) + val : val}</td></tr>\n`;
  });
  html2 += "</table>\n";
  return html2;
}).join("\n")}
</div>`,
  )
  .join("\n")}

<div id="tab-common" class="panel">
<h2>语义别名</h2>
<table><tr><th>变量名</th><th>引用链（${themes.map((t) => t.label).join(" / ")}）</th></tr>
${buildAliasRows()}
</table>

<h2>组件变量</h2>
<p style="color:var(--tt2)">均定义在 theme.css，通过 var() 引用基础变量，所有主题自动生效。</p>
<table><tr><th>组件</th><th>核心变量</th><th>说明</th></tr>${buildCompRows()}</table>

<h2>Element Plus 覆盖</h2>
<table><tr><th>变量名</th><th>值</th></tr>${buildElRows()}</table>

<h2>常用写法</h2>
<table><tr><th>需求</th><th>写法</th></tr>${buildPatternRows()}</table>
</div>

<footer class="ft">
  <span>生成：<code>npm run gen:cheatsheet</code></span>
  <span>校验：<code>npm run validate:theme</code></span>
  <span>规则：<code>.trae/rules/style-guide.md</code></span>
</footer>
</div>

<script>
function switchTab(n){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelector('.tab[onclick="switchTab(\\''+n+'\\')"]').classList.add('active');
  document.getElementById('tab-'+n).classList.add('active');
}
</script>
</body>
</html>
`;

fs.writeFileSync(OUTPUT, html, "utf8");
console.log(`\n✅ 速查表已生成: reference/css-variables-cheatsheet.html`);
console.log(`   主题数: ${themes.length}`);
themes.forEach((t) =>
  console.log(`   ${t.label}: ${Object.keys(t.vars).length} 个变量`),
);
