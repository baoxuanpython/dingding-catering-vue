const fs = require("fs");
const content = fs.readFileSync(
  "f:/document/GitHub/dingding-catering-vue/叮叮餐饮接口文档/dingding-catering-openapi.json",
  "utf8",
);
const lines = content.split("\n");

// Find all lines that look like path definitions or closing braces at the right indentation
let inPaths = false;
let braceDepth = 0;
let pathsStart = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  if (trimmed === '"paths": {') {
    inPaths = true;
    pathsStart = i + 1;
    console.log("paths starts at line", pathsStart);
    continue;
  }

  if (inPaths) {
    // Count braces
    for (const ch of line) {
      if (ch === "{") braceDepth++;
      if (ch === "}") braceDepth--;
    }

    // Check if this line is a path key at the right level
    if (trimmed.startsWith('"/') && trimmed.endsWith("{")) {
      console.log("Line", i + 1, ":", trimmed.substring(0, 60));
    }

    // Check if paths closed
    if (braceDepth <= 1 && trimmed === "}") {
      console.log("paths closes at line", i + 1);
      inPaths = false;
    }
  }
}
