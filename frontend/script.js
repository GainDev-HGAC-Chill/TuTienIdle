const API_BASE = '/api';

let currentUser = null;
let playerData = null;
let metaData = null;
let allSkills = [];
let allRecipes = [];
let allHerbs = [];
let refreshTimer = null;
let mapWorldOpenState = {};

const $ = (id) => document.getElementById(id);
const fmt = (n) => Number(n || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
const pct = (value, max) => max && isFinite(max) ? Math.max(0, Math.min(100, value / max * 100)) : 0;
const nowText = () => new Date().toLocaleTimeString('vi-VN');

const pageInfo = {
    overview: ['Tổng Quan', 'Theo dõi cảnh giới, chiến lực và tài nguyên.'],
    cultivation: ['Tu Luyện', 'Cảnh giới chính, tu vi và buff đang hoạt động.'],
    combat: ['Combat', 'Chọn map, đánh quái, nhận tu vi, linh thạch và vật phẩm.'],
    skills: ['Công Pháp', 'Học công pháp, trang bị vũ kỹ và thần thông theo linh căn.'],
    alchemy: ['Đan Dược', 'Luyện đan, xem công thức, dùng đan dược trong túi.'],
    cave: ['Động Phủ', 'Tụ linh trận, luyện đan phòng và dược viên.'],
    inventory: ['Túi Đồ', 'Xem vật phẩm, linh dược và đan dược đang có.'],
};

const elementNames = {
    kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ',
    quang: 'Quang', am: 'Ám', loi: 'Lôi', phong: 'Phong', bang: 'Băng', doc: 'Độc',
    long: 'Long', phat: 'Phật', ma: 'Ma', thoi_gian: 'Thời Gian', khong_gian: 'Không Gian',
    tu_vong: 'Tử Vong', sinh_menh: 'Sinh Mệnh', body: 'Luyện Thể', soul: 'Luyện Hồn', neutral: 'Trung lập'
};

const skillTypeNames = {
    cultivation: 'Luyện công', martial: 'Vũ kỹ', divine: 'Thần thông'
};

const categoryNames = {
    cultivation: 'Tu luyện', breakthrough: 'Đột phá', offensive: 'Sát thương', defensive: 'Phòng thủ', attribute: 'Thuộc tính'
};

window.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    initStaticSelects();
});

function bindEvents() {
    $('login-btn').addEventListener('click', () => login($('username-input').value.trim() || 'demo'));
    $('username-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('login-btn').click(); });
    $('logout-btn').addEventListener('click', logout);
    $('refresh-btn').addEventListener('click', () => fetchPlayer(true));
    $('toggle-fight').addEventListener('click', toggleFight);
    $('reload-skills').addEventListener('click', loadSkills);
    $('reload-recipes').addEventListener('click', loadRecipes);
    $('reload-herbs').addEventListener('click', loadHerbs);
    $('recipe-filter').addEventListener('change', renderRecipes);
    $('skill-filter').addEventListener('change', renderSkills);

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => setTab(btn.dataset.tab));
    });

    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-cultivation-focus]');
        if (!btn) return;
        await toggleCultivationFocus(btn.dataset.cultivationFocus);
    });
}

function initStaticSelects() {
    const skillFilter = $('skill-filter');
    skillFilter.innerHTML = `<option value="all">Tất cả hệ</option>` + Object.entries(elementNames)
        .filter(([id]) => !['body', 'soul', 'neutral'].includes(id))
        .map(([id, name]) => `<option value="${id}">${name}</option>`).join('');

    const recipeFilter = $('recipe-filter');
    recipeFilter.innerHTML = `
        <option value="all">Tất cả công thức</option>
        <option value="cultivation">Đan tu luyện</option>
        <option value="breakthrough">Đan đột phá</option>
        <option value="offensive">Đan sát thương</option>
        <option value="defensive">Đan phòng thủ</option>
        <option value="attribute">Đan thuộc tính</option>
    `;
}

