const fs = require('fs');
const path = require('path');

const root = process.cwd();
const files = {
  server: path.join(root, 'server.js'),
  script: path.join(root, 'frontend', 'script.js'),
  style: path.join(root, 'frontend', 'style.css'),
  activity: path.join(root, 'core', 'activityLog.js'),
};

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`Không tìm thấy file: ${path.relative(root, file)}`);
  return fs.readFileSync(file, 'utf8');
}
function write(file, content) { fs.writeFileSync(file, content, 'utf8'); }
function backup(file) {
  if (!fs.existsSync(file)) return;
  const bak = `${file}.bak_activity_v2_${Date.now()}`;
  fs.copyFileSync(file, bak);
  console.log(`Backup: ${path.relative(root, bak)}`);
}
function copyCore() {
  const src = path.join(__dirname, '..', 'core', 'activityLog.js');
  fs.mkdirSync(path.dirname(files.activity), { recursive: true });
  if (fs.existsSync(files.activity)) backup(files.activity);
  fs.copyFileSync(src, files.activity);
  console.log('Đã chép core/activityLog.js');
}
function replaceAllSafe(s, from, to, label) {
  if (!s.includes(from)) {
    console.warn(`Bỏ qua ${label}: không tìm thấy mốc hoặc đã patch.`);
    return s;
  }
  const next = s.split(from).join(to);
  console.log(`Đã patch ${label}`);
  return next;
}
function replaceOnceSafe(s, from, to, label) {
  if (!s.includes(from)) {
    console.warn(`Bỏ qua ${label}: không tìm thấy mốc hoặc đã patch.`);
    return s;
  }
  console.log(`Đã patch ${label}`);
  return s.replace(from, to);
}

