const fs = require('fs');
const path = require('path');

const root = process.cwd();
const file = (rel) => path.join(root, rel);

function backup(rel) {
  const f = file(rel);
  if (fs.existsSync(f)) fs.copyFileSync(f, f + '.bak_' + Date.now());
}
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function write(rel, s) { fs.writeFileSync(file(rel), s, 'utf8'); }

function replaceFunction(src, name, replacement) {
  const marker = `function ${name}(`;
  const start = src.indexOf(marker);
  if (start < 0) {
    console.warn(`[WARN] Không tìm thấy function ${name}`);
    return src;
  }
  const brace = src.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
    if (depth === 0) return src.slice(0, start) + replacement.trim() + '\n' + src.slice(i + 1);
  }
  console.warn(`[WARN] Không parse được function ${name}`);
  return src;
}

function insertBefore(src, needle, block) {
  if (src.includes(block.trim().slice(0, 50))) return src;
  const idx = src.indexOf(needle);
  if (idx < 0) {
    console.warn(`[WARN] Không tìm thấy vị trí chèn trước: ${needle}`);
    return src;
  }
  return src.slice(0, idx) + block + '\n' + src.slice(idx);
}

// =======================
// frontend/script.js
// =======================
backup('frontend/script.js');
let js = read('frontend/script.js');

// Sửa lỗi ký tự literal làm hỏng JS nếu còn.
js = js.replace(/\\nfunction\s+renderMapButtons/g, 'function renderMapButtons');
js = js.replace(/\n\\nfunction\s+renderMapButtons/g, '\nfunction renderMapButtons');

// Thêm state giữ trạng thái đóng/mở map theo world.
if (!js.includes('let mapWorldOpenState')) {
  js = js.replace(
    'let refreshTimer = null;',
    'let refreshTimer = null;\nlet mapWorldOpenState = {};'
  );
}

if (!js.includes('function syncMapWorldOpenState')) {
  js = js.replace(
    'function ensureMapButtonsContainer()',
    `
function syncMapWorldOpenState() {
    document.querySelectorAll('.map-world-group[data-world-id]').forEach(el => {
        mapWorldOpenState[el.dataset.worldId] = el.open;
    });
}

function getCurrentMapWorldId() {
    const map = playerData?.currentMap || {};
    return map.required?.world || map.world || playerData?.cultivation?.world || 'nhan_gioi';
}

function ensureMapButtonsContainer()`
  );
}

// Thay renderMapButtons: không tự bật lại details khi refresh.
js = replaceFunction(js, 'renderMapButtons', `
function renderMapButtons() {
    const el = ensureMapButtonsContainer();
    if (!el) return;

    syncMapWorldOpenState();

    const maps = playerData?.unlockedMaps || [];
    if (!maps.length) {
        el.innerHTML = '<span class="muted">Chưa mở map.</span>';
        return;
    }

    const currentWorldId = getCurrentMapWorldId();
    const worlds = groupMapsByWorldRealm(maps);

    el.innerHTML = worlds.map(world => {
        const hasState = Object.prototype.hasOwnProperty.call(mapWorldOpenState, world.id);
        const isOpen = hasState ? mapWorldOpenState[world.id] : world.id === currentWorldId;

        return \`
            <details class="map-world-group" data-world-id="\${world.id}" \${isOpen ? 'open' : ''}>
                <summary class="map-world-title">\${world.name}</summary>
                \${world.realms.map(realm => \`
                    <div class="map-realm-group">
                        <div class="map-realm-title">\${realm.name}</div>
                        <div class="map-button-row">
                            \${realm.maps.map(map => \`
                                <button class="small-btn map-btn \${map.id === playerData.currentZone ? 'active' : ''}" data-map-id="\${map.id}">
                                    \${map.name}
                                </button>
                            \`).join('')}
                        </div>
                    </div>
                \`).join('')}
            </details>
        \`;
    }).join('');

    el.querySelectorAll('.map-world-group[data-world-id]').forEach(detail => {
        detail.addEventListener('toggle', () => {
            mapWorldOpenState[detail.dataset.worldId] = detail.open;
        });
    });

    el.querySelectorAll('.map-btn').forEach(btn => {
        btn.onclick = () => changeZone(btn.dataset.mapId);
    });
}
`);

// Hiện EXP luyện thể/hồn để biết đang tự luyện.
js = js.replace(
  "$('body-info').textContent = playerData.bodyCultivation?.info?.displayName || '-';\n    $('soul-info').textContent = playerData.soulCultivation?.info?.displayName || '-';",
  `const body = playerData.bodyCultivation || {};
    const soul = playerData.soulCultivation || {};
    $('body-info').textContent = body.info?.displayName
        ? \`\${body.info.displayName} · \${fmt(body.exp || 0)} / \${fmt(body.maxExp || 0)}\`
        : '-';
    $('soul-info').textContent = soul.info?.displayName
        ? \`\${soul.info.displayName} · \${fmt(soul.exp || 0)} / \${fmt(soul.maxExp || 0)}\`
        : '-';`
);

