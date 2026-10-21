#!/usr/bin/env node

// ==================== 硬编码颜色检测脚本 ====================
// 检测规则：
// 1. rgba(r, g, b, ...) / rgba(r g b / ...) — 禁止数字开头的 rgba/rgb
// 2. 排除 var() 引用、注释行、主题定义文件（theme*.css）

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");

const patterns = [
  // 规则1: rgba/rgb() 数字格式 - rgba(xxx, xxx, xxx) / rgb(xxx, xxx, xxx)
  /rgba?\s*\(\s*\d{1,3}\s*,?\s*\d/gi,

  // 规则2: 十六进制颜色 - #RGB / #RRGGBB / #RGBA / #RRGGBBAA
  /#[0-9a-fA-F]{3,8}(?![\w-])/g,

  // 规则3: 颜色名称（常见） - red, blue, green, white, black 等
  /\b(black|white|red|green|blue|yellow|orange|purple|pink|gray|grey|brown|cyan|magenta|violet|indigo|gold|silver|navy|teal|maroon|olive|lime|aqua|fuchsia|coral|crimson|salmon|tomato|orchid|plum|tan|ivory|beige|khaki|lavender|turquoise|aquamarine)\b/gi,
];

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

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const matchedText = match[0];
        const before = line.substring(0, match.index);

        // 排除 var() 引用中的颜色
        if (before.includes("var(")) continue;

        // 排除 CSS 变量定义（--xxx: color）
        if (trimmed.startsWith("--") && trimmed.includes("=")) continue;

        // === 规则3 特殊排除：CSS 属性名、SVG ID、动画名中的误报 ===
        if (i === 2) {
          // 排除: white-space, line-height 等属性名中的颜色词
          // 检查匹配的颜色词前面是否有连字符（如 white-space）
          if (match.index > 0 && line[match.index - 1] === "-") continue;

          // 排除: url(#gradient-lime), url(#xxx-red) 等 SVG/URL 引用
          // 检查是否在 #...() 内部
          if (
            before.includes("#") &&
            before.includes("(") &&
            !before.includes(")")
          )
            continue;

          // 排除: ring-pulse-green, btn-primary-red 等连字符连接的类名/ID/动画名
          // 检查后面是否跟着连字符或字母数字（说明是标识符的一部分）
          const after = line.substring(match.index + matchedText.length);
          if (after.match(/^[-_a-zA-Z0-9]/)) continue;
        }

        // === 规则2 特殊排除：SVG ID 中的十六进制 ===
        if (i === 1) {
          // 排除: #gradient-lime, #icon-blue 等（非颜色的ID引用）
          // 负向断言 (?![\w-]) 已处理大部分情况，但再保险一点
          // 如果 # 后面紧跟字母且长度>7，很可能是 ID 而非颜色
          if (
            matchedText.length >= 6 &&
            /^[a-fA-F]{6}$/.test(matchedText.slice(1))
          ) {
            // 标准的6位HEX颜色，保留
          }
        }

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
