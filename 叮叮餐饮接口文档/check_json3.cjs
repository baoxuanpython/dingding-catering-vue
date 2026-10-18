const fs = require("fs");
const content = fs.readFileSync(
  "f:/document/GitHub/dingding-catering-vue/叮叮餐饮接口文档/dingding-catering-openapi.json",
  "utf8",
);
const lines = content.split("\n");

// Find paths object boundaries
let pathsLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '"paths": {') {
    pathsLine = i + 1;
    console.log("paths starts at line", pathsLine);
    break;
  }
}

// Now count braces from paths start
let depth = 0;
let pathKeys = [];
let inPaths = true;

for (let i = pathsLine - 1; i < lines.length && inPaths; i++) {
  const line = lines[i];
  for (const ch of line) {
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        console.log("paths closes at line", i + 1);
        inPaths = false;
      }
    }
  }

  // Track path keys (lines like "/admin/xxx": {)
  const match = line.trim().match(/^"\/[^"]+":\s*\{/);
  if (match) {
    pathKeys.push({ line: i + 1, key: line.trim().substring(0, 50) });
  }
}

console.log("\nPath keys found within paths object:", pathKeys.length);
pathKeys.forEach((p) => console.log("  Line", p.line, ":", p.key));