// Đảm bảo có render UI chọn trạng thái tu luyện.
if (!js.includes('function renderCultivationModes(')) {
  js = js.replace(
    "function estimateTuViRate() {",
    `
function renderCultivationModes() {
    const state = playerData.cultivationFocusState || {};
    const selected = state.selected || ['main'];
    const limit = state.limit || 1;
    const names = { main: 'Tu Luyện', body: 'Luyện Thể', soul: 'Luyện Hồn' };

    const box = $('cultivation-focus-list');
    if (box) {
        box.innerHTML = ['main', 'body', 'soul'].map(id => \`
            <button class="small-btn \${selected.includes(id) ? 'active' : ''}" data-cultivation-focus="\${id}">
                \${names[id]}
            </button>
        \`).join('');
    }

    if ($('cultivation-focus-limit')) {
        $('cultivation-focus-limit').textContent = \`Đang tu \${selected.length}/\${limit} loại\`;
    }
}

async function toggleCultivationFocus(type) {
    try {
        const data = await api(\`/player/\${currentUser}/cultivation/focus\`, {
            method: 'POST',
            body: JSON.stringify({ type })
        });
        playerData = data.player;
        renderAll();
        addLog(data.message || 'Đã đổi trạng thái tu luyện.', 'ok');
    } catch (err) {
        addLog(\`Không đổi được trạng thái tu luyện: \${err.message}\`, 'err');
    }
}

function estimateTuViRate() {`
  );
}

if (!js.includes('renderCultivationModes();')) {
  js = js.replace(
    "$('tuvi-rate').textContent = estimateTuViRate();",
    "$('tuvi-rate').textContent = estimateTuViRate();\n    renderCultivationModes();"
  );
}

if (!js.includes("data-cultivation-focus")) {
  js = js.replace(
    "    document.querySelectorAll('.nav-btn').forEach(btn => {\n        btn.addEventListener('click', () => setTab(btn.dataset.tab));\n    });",
    "    document.querySelectorAll('.nav-btn').forEach(btn => {\n        btn.addEventListener('click', () => setTab(btn.dataset.tab));\n    });\n\n    document.addEventListener('click', async (e) => {\n        const btn = e.target.closest('[data-cultivation-focus]');\n        if (!btn) return;\n        await toggleCultivationFocus(btn.dataset.cultivationFocus);\n    });"
  );
}

write('frontend/script.js', js);
console.log('[OK] frontend/script.js');

// =======================
// frontend/index.html
// =======================
backup('frontend/index.html');
let html = read('frontend/index.html');

if (!html.includes('cultivation-focus-list')) {
  html = html.replace(
    `                        <div class="info-table">
                            <div><span>Thế giới</span><b id="cult-world">-</b></div>
                            <div><span>Loại tầng</span><b id="cult-type">-</b></div>
                            <div><span>Tu vi mỗi giây</span><b id="tuvi-rate">-</b></div>
                        </div>`,
    `                        <div class="info-table">
                            <div><span>Thế giới</span><b id="cult-world">-</b></div>
                            <div><span>Loại tầng</span><b id="cult-type">-</b></div>
                            <div><span>Tu vi mỗi giây</span><b id="tuvi-rate">-</b></div>
                        </div>
                        <div class="slot-block">
                            <label>Trạng thái tu luyện</label>
                            <div id="cultivation-focus-list" class="button-row"></div>
                            <p id="cultivation-focus-limit" class="muted">Đang tu 1/1 loại</p>
                        </div>`
  );
}

write('frontend/index.html', html);
console.log('[OK] frontend/index.html');

// =======================
// server.js
// =======================
backup('server.js');
let server = read('server.js');

