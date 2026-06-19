const API_BASE = '';
const $ = id => document.getElementById(id);
const fmt = value => Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
const pct = (cur, max) => max > 0 && Number.isFinite(Number(max)) ? Math.max(0, Math.min(100, (Number(cur || 0) / Number(max)) * 100)) : 0;

let username = localStorage.getItem('tuTienUsername') || '';
let playerData = null;
let metaData = null;
let refreshTimer = null;
const collapsedMapGroups = new Set();

const pageInfo = {
  overview: ['Tổng Quan', 'Theo dõi cảnh giới, chiến lực và tài nguyên.'],
  cultivation: ['Tu Luyện', 'Điều phối tu luyện, luyện thể và luyện hồn.'],
  combat: ['Combat', 'Tự động đánh quái theo map đã mở.'],
  skills: ['Công Pháp', 'Công pháp và vũ kỹ cơ bản của ba hệ.'],
  alchemy: ['Đan Dược', 'Luyện đan, dùng đan và quản lý thọ nguyên.'],
  cave: ['Động Phủ', 'Linh khí, phòng luyện đan và dược viên.'],
  inventory: ['Túi Đồ', 'Vật phẩm, đan dược và nguyên liệu.'],
};

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function setWidth(id, value) {
  const el = $(id);
  if (el) el.style.width = `${Math.max(0, Math.min(100, Number(value || 0)))}%`;
}

function systemName(id) {
  return { cultivation: 'Tu Luyện', body: 'Luyện Thể', soul: 'Luyện Hồn', main: 'Tu Luyện' }[id] || id || '-';
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || data.reason || 'Lỗi máy chủ');
  return data;
}

function showApp() {
  $('login-screen')?.classList.add('hidden');
  $('app')?.classList.remove('hidden');
}

function showLogin() {
  $('app')?.classList.add('hidden');
  $('login-screen')?.classList.remove('hidden');
}

async function loadMeta() {
  try { metaData = await api('/api/meta'); } catch (err) { console.warn(err.message); }
}

async function loadPlayer() {
  if (!username) return;
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}`);
    playerData = data.player;
    setText('connection-status', 'Đã kết nối');
    renderAll();
  } catch (err) {
    setText('connection-status', err.message);
  }
}

async function postPlayer(body) {
  const data = await api(`/api/player/${encodeURIComponent(username)}`, { method: 'POST', body: JSON.stringify(body) });
  playerData = data.player;
  renderAll();
}

function bindEvents() {
  $('login-btn')?.addEventListener('click', login);
  $('username-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  $('logout-btn')?.addEventListener('click', logout);
  $('refresh-btn')?.addEventListener('click', loadPlayer);
  $('toggle-auto-btn')?.addEventListener('click', toggleAutoFight);
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab)));
}

async function login() {
  username = $('username-input')?.value.trim() || 'dao_huu';
  localStorage.setItem('tuTienUsername', username);
  showApp();
  await loadMeta();
  await loadPlayer();
  startTimer();
}

function logout() {
  localStorage.removeItem('tuTienUsername');
  username = '';
  playerData = null;
  if (refreshTimer) clearInterval(refreshTimer);
  showLogin();
}

function startTimer() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(loadPlayer, 3000);
}

function setTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  document.querySelectorAll('.tab-page').forEach(page => page.classList.toggle('active', page.id === `tab-${tab}`));
  const info = pageInfo[tab] || pageInfo.overview;
  setText('page-title', info[0]);
  setText('page-subtitle', info[1]);
}

function renderAll() {
  if (!playerData) return;
  renderHeader();
  renderEncounter();
  renderOverview();
  renderCultivation();
  renderCombat();
  renderSkills();
  renderAlchemy();
  renderCave();
  renderInventory();
}

function renderHeader() {
  setText('profile-name', playerData.username || '-');
  setText('profile-realm', playerData.cultivation?.realmName || '-');
  setText('toggle-auto-btn', playerData.autoFight ? 'Tạm dừng tự đánh' : 'Bật tự đánh');
}

function renderEncounter() {
  const box = $('encounter-popup');
  const encounter = playerData.encounter?.active || playerData.pendingEncounter || null;
  if (!box) return;
  if (!encounter) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }
  const choices = encounter.choices || [];
  box.classList.remove('hidden');
  box.innerHTML = `
    <div class="encounter-card">
      <h2>${escapeHtml(encounter.name || 'Kỳ Ngộ Thiên Cơ')}</h2>
      <p>${escapeHtml(encounter.description || 'Một cơ duyên bất ngờ xuất hiện.')}</p>
      <div class="button-row">
        ${choices.map(choice => `<button type="button" data-encounter-choice="${escapeHtml(choice.id)}">${escapeHtml(choice.label || choice.name || 'Lựa chọn')}</button>`).join('')}
        <button type="button" class="danger" data-encounter-decline>Không thực hiện</button>
      </div>
      <small>Từ chối kỳ ngộ sẽ bị thiên phạt 5% tổng thuộc tính trong 60 phút.</small>
    </div>`;
  box.querySelectorAll('[data-encounter-choice]').forEach(btn => btn.addEventListener('click', () => chooseEncounter(btn.dataset.encounterChoice)));
  box.querySelector('[data-encounter-decline]')?.addEventListener('click', declineEncounter);
}

async function chooseEncounter(choiceId) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/encounter/choose`, { method: 'POST', body: JSON.stringify({ choiceId }) });
    playerData = data.player;
    renderAll();
  } catch (err) { alert(err.message); }
}

