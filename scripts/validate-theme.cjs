#!/usr/bin/env node

// ==================== 主题变量校验脚本 ====================
// 用法：node scripts/validate-theme.cjs <theme-file-path>
// 示例：node scripts/validate-theme.cjs src/styles/theme-warm.css
// 退出码：0 = 全部通过，1 = 有缺失变量或校验清单过期

const fs = require("fs");
const path = require("path");

// ==================== 73 个必填变量清单 ====================
const REQUIRED = [
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
  "--accent-lime",
  "--accent-mint",
  "--accent-moss",
  "--accent-teal",
  "--accent-purple",
  "--neutral-100",
  "--neutral-200",
  "--neutral-300",
  "--neutral-400",
  "--neutral-500",
  "--neutral-600",
  "--neutral-700",
  "--neutral-800",
  "--neutral-900",
  "--shadow",
  "--shadow-light",
  "--shadow-heavy",
  "--shadow-glow",
  "--shadow-glow-strong",
  "--gradient-primary",
  "--gradient-light",
  "--gradient-card",
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
];

const CATEGORIES = [
  {
    name: "背景色系",
    vars: ["--bg-primary", "--bg-card", "--bg-card-hover", "--bg-overlay"],
  },
  {
    name: "文字色系",
    vars: [
      "--text-primary",
      "--text-secondary",
      "--text-disabled",
      "--text-inverse",
    ],
  },
  {
    name: "边框色",
    vars: ["--border-color", "--border-light", "--border-dark"],
  },
  {
    name: "主色",
    vars: [
      "--primary",
      "--primary-light",
      "--primary-lighter",
      "--primary-dark",
      "--primary-darker",
      "--primary-bg",
    ],
  },
  {
    name: "危险色",
    vars: ["--danger", "--danger-light", "--danger-dark", "--danger-bg"],
  },
  {
    name: "警告色",
    vars: ["--warning", "--warning-light", "--warning-dark", "--warning-bg"],
  },
  {
    name: "信息色",
    vars: ["--info", "--info-light", "--info-dark", "--info-bg"],
  },
  {
    name: "成功色",
    vars: ["--success", "--success-light", "--success-dark", "--success-bg"],
  },
  { name: "纯白", vars: ["--white"] },
  {
    name: "辅助色",
    vars: [
      "--accent-lime",
      "--accent-mint",
      "--accent-moss",
      "--accent-teal",
      "--accent-purple",
    ],
  },
  {
    name: "中性色阶",
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
  },
  {
    name: "阴影",
    vars: [
      "--shadow",
      "--shadow-light",
      "--shadow-heavy",
      "--shadow-glow",
      "--shadow-glow-strong",
    ],
  },
  {
    name: "渐变",
    vars: ["--gradient-primary", "--gradient-light", "--gradient-card"],
  },
  {
    name: "RGB 分量",
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
  },
];

// ==================== 主逻辑 ====================

const STYLES_DIR = path.resolve(__dirname, "..", "src", "styles");

function validateSingle(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const varRegex = /^\s*(--[a-zA-Z][a-zA-Z0-9-]*)\s*:/gm;
  const defined = new Set();
  let match;
  while ((match = varRegex.exec(content)) !== null) defined.add(match[1]);
  const definedArray = [...defined];

  const missingMap = new Map();
  for (const cat of CATEGORIES) {
    const missing = cat.vars.filter((v) => !defined.has(v));
    if (missing.length > 0) missingMap.set(cat.name, missing);
  }

  const extraFromCSS = definedArray.filter((v) => !REQUIRED.includes(v));
  const fileName = path.basename(filePath);
  const missingCount = Array.from(missingMap.values()).reduce(
    (s, v) => s + v.length,
    0,
  );

  console.log(`\n📋 ${fileName}`);
  console.log(`   共 ${definedArray.length} 个变量定义`);

  let ok = true;
  if (missingMap.size === 0) {
    console.log("   ✅ 正向检查通过");
  } else {
    ok = false;
    console.log("   ❌ 缺失变量：");
    for (const [cat, vars] of missingMap) {
      console.log(`     【${cat}】${vars.join(", ")}`);
    }
  }
  if (extraFromCSS.length > 0) {
    console.log(
      `   ⚠ CSS 中定义了 ${extraFromCSS.length} 个不在校验清单中的变量：${extraFromCSS.join(", ")}`,
    );
  }
  return { ok, missingCount, extraCount: extraFromCSS.length };
}

const targetFile = process.argv[2];

if (!targetFile) {
  console.error("❌ 用法: node scripts/validate-theme.cjs <theme-file>");
  console.error(
    "   或: node scripts/validate-theme.cjs --all (扫描所有 theme-*.css)",
  );
  process.exit(1);
}

if (targetFile === "--all") {
  const files = fs
    .readdirSync(STYLES_DIR)
    .filter((f) => /^theme-.+\.css$/.test(f) && f !== "theme.css");
  if (files.length === 0) {
    console.error("❌ 未找到 theme-*.css 文件");
    process.exit(1);
  }
  console.log(`\n🔍 扫描全部 ${files.length} 个主题文件...`);
  let totalMissing = 0;
  let totalExtra = 0;
  let exitCode = 0;
  for (const f of files) {
    const result = validateSingle(path.join(STYLES_DIR, f));
    if (!result.ok) exitCode = 1;
    totalMissing += result.missingCount;
    totalExtra += result.extraCount;
  }
  if (exitCode === 0 && totalExtra === 0) {
    console.log(`\n✅ ${files.length} 个主题全部通过！`);
  } else {
    console.log(`\n⚠ 缺失总计: ${totalMissing}，清单外变量总计: ${totalExtra}`);
  }
  process.exit(exitCode);
}

const filePath = path.resolve(targetFile);
if (!fs.existsSync(filePath)) {
  console.error(`❌ 文件不存在: ${filePath}`);
  process.exit(1);
}

const result = validateSingle(filePath);
process.exit(result.ok ? 0 : 1);