function patchServer() {
  let s = read(files.server);
  backup(files.server);

  if (!s.includes("./core/activityLog")) {
    s = replaceOnceSafe(
      s,
      "const app = express();",
      "const app = express(); const { ensureActivityLog, addActivityLog, addResultActivityLog } = require('./core/activityLog');",
      'server require activityLog'
    );
  }

  if (!s.includes('activityLog: []')) {
    s = replaceOnceSafe(
      s,
      "temporaryPenalties: [], };",
      "temporaryPenalties: [], activityLog: [], };",
      'createNewPlayer.activityLog'
    );
  }

  if (!s.includes('ensureActivityLog(player); normalizePracticeState(player);')) {
    s = replaceOnceSafe(
      s,
      "normalizePracticeState(player); ensureCurrentMap(player);",
      "ensureActivityLog(player); normalizePracticeState(player); ensureCurrentMap(player);",
      'ensurePlayerShape.activityLog'
    );
  }

  if (!s.includes('activityLog: ensureActivityLog(player)')) {
    s = replaceOnceSafe(
      s,
      "temporaryPenaltyPercent, pillEffects:",
      "temporaryPenaltyPercent, activityLog: ensureActivityLog(player).slice(-80).reverse(), pillEffects:",
      'sanitizePlayer.activityLog'
    );
  }

  s = replaceOnceSafe(
    s,
    "player.cultivationFocus = selected.slice(0, limit); sendPlayer(res, players, player, { message: 'Đã đổi trạng thái tu luyện.' });",
    "player.cultivationFocus = selected.slice(0, limit); addActivityLog(player, 'cultivation', `Đổi mạch tu luyện: ${player.cultivationFocus.map(tabName).join(' + ')}`); sendPlayer(res, players, player, { message: 'Đã đổi trạng thái tu luyện.' });",
    'log đổi mạch tu luyện'
  );

  s = replaceOnceSafe(
    s,
    "player.techniques.equipped[cfg.system] = id; sendPlayer(res, players, player, { message: `Đã vận chuyển ${cfg.name}.` });",
    "player.techniques.equipped[cfg.system] = id; addActivityLog(player, 'skill', `Vận chuyển công pháp: ${cfg.name}`); sendPlayer(res, players, player, { message: `Đã vận chuyển ${cfg.name}.` });",
    'log vận chuyển công pháp'
  );

  s = replaceOnceSafe(
    s,
    "player.techniques.equipped[slot] = null; sendPlayer(res, players, player, { message: `Đã tháo công pháp ${slot === 'cultivation' ? 'tu luyện' : slot === 'body' ? 'luyện thể' : 'luyện hồn'}.` });",
    "player.techniques.equipped[slot] = null; addActivityLog(player, 'skill', `Tháo công pháp ${slot === 'cultivation' ? 'tu luyện' : slot === 'body' ? 'luyện thể' : 'luyện hồn'}`); sendPlayer(res, players, player, { message: `Đã tháo công pháp ${slot === 'cultivation' ? 'tu luyện' : slot === 'body' ? 'luyện thể' : 'luyện hồn'}.` });",
    'log tháo công pháp'
  );

  s = replaceOnceSafe(
    s,
    "player.martialSkills.equipped.active = id; sendPlayer(res, players, player, { message: `Đã trang bị ${cfg.name}.` });",
    "player.martialSkills.equipped.active = id; addActivityLog(player, 'skill', `Trang bị vũ kỹ: ${cfg.name}`); sendPlayer(res, players, player, { message: `Đã trang bị ${cfg.name}.` });",
    'log trang bị vũ kỹ'
  );

  s = replaceOnceSafe(
    s,
    "player.martialSkills.equipped.active = null; sendPlayer(res, players, player, { message: 'Đã tháo vũ kỹ chiến đấu.' });",
    "player.martialSkills.equipped.active = null; addActivityLog(player, 'skill', 'Tháo vũ kỹ chiến đấu'); sendPlayer(res, players, player, { message: 'Đã tháo vũ kỹ chiến đấu.' });",
    'log tháo vũ kỹ'
  );

  s = replaceOnceSafe(
    s,
    "const result = plantHerb(player, Number(req.body.plotIndex || 0), req.body.herbId); if (!result.success) return res.status(400).json(result); lockInteraction(player, 'garden', 'gieo trồng dược liệu', 800); sendPlayer(res, players, player, result);",
    "const result = plantHerb(player, Number(req.body.plotIndex || 0), req.body.herbId); if (!result.success) return res.status(400).json(result); lockInteraction(player, 'garden', 'gieo trồng dược liệu', 800); addResultActivityLog(player, 'cave', result, 'Đã gieo trồng dược liệu.'); sendPlayer(res, players, player, result);",
    'log gieo trồng dược liệu'
  );

  s = replaceOnceSafe(
    s,
    "const result = harvestHerb(player, Number(req.body.plotIndex || 0)); if (!result.success) return res.status(400).json(result); lockInteraction(player, 'garden', 'thu hoạch dược liệu', 800); sendPlayer(res, players, player, result);",
    "const result = harvestHerb(player, Number(req.body.plotIndex || 0)); if (!result.success) return res.status(400).json(result); lockInteraction(player, 'garden', 'thu hoạch dược liệu', 800); addResultActivityLog(player, 'cave', result, 'Đã thu hoạch dược liệu.'); sendPlayer(res, players, player, result);",
    'log thu hoạch dược liệu'
  );

  s = replaceOnceSafe(
    s,
    "const result = craftRecipe(player, req.body.recipeId); if (!result.success) return res.status(400).json(result); sendPlayer(res, players, player, result);",
    "const result = craftRecipe(player, req.body.recipeId); if (!result.success) return res.status(400).json(result); addResultActivityLog(player, 'alchemy', result, 'Luyện chế thành công.'); sendPlayer(res, players, player, result);",
    'log luyện chế'
  );

  s = replaceOnceSafe(
    s,
    "const result = useLifespanPill(player, req.body.itemId || req.body.pillId); if (!result.success) return res.status(400).json(result); sendPlayer(res, players, player, result);",
    "const result = useLifespanPill(player, req.body.itemId || req.body.pillId); if (!result.success) return res.status(400).json(result); addResultActivityLog(player, 'item', result, 'Đã sử dụng đan dược.'); sendPlayer(res, players, player, result);",
    'log dùng đan dược endpoint pill/use'
  );

  s = replaceOnceSafe(
    s,
    "const result = useLifespanPill(player, itemId); if (!result.success) return res.status(400).json(result); return sendPlayer(res, players, player, result);",
    "const result = useLifespanPill(player, itemId); if (!result.success) return res.status(400).json(result); addResultActivityLog(player, 'item', result, 'Đã sử dụng đan dược.'); return sendPlayer(res, players, player, result);",
    'log dùng đan dược endpoint use'
  );

  s = replaceOnceSafe(
    s,
    "sendPlayer(res, players, player, { message: 'Vật phẩm này chưa có logic sử dụng.' });",
    "addActivityLog(player, 'item', `Thử sử dụng vật phẩm: ${itemId || 'không rõ'} nhưng chưa có logic.`); sendPlayer(res, players, player, { message: 'Vật phẩm này chưa có logic sử dụng.' });",
    'log vật phẩm chưa có logic'
  );

  s = replaceOnceSafe(
    s,
    "const result = resolveEncounter(player, req.body.choiceId); if (!result.success) return res.status(400).json(result); sendPlayer(res, players, player, result);",
    "const result = resolveEncounter(player, req.body.choiceId); if (!result.success) return res.status(400).json(result); addResultActivityLog(player, 'fortune', result, 'Đã xử lý kỳ ngộ.'); sendPlayer(res, players, player, result);",
    'log chọn kỳ ngộ'
  );

  s = replaceOnceSafe(
    s,
    "const result = declineEncounter(player); if (!result.success) return res.status(400).json(result); sendPlayer(res, players, player, result);",
    "const result = declineEncounter(player); if (!result.success) return res.status(400).json(result); addResultActivityLog(player, 'fortune', result, 'Đã từ chối kỳ ngộ.'); sendPlayer(res, players, player, result);",
    'log từ chối kỳ ngộ'
  );

  write(files.server, s);
}