async function declineEncounter() {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/encounter/decline`, { method: 'POST', body: JSON.stringify({}) });
    playerData = data.player;
    renderAll();
  } catch (err) { alert(err.message); }
}

function renderOverview() {
  const c = playerData.cultivation || {};
  const combat = playerData.combat || {};
  const root = playerData.spiritRootDisplay || {};
  setText('world-name', c.info?.worldName || c.info?.world || c.worldName || '-');
  setText('realm-name', c.realmName || '-');
  setText('tuvi-text', `${fmt(c.exp ?? c.tuVi)} / ${fmt(c.maxExp ?? c.maxTuVi)}`);
  setText('hp-text', `${fmt(combat.hp)} / ${fmt(combat.maxHp)}`);
  setText('atk-text', fmt(combat.atk));
  setText('def-text', fmt(combat.def));
  setText('spirit-root-name', root.name || 'Chưa ngộ linh căn');
  setText('spirit-root-desc', root.description || 'Tính năng linh căn sẽ mở ở bước sau.');
  setText('body-rank', playerData.bodyCultivation?.info?.name || playerData.bodyCultivation?.name || '-');
  setText('soul-rank', playerData.soulCultivation?.info?.name || playerData.soulCultivation?.name || '-');

  const currencies = playerData.currencies || {};
  $('currency-list').innerHTML = Object.entries(currencies)
    .filter(([, amount]) => Number(amount) > 0)
    .map(([id, amount]) => smallCard(currencyName(id), fmt(amount), 'Tiền tệ'))
    .join('') || '<p class="empty">Chưa có tài nguyên.</p>';
}

function progressData(type) {
  if (type === 'main') {
    const c = playerData.cultivation || {};
    return { type, title: c.realmName || '-', cur: c.exp ?? c.tuVi ?? 0, max: c.maxExp ?? c.maxTuVi ?? 100, sub: c.info?.worldName || c.worldName || '-' };
  }
  if (type === 'body') {
    const b = playerData.bodyCultivation || {};
    return { type, title: b.info?.name || b.name || 'Luyện Thể', cur: b.exp || 0, max: b.maxExp || 100, sub: 'Khí huyết rèn thân' };
  }
  const s = playerData.soulCultivation || {};
  return { type, title: s.info?.name || s.name || 'Luyện Hồn', cur: s.exp || 0, max: s.maxExp || 100, sub: 'Thần thức dưỡng hồn' };
}

function renderCultivation() {
  const c = playerData.cultivation || {};
  const tuviGain = playerData.pillEffects?.tuViGainPerSecond || playerData.tuViGainPerSecond || 1;
  setText('cultivation-title', `${c.realmName || '-'} · ${fmt(c.exp ?? c.tuVi)} / ${fmt(c.maxExp ?? c.maxTuVi)}`);
  setText('cult-world', c.info?.worldName || c.worldName || '-');
  setText('cult-type', c.info?.name || '-');
  setText('tuvi-rate', `${fmt(tuviGain)}/s`);

  const state = playerData.cultivationFocusState || { selected: ['main'], limit: 1, options: ['main', 'body', 'soul'] };
  const selected = Array.isArray(state.selected) ? state.selected : ['main'];
  const options = Array.isArray(state.options) ? state.options : ['main', 'body', 'soul'];
  setText('focus-limit', `Đang tu ${selected.length}/${state.limit || 1} mạch`);
  setText('focus-note', (state.limit || 1) === 1 ? 'Chỉ được khai mở 1 mạch. Thẻ sáng vàng là mạch đang vận chuyển.' : `Có thể đồng tu ${state.limit} mạch.`);

  $('cultivation-progress-panels').innerHTML = options.map(type => {
    const d = progressData(type);
    const w = pct(d.cur, d.max);
    const active = selected.includes(type);
    return `
      <button type="button" class="progress-panel ${active ? 'active' : ''}" data-focus="${type}">
        <div class="progress-head"><span>${systemName(type)}</span><b>${active ? 'Đang tu' : 'Tạm dừng'}</b></div>
        <h4>${escapeHtml(d.title)}</h4>
        <p>${escapeHtml(d.sub)}</p>
        <div class="bar"><i style="width:${w}%"></i></div>
        <div class="progress-foot"><b>${fmt(d.cur)} / ${fmt(d.max)}</b><span>${Math.round(w)}%</span></div>
      </button>`;
  }).join('');

  $('focus-buttons').innerHTML = options.map(type => {
    const active = selected.includes(type);
    return `<button type="button" class="${active ? 'success' : ''}" data-focus="${type}">${active ? 'Đang tu' : 'Chọn'}: ${systemName(type)}</button>`;
  }).join('');
  document.querySelectorAll('[data-focus]').forEach(btn => btn.addEventListener('click', () => toggleFocus(btn.dataset.focus)));

  const buffs = playerData.activePillBuffs || [];
  $('pill-buffs').innerHTML = buffs.length
    ? buffs.map(buff => smallCard(buff.name || buff.id, buff.remainingMs ? `Còn ${Math.ceil(buff.remainingMs / 1000)} giây` : 'Đang hiệu lực')).join('')
    : '<p class="empty">Chưa có buff đan.</p>';
}

async function toggleFocus(type) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/cultivation/focus`, { method: 'POST', body: JSON.stringify({ type }) });
    playerData = data.player;
    renderAll();
  } catch (err) { alert(err.message); }
}