// Chèn helper tu luyện 3 nhánh.
const helperBlock = `
function getMainCultivationRank(cultivation) {
    const worldOffsets = {
        nhan_gioi: 0,
        tien_gioi: 8,
        nguyen_gioi: 16,
        dao_gioi: 26,
        chung_cuc_gioi: 30,
    };
    return (worldOffsets[cultivation?.world || 'nhan_gioi'] || 0) + Number(cultivation?.realmIndex || 0) + 1;
}

function getCultivationFocusLimit(player) {
    const mainRank = getMainCultivationRank(player.cultivation);
    const bodyRank = Number(player.bodyCultivation?.rank || 1);
    const soulRank = Number(player.soulCultivation?.rank || 1);

    if (mainRank >= 17 && bodyRank >= 17 && soulRank >= 17) return 3; // Nhập Thánh
    if (mainRank >= 9 && bodyRank >= 9 && soulRank >= 9) return 2; // Bán Tiên
    return 1;
}

function normalizeCultivationFocus(player) {
    const valid = ['main', 'body', 'soul'];
    const limit = getCultivationFocusLimit(player);
    let selected = Array.isArray(player.cultivationFocus) ? player.cultivationFocus : ['main'];

    selected = [...new Set(selected.filter(id => valid.includes(id)))];
    if (!selected.length) selected = ['main'];

    player.cultivationFocus = selected.slice(0, limit);
    return player.cultivationFocus;
}

function addSubCultivationExp(player, type, amount) {
    const isBody = type === 'body';
    const progress = isBody ? player.bodyCultivation : player.soulCultivation;
    progress.exp = Number(progress.exp || 0) + Number(amount || 0);

    let guard = 0;
    while (progress.exp >= progress.maxExp && guard < 50) {
        progress.exp -= progress.maxExp;

        const result = isBody
            ? bodyService.upgradeBody(progress, player.cultivation)
            : soulService.upgradeSoul(progress, player.cultivation);

        if (!result.success) {
            progress.exp = progress.maxExp;
            break;
        }

        if (isBody) player.bodyCultivation = result.progress;
        else player.soulCultivation = result.progress;

        guard++;
    }
}

function getCultivationFocusState(player) {
    return {
        selected: normalizeCultivationFocus(player),
        limit: getCultivationFocusLimit(player),
        options: ['main', 'body', 'soul'],
    };
}
`;

server = insertBefore(server, 'function getTuViGainPerSecond(player)', helperBlock);

if (!server.includes("player.cultivationFocus = ['main']")) {
  server = server.replace(
    "if (player.autoFight === undefined) player.autoFight = true;",
    "if (player.autoFight === undefined) player.autoFight = true;\n    if (!Array.isArray(player.cultivationFocus)) player.cultivationFocus = ['main'];\n    normalizeCultivationFocus(player);"
  );
}

// Thay hẳn processGameTick để chắc chắn body/soul có chạy.
server = replaceFunction(server, 'processGameTick', `
function processGameTick(player) {
    ensurePlayerShape(player);
    caveService.processCave(player);
    pillService.clearExpiredPillBuffs(player);

    const now = Date.now();
    const deltaMsRaw = now - player.lastTick;
    const deltaSecondsRaw = Math.floor(deltaMsRaw / 1000);
    if (deltaSecondsRaw <= 0) return;

    const ticks = Math.min(deltaSecondsRaw, 60 * 60);
    const combatDeltaMs = Math.min(deltaMsRaw, 5 * 60 * 1000);
    player.lastTick = now;

    const gain = getTuViGainPerSecond(player) * ticks;
    const focus = normalizeCultivationFocus(player);

    if (focus.includes('main')) {
        player.cultivation.tuVi += gain;
        player.stats.totalTuVi += gain;
    }

    if (focus.includes('body')) {
        addSubCultivationExp(player, 'body', gain);
    }

    if (focus.includes('soul')) {
        addSubCultivationExp(player, 'soul', gain);
    }

    player.stats.playTime += ticks;

    updateCultivation(player);

    if (typeof combatService !== 'undefined' && combatService.processCombat) {
        mapService.ensureCurrentMap(player);
        combatService.processCombat(player, combatDeltaMs);
    } else if (player.autoFight) {
        const fightTicks = Math.min(ticks, 120);
        for (let i = 0; i < fightTicks; i++) fightMonster(player);
    }
}
`);

if (!server.includes('cultivationFocusState: getCultivationFocusState(player)')) {
  server = server.replace(
    "cultivation: cultivationCompat,",
    "cultivation: cultivationCompat,\n        cultivationFocusState: getCultivationFocusState(player),"
  );
}

if (!server.includes("/cultivation/focus")) {
  server = insertBefore(server, "app.get('/api/skills'", `
app.post('/api/player/:username/cultivation/focus', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);

    const type = req.body.type;
    const valid = ['main', 'body', 'soul'];
    if (!valid.includes(type)) {
        return res.status(400).json({ success: false, error: 'Loại tu luyện không hợp lệ.' });
    }

    const limit = getCultivationFocusLimit(player);
    let selected = normalizeCultivationFocus(player);

    if (selected.includes(type)) {
        if (selected.length <= 1) {
            return res.status(400).json({ success: false, error: 'Ít nhất phải chọn 1 loại tu luyện.' });
        }
        selected = selected.filter(id => id !== type);
    } else {
        if (selected.length >= limit) selected.shift();
        selected.push(type);
    }

    player.cultivationFocus = selected.slice(0, limit);
    sendPlayer(res, players, player, { message: 'Đã đổi trạng thái tu luyện.' });
});

`);
}

write('server.js', server);
console.log('[OK] server.js');

console.log('\nXong. Chạy node server.js và Ctrl+F5.');
