const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'frontend', 'script.js');
let s = fs.readFileSync(file, 'utf8');

fs.copyFileSync(file, file + '.bak_' + Date.now());

if (!s.includes('function ensureMapButtonsContainer(')) {
  const insert = `
function ensureMapButtonsContainer() {
    return document.getElementById('combat-map-buttons') ||
        document.getElementById('map-buttons') ||
        document.getElementById('zone-buttons') ||
        document.getElementById('zone-list');
}
`;

  const idx = s.indexOf('function renderMapButtons(');
  if (idx >= 0) {
    s = s.slice(0, idx) + insert + '\\n' + s.slice(idx);
  } else {
    s += '\\n' + insert + '\\n';
  }

  fs.writeFileSync(file, s, 'utf8');
  console.log('[OK] Đã thêm ensureMapButtonsContainer vào frontend/script.js');
} else {
  console.log('[SKIP] ensureMapButtonsContainer đã tồn tại.');
}

console.log('Chạy lại: node server.js và Ctrl+F5.');
