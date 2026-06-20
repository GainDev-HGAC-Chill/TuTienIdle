const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const STAMP = Date.now();

function p(...parts) { return path.join(ROOT, ...parts); }
function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, content) { fs.writeFileSync(file, content, 'utf8'); }
function exists(file) { return fs.existsSync(file); }
function backup(file) {
  if (!exists(file)) return;
  const bak = file + '.bak_dao_log_' + STAMP;
  fs.copyFileSync(file, bak);
  console.log('Backup:', path.relative(ROOT, bak));
}
function copyFromPatch(relative) {
  const src = path.join(__dirname, '..', relative);
  const dst = p(relative);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  console.log('Đã chép', relative);
}
function checkJs(file) {
  cp.execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}
function replaceAll(src, find, replace) {
  return src.split(find).join(replace);
}
function ensureRequire(server) {
  server = server.replace(/\s*const\s+serverActionLog\s*=\s*require\(['"]\.\/core\/serverActionLog['"]\);\s*/g, '\n');
  server = server.replace(/\s*const\s+recordPlayerSaveDiff\s*=\s*serverActionLog\.recordPlayerSaveDiff;\s*/g, '\n');
  server = server.replace(/\s*const\s*\{\s*ensureActivityLog\s*,\s*addActivityLog\s*,\s*addResultActivityLog\s*\}\s*=\s*require\(['"]\.\/core\/activityLog['"]\);\s*/g, '\n');

  if (!server.includes("require('./core/actionLog')") && !server.includes('require("./core/actionLog")')) {
    const marker = 'const app = express();';
    if (!server.includes(marker)) throw new Error('Không tìm thấy mốc const app = express();');
    server = server.replace(marker, "const app = express();\nconst { addActionLog, getPlayerLogs } = require('./core/actionLog');");
  }
  return server;
}
function cleanSavePlayers(server) {
  server = server.replace(
    /function\s+savePlayers\s*\(players\)\s*\{\s*try\s*\{\s*recordPlayerSaveDiff\s*\(players\s*,\s*DATA_FILE\)\s*;?\s*\}\s*catch\s*\(err\)\s*\{\s*console\.warn\s*\([^)]*\)\s*;?\s*\}\s*fs\.writeFileSync\s*\(DATA_FILE\s*,\s*JSON\.stringify\s*\(players\s*,\s*null\s*,\s*2\)\s*\)\s*;?\s*\}/,
    "function savePlayers(players) {\n  fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));\n}"
  );
  return server;
}
function cleanSanitizePlayer(server) {
  server = server.replace(
    /activityLog\s*:\s*serverActionLog\.readPlayerLogs\s*\(\s*DATA_FILE\s*,\s*player\.username\s*,\s*80\s*\)\s*,/g,
    'activityLog: getPlayerLogs(player.username, 80),'
  );

  // Nếu chưa có activityLog trong object public player thì thêm ngay trước pillEffects.
  if (!/activityLog\s*:\s*getPlayerLogs\s*\(/.test(server) && /pillEffects\s*:/.test(server)) {
    server = server.replace(/pillEffects\s*:/, 'activityLog: getPlayerLogs(player.username, 80),\n  pillEffects:');
  }
  return server;
}
function insertOnce(server, anchor, insert, label) {
  if (server.includes(insert.trim())) return server;
  if (!server.includes(anchor)) {
    console.warn('Bỏ qua', label + ': không tìm thấy mốc.');
    return server;
  }
  return server.replace(anchor, insert + anchor);
}
function addManualLogs(server) {
  server = insertOnce(
    server,
    "  lockInteraction(player, 'garden', 'gieo trồng dược liệu', 800);",
    "  addActionLog(player, 'garden', 'Gieo trồng dược liệu.');\n",
    'log gieo trồng'
  );
  server = insertOnce(
    server,
    "  lockInteraction(player, 'garden', 'thu hoạch dược liệu', 800);",
    "  addActionLog(player, 'garden', 'Thu hoạch dược liệu.');\n",
    'log thu hoạch'
  );
  server = insertOnce(
    server,
    "  sendPlayer(res, players, player, result);\n\n});\n\napp.post('/api/player/:username/pill/use'",
    "  const recipeLog = RECIPES.find(x => x.id === req.body.recipeId);\n  const pillLog = LIFESPAN_PILLS.find(x => x.id === recipeLog?.pillId);\n  addActionLog(player, 'alchemy', `Luyện chế ${pillLog?.name || recipeLog?.name || 'đan dược'} thành công.`);\n",
    'log luyện đan'
  );
  server = insertOnce(
    server,
    "  sendPlayer(res, players, player, result);\n\n});\n\napp.get('/api/player/:username'",
    "  const usedPillId = req.body.itemId || req.body.pillId;\n  const usedPill = LIFESPAN_PILLS.find(x => x.id === usedPillId);\n  addActionLog(player, 'pill', `Sử dụng ${usedPill?.name || 'đan dược'}.`);\n",
    'log dùng đan'
  );
  server = insertOnce(
    server,
    "  sendPlayer(res, players, player, { message: `Đã trang bị ${cfg.name}.` });",
    "  addActionLog(player, 'martial', `Trang bị vũ kỹ ${cfg.name}.`);\n",
    'log trang bị vũ kỹ'
  );
  server = insertOnce(
    server,
    "  sendPlayer(res, players, player, { message: 'Đã tháo vũ kỹ chiến đấu.' });",
    "  addActionLog(player, 'martial', 'Tháo vũ kỹ chiến đấu.');\n",
    'log tháo vũ kỹ'
  );
  return server;
}
function patchServer() {
  const file = p('server.js');
  backup(file);
  let server = read(file);

  server = ensureRequire(server);
  server = cleanSavePlayers(server);
  server = cleanSanitizePlayer(server);
  server = addManualLogs(server);

  if (/serverActionLog|recordPlayerSaveDiff|ensureActivityLog|addResultActivityLog/.test(server)) {
    throw new Error('server.js vẫn còn dấu vết log cũ. Dừng để tránh lỗi cũ. Hãy gửi server.js hiện tại nếu gặp lỗi này.');
  }

  write(file, server);
  checkJs(file);
  console.log('Đã vá server.js sạch log cũ + log theo hành động.');
}
function patchIndex() {
  const file = p('frontend', 'index.html');
  if (!exists(file)) return;
  backup(file);
  let html = read(file);
  html = html.replace(/\s*<script\s+src=["']actionLogClient\.js["']><\/script>\s*/g, '\n');
  if (html.includes('<script src="script.js"></script>')) {
    html = html.replace('<script src="script.js"></script>', '<script src="script.js"></script>\n  <script src="actionLogClient.js"></script>');
  } else if (html.includes("<script src='script.js'></script>")) {
    html = html.replace("<script src='script.js'></script>", "<script src='script.js'></script>\n  <script src='actionLogClient.js'></script>");
  } else if (!html.includes('actionLogClient.js')) {
    html = html.replace(/<\/body>/i, '  <script src="actionLogClient.js"></script>\n</body>');
  }
  write(file, html);
  console.log('Đã gắn frontend/actionLogClient.js vào index.html.');
}
function patchCss() {
  const file = p('frontend', 'style.css');
  if (!exists(file)) return;
  backup(file);
  let css = read(file);
  if (!css.includes('dao-action-log-panel')) {
    css += `\n\n/* Nhật Ký Đạo Hành */\n.dao-action-log-panel { margin-top: 16px; }\n.dao-action-log-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 12px; }\n.dao-action-log-head h3 { margin: 0 0 4px; }\n.dao-action-log-head p { margin: 0; opacity: .78; font-size: 13px; }\n.dao-action-log-list { display: grid; gap: 10px; max-height: 320px; overflow: auto; padding-right: 4px; }\n.dao-action-log-item { border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.045); border-radius: 12px; padding: 10px 12px; }\n.dao-action-log-meta { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; opacity: .82; margin-bottom: 5px; }\n.dao-action-log-item strong { display: block; font-size: 14px; line-height: 1.45; }\n.dao-action-log-item p { margin: 5px 0 0; opacity: .82; font-size: 13px; }\n`;
  }
  write(file, css);
  console.log('Đã thêm CSS Nhật Ký Đạo Hành.');
}
function main() {
  copyFromPatch('core/actionLog.js');
  copyFromPatch('frontend/actionLogClient.js');
  patchServer();
  patchIndex();
  patchCss();
  console.log('\nHoàn tất. Chạy: npm start, vào web nhấn Ctrl + F5.');
}
main();