async function api(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    const data = await res.json().catch(() => ({ success: false, error: 'Invalid JSON response' }));
    if (!res.ok || data.success === false) {
        throw new Error(data.error || data.reason || data.message || 'Request failed');
    }
    return data;
}

async function login(username) {
    try {
        currentUser = username;
        $('server-status').textContent = 'Đang tải dữ liệu...';
        await loadMeta();
        const data = await api(`/player/${encodeURIComponent(username)}`);
        playerData = data.player;
        $('login-screen').style.display = 'none';
        $('game-screen').style.display = 'grid';
        $('player-name').textContent = username;
        await Promise.allSettled([loadSkills(), loadRecipes(), loadHerbs()]);
        renderAll();
        addLog('Đăng nhập thành công.', 'ok');
        clearInterval(refreshTimer);
        refreshTimer = setInterval(() => fetchPlayer(false), 3000);
    } catch (err) {
        alert(`Không thể đăng nhập: ${err.message}`);
        $('server-status').textContent = 'Mất kết nối';
    }
}

function logout() {
    clearInterval(refreshTimer);
    currentUser = null;
    playerData = null;
    $('game-screen').style.display = 'none';
    $('login-screen').style.display = 'flex';
}

async function loadMeta() {
    const data = await api('/meta');
    metaData = data;
    $('server-status').textContent = `${data.counts.skills} skill · ${data.counts.pills} đan · ${data.counts.herbs} linh dược`;
}

async function fetchPlayer(showLog = false) {
    if (!currentUser) return;
    try {
        const data = await api(`/player/${encodeURIComponent(currentUser)}`);
        playerData = data.player;
        renderAll();
        if (showLog) addLog('Đã làm mới dữ liệu.', 'info');
    } catch (err) {
        addLog(`Lỗi tải player: ${err.message}`, 'err');
    }
}

function setTab(tab) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
    document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active'));
    $(`tab-${tab}`).classList.add('active');
    $('page-title').textContent = pageInfo[tab]?.[0] || 'Tu Tiên Idle';
    $('page-subtitle').textContent = pageInfo[tab]?.[1] || '';
}

function renderAll() {
    if (!playerData) return;
    renderOverview();
    renderCultivation();
    renderCombat();
    renderSkills();
    renderAlchemy();
    renderCave();
    renderInventory();
}

function renderOverview() {
    const cult = playerData.cultivation || {};
    const info = cult.info || {};
    const realmName = cult.realmName || info.displayName || 'Không rõ';
    const percent = pct(cult.exp || cult.tuVi, cult.maxExp || cult.maxTuVi);

    $('realm-title').textContent = realmName;
    $('realm-big').textContent = realmName;
    $('world-badge').textContent = info.worldName || cult.world || '-';
    $('tuvi-text').textContent = `${fmt(cult.exp || cult.tuVi)} / ${fmt(cult.maxExp || cult.maxTuVi)}`;
    $('tuvi-bar').style.width = `${percent}%`;
    $('hp-text').textContent = `${fmt(playerData.combat?.hp)} / ${fmt(playerData.combat?.maxHp)}`;
    $('atk-text').textContent = fmt(playerData.combat?.atk);
    $('def-text').textContent = fmt(playerData.combat?.def);

    $('spirit-root-card').innerHTML = playerData.spiritRootDisplay
        ? `<div class="data-card"><h4>${playerData.spiritRootDisplay}</h4><p>Linh căn dùng để học công pháp/vũ kỹ/thần thông cùng hệ.</p></div>`
        : 'Chưa ngộ linh căn';
    $('spirit-root-list').innerHTML = (playerData.spiritRoots || []).map(id => `<span class="chip">${elementNames[id] || id}</span>`).join('') || '<span class="chip">Chưa có</span>';

    const body = playerData.bodyCultivation || {};
    const soul = playerData.soulCultivation || {};
    $('body-info').textContent = body.info?.displayName
        ? `${body.info.displayName} · ${fmt(body.exp || 0)} / ${fmt(body.maxExp || 0)}`
        : '-';
    $('soul-info').textContent = soul.info?.displayName
        ? `${soul.info.displayName} · ${fmt(soul.exp || 0)} / ${fmt(soul.maxExp || 0)}`
        : '-';

    $('currency-list').innerHTML = Object.entries(playerData.currencies || {})
        .filter(([, value]) => value > 0)
        .map(([id, value]) => `<span class="chip">${id}: <b>${fmt(value)}</b></span>`).join('') || '<span class="chip">Chưa có tiền tệ</span>';
}