async function toggleAutoFight() {
  try { await postPlayer({ autoFight: !playerData.autoFight }); } catch (err) { alert(err.message); }
}

function mapGroupKey(map) {
  return `${map.worldName || map.world || '-'}|${map.realmName || map.realm || 'Cảnh giới'}`;
}

function renderMapGroups(maps) {
  if (!maps.length) return '<p class="empty">Chưa mở map.</p>';
  const groups = new Map();
  maps.forEach(map => {
    const key = mapGroupKey(map);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(map);
  });
  return [...groups.entries()].map(([key, items]) => {
    const [world, realm] = key.split('|');
    const collapsed = collapsedMapGroups.has(key);
    const body = collapsed ? '' : `<div class="map-group-body">${items.map(item => `
      <button type="button" class="map-card ${playerData.currentZone === item.id ? 'active' : ''}" data-map="${escapeHtml(item.id)}">
        <b>${escapeHtml(item.name)}</b>
        <span>${escapeHtml(item.worldName || world)} · ${escapeHtml(item.realmName || realm)}</span>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
      </button>`).join('')}</div>`;
    return `<div class="map-group">
      <button type="button" class="map-group-head" data-map-group="${escapeHtml(key)}">
        <b>${escapeHtml(world)} · ${escapeHtml(realm)}</b><span>${collapsed ? 'Mở' : 'Thu gọn'} (${items.length})</span>
      </button>${body}</div>`;
  }).join('');
}

