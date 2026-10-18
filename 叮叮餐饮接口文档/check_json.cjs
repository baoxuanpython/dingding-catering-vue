const fs = require('fs');
const content = fs.readFileSync('f:/document/GitHub/dingding-catering-vue/叮叮餐饮接口文档/dingding-catering-openapi.json', 'utf8');
const lines = content.split('\n');
let pathsCount = 0;
lines.forEach((l, i) => {
  if (l.includes('"/admin/dish') || l.includes('"/admin/order') || l.includes('"/admin/common')) {
    console.log((i + 1) + ':', l.trim());
    pathsCount++;
  }
});
console.log('Found', pathsCount, 'path definitions');

// Also check JSON parse
const data = JSON.parse(content);
console.log('Parsed paths count:', Object.keys(data.paths).length);
console.log('Parsed paths:');
Object.keys(data.paths).forEach(p => console.log(' ', p));
