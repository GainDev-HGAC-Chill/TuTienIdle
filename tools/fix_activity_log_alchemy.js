const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const serverPath = path.join(ROOT, 'server.js');
const coreDir = path.join(ROOT, 'core');
const activityPath = path.join(coreDir, 'activityLog.js');

function backup(file) {
  if (!fs.existsSync(file)) return;
  const bak = `${file}.bak_activity_alchemy_${Date.now()}`;
  fs.copyFileSync(file, bak);
  console.log('Backup:', path.relative(ROOT, bak));
}

function writeActivityCore() {
  if (!fs.existsSync(coreDir)) fs.mkdirSync(coreDir, { recursive: true });
  backup(activityPath);
  const src = path.join(__dirname, '..', 'core', 'activityLog.js');
  fs.copyFileSync(src, activityPath);
  console.log('Đã cập nhật core/activityLog.js');
}

function insertAfterOnce(text, marker, insert, label) {
  if (text.includes(insert.trim())) {
    console.log('Bỏ qua', label, '- đã có');
    return text;
  }
  const idx = text.indexOf(marker);
  if (idx < 0) {
    console.log('Không tìm thấy mốc:', label);
    return text;
  }
  return text.slice(0, idx + marker.length) + insert + text.slice(idx + marker.length);
}

function replaceOnce(text, from, to, label) {
  if (text.includes(to)) {
    console.log('Bỏ qua', label, '- đã có');
    return text;
  }
  if (!text.includes(from)) {
    console.log('Không tìm thấy mốc:', label);
    return text;
  }
  console.log('Đã vá:', label);
  return text.replace(from, to);
}

function patchServer() {
  if (!fs.existsSync(serverPath)) {
    console.error('Không tìm thấy server.js. Hãy chạy script ở thư mục gốc repo.');
    process.exit(1);
  }

  backup(serverPath);
  let s = fs.readFileSync(serverPath, 'utf8');

  // 1) Require helper. Repo hiện tại là CommonJS.
  if (!s.includes("require('./core/activityLog')")) {
    const marker = "const cors = require('cors');";
    if (s.includes(marker)) {
      s = s.replace(marker, `${marker} const { ensureActivityLog, addActivityLog, publicActivityLog } = require('./core/activityLog');`);
      console.log('Đã thêm require activityLog');
    } else {
      console.log('Không tìm thấy mốc require cors');
    }
  } else {
    console.log('Require activityLog đã có');
  }

  // 2) Đảm bảo player cũ có activityLog.
  s = replaceOnce(
    s,
    "function getPlayerOrCreate(players, username) { if (!players[username]) players[username] = createNewPlayer(username); ensurePlayerShape(players[username]); return players[username]; }",
    "function getPlayerOrCreate(players, username) { if (!players[username]) players[username] = createNewPlayer(username); ensurePlayerShape(players[username]); ensureActivityLog(players[username]); return players[username]; }",
    'ensure activityLog trong getPlayerOrCreate'
  );

  // 3) Đưa log ra client.
  s = replaceOnce(
    s,
    "pillEffects: { tuViGainPerSecond: getTuViGainPerSecond(player) }, }; }",
    "pillEffects: { tuViGainPerSecond: getTuViGainPerSecond(player) }, activityLog: publicActivityLog(player), }; }",
    'public activityLog trong sanitizePlayer'
  );

  // 4) Log luyện đan: endpoint /alchemy/craft.
  s = replaceOnce(
    s,
    "const result = craftRecipe(player, req.body.recipeId); if (!result.success) return res.status(400).json(result); sendPlayer(res, players, player, result); }); app.post('/api/player/:username/pill/use'",
    "const result = craftRecipe(player, req.body.recipeId); if (!result.success) return res.status(400).json(result); addActivityLog(player, 'alchemy', result.message || 'Luyện đan thành công', `Công thức: ${req.body.recipeId || 'không rõ'}`); sendPlayer(res, players, player, result); }); app.post('/api/player/:username/pill/use'",
    'log luyện đan /alchemy/craft'
  );

  // 5) Log dùng đan qua /pill/use.
  s = replaceOnce(
    s,
    "const result = useLifespanPill(player, req.body.itemId || req.body.pillId); if (!result.success) return res.status(400).json(result); sendPlayer(res, players, player, result); }); app.post('/api/player/:username/use'",
    "const itemId = req.body.itemId || req.body.pillId; const result = useLifespanPill(player, itemId); if (!result.success) return res.status(400).json(result); addActivityLog(player, 'item', result.message || 'Đã sử dụng đan dược', `Vật phẩm: ${itemId || 'không rõ'}`); sendPlayer(res, players, player, result); }); app.post('/api/player/:username/use'",
    'log dùng đan /pill/use'
  );

  // 6) Log dùng đan qua generic /use.
  s = replaceOnce(
    s,
    "const result = useLifespanPill(player, itemId); if (!result.success) return res.status(400).json(result); return sendPlayer(res, players, player, result); } sendPlayer(res, players, player, { message: 'Vật phẩm này chưa có logic sử dụng.' }); }); app.post('/api/player/:username/encounter/choose'",
    "const result = useLifespanPill(player, itemId); if (!result.success) return res.status(400).json(result); addActivityLog(player, 'item', result.message || 'Đã sử dụng vật phẩm', `Vật phẩm: ${itemId || 'không rõ'}`); return sendPlayer(res, players, player, result); } sendPlayer(res, players, player, { message: 'Vật phẩm này chưa có logic sử dụng.' }); }); app.post('/api/player/:username/encounter/choose'",
    'log dùng đan /use'
  );

  fs.writeFileSync(serverPath, s, 'utf8');
  console.log('Hoàn tất vá server.js');
}

writeActivityCore();
patchServer();
console.log('\nXong. Chạy lại: npm start rồi Ctrl + F5 ở trình duyệt.');