function patchScript() {
  let s = read(files.script);
  backup(files.script);

  if (!s.includes('renderActivityLog();')) {
    s = replaceOnceSafe(
      s,
      "renderOverview(); renderCultivation();",
      "renderOverview(); renderActivityLog(); renderCultivation();",
      'renderAll gọi Nhật Ký Đạo Hành'
    );
  }

  if (!s.includes('function ensureActivityPanel')) {
    const block = [
      '',
      '// ===============================',
      '// Nhật Ký Đạo Hành - Tổng Quan',
      '// ===============================',
      'function formatActivityTime(at) {',
      ' const time = Number(at || 0);',
      " if (!time) return '';",
      " return new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });",
      '}',
      'function ensureActivityPanel() {',
      " let box = $('activity-log-list');",
      ' if (box) return box;',
      " const overview = $('tab-overview');",
      ' if (!overview) return null;',
      " const panel = document.createElement('div');",
      " panel.className = 'panel wide activity-panel';",
      " panel.innerHTML = '<div class=\"panel-head\"><h3>Nhật Ký Đạo Hành</h3><span>Không gồm combat</span></div><div id=\"activity-log-list\" class=\"activity-log-list\"></div>';",
      ' overview.appendChild(panel);',
      " return $('activity-log-list');",
      '}',
      'function renderActivityLog() {',
      ' const box = ensureActivityPanel();',
      ' if (!box) return;',
      ' const logs = Array.isArray(playerData?.activityLog) ? playerData.activityLog : [];',
      ' if (!logs.length) {',
      "  box.innerHTML = '<p class=\"empty\">Chưa có đạo hành nào được ghi nhận.</p>';",
      '  return;',
      ' }',
      ' box.innerHTML = logs.map(item => {',
      "  const category = escapeHtml(item.categoryLabel || item.category || 'Thiên Cơ');",
      "  const text = escapeHtml(item.text || 'Hoạt động không rõ');",
      "  const detail = item.detail ? '<p>' + escapeHtml(item.detail) + '</p>' : '';",
      '  const time = escapeHtml(formatActivityTime(item.at));',
      "  return '<div class=\"activity-log-item activity-' + escapeHtml(item.category || 'system') + '\"><div><b>' + category + '</b><span>' + time + '</span></div><strong>' + text + '</strong>' + detail + '</div>';",
      " }).join('');",
      '}',
      ''
    ].join('\n');
    if (s.includes('function renderCultivation()')) {
      s = s.replace('function renderCultivation()', block + 'function renderCultivation()');
      console.log('Đã thêm hàm renderActivityLog trước renderCultivation');
    } else {
      s += block;
      console.log('Đã thêm hàm renderActivityLog cuối file');
    }
  }

  write(files.script, s);
}

function patchStyle() {
  let s = read(files.style);
  backup(files.style);
  if (s.includes('.activity-log-list')) {
    console.log('style.css đã có activity-log-list, bỏ qua style.');
    return;
  }
  s += `\n\n/* =============================== */\n/* Nhật Ký Đạo Hành */\n/* =============================== */\n.activity-panel { margin-top: 16px; }\n.activity-panel .panel-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }\n.activity-panel .panel-head span { color:#ffd76a; font-weight:800; font-size:12px; }\n.activity-log-list { display:grid; gap:10px; max-height:360px; overflow:auto; padding-right:4px; }\n.activity-log-item { padding:12px 14px; border-radius:14px; background:linear-gradient(145deg, rgba(23,34,52,.96), rgba(10,18,30,.96)); border:1px solid rgba(103,133,174,.34); box-shadow:inset 0 1px 0 rgba(255,255,255,.035); }\n.activity-log-item > div { display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:6px; }\n.activity-log-item b { color:#ffd76a; }\n.activity-log-item span { color:#8fb9ff; font-size:12px; white-space:nowrap; }\n.activity-log-item strong { color:#fff6d8; font-weight:800; }\n.activity-log-item p { margin:7px 0 0; color:#cfe2ff; line-height:1.45; }\n.activity-alchemy { border-color:rgba(204,154,255,.55); }\n.activity-fortune { border-color:rgba(255,215,106,.7); }\n.activity-item { border-color:rgba(116,235,154,.55); }\n.activity-cave { border-color:rgba(93,214,255,.55); }\n.activity-cultivation { border-color:rgba(255,180,92,.55); }\n.activity-skill { border-color:rgba(255,120,120,.55); }\n`;
  write(files.style, s);
  console.log('Đã thêm CSS Nhật Ký Đạo Hành');
}

try {
  copyCore();
  patchServer();
  patchScript();
  patchStyle();
  console.log('\nHoàn tất patch V2 Nhật Ký Đạo Hành. Chạy: npm start');
  console.log('Lưu ý: nếu trình duyệt vẫn không thấy, nhấn Ctrl+F5 để xóa cache.');
} catch (err) {
  console.error('\nLỗi patch:', err.stack || err.message);
  process.exit(1);
}