function renderCombat() {
  const map = playerData.currentMap || {};
  const state = playerData.combatState || {};
  const combat = playerData.combat || {};
  const monster = state.currentMonster || {};
  setText('combat-zone', map.name || playerData.zoneName || '-');
  setText('monster-name', monster.name || 'Không rõ');
  setText('combat-status', state.status || (playerData.autoFight ? 'Đang tự đánh' : 'Tự đánh đang tắt'));
  setText('combat-player-hp', `${fmt(combat.hp)} / ${fmt(combat.maxHp)}`);
  setText('combat-monster-hp', `${fmt(state.monsterHp)} / ${fmt(state.monsterMaxHp)}`);
  setText('fight-progress-text', `${Math.round(pct(state.fightProgress || 0, state.fightDuration || 3000))}%`);
  setWidth('fight-progress-bar', pct(state.fightProgress || 0, state.fightDuration || 3000));
  setWidth('player-hp-bar', pct(combat.hp, combat.maxHp));
  setWidth('monster-hp-bar', pct(state.monsterHp, state.monsterMaxHp));
  setText('auto-fight-status', playerData.autoFight ? 'Đang bật' : 'Đang tắt');
  setText('kill-count', fmt(playerData.stats?.totalKills || 0));
  setText('death-penalty', `${fmt(state.deathPenaltyPercent || playerData.temporaryPenaltyPercent || 0)}%`);

  $('map-list').innerHTML = renderMapGroups(playerData.unlockedMaps || []);
  document.querySelectorAll('[data-map-group]').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.mapGroup;
    if (collapsedMapGroups.has(key)) collapsedMapGroups.delete(key); else collapsedMapGroups.add(key);
    renderCombat();
  }));
  document.querySelectorAll('[data-map]').forEach(btn => btn.addEventListener('click', () => changeMap(btn.dataset.map)));

  const logs = state.logs || [];
  $('combat-logs').innerHTML = logs.length
    ? logs.slice(-40).reverse().map(line => `<p>${escapeHtml(line)}</p>`).join('')
    : '<p class="empty">Chưa có nhật ký.</p>';
}

async function changeMap(mapId) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/zone`, { method: 'POST', body: JSON.stringify({ mapId }) });
    playerData = data.player;
    renderAll();
  } catch (err) { alert(err.message); }
}

function smallCard(title, body = '', meta = '') {
  return `<div class="mini-card"><div><b>${escapeHtml(title)}</b>${body ? `<p>${escapeHtml(body)}</p>` : ''}</div>${meta ? `<span>${escapeHtml(meta)}</span>` : ''}</div>`;
}

function effectChips(effects = {}) {
  const entries = Object.entries(effects || {});
  if (!entries.length) return '<span class="chip">Chưa có chỉ số</span>';
  return entries.map(([k, v]) => {
    let val = v;
    if (typeof v === 'number') val = Math.abs(v) < 1 ? `${Math.round(v * 100)}%` : v;
    return `<span class="chip"><b>${escapeHtml(k)}</b> ${escapeHtml(val)}</span>`;
  }).join('');
}

function renderSkills() {
  const techState = playerData.techniques || { equipped: {}, learned: [] };
  const martialState = playerData.martialSkills || { equipped: {}, learned: [] };
  const techniques = Array.isArray(techState.learned) ? techState.learned : Object.values(techState.learned || {});
  const martial = Array.isArray(martialState.learned) ? martialState.learned : Object.values(martialState.learned || {});

  $('technique-list').innerHTML = techniques.length ? techniques.map(item => {
    const slot = item.system || item.type || 'cultivation';
    const equipped = techState.equipped?.[slot] === item.id;
    return practiceCard(item, equipped, 'technique');
  }).join('') : '<p class="empty">Chưa học công pháp.</p>';

  $('martial-list').innerHTML = martial.length ? martial.map(item => {
    const equipped = martialState.equipped?.active === item.id;
    return practiceCard(item, equipped, 'martial-skill');
  }).join('') : '<p class="empty">Chưa học vũ kỹ.</p>';

  document.querySelectorAll('[data-equip-kind]').forEach(btn => btn.addEventListener('click', () => equipPracticeItem(btn.dataset.equipKind, btn.dataset.equipId)));
  $('skill-list').innerHTML = '<p class="empty">Skill theo linh căn sẽ mở sau khi hoàn thiện linh căn.</p>';
}

function practiceCard(item, equipped, kind) {
  const system = item.system || item.type || 'cultivation';
  return `<div class="practice-card ${equipped ? 'equipped' : ''}">
    <div class="practice-top"><h4>${escapeHtml(item.name || item.id)}</h4><span>Bậc ${fmt(item.rank || 1)}</span></div>
    <b class="practice-system">${systemName(system)}</b>
    <p>${escapeHtml(item.description || '')}</p>
    <div class="chip-row">${effectChips(item.effects)}</div>
    <div class="practice-bottom"><strong>${equipped ? (kind === 'technique' ? 'Đang vận chuyển' : 'Đang xuất chiến') : 'Chưa trang bị'}</strong>${equipped ? '<button type="button" disabled>Đã trang bị</button>' : `<button type="button" data-equip-kind="${kind}" data-equip-id="${escapeHtml(item.id)}">Trang bị</button>`}</div>
  </div>`;
}

async function equipPracticeItem(kind, id) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/${kind}/equip`, { method: 'POST', body: JSON.stringify({ id }) });
    playerData = data.player;
    renderAll();
  } catch (err) { alert(err.message); }
}

