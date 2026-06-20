const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_ROOT = path.join(__dirname, '..');
const STAMP = Date.now();

function file(p) { return path.join(ROOT, p); }
function src(p) { return path.join(SRC_ROOT, p); }
function backup(target) {
  if (!fs.existsSync(target)) return;
  const bak = `${target}.bak_action_log_${STAMP}`;
  fs.copyFileSync(target, bak);
  console.log('Backup:', path.relative(ROOT, bak));
}
function copy(srcRel, dstRel) {
  const from = src(srcRel);
  const to = file(dstRel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  backup(to);
  fs.copyFileSync(from, to);
  console.log('Đã chép', dstRel);
}
function replaceOnce(content, marker, replacement, label) {
  if (content.includes(replacement)) {
    console.log('Bỏ qua', label, ': đã có.');
    return content;
  }
  if (!content.includes(marker)) {
    console.log('Bỏ qua', label, ': không tìm thấy mốc.');
    return content;
  }
  console.log('Đã vá', label);
  return content.replace(marker, replacement);
}
function insertBefore(content, marker, block, label) {
  if (content.includes(block.trim())) {
    console.log('Bỏ qua', label, ': đã có.');
    return content;
  }
  if (!content.includes(marker)) {
    console.log('Bỏ qua', label, ': không tìm thấy mốc.');
    return content;
  }
  console.log('Đã vá', label);
  return content.replace(marker, `${block}\n${marker}`);
}

copy('core/serverActionLog.js', 'core/serverActionLog.js');

const serverPath = file('server.js');
if (fs.existsSync(serverPath)) {
  backup(serverPath);
  let s = fs.readFileSync(serverPath, 'utf8');

  s = insertBefore(
    s,
    "const app = express();",
    "const serverActionLog = require('./core/serverActionLog');",
    'require serverActionLog'
  );

  s = replaceOnce(
    s,
    "function savePlayers(players) { fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2)); }",
    "function savePlayers(players) { serverActionLog.logPlayerChanges(DATA_FILE, players); fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2)); }",
    'ghi log khi savePlayers'
  );

  s = replaceOnce(
    s,
    "pillEffects: { tuViGainPerSecond: getTuViGainPerSecond(player) },",
    "activityLog: serverActionLog.readPlayerLogs(DATA_FILE, player.username, 80), pillEffects: { tuViGainPerSecond: getTuViGainPerSecond(player) },",
    'đưa activityLog vào sanitizePlayer'
  );

  const apiBlock = "app.get('/api/player/:username/action-log', (req, res) => { const limit = Math.max(1, Math.min(300, Number(req.query.limit || 80))); res.json({ success: true, logs: serverActionLog.readPlayerLogs(DATA_FILE, req.params.username, limit) }); });";
  s = insertBefore(s, "app.listen(PORT", apiBlock, 'API đọc nhật ký riêng');

  fs.writeFileSync(serverPath, s, 'utf8');
}

const scriptPath = file('frontend/script.js');
if (fs.existsSync(scriptPath)) {
  backup(scriptPath);
  let js = fs.readFileSync(scriptPath, 'utf8');

  if (!js.includes('function ensureActionLogPanel()')) {
    const block = `
// ===============================
// Nhật Ký Đạo Hành - lấy từ log server
// ===============================
function formatServerActionTime(at) {
  const time = Number(at || 0);
  if (!time) return '';
  return new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function ensureActionLogPanel() {
  let box = document.getElementById('activity-log-list');
  if (box) return box;
  const overview = document.getElementById('tab-overview');
  if (!overview) return null;
  const panel = document.createElement('div');
  panel.className = 'panel wide activity-panel';
  panel.innerHTML = '<div class="panel-title"><div><h3>Nhật Ký Đạo Hành</h3><p>Ghi từ log server, không phụ thuộc tab đang mở.</p></div></div><div id="activity-log-list" class="activity-log-list"></div>';
  overview.appendChild(panel);
  return document.getElementById('activity-log-list');
}

function renderServerActionLog() {
  const box = ensureActionLogPanel();
  if (!box) return;
  const logs = Array.isArray(playerData?.activityLog) ? playerData.activityLog : [];
  if (!logs.length) {
    box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>';
    return;
  }
  box.innerHTML = logs.map(item => {
    const category = escapeHtml(item.categoryLabel || item.category || 'Thiên Cơ');
    const text = escapeHtml(item.text || 'Đạo hành biến động.');
    const detail = item.detail ? '<p>' + escapeHtml(item.detail) + '</p>' : '';
    const time = escapeHtml(formatServerActionTime(item.at));
    const cls = escapeHtml(item.category || 'system');
    return '<div class="activity-log-item activity-' + cls + '"><div><b>' + category + '</b><span>' + time + '</span></div><strong>' + text + '</strong>' + detail + '</div>';
  }).join('');
}
`;
    js += `\n${block}\n`;
    console.log('Đã thêm renderServerActionLog');
  }

  if (js.includes('renderActivityLog();')) {
    js = js.replace('renderActivityLog();', 'renderActivityLog(); renderServerActionLog();');
    console.log('Đã gắn renderServerActionLog vào renderAll');
  } else if (js.includes('renderOverview();')) {
    js = js.replace('renderOverview();', 'renderOverview(); renderServerActionLog();');
    console.log('Đã gắn renderServerActionLog sau renderOverview');
  } else {
    console.log('Bỏ qua gắn render frontend: không tìm thấy mốc render.');
  }

  fs.writeFileSync(scriptPath, js, 'utf8');
}

const cssPath = file('frontend/style.css');
if (fs.existsSync(cssPath)) {
  backup(cssPath);
  let css = fs.readFileSync(cssPath, 'utf8');
  if (!css.includes('.activity-log-list')) {
    css += `

.activity-panel { margin-top: 16px; }
.activity-log-list { display: grid; gap: 10px; max-height: 360px; overflow: auto; padding-right: 4px; }
.activity-log-item { border: 1px solid rgba(255,255,255,.12); border-radius: 12px; padding: 10px 12px; background: rgba(0,0,0,.24); }
.activity-log-item > div { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; opacity: .82; margin-bottom: 4px; }
.activity-log-item strong { display: block; font-size: 14px; line-height: 1.35; }
.activity-log-item p { margin: 4px 0 0; font-size: 12px; opacity: .82; }
`;
    console.log('Đã thêm CSS nhật ký');
  }
  fs.writeFileSync(cssPath, css, 'utf8');
}

console.log('\nHoàn tất patch Nhật Ký Server. Chạy: npm start');
