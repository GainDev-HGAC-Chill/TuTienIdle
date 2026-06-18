const fs = require('fs');
const path = require('path');

const root = process.cwd();
const serverPath = path.join(root, 'server.js');
const scriptPath = path.join(root, 'frontend', 'script.js');
const mapServiceSrc = path.join(__dirname, '..', 'core', 'mapService.js');
const mapServiceDst = path.join(root, 'core', 'mapService.js');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
  console.log('patched:', path.relative(root, file));
}

function backup(file) {
  const bak = `${file}.bak_map_${Date.now()}`;
  fs.copyFileSync(file, bak);
  console.log('backup:', path.relative(root, bak));
}

function replaceOrFail(content, pattern, replacement, label) {
  if (!pattern.test(content)) throw new Error(`Không tìm thấy đoạn cần thay: ${label}`);
  return content.replace(pattern, replacement);
}

if (!fs.existsSync(serverPath)) throw new Error('Không thấy server.js. Hãy chạy trong thư mục gốc repo TuTienIdle.');
if (!fs.existsSync(scriptPath)) throw new Error('Không thấy frontend/script.js.');

backup(serverPath);
backup(scriptPath);
fs.mkdirSync(path.dirname(mapServiceDst), { recursive: true });
fs.copyFileSync(mapServiceSrc, mapServiceDst);
console.log('patched:', path.relative(root, mapServiceDst));

let server = read(serverPath);

if (!server.includes("require('./core/mapService')")) {
  server = server.replace(
    "const caveService = require('./core/caveService');",
    "const caveService = require('./core/caveService'); const mapService = require('./core/mapService');"
  );
}

server = server.replace(/currentZone:\s*'rung_thap'/g, "currentZone: mapService.getDefaultMapId()");
server = server.replace(/if \(!player\.currentZone\) player\.currentZone = 'rung_thap';/g, "if (!player.currentZone) player.currentZone = mapService.getDefaultMapId(); mapService.ensureCurrentMap(player);");

server = replaceOrFail(
  server,
  /const ZONES = \{[\s\S]*?\};\s*function fightMonster\(player\) \{[\s\S]*?\}\s*function getTuViGainPerSecond/,
  `function fightMonster(player) {\n  const result = mapService.fightMonster(player);\n  if (result.killed) {\n    currencyService.addCurrency(player, 'so_linh_thach', Math.max(1, result.monster.stoneReward || Math.floor((result.monster.tuViReward || 10) / 10)));\n  }\n  return result;\n}\n\nfunction getTuViGainPerSecond`,
  'ZONES + fightMonster cũ'
);

server = server.replace(/zoneName:\s*ZONES\[player\.currentZone\]\?\.name \|\| 'Unknown'/g, "zoneName: mapService.ensureCurrentMap(player)?.name || 'Unknown', currentMap: mapService.getPlayerMapState(player).currentMap, unlockedMaps: mapService.getPlayerMapState(player).unlockedMaps");

server = server.replace(/zones:\s*ZONES,\s*skillRules:/g, "zones: mapService.getZonesForMeta(), maps: mapService.getAllMaps(), skillRules:");

server = replaceOrFail(
  server,
  /app\.post\('\/api\/player\/:username\/zone',[\s\S]*?\}\);\s*app\.get\('\/api\/skills'/,
  `app.post('/api/player/:username/zone', (req, res) => {\n  const players = loadPlayers();\n  const player = getPlayerOrCreate(players, req.params.username);\n  const zone = req.body.zone || req.body.mapId;\n  const map = mapService.getMapById(zone);\n  if (!map) return res.status(400).json({ success: false, error: 'Invalid map' });\n  if (!mapService.getUnlockedMaps(player).some(item => item.id === map.id)) {\n    return res.status(400).json({ success: false, error: 'Map chưa mở khóa theo cảnh giới hiện tại.' });\n  }\n  player.currentZone = map.id;\n  sendPlayer(res, players, player, { message: \`Đã chuyển đến \${map.name}\` });\n});\n\napp.get('/api/skills'`,
  'endpoint /zone cũ'
);

write(serverPath, server);

let script = read(scriptPath);

// Gắn sự kiện động cho nút map tạo bằng JS.
if (!script.includes('document.addEventListener(\'click\', async (e) =>')) {
  script = script.replace(
    "document.querySelectorAll('[data-zone]').forEach(btn => { btn.addEventListener('click', () => changeZone(btn.dataset.zone)); });",
    "document.addEventListener('click', async (e) => { const btn = e.target.closest('[data-map-id]'); if (btn) changeZone(btn.dataset.mapId); });"
  );
}

if (!script.includes('function ensureMapButtonsContainer()')) {
  const helper = `\nfunction ensureMapButtonsContainer() {\n  let el = document.getElementById('map-buttons') || document.getElementById('zone-buttons') || document.getElementById('zone-list');\n  if (el) return el;\n\n  const monsterEl = document.getElementById('zone-monster');\n  el = document.createElement('div');\n  el.id = 'map-buttons';\n  el.className = 'action-row zone-actions';\n\n  const card = monsterEl?.closest('.card, .panel, .glass-card, section, div');\n  if (card) card.appendChild(el);\n  else document.body.appendChild(el);\n  return el;\n}\n\nfunction renderMapButtons() {\n  const el = ensureMapButtonsContainer();\n  const maps = playerData?.unlockedMaps || Object.values(metaData?.zones || {});\n  el.innerHTML = (maps || []).map(map => \`<button class=\"secondary-btn map-btn \${map.id === playerData.currentZone ? 'active' : ''}\" data-map-id=\"\${map.id}\">\${map.name}</button>\`).join('') || '<span class=\"muted\">Chưa mở map.</span>';\n}\n`;
  script = script.replace('async function toggleFight()', `${helper}\nasync function toggleFight()`);
}

script = script.replace(
  "const zone = metaData?.zones?.[playerData.currentZone]; $('zone-monster').textContent = zone?.monster || 'Không rõ';",
  "const zone = playerData.currentMap || metaData?.zones?.[playerData.currentZone]; $('zone-monster').textContent = zone?.monster || zone?.monsters?.[0]?.name || 'Không rõ'; renderMapButtons();"
);

write(scriptPath, script);

console.log('\nXong. Hãy chạy: npm start hoặc node server.js, sau đó Ctrl+F5 trên trình duyệt.');
