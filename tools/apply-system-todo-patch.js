const fs = require('fs');
const path = require('path');

const root = process.cwd();

function p(rel) { return path.join(root, rel); }
function backup(rel) {
  const file = p(rel);
  if (fs.existsSync(file)) fs.copyFileSync(file, file + '.bak_' + Date.now());
}
function read(rel) { return fs.readFileSync(p(rel), 'utf8'); }
function write(rel, s) { fs.writeFileSync(p(rel), s, 'utf8'); }

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
    if (depth === 0) {
      return src.slice(0, start) + replacement.trim() + '\n' + src.slice(i + 1);
    }
  }
  console.warn(`[WARN] Không parse được function ${name}`);
  return src;
}

function insertBefore(src, needle, block, label) {
  if (src.includes(block.trim().slice(0, 40))) return src;
  const idx = src.indexOf(needle);
  if (idx < 0) {
    console.warn(`[WARN] Không tìm thấy vị trí chèn: ${label}`);
    return src;
  }
  return src.slice(0, idx) + block + '\n' + src.slice(idx);
}

// frontend/script.js
backup('frontend/script.js');
let js = read('frontend/script.js');

js = js.replace(/\\nfunction\s+renderMapButtons/g, 'function renderMapButtons');
js = js.replace(/\n\\nfunction\s+renderMapButtons/g, '\nfunction renderMapButtons');

js = replaceFunction(js, 'renderMapButtons', `
function renderMapButtons() {
    const el = ensureMapButtonsContainer();
    if (!el) return;

    const maps = playerData?.unlockedMaps || [];
    if (!maps.length) {
        el.innerHTML = '<span class="muted">Chưa mở map.</span>';
        return;
    }

    const worlds = groupMapsByWorldRealm(maps);
    el.innerHTML = worlds.map(world => \`
        <details class="map-world-group" open>
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
    \`).join('');

    el.querySelectorAll('.map-btn').forEach(btn => {
        btn.onclick = () => changeZone(btn.dataset.mapId);
    });
}
`);