function renderCultivation() {
    const cult = playerData.cultivation || {};
    const info = cult.info || {};
    const percent = pct(cult.exp || cult.tuVi, cult.maxExp || cult.maxTuVi);
    $('cultivation-name').textContent = cult.realmName || info.displayName || 'Không rõ';
    $('cultivation-progress').textContent = `${percent.toFixed(1)}%`;
    $('cultivation-bar').style.width = `${percent}%`;
    $('cult-world').textContent = info.worldName || cult.world || '-';
    $('cult-type').textContent = `${cult.realmName || info.displayName || ''} ${cult.stage || cult.level || ''}/9`;
    $('tuvi-rate').textContent = estimateTuViRate();
    renderCultivationModes();

    $('toggle-fight').textContent = playerData.autoFight ? 'Tạm dừng tự đánh' : 'Tiếp tục tự đánh';

    const buffs = playerData.activePillBuffs || [];
    $('active-buffs').innerHTML = buffs.length ? buffs.map(buff => {
        const left = Math.max(0, Math.floor(((buff.expiresAt || 0) - Date.now()) / 1000));
        return `<div class="data-card"><h4>${buff.name || buff.pillId}</h4><p>Còn ${left}s</p><div class="meta"><span class="chip">${categoryNames[buff.category] || buff.category || 'buff'}</span></div></div>`;
    }).join('') : '<div class="empty-state">Không có buff đan đang hoạt động.</div>';
}


function renderCultivationModes() {
    const state = playerData.cultivationFocusState || {};
    const selected = state.selected || ['main'];
    const limit = state.limit || 1;
    const names = { main: 'Tu Luyện', body: 'Luyện Thể', soul: 'Luyện Hồn' };

    const box = $('cultivation-focus-list');
    if (box) {
        box.innerHTML = ['main', 'body', 'soul'].map(id => `
            <button class="small-btn ${selected.includes(id) ? 'active' : ''}" data-cultivation-focus="${id}">
                ${names[id]}
            </button>
        `).join('');
    }

    if ($('cultivation-focus-limit')) {
        $('cultivation-focus-limit').textContent = `Đang tu ${selected.length}/${limit} loại`;
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
        const data = await api(`/player/${currentUser}/cultivation/focus`, {
            method: 'POST',
            body: JSON.stringify({ type })
        });
        playerData = data.player;
        renderAll();
        addLog(data.message || 'Đã đổi trạng thái tu luyện.', 'ok');
    } catch (err) {
        addLog(`Không đổi được trạng thái tu luyện: ${err.message}`, 'err');
    }
}

function estimateTuViRate() {
    const effects = playerData.pillEffects || {};
    const caveAura = Math.floor((playerData.cave?.resources?.aura || 0) / 1000);
    const base = 1 + caveAura;
    const bonus = (playerData.permanentBonuses?.tuViBonus || 0) + (effects.cultivationSpeedPercent || 0) + (effects.tuViBonusPercent || 0);
    return `${(base * (1 + bonus / 100)).toFixed(2)}/s`;
}





function syncMapWorldOpenState() {
    document.querySelectorAll('.map-world-group[data-world-id]').forEach(el => {
        mapWorldOpenState[el.dataset.worldId] = el.open;
    });
}

function getCurrentMapWorldId() {
    const map = playerData?.currentMap || {};
    return map.required?.world || map.world || playerData?.cultivation?.world || 'nhan_gioi';
}