function renderAlchemy() {
  setText('alchemy-bonus', `+${fmt(playerData.cave?.alchemyBonus || 0)}%`);
  const recipes = metaData?.recipes || playerData.recipes || [];
  const recipeHtml = Array.isArray(recipes) && recipes.length
    ? recipes.map(r => `<div class="mini-card"><div><b>${escapeHtml(r.name || r.id)}</b><p>${escapeHtml(r.description || 'Công thức luyện đan')}</p></div><button type="button" data-craft="${escapeHtml(r.id)}">Luyện</button></div>`).join('')
    : `<div class="mini-card"><div><b>Luyện Thọ Nguyên Đan</b><p>Công thức luyện đan</p></div><button type="button" disabled>Luyện</button></div><div class="mini-card"><div><b>Luyện Huyền Thọ Đan</b><p>Công thức luyện đan</p></div><button type="button" disabled>Luyện</button></div>`;
  $('recipe-list').innerHTML = recipeHtml;
  document.querySelectorAll('[data-craft]').forEach(btn => btn.addEventListener('click', () => craftPill(btn.dataset.craft)));

  const pills = (playerData.inventory || []).filter(item => item.basePillId || String(item.id || '').includes('dan'));
  $('pill-list').innerHTML = pills.length ? pills.map(item => smallCard(item.name || item.id, `Số lượng: ${fmt(item.amount)}`, item.quality || 'Đan dược')).join('') : '<p class="empty">Chưa có đan dược.</p>';
}

async function craftPill(recipeId) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/alchemy/craft`, { method: 'POST', body: JSON.stringify({ recipeId }) });
    playerData = data.player;
    renderAll();
  } catch (err) { alert(err.message); }
}

function renderCave() {
  const cave = playerData.cave || {};
  setText('cave-level', `Cấp ${cave.level || 1}`);
  setText('cave-aura', fmt(cave.resources?.aura || 0));
  setText('cave-rate', `${fmt(cave.auraPerSecond || 0)}/s`);
  setText('cave-alchemy', `${fmt(cave.alchemyBonus || 0)}%`);
  $('cave-buildings').innerHTML = '<p class="empty">Kiến trúc động phủ sẽ mở ở bước sau.</p>';
  const plots = playerData.herbPlots || playerData.cave?.herbPlots || [];
  $('herb-plots').innerHTML = plots.length ? plots.map((plot, idx) => `<div class="garden-plot"><b>Ô Dược Viên ${idx + 1}</b><p>${escapeHtml(plot.herbName || plot.name || (plot.herbId ? plot.herbId : 'Ô trống'))}</p></div>`).join('') : '<p class="empty">Dược viên chưa khai mở.</p>';
}

function renderInventory() {
  const inv = playerData.inventory || [];
  const currencies = Object.entries(playerData.currencies || {}).filter(([, amount]) => Number(amount) > 0);
  setText('inventory-count', `${inv.length} vật phẩm · ${currencies.length} tiền tệ`);
  const currencyHtml = currencies.length ? `<h4>Tiền tệ</h4><div class="inventory-grid">${currencies.map(([id, amount]) => smallCard(currencyName(id), `Số lượng: ${fmt(amount)}`, 'Tiền tệ')).join('')}</div>` : '<p class="empty">Chưa có tiền tệ.</p>';
  const itemHtml = inv.length ? `<h4>Vật phẩm</h4><div class="inventory-grid">${inv.map(item => smallCard(item.name || item.id, `Số lượng: ${fmt(item.amount)}`, item.quality || item.type || 'Vật phẩm')).join('')}</div>` : '<p class="empty">Chưa có vật phẩm rơi vào túi.</p>';
  $('inventory-list').innerHTML = currencyHtml + itemHtml;
}

function currencyName(id) {
  return { so_linh_thach: 'Sơ Linh Thạch', trung_linh_thach: 'Trung Linh Thạch', cao_linh_thach: 'Cao Linh Thạch', cuc_pham_linh_thach: 'Cực Phẩm Linh Thạch', tien_ngoc: 'Tiên Ngọc' }[id] || id;
}

window.addEventListener('DOMContentLoaded', async () => {
  bindEvents();
  if (username) {
    const input = $('username-input');
    if (input) input.value = username;
    showApp();
    await loadMeta();
    await loadPlayer();
    startTimer();
  }
});