js = js.replace(/const actionPct = state\.fightDuration \?[\s\S]*? : 0;\n/, '');
js = js.replace(/\s*if \(\$\('combat-action-progress-text'\)\)[\s\S]*?combat-action-progress-bar'\)\.style\.width = `\$\{actionPct\}%`;\n/, '\n');

if (!js.includes("document.addEventListener('click', async (e) =>")) {
  js = js.replace(
    "    document.querySelectorAll('.nav-btn').forEach(btn => {\n        btn.addEventListener('click', () => setTab(btn.dataset.tab));\n    });",
    "    document.querySelectorAll('.nav-btn').forEach(btn => {\n        btn.addEventListener('click', () => setTab(btn.dataset.tab));\n    });\n\n    document.addEventListener('click', async (e) => {\n        const btn = e.target.closest('[data-cultivation-focus]');\n        if (!btn) return;\n        await toggleCultivationFocus(btn.dataset.cultivationFocus);\n    });"
  );
}

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

    if ($('cultivation-focus-note')) {
        $('cultivation-focus-note').textContent =
            limit === 1 ? 'Chưa đủ cảnh giới, chỉ được chọn 1 loại.' :
            limit === 2 ? 'Tam tu đạt Bán Tiên, được chọn 2 loại cùng lúc.' :
            'Tam tu đạt Nhập Thánh, được chọn 3 loại cùng lúc.';
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

write('frontend/script.js', js);
console.log('[OK] frontend/script.js');

// frontend/index.html
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
                            <p id="cultivation-focus-note" class="muted">Chưa đủ cảnh giới, chỉ được chọn 1 loại.</p>
                        </div>`
  );
}

html = html.replace(/\s*<div class="progress-wrap">\s*<div class="progress-label"><span>Tiến trình lượt đánh<\/span><span id="combat-action-progress-text">0%<\/span><\/div>\s*<div class="progress-bar"><div id="combat-action-progress-bar"><\/div><\/div>\s*<\/div>/, '');

write('frontend/index.html', html);
console.log('[OK] frontend/index.html');

// frontend/style.css
if (fs.existsSync(p('frontend/style.css'))) {
  backup('frontend/style.css');
  let css = read('frontend/style.css');
  if (!css.includes('.map-world-group > summary')) {
    css += `

.map-world-group > summary {
    cursor: pointer;
    user-select: none;
    list-style: none;
}

.map-world-group > summary::-webkit-details-marker {
    display: none;
}

.map-world-group > summary::before {
    content: '▾';
    display: inline-block;
    width: 18px;
    color: #f3d681;
}

.map-world-group:not([open]) > summary::before {
    content: '▸';
}

.small-btn.active {
    border-color: #f3d681;
    color: #f3d681;
    background: rgba(243, 214, 129, 0.12);
}
`;
  }
  write('frontend/style.css', css);
  console.log('[OK] frontend/style.css');
}

// core/herbGardenService.js
backup('core/herbGardenService.js');
let herb = read('core/herbGardenService.js');

if (!herb.includes("currencyService")) {
  herb = herb.replace(
    "const caveService = require('./caveService');",
    "const caveService = require('./caveService'); const currencyService = require('./currencyService');"
  );
}

if (!herb.includes('function getPlantCost(')) {
  herb = herb.replace(
    "function getEffectiveGrowSeconds(player, herb) {",
    `
function getPlantCost(herb) {
  const worldCost = {
    nhan_gioi: 10,
    tien_gioi: 100,
    nguyen_gioi: 1000,
    dao_gioi: 10000,
    chung_cuc_gioi: 100000,
  };

  if (herb.plantCost) return herb.plantCost;

  const base = worldCost[herb.world] || 10;
  const growMul = Math.max(1, Math.ceil(Number(herb.growSeconds || 60) / 60));
  return { so_linh_thach: base * growMul };
}

function getEffectiveGrowSeconds(player, herb) {`
  );
}

if (!herb.includes("Không đủ linh thạch để trồng")) {
  herb = herb.replace(
    `if (player.cave.herbPlots[plotIndex]) { return { success: false, reason: 'Ô này đã có linh dược.' }; } player.cave.herbPlots[plotIndex] = { herbId, plantedAt: currentTime, }; return { success: true, plotIndex, herbId, herbName: herb.name, growSeconds: getEffectiveGrowSeconds(player, herb), };`,
    `if (player.cave.herbPlots[plotIndex]) { return { success: false, reason: 'Ô này đã có linh dược.' }; }

 const cost = getPlantCost(herb);
 for (const [currencyId, amount] of Object.entries(cost)) {
   if ((player.currencies?.[currencyId] || 0) < amount) {
     return { success: false, reason: 'Không đủ linh thạch để trồng.', cost };
   }
 }
 for (const [currencyId, amount] of Object.entries(cost)) {
   currencyService.spendCurrency(player, currencyId, amount);
 }

 player.cave.herbPlots[plotIndex] = { herbId, plantedAt: currentTime, cost }; return { success: true, plotIndex, herbId, herbName: herb.name, growSeconds: getEffectiveGrowSeconds(player, herb), cost };`
  );
}

if (!herb.includes('getPlantCost,')) {
  herb = herb.replace('module.exports = {', 'module.exports = { getPlantCost,');
}

write('core/herbGardenService.js', herb);
console.log('[OK] core/herbGardenService.js');

// server.js
backup('server.js');
let server = read('server.js');

const helpers = `
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

    if (mainRank >= 17 && bodyRank >= 17 && soulRank >= 17) return 3;
    if (mainRank >= 9 && bodyRank >= 9 && soulRank >= 9) return 2;
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
    progress.exp = Number(progress.exp || 0) + amount;

    let guard = 0;
    while (progress.exp >= progress.maxExp && guard < 20) {
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
    const selected = normalizeCultivationFocus(player);
    return {
        selected,
        limit: getCultivationFocusLimit(player),
        options: ['main', 'body', 'soul'],
    };
}
`;

server = insertBefore(server, 'function getTuViGainPerSecond(player)', helpers, 'cultivation focus helpers');

if (!server.includes('player.cultivationFocus')) {
  server = server.replace(
    "if (player.autoFight === undefined) player.autoFight = true;",
    "if (player.autoFight === undefined) player.autoFight = true;\n    if (!Array.isArray(player.cultivationFocus)) player.cultivationFocus = ['main'];\n    normalizeCultivationFocus(player);"
  );
}

server = server.replace(
`    const tuViGain = getTuViGainPerSecond(player) * ticks;
    player.cultivation.tuVi += tuViGain;
    player.stats.totalTuVi += tuViGain;
    player.stats.playTime += ticks;`,
`    const tuViGain = getTuViGainPerSecond(player) * ticks;
    const focus = normalizeCultivationFocus(player);

    if (focus.includes('main')) {
        player.cultivation.tuVi += tuViGain;
        player.stats.totalTuVi += tuViGain;
    }
    if (focus.includes('body')) addSubCultivationExp(player, 'body', tuViGain);
    if (focus.includes('soul')) addSubCultivationExp(player, 'soul', tuViGain);

    player.stats.playTime += ticks;`
);

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
        if (selected.length >= limit) {
            selected.shift();
        }
        selected.push(type);
    }

    player.cultivationFocus = selected.slice(0, limit);
    sendPlayer(res, players, player, { message: 'Đã đổi trạng thái tu luyện.' });
});

`, 'cultivation focus endpoint');
}

write('server.js', server);
console.log('[OK] server.js');

console.log('\nXong. Chạy node server.js và Ctrl+F5.');