function ensureMapButtonsContainer() {
    return document.getElementById('combat-map-buttons') ||
        document.getElementById('map-buttons') ||
        document.getElementById('zone-buttons') ||
        document.getElementById('zone-list');
}
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

        return `
            <details class="map-world-group" data-world-id="${world.id}" ${isOpen ? 'open' : ''}>
                <summary class="map-world-title">${world.name}</summary>
                ${world.realms.map(realm => `
                    <div class="map-realm-group">
                        <div class="map-realm-title">${realm.name}</div>
                        <div class="map-button-row">
                            ${realm.maps.map(map => `
                                <button class="small-btn map-btn ${map.id === playerData.currentZone ? 'active' : ''}" data-map-id="${map.id}">
                                    ${map.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </details>
        `;
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




function renderCombat() {
    if (!playerData) return;
    renderMapButtons();

    const state = playerData.combatState || {};
    const currentMap = playerData.currentMap || {};
    const monster = state.currentMonster || {};
    const combat = playerData.combat || {};

    if ($('combat-map-name')) $('combat-map-name').textContent = currentMap.name || playerData.zoneName || 'Unknown';
    if ($('combat-monster-name')) $('combat-monster-name').textContent = monster.name || 'Không rõ';
    if ($('combat-monster-desc')) $('combat-monster-desc').textContent = monster.description || 'Quái có thể đánh trả. Hết HP sẽ dừng tự đánh.';

    const playerHp = Number(combat.hp || 0);
    const playerMaxHp = Number(combat.maxHp || 0);
    const monsterHp = Number(state.monsterHp || 0);
    const monsterMaxHp = Number(state.monsterMaxHp || 0);
    
    if ($('combat-player-hp-text')) $('combat-player-hp-text').textContent = `${fmt(playerHp)} / ${fmt(playerMaxHp)}`;
    if ($('combat-player-hp-bar')) $('combat-player-hp-bar').style.width = `${pct(playerHp, playerMaxHp)}%`;
    if ($('combat-monster-hp-text')) $('combat-monster-hp-text').textContent = `${fmt(monsterHp)} / ${fmt(monsterMaxHp)}`;
    if ($('combat-monster-hp-bar')) $('combat-monster-hp-bar').style.width = `${pct(monsterHp, monsterMaxHp)}%`;

    if ($('combat-status')) $('combat-status').textContent = state.status || '-';
    if ($('combat-kills')) $('combat-kills').textContent = fmt(playerData.stats?.totalKills || 0);
    if ($('combat-auto')) $('combat-auto').textContent = playerData.autoFight ? 'Đang bật' : 'Đang tắt';

    const logs = state.logs || [];
    if ($('combat-log')) {
        $('combat-log').innerHTML = logs.length
            ? logs.slice(-8).map(line => `<div class="log-entry info">${line}</div>`).join('')
            : '<div class="empty-state">Chưa có combat log.</div>';
    }
}

async function toggleFight() {
    try {
        const data = await api(`/player/${currentUser}`, { method: 'POST', body: JSON.stringify({ autoFight: !playerData.autoFight }) });
        playerData = data.player;
        renderAll();
        addLog(playerData.autoFight ? 'Đã bật tự đánh.' : 'Đã tắt tự đánh.', 'ok');
    } catch (err) { addLog(err.message, 'err'); }
}

async function changeZone(zone) {
    try {
        const data = await api(`/player/${currentUser}/zone`, { method: 'POST', body: JSON.stringify({ mapId: zone }) });
        playerData = data.player;
        renderAll();
        addLog(data.message || 'Đã đổi khu vực.', 'ok');
    } catch (err) { addLog(err.message, 'err'); }
}

async function loadSkills() {
    const data = await api('/skills');
    allSkills = data.skills || [];
    renderSkills();
}

function renderSkills() {
    if (!playerData) return;
    const learned = playerData.skills?.learned || {};
    const equippedMartial = playerData.skills?.equippedMartial || [];
    const equippedDivine = playerData.skills?.equippedDivine || [];

    $('equipped-martial').innerHTML = equippedMartial.map(id => slotHtml(id)).join('') || '<span class="chip">Trống</span>';
    $('equipped-divine').innerHTML = equippedDivine.map(id => slotHtml(id)).join('') || '<span class="chip">Trống</span>';
    $('learned-skills').innerHTML = Object.keys(learned).length ? Object.keys(learned).map(id => {
        const skill = allSkills.find(s => s.id === id) || { name: id };
        return `<div class="data-card"><h4>${skill.name}</h4><p>${skillTypeNames[skill.type] || skill.type || ''} · ${elementNames[skill.element] || skill.element || ''}</p></div>`;
    }).join('') : '<div class="empty-state">Chưa học skill nào.</div>';

    const filter = $('skill-filter')?.value || 'all';
    const skills = filter === 'all' ? allSkills : allSkills.filter(s => s.element === filter);
    $('skill-list').innerHTML = skills.map(skill => {
        const isLearned = !!learned[skill.id];
        const isEquipped = equippedMartial.includes(skill.id) || equippedDivine.includes(skill.id);
        return `<div class="data-card">
            <h4>${skill.name}</h4>
            <div class="meta">
                <span class="chip">${elementNames[skill.element] || skill.element}</span>
                <span class="chip">${skillTypeNames[skill.type] || skill.type}</span>
                <span class="chip">${skill.castType || ''}</span>
            </div>
            <p>${skill.description || skill.desc || ''}</p>
            <div class="actions">
                <button class="small-btn" onclick="learnSkill('${skill.id}')" ${isLearned ? 'disabled' : ''}>${isLearned ? 'Đã học' : 'Học'}</button>
                ${skill.type !== 'cultivation' ? `<button class="small-btn" onclick="equipSkill('${skill.id}')" ${!isLearned || isEquipped ? 'disabled' : ''}>${isEquipped ? 'Đã trang bị' : 'Trang bị'}</button>` : ''}
                ${isEquipped ? `<button class="small-btn" onclick="unequipSkill('${skill.id}')">Gỡ</button>` : ''}
            </div>
        </div>`;
    }).join('') || '<div class="empty-state">Không có skill.</div>';
}

function slotHtml(id) {
    const skill = allSkills.find(s => s.id === id);
    return `<span class="slot">${skill?.name || id}</span>`;
}

async function learnSkill(skillId) {
    try {
        const data = await api(`/player/${currentUser}/skill/learn`, { method: 'POST', body: JSON.stringify({ skillId }) });
        playerData = data.player;
        renderAll();
        addLog('Đã học skill.', 'ok');
    } catch (err) { addLog(`Không học được: ${err.message}`, 'err'); }
}

async function equipSkill(skillId) {
    try {
        const data = await api(`/player/${currentUser}/skill/equip`, { method: 'POST', body: JSON.stringify({ skillId }) });
        playerData = data.player;
        renderAll();
        addLog('Đã trang bị skill.', 'ok');
    } catch (err) { addLog(`Không trang bị được: ${err.message}`, 'err'); }
}

async function unequipSkill(skillId) {
    try {
        const data = await api(`/player/${currentUser}/skill/unequip`, { method: 'POST', body: JSON.stringify({ skillId }) });
        playerData = data.player;
        renderAll();
        addLog('Đã gỡ skill.', 'ok');
    } catch (err) { addLog(err.message, 'err'); }
}

async function loadRecipes() {
    const data = await api('/recipes');
    allRecipes = data.recipes || [];
    renderRecipes();
}

async function loadHerbs() {
    const data = await api('/herbs');
    allHerbs = data.herbs || [];
    $('herb-select').innerHTML = allHerbs.slice(0, 80).map(h => `<option value="${h.id}">${h.name}</option>`).join('');
    renderCave();
}

function renderAlchemy() {
    $('alchemy-bonus').textContent = `+${playerData.cave?.alchemyBonus || 0}%`;
    renderRecipes();
    renderPillInventory();
}

function renderRecipes() {
    if (!$('recipe-list')) return;
    const filter = $('recipe-filter')?.value || 'all';
    const recipes = filter === 'all' ? allRecipes : allRecipes.filter(r => r.category === filter);
    $('recipe-list').innerHTML = recipes.slice(0, 80).map(recipe => {
        const mats = (recipe.materials || []).map(m => `${m.id} x${m.amount}`).join(', ');
        return `<div class="data-card">
            <h4>${recipe.name || recipe.id}</h4>
            <div class="meta"><span class="chip">${categoryNames[recipe.category] || recipe.category}</span><span class="chip">${recipe.world || ''}</span></div>
            <p>Nguyên liệu: ${mats || 'Không rõ'}</p>
            <div class="actions"><button class="small-btn" onclick="craftRecipe('${recipe.id}')">Luyện đan</button></div>
        </div>`;
    }).join('') || '<div class="empty-state">Không có công thức.</div>';
}

function renderPillInventory() {
    const pills = (playerData.inventory || []).filter(i => i.basePillId || i.category || i.id.includes('_dan') || i.id.includes('_tan'));
    $('pill-inventory').innerHTML = pills.length ? pills.map(item => itemCard(item, true)).join('') : '<div class="empty-state">Chưa có đan dược.</div>';
}

async function craftRecipe(recipeId) {
    try {
        const data = await api(`/player/${currentUser}/alchemy/craft`, { method: 'POST', body: JSON.stringify({ recipeId }) });
        playerData = data.player;
        renderAll();
        addLog(`Luyện đan thành công: ${data.result?.item?.name || 'thành phẩm'}.`, 'ok');
    } catch (err) { addLog(`Luyện đan thất bại: ${err.message}`, 'err'); }
}

async function usePill(itemId) {
    try {
        const data = await api(`/player/${currentUser}/pill/use`, { method: 'POST', body: JSON.stringify({ itemId }) });
        playerData = data.player;
        renderAll();
        addLog(data.result?.message || data.message || 'Đã dùng đan.', 'ok');
    } catch (err) { addLog(`Không dùng được: ${err.message}`, 'err'); }
}

function renderCave() {
    if (!playerData) return;
    const cave = playerData.cave || {};
    $('cave-level').textContent = `Cấp ${cave.level || 1}`;
    $('cave-aura').textContent = `${fmt(cave.resources?.aura || 0)} / ${fmt(cave.maxAura || 0)}`;
    $('cave-aura-rate').textContent = `${fmt(cave.auraPerSecond || 0)}/s`;
    $('cave-alchemy-bonus').textContent = `+${fmt(cave.alchemyBonus || 0)}%`;

    const buildings = cave.buildings || {};
    $('cave-buildings').innerHTML = Object.entries(buildings).map(([id, b]) => `
        <div class="data-card">
            <h4>${buildingName(id)}</h4>
            <p>Cấp ${b.level || 1}</p>
            <div class="actions"><button class="small-btn" onclick="upgradeBuilding('${id}')">Nâng cấp</button></div>
        </div>
    `).join('') || '<div class="empty-state">Chưa có công trình.</div>';

    renderHerbPlots();
}

function buildingName(id) {
    return ({ gathering_array: 'Tụ Linh Trận', herb_garden: 'Dược Viên', alchemy_room: 'Luyện Đan Phòng' })[id] || id;
}

async function upgradeBuilding(buildingId) {
    try {
        const data = await api(`/player/${currentUser}/cave/upgrade`, { method: 'POST', body: JSON.stringify({ buildingId }) });
        playerData = data.player;
        renderAll();
        addLog('Đã nâng cấp công trình.', 'ok');
    } catch (err) { addLog(`Không nâng được: ${err.message}`, 'err'); }
}

function renderHerbPlots() {
    const plots = playerData.herbPlots || [];
    $('herb-plots').innerHTML = plots.map((plot, index) => {
        if (!plot.herbId) {
            return `<div class="plot-card"><h4>Ô ${index + 1}</h4><p>Đất trống</p><button class="small-btn" onclick="plantHerb(${index})">Trồng</button></div>`;
        }
        const left = Math.max(0, Math.floor(((plot.finishAt || 0) - Date.now()) / 1000));
        const ready = left <= 0;
        return `<div class="plot-card ${ready ? 'ready' : ''}">
            <h4>Ô ${index + 1}</h4>
            <p>${plot.herbName || plot.herbId}</p>
            <p>${ready ? 'Đã chín' : `Còn ${left}s`}</p>
            <button class="small-btn" onclick="harvestHerb(${index})" ${ready ? '' : 'disabled'}>Thu hoạch</button>
        </div>`;
    }).join('') || '<div class="empty-state">Chưa có ô dược viên.</div>';
}

async function plantHerb(plotIndex) {
    const herbId = $('herb-select').value;
    try {
        const data = await api(`/player/${currentUser}/herb/plant`, { method: 'POST', body: JSON.stringify({ plotIndex, herbId }) });
        playerData = data.player;
        renderAll();
        addLog('Đã trồng linh dược.', 'ok');
    } catch (err) { addLog(`Không trồng được: ${err.message}`, 'err'); }
}

async function harvestHerb(plotIndex) {
    try {
        const data = await api(`/player/${currentUser}/herb/harvest`, { method: 'POST', body: JSON.stringify({ plotIndex }) });
        playerData = data.player;
        renderAll();
        addLog('Đã thu hoạch linh dược.', 'ok');
    } catch (err) { addLog(`Không thu hoạch được: ${err.message}`, 'err'); }
}

function renderInventory() {
    const inv = playerData.inventory || [];
    $('inventory-count').textContent = `${inv.length} loại`;
    $('inventory-container').innerHTML = inv.length ? inv.map(item => itemCard(item, !!(item.basePillId || item.category))).join('') : '<div class="empty-state">Túi đồ trống.</div>';
}

function itemCard(item, allowUse) {
    return `<div class="data-card">
        <h4>${item.name || item.id}</h4>
        <div class="meta">
            <span class="chip">x${fmt(item.amount)}</span>
            ${item.quality ? `<span class="chip">${item.quality}</span>` : ''}
            ${item.category ? `<span class="chip">${categoryNames[item.category] || item.category}</span>` : ''}
        </div>
        <p>${item.id}</p>
        ${allowUse ? `<div class="actions"><button class="small-btn" onclick="usePill('${item.id}')">Dùng</button></div>` : ''}
    </div>`;
}

function addLog(message, type = 'info') {
    const box = $('log-container');
    if (!box) return;
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.textContent = `[${nowText()}] ${message}`;
    box.appendChild(div);
    while (box.children.length > 80) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
}


function getWorldDisplayName(worldId) {
    return ({
        nhan_gioi: 'Nhân Giới',
        tien_gioi: 'Tiên Giới',
        nguyen_gioi: 'Nguyên Giới',
        dao_gioi: 'Đạo Giới',
        chung_cuc_gioi: 'Chung Cực Giới'
    })[worldId] || worldId || 'Không rõ';
}

function getRealmDisplayName(map) {
    return map.realmName || map.required?.realmName || map.realm || `Cảnh giới ${Number(map.required?.realmIndex ?? map.realmIndex ?? 0) + 1}`;
}

function groupMapsByWorldRealm(maps) {
    const groups = {};
    (maps || []).forEach(map => {
        const worldId = map.required?.world || map.world || 'nhan_gioi';
        const realmIndex = Number(map.required?.realmIndex ?? map.realmIndex ?? 0);
        const realmName = getRealmDisplayName(map);
        const worldName = map.worldName || getWorldDisplayName(worldId);
        const key = `${worldId}_${realmIndex}`;

        if (!groups[worldId]) groups[worldId] = { id: worldId, name: worldName, realms: {} };
        if (!groups[worldId].realms[key]) {
            groups[worldId].realms[key] = { key, realmIndex, name: realmName, maps: [] };
        }
        groups[worldId].realms[key].maps.push(map);
    });

    return Object.values(groups).map(world => ({
        ...world,
        realms: Object.values(world.realms).sort((a, b) => a.realmIndex - b.realmIndex)
    }));
}
