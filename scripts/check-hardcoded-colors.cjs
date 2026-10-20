#!/usr/bin/env node

// ==================== 硬编码颜色检测脚本 ====================
// 检测规则：
// 1. rgba(r, g, b, ...) / rgba(r g b / ...) — 禁止数字开头的 rgba/rgb
// 2. 排除 var() 引用、注释行、主题定义文件（theme*.css）

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");

const patterns = [/rgba?\s*\(\s*\d{1,3}\s*,?\s*\d/gi];

const IGNORE_DIRS = ["node_modules", "dist", ".git"];
const STYLES_DIR = path.join("src", "styles");
const EXTENSIONS = [".css", ".scss", ".vue"];

let totalErrors = 0;
let totalFiles = 0;

function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      callback(fullPath);
    }
  }
}

function shouldIgnore(filePath) {
  const fileName = path.basename(filePath);

  // 自动忽略所有主题定义文件（theme*.css），无需手动维护排除列表
  if (filePath.includes(STYLES_DIR) && fileName.startsWith("theme")) {
    return true;
  }

  // 忽略独立演示样式表
  if (fileName === "style.css") {
    return true;
  }

  return false;
}

function checkFile(filePath) {
  if (shouldIgnore(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  let fileErrors = 0;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*")
    )
      return;

    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const before = line.substring(0, match.index);
        if (before.includes("var(")) continue;
        if (trimmed.startsWith("--") && trimmed.includes("rgb")) continue;

        const displayPath = path.relative(ROOT, filePath);
        const snippet =
          trimmed.length > 100 ? trimmed.substring(0, 97) + "..." : trimmed;
        console.log(`  ✗ ${displayPath}:${idx + 1}  ${snippet}`);
        fileErrors++;
      }
    }
  });

  if (fileErrors > 0) {
    totalErrors += fileErrors;
  } else {
    totalFiles++;
  }
}

// Main
const targetDir = process.argv[2] || "src";
const srcPath = path.resolve(ROOT, targetDir);

console.log(`\n🔍 扫描硬编码颜色: ${path.relative(ROOT, srcPath)}\n`);

walkDir(srcPath, checkFile);

console.log(`\n  ${totalFiles} 个文件通过, ${totalErrors} 处硬编码违规\n`);

process.exit(totalErrors > 0 ? 1 : 0);
