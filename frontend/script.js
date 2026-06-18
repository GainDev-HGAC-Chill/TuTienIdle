const API_BASE = '/api';

let currentUser = null;
let playerData = null;
let metaData = null;
let allSkills = [];
let allRecipes = [];
let allHerbs = [];
let refreshTimer = null;

const $ = (id) => document.getElementById(id);
const fmt = (n) => Number(n || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
const pct = (value, max) => max && isFinite(max) ? Math.max(0, Math.min(100, value / max * 100)) : 0;
const nowText = () => new Date().toLocaleTimeString('vi-VN');

const pageInfo = {
    overview: ['Tổng Quan', 'Theo dõi cảnh giới, chiến lực và tài nguyên.'],
    cultivation: ['Tu Luyện', 'Cảnh giới chính, khu vực đánh quái và buff đang hoạt động.'],
    skills: ['Công Pháp', 'Học công pháp, trang bị vũ kỹ và thần thông theo linh căn.'],
    alchemy: ['Đan Dược', 'Luyện đan, xem công thức, dùng đan dược trong túi.'],
    cave: ['Động Phủ', 'Tụ linh trận, luyện đan phòng và dược viên.'],
    inventory: ['Túi Đồ', 'Xem vật phẩm, linh dược và đan dược đang có.'],
    dev: ['Test Dev', 'Cấp dữ liệu nhanh để kiểm thử tính năng.'],
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
    $('dev-grant').addEventListener('click', devGrant);
    $('dev-set-cultivation').addEventListener('click', devSetCultivation);

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => setTab(btn.dataset.tab));
    });
    document.querySelectorAll('[data-zone]').forEach(btn => {
        btn.addEventListener('click', () => changeZone(btn.dataset.zone));
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

    $('body-info').textContent = playerData.bodyCultivation?.info?.displayName || '-';
    $('soul-info').textContent = playerData.soulCultivation?.info?.displayName || '-';

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
    $('cult-type').textContent = info.progressType || '-';
    $('tuvi-rate').textContent = estimateTuViRate();

    $('zone-name').textContent = playerData.zoneName || '-';
    const zone = metaData?.zones?.[playerData.currentZone];
    $('zone-monster').textContent = zone?.monster || 'Không rõ';
    $('toggle-fight').textContent = playerData.autoFight ? 'Tạm dừng tự đánh' : 'Tiếp tục tự đánh';

    const buffs = playerData.activePillBuffs || [];
    $('active-buffs').innerHTML = buffs.length ? buffs.map(buff => {
        const left = Math.max(0, Math.floor(((buff.expiresAt || 0) - Date.now()) / 1000));
        return `<div class="data-card"><h4>${buff.name || buff.pillId}</h4><p>Còn ${left}s</p><div class="meta"><span class="chip">${categoryNames[buff.category] || buff.category || 'buff'}</span></div></div>`;
    }).join('') : '<div class="empty-state">Không có buff đan đang hoạt động.</div>';
}

function estimateTuViRate() {
    const effects = playerData.pillEffects || {};
    const caveAura = Math.floor((playerData.cave?.resources?.aura || 0) / 1000);
    const base = 1 + caveAura;
    const bonus = (playerData.permanentBonuses?.tuViBonus || 0) + (effects.cultivationSpeedPercent || 0) + (effects.tuViBonusPercent || 0);
    return `${(base * (1 + bonus / 100)).toFixed(2)}/s`;
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
        const data = await api(`/player/${currentUser}/zone`, { method: 'POST', body: JSON.stringify({ zone }) });
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

async function devGrant() {
    try {
        const element = $('dev-element').value;
        const data = await api(`/dev/${currentUser}/grant`, { method: 'POST', body: JSON.stringify({ element, herbAmount: 50, herbCount: 40 }) });
        playerData = data.player;
        await loadSkills();
        renderAll();
        addLog(`Đã cấp dữ liệu test hệ ${elementNames[element] || element}.`, 'ok');
    } catch (err) { addLog(`Dev grant lỗi: ${err.message}`, 'err'); }
}

async function devSetCultivation() {
    try {
        const body = {
            world: $('dev-world').value,
            realmIndex: Number($('dev-realm-index').value || 0),
            stage: Number($('dev-stage').value || 1),
            tuVi: 0,
        };
        const data = await api(`/dev/${currentUser}/set-cultivation`, { method: 'POST', body: JSON.stringify(body) });
        playerData = data.player;
        renderAll();
        addLog('Đã set cảnh giới test.', 'ok');
    } catch (err) { addLog(`Set cảnh giới lỗi: ${err.message}`, 'err'); }
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
