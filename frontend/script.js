const API_BASE = '';
const $ = id => document.getElementById(id);
const fmt = value => Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
const pct = (cur, max) => max > 0 && Number.isFinite(Number(max)) ? Math.max(0, Math.min(100, (Number(cur || 0) / Number(max)) * 100)) : 0;

let username = localStorage.getItem('tuTienUsername') || '';
let playerData = null;
let metaData = null;
let currentTab = localStorage.getItem('tuTienActiveTab') || 'overview';
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
  setTab(currentTab, true);
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

function setTab(tab, shouldSync = true) {
  currentTab = tab;
  localStorage.setItem('tuTienActiveTab', tab);
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  document.querySelectorAll('.tab-page').forEach(page => page.classList.toggle('active', page.id === `tab-${tab}`));
  const info = pageInfo[tab] || pageInfo.overview;
  setText('page-title', info[0]);
  setText('page-subtitle', info[1]);

  if (playerData) {
    playerData.activeTab = tab;
    renderActivityHint();
  }
  if (shouldSync && username) syncActiveTab(tab);
}

async function syncActiveTab(tab) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}`, {
      method: 'POST',
      body: JSON.stringify({ activeTab: tab })
    });
    playerData = data.player;
    renderAll();
  } catch (err) {
    console.warn('Không thể đổi mục hoạt động:', err.message);
  }
}

function renderActivityHint() {
  const active = playerData?.activeTab || currentTab || 'overview';
  document.querySelectorAll('[data-activity-mode]').forEach(el => {
    const mode = el.dataset.activityMode;
    el.classList.toggle('activity-active', mode === active);
    el.classList.toggle('activity-paused', mode !== active);
  });
}


function renderAll() {
  if (!playerData) return;
  window.playerData = playerData;
  renderHeader();
  renderEncounter();
  renderOverview();

  window.playerData = playerData;
  if (typeof window.renderActivityLog === 'function') window.renderActivityLog();
  renderCultivation();
  renderCombat();
  renderSkills();
  renderAlchemy();
  renderCave();
  renderInventory();
  renderActivityHint();
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

function formatActivityTime(at) {

 const time = Number(at || 0);

 if (!time) return '';

 return new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

}

function renderActivityLog() {

 const box = $('activity-log-list');

 if (!box) return;

 const logs = Array.isArray(playerData.activityLog) ? playerData.activityLog : [];

 if (!logs.length) {
  box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>';
  return;
 }

 box.innerHTML = logs.map(item => {
  const category = escapeHtml(item.categoryLabel || item.category || 'Thiên Cơ');
  const text = escapeHtml(item.text || 'Hoạt động không rõ');
  const detail = item.detail ? '<p>' + escapeHtml(item.detail) + '</p>' : '';
  const time = escapeHtml(formatActivityTime(item.at));
  return '<div class="activity-log-item activity-' + escapeHtml(item.category || 'system') + '"><div><b>' + category + '</b><span>' + time + '</span></div><strong>' + text + '</strong>' + detail + '</div>';
 }).join('');

}


// ===============================
// Nhật Ký Đạo Hành - Tổng Quan
// ===============================
function formatActivityTime(at) {
 const time = Number(at || 0);
 if (!time) return '';
 return new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function ensureActivityPanel() {
 let box = $('activity-log-list');
 if (box) return box;
 const overview = $('tab-overview');
 if (!overview) return null;
 const panel = document.createElement('div');
 panel.className = 'panel wide activity-panel';
 panel.innerHTML = '<div class="panel-head"><h3>Nhật Ký Đạo Hành</h3><span>Không gồm combat</span></div><div id="activity-log-list" class="activity-log-list"></div>';
 overview.appendChild(panel);
 return $('activity-log-list');
}
function renderActivityLog() {
 const box = ensureActivityPanel();
 if (!box) return;
 const logs = Array.isArray(playerData?.activityLog) ? playerData.activityLog : [];
 if (!logs.length) {
  box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>';
  return;
 }
 box.innerHTML = logs.map(item => {
  const category = escapeHtml(item.categoryLabel || item.category || 'Thiên Cơ');
  const text = escapeHtml(item.text || 'Hoạt động không rõ');
  const detail = item.detail ? '<p>' + escapeHtml(item.detail) + '</p>' : '';
  const time = escapeHtml(formatActivityTime(item.at));
  return '<div class="activity-log-item activity-' + escapeHtml(item.category || 'system') + '"><div><b>' + category + '</b><span>' + time + '</span></div><strong>' + text + '</strong>' + detail + '</div>';
 }).join('');
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
  const activeMode = playerData.activeTab || currentTab;
  setText('focus-note', activeMode === 'cultivation'
    ? ((state.limit || 1) === 1 ? 'Đang vận chuyển tu luyện. Rời tab này thì tu luyện tạm dừng.' : `Có thể đồng tu ${state.limit} mạch. Rời tab này thì tu luyện tạm dừng.`)
    : 'Tu luyện đang tạm dừng vì đang ở mục khác. Chọn tab Tu Luyện để vận chuyển.');

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
  setText('combat-status', (playerData.activeTab || currentTab) === 'combat' ? (state.status || (playerData.autoFight ? 'Đang tự đánh' : 'Tự đánh đang tắt')) : 'Combat tạm dừng vì đang ở mục khác.');
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
    setTab(currentTab, true);
    startTimer();
  }
});

// ===============================
// UI FEATURE OVERRIDE - Thọ Nguyên / Đan Dược / Dược Viên / Tháo Công Pháp
// ===============================
function findMetaList(name) {
  return Array.isArray(metaData?.[name]) ? metaData[name] : [];
}
function getMetaItem(id) {
  return [...findMetaList('materials'), ...findMetaList('herbs'), ...findMetaList('lifespanPills'), ...findMetaList('pills')]
    .find(item => item && item.id === id) || null;
}
function getItemName(id) {
  return getMetaItem(id)?.name || currencyName(id) || id;
}
function secondsText(msOrSec) {
  const sec = Number(msOrSec || 0) > 1000 ? Math.ceil(Number(msOrSec || 0) / 1000) : Math.ceil(Number(msOrSec || 0));
  if (sec <= 0) return 'Hoàn tất';
  if (sec < 60) return `${sec} giây`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m} phút ${s} giây` : `${m} phút`;
}
function pillEffectText(pill) {
  if (!pill) return 'Chưa rõ công hiệu.';
  const parts = [];
  if (pill.addYears) parts.push(`Tăng ${fmt(pill.addYears)} năm thọ nguyên`);
  if (pill.maxUses) parts.push(`giới hạn ${fmt(pill.maxUses)} lần dùng`);
  if (pill.realmMinOrder) parts.push(`yêu cầu cảnh giới bậc ${fmt(pill.realmMinOrder)} trở lên`);
  if (pill.durationMs) parts.push(`hiệu lực ${secondsText(pill.durationMs)}`);
  if (pill.effects) parts.push(effectPlainText(pill.effects));
  if (pill.description) parts.push(pill.description);
  return [...new Set(parts.filter(Boolean))].join(' · ') || 'Công hiệu chưa được khai mở.';
}
function effectPlainText(effects = {}) {
  const labels = {
    cultivationSpeedBonus: 'Tốc độ tu luyện', auraBonus: 'Linh khí', tuViBonus: 'Tu vi', hpBonus: 'Sinh mệnh', defBonus: 'Phòng ngự', bodyExpBonus: 'Kinh nghiệm luyện thể', soulPowerBonus: 'Hồn lực', soulExpBonus: 'Kinh nghiệm luyện hồn', critBonus: 'Bạo kích', damageMultiplier: 'Hệ số sát thương', atkBonus: 'Công kích', defDamageRatio: 'Lấy thủ hóa công', extraDamage: 'Sát thương thêm'
  };
  const entries = Object.entries(effects || {});
  if (!entries.length) return '';
  return entries.map(([key, value]) => {
    let shown = value;
    if (typeof value === 'number') shown = Math.abs(value) < 1 ? `${Math.round(value * 100)}%` : value;
    return `${labels[key] || key}: ${shown}`;
  }).join(' · ');
}
function formulaText(recipe) {
  const ingredients = recipe?.ingredients || [];
  const ing = ingredients.length
    ? ingredients.map(item => `${getItemName(item.id)} x${fmt(item.amount || 1)}`).join(', ')
    : 'Chưa cần nguyên liệu';
  const cost = recipe?.cost ? `Linh thạch: ${fmt(recipe.cost)}` : 'Không tốn linh thạch';
  const time = recipe?.durationMs ? `Thời gian: ${secondsText(recipe.durationMs)}` : 'Dùng ngay';
  return `${ing} · ${cost} · ${time}`;
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
  const life = playerData.lifespan || {};
  const age = life.ageYears ?? life.age ?? 0;
  const max = life.maxYears ?? life.max ?? 0;
  const remain = life.remainYears ?? Math.max(0, max - age);
  setText('lifespan-text', `${fmt(age)} / ${fmt(max)} năm`);
  setText('lifespan-desc', `Còn khoảng ${fmt(remain)} năm thọ nguyên. Đan dược thọ nguyên có giới hạn số lần dùng.`);
  const currencies = playerData.currencies || {};
  $('currency-list').innerHTML = Object.entries(currencies)
    .filter(([, amount]) => Number(amount) > 0)
    .map(([id, amount]) => smallCard(currencyName(id), fmt(amount), 'Tiền tệ'))
    .join('') || '<p class="empty">Chưa có tài nguyên.</p>';
}
function practiceCard(item, equipped, kind) {
  const system = item.system || item.type || 'cultivation';
  const status = equipped ? (kind === 'technique' ? 'Đang vận chuyển' : 'Đang xuất chiến') : 'Chưa trang bị';
  return `<div class="practice-card ${equipped ? 'equipped' : ''}">
    <div class="practice-top"><h4>${escapeHtml(item.name || item.id)}</h4><span>Bậc ${fmt(item.rank || 1)}</span></div>
    <b class="practice-system">${systemName(system)}</b>
    <p>${escapeHtml(item.description || '')}</p>
    <div class="chip-row">${effectChips(item.effects)}</div>
    <div class="practice-bottom">
      <strong>${status}</strong>
      <div class="button-row mini-actions">
        ${equipped ? `<button type="button" class="ghost" data-unequip-kind="${kind}" data-unequip-id="${escapeHtml(item.id)}" data-unequip-system="${escapeHtml(system)}">Tháo</button>` : `<button type="button" data-equip-kind="${kind}" data-equip-id="${escapeHtml(item.id)}">Trang bị</button>`}
      </div>
    </div>
  </div>`;
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
  document.querySelectorAll('[data-unequip-kind]').forEach(btn => btn.addEventListener('click', () => unequipPracticeItem(btn.dataset.unequipKind, btn.dataset.unequipId, btn.dataset.unequipSystem)));
  $('skill-list').innerHTML = '<p class="empty">Skill theo linh căn sẽ mở sau khi hoàn thiện linh căn.</p>';
}
async function unequipPracticeItem(kind, id, system) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/${kind}/unequip`, { method: 'POST', body: JSON.stringify({ id, system }) });
    playerData = data.player;
    renderAll();
  } catch (err) { alert(err.message); }
}
function renderAlchemy() {
  setText('alchemy-bonus', `+${fmt(playerData.cave?.alchemyBonus || 0)}%`);
  const recipes = findMetaList('recipes');
  const pillsMeta = [...findMetaList('lifespanPills'), ...findMetaList('pills')];
  $('recipe-list').innerHTML = recipes.length ? recipes.map(recipe => {
    const pill = pillsMeta.find(p => p.id === recipe.pillId) || getMetaItem(recipe.pillId);
    return `<div class="recipe-card">
      <div class="recipe-head"><h4>${escapeHtml(recipe.name || recipe.id)}</h4><span>${recipe.durationMs ? secondsText(recipe.durationMs) : 'Tức thời'}</span></div>
      <p><b>Công hiệu:</b> ${escapeHtml(pillEffectText(pill))}</p>
      <p><b>Công thức:</b> ${escapeHtml(formulaText(recipe))}</p>
      <button type="button" ${(playerData.activeTab || currentTab) === 'alchemy' ? '' : 'disabled'} data-craft="${escapeHtml(recipe.id)}">${(playerData.activeTab || currentTab) === 'alchemy' ? 'Luyện' : 'Chuyển sang Đan Dược để luyện'}</button>
    </div>`;
  }).join('') : '<p class="empty">Chưa có công thức luyện đan.</p>';
  document.querySelectorAll('[data-craft]').forEach(btn => btn.addEventListener('click', () => craftPill(btn.dataset.craft)));
  const pills = (playerData.inventory || []).filter(item => item.basePillId || String(item.id || '').includes('dan'));
  $('pill-list').innerHTML = pills.length ? pills.map(item => {
    const pill = pillsMeta.find(p => p.id === (item.basePillId || item.id)) || item;
    return `<div class="pill-card">
      <div><h4>${escapeHtml(item.name || pill.name || item.id)}</h4><p>Số lượng: ${fmt(item.amount)}</p><p><b>Công hiệu:</b> ${escapeHtml(pillEffectText(pill))}</p></div>
      <button type="button" data-use-pill="${escapeHtml(item.id)}">Dùng</button>
    </div>`;
  }).join('') : '<p class="empty">Chưa có đan dược.</p>';
  document.querySelectorAll('[data-use-pill]').forEach(btn => btn.addEventListener('click', () => usePill(btn.dataset.usePill)));
}
async function usePill(itemId) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/pill/use`, { method: 'POST', body: JSON.stringify({ itemId }) });
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
  const herbs = findMetaList('herbs');
  $('herb-plots').innerHTML = plots.length ? plots.map((plot, idx) => {
    const state = plot.state || (plot.herbId ? 'growing' : 'empty');
    const ready = state === 'ready' || Number(plot.remainMs || 0) <= 0 && plot.herbId;
    if (plot.herbId) {
      const herb = herbs.find(h => h.id === plot.herbId) || getMetaItem(plot.herbId) || plot;
      return `<div class="garden-plot ${ready ? 'ready' : 'growing'}">
        <b>Ô Dược Viên ${idx + 1}</b>
        <h4>${escapeHtml(plot.herbName || herb.name || plot.herbId)}</h4>
        <p>${ready ? 'Đã chín, có thể thu hoạch.' : `Đang sinh trưởng · còn ${secondsText(plot.remainMs || 0)}`}</p>
        <button type="button" ${ready && (playerData.activeTab || currentTab) === 'cave' ? '' : 'disabled'} data-harvest="${idx}">${(playerData.activeTab || currentTab) === 'cave' ? 'Thu hoạch' : 'Chuyển sang Động Phủ'}</button>
      </div>`;
    }
    return `<div class="garden-plot empty-plot">
      <b>Ô Dược Viên ${idx + 1}</b>
      <p>Chọn dược liệu để gieo trồng. Mỗi lần cần hạt giống, linh thủy, linh nhưỡng và linh thạch.</p>
      <select data-plant-select="${idx}">${herbs.map(h => `<option value="${escapeHtml(h.id)}">${escapeHtml(h.name)} · ${escapeHtml(formulaText({ ingredients: [{ id: h.seedId, amount: 1 }, { id: h.waterId, amount: 1 }, { id: h.soilId, amount: 1 }], cost: h.cost, durationMs: h.growSeconds * 1000 }))}</option>`).join('')}</select>
      <button type="button" ${(playerData.activeTab || currentTab) === 'cave' ? '' : 'disabled'} data-plant="${idx}">${(playerData.activeTab || currentTab) === 'cave' ? 'Gieo trồng' : 'Chuyển sang Động Phủ để trồng'}</button>
    </div>`;
  }).join('') : '<p class="empty">Dược viên chưa khai mở.</p>';
  document.querySelectorAll('[data-plant]').forEach(btn => btn.addEventListener('click', () => {
    const idx = Number(btn.dataset.plant || 0);
    const select = document.querySelector(`[data-plant-select="${idx}"]`);
    plantHerb(idx, select?.value);
  }));
  document.querySelectorAll('[data-harvest]').forEach(btn => btn.addEventListener('click', () => harvestHerb(Number(btn.dataset.harvest || 0))));
}
async function plantHerb(plotIndex, herbId) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/herb/plant`, { method: 'POST', body: JSON.stringify({ plotIndex, herbId }) });
    playerData = data.player;
    renderAll();
  } catch (err) { alert(err.message); }
}
async function harvestHerb(plotIndex) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/herb/harvest`, { method: 'POST', body: JSON.stringify({ plotIndex }) });
    playerData = data.player;
    renderAll();
  } catch (err) { alert(err.message); }
}


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



// DAO_UI_POPUP_V2_SCRIPT - Popup chi tiết Đan Dược + Nhật Ký cuộn riêng
(function daoUiPopupV2() {
  if (window.__daoUiPopupV2Loaded) return;
  window.__daoUiPopupV2Loaded = true;

  function el(id) { return document.getElementById(id); }
  function esc(text) {
    if (typeof escapeHtml === 'function') return escapeHtml(text == null ? '' : text);
    return String(text == null ? '' : text).replace(/[&<>"']/g, function(c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function numberText(value) {
    if (typeof fmt === 'function') return fmt(Number(value || 0));
    return Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
  }
  function timeText(ms) {
    const sec = Math.ceil(Number(ms || 0) / 1000);
    if (sec <= 0) return 'Tức thời';
    if (sec < 60) return sec + ' giây';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ' phút' + (s ? ' ' + s + ' giây' : '');
  }
  function findList(name) {
    if (typeof findMetaList === 'function') return findMetaList(name);
    return Array.isArray(window.metaData && window.metaData[name]) ? window.metaData[name] : [];
  }
  function allRecipes() { return [].concat(findList('recipes'), Array.isArray(window.playerData && window.playerData.recipes) ? window.playerData.recipes : []); }
  function allPillMeta() { return [].concat(findList('lifespanPills'), findList('pills')); }
  function getName(id) {
    if (typeof getItemName === 'function') return getItemName(id);
    const pool = [].concat(findList('materials'), findList('herbs'), allPillMeta());
    const found = pool.find(function(item) { return item && item.id === id; });
    return found ? found.name : id;
  }
  function findPill(id) {
    const cleanId = String(id || '').replace(/_(thuong|tot|cuc_pham)$/i, '');
    return allPillMeta().find(function(p) { return p && (p.id === id || p.id === cleanId); }) || null;
  }
  function inventoryAmount(itemId) {
    const inv = Array.isArray(window.playerData && window.playerData.inventory) ? window.playerData.inventory : [];
    const item = inv.find(function(x) { return x && x.id === itemId; });
    return Number(item && item.amount || 0);
  }
  function recipeMaterials(recipe) {
    return Array.isArray(recipe && recipe.ingredients) ? recipe.ingredients : (Array.isArray(recipe && recipe.materials) ? recipe.materials : []);
  }
  function effectMap(source) {
    if (!source) return {};
    if (source.effects && typeof source.effects === 'object') return source.effects;
    const out = {};
    ['lifespanYears','tuViPercent','breakthroughBonus','hpBuffPercent','atkBuffPercent','defBuffPercent','cultivationSpeedBonus','auraBonus','bodyExpBonus','soulExpBonus','atkBonus','defBonus'].forEach(function(key) {
      if (source[key] !== undefined && source[key] !== null && source[key] !== 0) out[key] = source[key];
    });
    return out;
  }
  function effectLabel(key) {
    return ({
      lifespanYears: 'Tăng thọ nguyên', tuViPercent: 'Tăng tu vi', breakthroughBonus: 'Tỷ lệ đột phá',
      hpBuffPercent: 'Sinh lực', atkBuffPercent: 'Công kích', defBuffPercent: 'Phòng thủ',
      cultivationSpeedBonus: 'Tốc độ tu luyện', auraBonus: 'Linh khí', bodyExpBonus: 'Luyện thể', soulExpBonus: 'Luyện hồn',
      atkBonus: 'Công kích', defBonus: 'Phòng ngự'
    })[key] || key;
  }
  function effectValue(value) {
    if (typeof value === 'number') {
      if (Math.abs(value) > 0 && Math.abs(value) < 1) return Math.round(value * 100) + '%';
      return numberText(value);
    }
    return String(value);
  }
  function successRateText(recipe) {
    if (recipe && typeof recipe.successRate === 'number') return Math.round(recipe.successRate * 100) + '%';
    if (recipe && typeof recipe.successRatePercent === 'number') return Math.round(recipe.successRatePercent) + '%';
    const player = window.playerData || {};
    const level = Number(player.alchemy && player.alchemy.level || 1);
    const need = Number(recipe && (recipe.alchemyLevel || recipe.requiredAlchemyRank) || 1);
    const approx = Math.min(95, Math.max(25, 55 + (level - need) * 4));
    return approx + '% dự tính';
  }
  function callUsePill(itemId) {
    if (typeof usePill === 'function') return usePill(itemId);
    alert('Không tìm thấy hàm usePill trong script.js.');
  }
  function callCraft(recipeId) {
    if (typeof craftPill === 'function') return craftPill(recipeId);
    alert('Không tìm thấy hàm craftPill trong script.js.');
  }
  function closeModal() { const modal = el('dao-detail-modal'); if (modal) modal.classList.add('hidden'); }
  function ensureModal() {
    let modal = el('dao-detail-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'dao-detail-modal';
    modal.className = 'dao-modal hidden';
    modal.innerHTML = '<div class="dao-modal-shell"><div class="dao-modal-head"><div><h3 class="dao-modal-title" id="dao-modal-title">Chi tiết</h3><div class="dao-modal-subtitle" id="dao-modal-subtitle"></div></div><button class="dao-modal-close" type="button" data-dao-close>×</button></div><div class="dao-modal-body" id="dao-modal-body"></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal || e.target.closest('[data-dao-close]')) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
    return modal;
  }
  function openModal(title, subtitle, bodyHtml) {
    const modal = ensureModal();
    el('dao-modal-title').textContent = title || 'Chi tiết';
    el('dao-modal-subtitle').textContent = subtitle || '';
    el('dao-modal-body').innerHTML = bodyHtml;
    modal.classList.remove('hidden');
    modal.querySelectorAll('[data-craft]').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); callCraft(btn.dataset.craft); closeModal(); }); });
    modal.querySelectorAll('[data-use-pill]').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); callUsePill(btn.dataset.usePill); closeModal(); }); });
  }
  function recipeDetail(recipe) {
    const pill = findPill(recipe.pillId) || {};
    const mats = recipeMaterials(recipe);
    const effects = effectMap(pill);
    const matHtml = mats.length ? mats.map(function(m) {
      const have = inventoryAmount(m.id);
      const need = Number(m.amount || 1);
      return '<div class="dao-material-row ' + (have >= need ? 'enough' : 'missing') + '"><span>' + esc(getName(m.id)) + '</span><span>' + numberText(have) + ' / ' + numberText(need) + '</span></div>';
    }).join('') : '<p>Chưa cần nguyên liệu.</p>';
    const effHtml = Object.keys(effects).length ? Object.entries(effects).map(function(pair) {
      return '<div class="dao-effect-row"><span>' + esc(effectLabel(pair[0])) + '</span><span>' + esc(effectValue(pair[1])) + '</span></div>';
    }).join('') : '<p>Chưa ghi chỉ số công hiệu.</p>';
    return '<div class="dao-detail-grid"><div class="dao-detail-section"><h4>Đan phương</h4><div class="dao-kv">'
      + '<b>Công hiệu</b><span>' + esc((typeof pillEffectText === 'function' ? pillEffectText(pill) : '') || pill.description || recipe.description || 'Chưa ghi công hiệu.') + '</span>'
      + '<b>Thời gian luyện</b><span>' + esc(timeText(recipe.durationMs || recipe.craftTimeMs || 0)) + '</span>'
      + '<b>Tỷ lệ thành công</b><span>' + esc(successRateText(recipe)) + '</span>'
      + '<b>Đan sư yêu cầu</b><span>Bậc ' + esc(recipe.alchemyLevel || recipe.requiredAlchemyRank || 1) + '</span>'
      + '<b>Linh thạch</b><span>' + numberText(recipe.cost || 0) + '</span>'
      + '</div><div class="dao-modal-actions"><button type="button" data-craft="' + esc(recipe.id) + '">Khai lò luyện đan</button><button class="secondary" type="button" data-dao-close>Đóng</button></div></div>'
      + '<div class="dao-detail-section"><h4>Nguyên liệu</h4>' + matHtml + '<h4 style="margin-top:14px">Hiệu quả</h4>' + effHtml + '</div></div>';
  }
  function pillDetail(item) {
    const pill = findPill(item.basePillId || item.id) || item;
    const effects = effectMap(pill);
    const effHtml = Object.keys(effects).length ? Object.entries(effects).map(function(pair) {
      return '<div class="dao-effect-row"><span>' + esc(effectLabel(pair[0])) + '</span><span>' + esc(effectValue(pair[1])) + '</span></div>';
    }).join('') : '<p>Chưa ghi chỉ số công hiệu.</p>';
    return '<div class="dao-detail-grid"><div class="dao-detail-section"><h4>Đan dược</h4><div class="dao-kv">'
      + '<b>Số lượng</b><span>' + numberText(item.amount || 0) + '</span>'
      + '<b>Phẩm chất</b><span>' + esc(item.qualityName || item.quality || 'Đan dược') + '</span>'
      + '<b>Loại</b><span>' + esc(pill.category || item.category || 'Đan dược') + '</span>'
      + '<b>Mô tả</b><span>' + esc((typeof pillEffectText === 'function' ? pillEffectText(pill) : '') || pill.description || item.description || 'Chưa ghi công hiệu.') + '</span>'
      + '</div><div class="dao-modal-actions"><button type="button" data-use-pill="' + esc(item.id) + '">Dùng đan</button><button class="secondary" type="button" data-dao-close>Đóng</button></div></div>'
      + '<div class="dao-detail-section"><h4>Công hiệu</h4>' + effHtml + '<h4 style="margin-top:14px">Ghi chú</h4><p>Những thẻ dài như công pháp, vũ kỹ, linh căn có thể dùng lại khung popup này.</p></div></div>';
  }
  window.openRecipeDetail = function(id) {
    const recipe = allRecipes().find(function(r) { return r && r.id === id; });
    if (!recipe) return alert('Không tìm thấy đan phương.');
    openModal(recipe.name || recipe.id, 'Đan phương · nguyên liệu · tỷ lệ · công hiệu', recipeDetail(recipe));
  };
  window.openPillDetail = function(id) {
    const inv = Array.isArray(window.playerData && window.playerData.inventory) ? window.playerData.inventory : [];
    const item = inv.find(function(x) { return x && x.id === id; });
    if (!item) return alert('Không tìm thấy đan dược.');
    openModal(item.name || item.id, 'Chi tiết đan dược trong túi', pillDetail(item));
  };
  window.renderActivityLog = function renderActivityLogPopupV2() {
    const box = (typeof ensureActivityPanel === 'function' ? ensureActivityPanel() : el('activity-log-list'));
    if (!box) return;
    if (!box.dataset.daoWheelBound) {
      box.dataset.daoWheelBound = '1';
      box.addEventListener('wheel', function(e) { e.stopPropagation(); }, { passive: true });
    }
    const logs = Array.isArray(window.playerData && window.playerData.activityLog) ? window.playerData.activityLog : [];
    if (!logs.length) { box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>'; return; }
    box.innerHTML = logs.map(function(item) {
      const category = esc(item.categoryLabel || item.category || 'Thiên Cơ');
      const text = esc(item.text || item.message || 'Đạo hành biến động.');
      const detail = item.detail ? '<p class="log-detail">' + esc(item.detail) + '</p>' : '';
      const time = typeof formatActivityTime === 'function' ? esc(formatActivityTime(item.at)) : '';
      return '<article class="log-item"><div class="log-head"><span>' + category + '</span><time>' + time + '</time></div><p>' + text + '</p>' + detail + '</article>';
    }).join('');
  };
  window.renderAlchemy = function renderAlchemyPopupV2() {
    if (typeof setText === 'function') setText('alchemy-bonus', '+' + numberText(window.playerData && window.playerData.cave && window.playerData.cave.alchemyBonus || 0) + '%');
    const recipeList = el('recipe-list');
    const recipes = allRecipes();
    if (recipeList) {
      recipeList.classList.add('dao-recipe-grid');
      recipeList.innerHTML = recipes.length ? recipes.map(function(r) {
        const pill = findPill(r.pillId) || {};
        const mats = recipeMaterials(r);
        return '<article class="dao-recipe-card" data-open-recipe="' + esc(r.id) + '"><div class="dao-card-title">' + esc(r.name || r.id) + '</div><div class="dao-card-desc">' + esc((typeof pillEffectText === 'function' ? pillEffectText(pill) : '') || pill.description || r.description || 'Công thức luyện đan') + '</div><div class="dao-card-meta"><span class="dao-chip">' + esc(timeText(r.durationMs || r.craftTimeMs || 0)) + '</span><span class="dao-chip">' + mats.length + ' nguyên liệu</span><span class="dao-chip">TC: ' + esc(successRateText(r)) + '</span></div><div class="dao-card-actions"><button type="button" data-open-recipe="' + esc(r.id) + '">Chi tiết</button><button type="button" data-craft="' + esc(r.id) + '">Luyện</button></div></article>';
      }).join('') : '<p class="empty">Chưa có đan phương.</p>';
    }
    const pillList = el('pill-list');
    const inv = Array.isArray(window.playerData && window.playerData.inventory) ? window.playerData.inventory : [];
    const pills = inv.filter(function(item) { return item && (item.basePillId || String(item.id || '').includes('dan')); });
    if (pillList) {
      pillList.classList.add('dao-pill-grid');
      pillList.innerHTML = pills.length ? pills.map(function(item) {
        const pill = findPill(item.basePillId || item.id) || item;
        return '<article class="dao-pill-card" data-open-pill="' + esc(item.id) + '"><div class="dao-card-title">' + esc(item.name || pill.name || item.id) + '</div><div class="dao-card-desc">Số lượng: ' + numberText(item.amount || 0) + '</div><div class="dao-card-meta"><span class="dao-chip">' + esc(item.qualityName || item.quality || 'Đan dược') + '</span><span class="dao-chip">Xem công hiệu</span></div><div class="dao-card-actions"><button type="button" data-open-pill="' + esc(item.id) + '">Chi tiết</button><button type="button" data-use-pill="' + esc(item.id) + '">Dùng</button></div></article>';
      }).join('') : '<p class="empty">Chưa có đan dược.</p>';
    }
    document.querySelectorAll('[data-open-recipe]').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); window.openRecipeDetail(btn.dataset.openRecipe); }); });
    document.querySelectorAll('[data-open-pill]').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); window.openPillDetail(btn.dataset.openPill); }); });
    document.querySelectorAll('#recipe-list [data-craft]').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); callCraft(btn.dataset.craft); }); });
    document.querySelectorAll('#pill-list [data-use-pill]').forEach(function(btn) { btn.addEventListener('click', function(e) { e.stopPropagation(); callUsePill(btn.dataset.usePill); }); });
  };
})();


// ===============================
// DAO_UI_POPUP_FIX_V3
// Nhật Ký Đạo Hành cuộn riêng + Popup Đan Dược
// ===============================
(function () {
  function q(id) { return document.getElementById(id); }
  function html(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c];
    });
  }
  function num(value) {
    if (typeof fmt === 'function') return fmt(value);
    return Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
  }
  function listFromMeta(name) {
    return Array.isArray(window.metaData && window.metaData[name]) ? window.metaData[name] : [];
  }
  function currencyLabel(id) {
    if (typeof currencyName === 'function') return currencyName(id);
    return id || '-';
  }
  function allKnownItems() {
    return []
      .concat(listFromMeta('materials'))
      .concat(listFromMeta('herbs'))
      .concat(listFromMeta('lifespanPills'))
      .concat(listFromMeta('pills'))
      .concat(listFromMeta('items'))
      .concat(listFromMeta('seeds'));
  }
  function findKnownItem(id) {
    return allKnownItems().find(function (item) { return item && item.id === id; }) || null;
  }
  function itemName(id) {
    const item = findKnownItem(id);
    return (item && item.name) || currencyLabel(id) || id || '-';
  }
  function secondsText(msOrSec) {
    const raw = Number(msOrSec || 0);
    const sec = raw > 1000 ? Math.ceil(raw / 1000) : Math.ceil(raw);
    if (sec <= 0) return 'Hoàn tất';
    if (sec < 60) return sec + ' giây';
    const min = Math.floor(sec / 60);
    const rest = sec % 60;
    if (min < 60) return rest ? (min + ' phút ' + rest + ' giây') : (min + ' phút');
    const hour = Math.floor(min / 60);
    const m = min % 60;
    return m ? (hour + ' giờ ' + m + ' phút') : (hour + ' giờ');
  }
  function effectText(effects) {
    const labels = {
      cultivationSpeedBonus: 'Tốc độ tu luyện', auraBonus: 'Linh khí', tuViBonus: 'Tu vi', tuViGainPerSecond: 'Tu vi mỗi giây',
      hpBonus: 'Sinh mệnh', maxHpBonus: 'Sinh mệnh tối đa', defBonus: 'Phòng ngự', atkBonus: 'Công kích',
      bodyExpBonus: 'Kinh nghiệm luyện thể', soulExpBonus: 'Kinh nghiệm luyện hồn', soulPowerBonus: 'Hồn lực',
      critBonus: 'Bạo kích', damageMultiplier: 'Hệ số sát thương', extraDamage: 'Sát thương thêm', breakthroughBonus: 'Tỷ lệ đột phá'
    };
    const entries = Object.entries(effects || {});
    if (!entries.length) return '';
    return entries.map(function (entry) {
      const key = entry[0];
      let value = entry[1];
      if (typeof value === 'number' && Math.abs(value) < 1) value = Math.round(value * 100) + '%';
      return (labels[key] || key) + ': ' + value;
    }).join(' · ');
  }
  function pillEffectText(pill) {
    if (!pill) return 'Chưa rõ công hiệu.';
    const out = [];
    if (pill.description) out.push(pill.description);
    if (pill.addYears) out.push('Tăng ' + num(pill.addYears) + ' năm thọ nguyên');
    if (pill.durationMs || pill.durationSeconds) out.push('Hiệu lực ' + secondsText(pill.durationMs || pill.durationSeconds));
    if (pill.maxUses) out.push('Giới hạn dùng: ' + num(pill.maxUses) + ' lần');
    if (pill.realmMinOrder) out.push('Yêu cầu cảnh giới bậc ' + num(pill.realmMinOrder));
    const effects = effectText(pill.effects || pill.effect || pill.stats);
    if (effects) out.push(effects);
    return Array.from(new Set(out.filter(Boolean))).join(' · ') || 'Công hiệu chưa được khai mở.';
  }
  function recipeMaterials(recipe) {
    return recipe.ingredients || recipe.materials || recipe.costItems || recipe.requires || [];
  }
  function materialRows(recipe) {
    const items = recipeMaterials(recipe);
    if (!items.length) return '<div class="dao-popup-empty">Không yêu cầu nguyên liệu.</div>';
    return items.map(function (mat) {
      const id = mat.id || mat.itemId || mat.materialId || mat.herbId || mat.currency;
      const amount = mat.amount || mat.count || mat.qty || 1;
      return '<div class="dao-popup-material"><span>' + html(itemName(id)) + '</span><b>x' + html(num(amount)) + '</b></div>';
    }).join('');
  }
  function getRecipes() {
    const fromMeta = listFromMeta('recipes');
    if (fromMeta.length) return fromMeta;
    return Array.isArray(window.playerData && window.playerData.recipes) ? window.playerData.recipes : [];
  }
  function getPillMetas() {
    return [].concat(listFromMeta('lifespanPills')).concat(listFromMeta('pills'));
  }
  function findRecipe(id) {
    return getRecipes().find(function (r) { return r && String(r.id) === String(id); }) || null;
  }
  function findPill(id) {
    return getPillMetas().find(function (p) { return p && String(p.id) === String(id); }) || findKnownItem(id);
  }
  function recipePill(recipe) {
    return findPill(recipe && (recipe.pillId || recipe.outputId || recipe.resultId || recipe.resultPillId));
  }
  function openDaoPopup(title, bodyHtml, actionHtml) {
    let layer = q('dao-detail-popup');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'dao-detail-popup';
      layer.className = 'dao-popup hidden';
      document.body.appendChild(layer);
    }
    layer.className = 'dao-popup';
    layer.innerHTML = '' +
      '<div class="dao-popup-backdrop" data-dao-popup-close="1"></div>' +
      '<section class="dao-popup-card" role="dialog" aria-modal="true">' +
        '<header class="dao-popup-head"><div><span class="dao-popup-kicker">Đan Các Chi Tiết</span><h2>' + html(title) + '</h2></div><button class="ghost-btn dao-popup-x" data-dao-popup-close="1">Đóng</button></header>' +
        '<div class="dao-popup-body">' + bodyHtml + '</div>' +
        '<footer class="dao-popup-foot">' + (actionHtml || '') + '</footer>' +
      '</section>';
    layer.querySelectorAll('[data-dao-popup-close]').forEach(function (el) {
      el.addEventListener('click', closeDaoPopup);
    });
    layer.querySelectorAll('[data-popup-craft]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeDaoPopup(); craftPill(btn.dataset.popupCraft); });
    });
    layer.querySelectorAll('[data-popup-use-pill]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeDaoPopup(); usePill(btn.dataset.popupUsePill); });
    });
  }
  function closeDaoPopup() {
    const layer = q('dao-detail-popup');
    if (layer) layer.classList.add('hidden');
  }
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeDaoPopup();
  });

  window.openDaoRecipePopup = function (recipeId) {
    const recipe = findRecipe(recipeId);
    if (!recipe) return;
    const pill = recipePill(recipe);
    const success = recipe.successRate || recipe.baseSuccessRate || recipe.rate || recipe.chance;
    const cost = recipe.cost || recipe.lingStoneCost || recipe.spiritStoneCost;
    const body = '' +
      '<div class="dao-popup-grid">' +
        '<div class="dao-popup-section"><h3>Công hiệu</h3><p>' + html(pillEffectText(pill || recipe)) + '</p></div>' +
        '<div class="dao-popup-section"><h3>Yêu cầu luyện chế</h3>' +
          '<div class="dao-popup-stat"><span>Thời gian</span><b>' + html(secondsText(recipe.durationMs || recipe.durationSeconds || recipe.craftTime || 0)) + '</b></div>' +
          '<div class="dao-popup-stat"><span>Tỷ lệ thành công</span><b>' + html(success ? ((success <= 1 ? Math.round(success * 100) : success) + '%') : 'Theo bậc đan sư') + '</b></div>' +
          '<div class="dao-popup-stat"><span>Linh thạch</span><b>' + html(cost ? num(cost) : 'Không tốn') + '</b></div>' +
          '<div class="dao-popup-stat"><span>Đan sư</span><b>' + html(recipe.alchemistRankName || recipe.rankName || recipe.requiredRank || 'Không yêu cầu') + '</b></div>' +
        '</div>' +
        '<div class="dao-popup-section dao-popup-wide"><h3>Nguyên liệu</h3>' + materialRows(recipe) + '</div>' +
      '</div>';
    const disabled = (window.playerData && window.playerData.activeTab || window.currentTab) !== 'alchemy';
    const action = '<button class="primary-btn" data-popup-craft="' + html(recipe.id) + '"' + (disabled ? ' disabled' : '') + '>' + (disabled ? 'Chuyển sang Đan Dược để luyện' : 'Khai lò luyện đan') + '</button>';
    openDaoPopup(recipe.name || recipe.id, body, action);
  };

  window.openDaoPillPopup = function (itemId) {
    const inv = Array.isArray(window.playerData && window.playerData.inventory) ? window.playerData.inventory : [];
    const item = inv.find(function (it) { return String(it.id) === String(itemId); }) || {};
    const pill = findPill(item.basePillId || item.pillId || item.id) || item;
    const body = '' +
      '<div class="dao-popup-grid">' +
        '<div class="dao-popup-section dao-popup-wide"><h3>Công hiệu</h3><p>' + html(pillEffectText(pill)) + '</p></div>' +
        '<div class="dao-popup-section"><h3>Thông tin linh đan</h3>' +
          '<div class="dao-popup-stat"><span>Số lượng</span><b>' + html(num(item.amount || 1)) + '</b></div>' +
          '<div class="dao-popup-stat"><span>Phẩm chất</span><b>' + html(item.quality || pill.quality || 'Đan dược') + '</b></div>' +
          '<div class="dao-popup-stat"><span>Hiệu lực</span><b>' + html(pill.durationMs || pill.durationSeconds ? secondsText(pill.durationMs || pill.durationSeconds) : 'Dùng ngay') + '</b></div>' +
        '</div>' +
      '</div>';
    const disabled = (window.playerData && window.playerData.activeTab || window.currentTab) !== 'alchemy';
    const action = '<button class="primary-btn" data-popup-use-pill="' + html(item.id || itemId) + '"' + (disabled ? ' disabled' : '') + '>' + (disabled ? 'Chuyển sang Đan Dược để dùng' : 'Dùng linh đan') + '</button>';
    openDaoPopup(item.name || pill.name || itemId, body, action);
  };

  window.renderActivityLog = function renderActivityLogDaoScroll() {
    const box = q('activity-log-list') || (typeof ensureActionLogPanel === 'function' ? ensureActionLogPanel() : null) || (typeof ensureActivityPanel === 'function' ? ensureActivityPanel() : null);
    if (!box) return;
    const logs = Array.isArray(window.playerData && window.playerData.activityLog) ? window.playerData.activityLog : [];
    const panel = box.closest('.panel') || box.parentElement;
    if (panel) panel.classList.add('activity-panel-scroll-host');
    box.classList.add('activity-log-scroll-box');
    if (!logs.length) {
      box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>';
      return;
    }
    box.innerHTML = logs.map(function (item) {
      const category = html(item.categoryLabel || item.category || 'Thiên Cơ');
      const text = html(item.text || item.message || 'Đạo hành biến động.');
      const detail = item.detail ? '<p>' + html(item.detail) + '</p>' : '';
      const at = Number(item.at || 0);
      const time = at ? new Date(at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
      const cls = html(item.category || 'system');
      return '<article class="log-entry log-' + cls + '"><div><b>' + category + '</b><span>' + html(time) + '</span></div><p>' + text + '</p>' + detail + '</article>';
    }).join('');
  };

  window.renderAlchemy = function renderAlchemyPopupCards() {
    if (!window.playerData) return;
    const bonusEl = q('alchemy-bonus');
    if (bonusEl) bonusEl.textContent = '+' + num((window.playerData.cave && window.playerData.cave.alchemyBonus) || 0) + '%';
    const recipes = getRecipes();
    const recipeBox = q('recipe-list');
    if (recipeBox) {
      recipeBox.classList.add('dao-compact-card-grid');
      recipeBox.innerHTML = recipes.length ? recipes.map(function (recipe) {
        const pill = recipePill(recipe);
        const duration = secondsText(recipe.durationMs || recipe.durationSeconds || recipe.craftTime || 0);
        const success = recipe.successRate || recipe.baseSuccessRate || recipe.rate || recipe.chance;
        const shownRate = success ? ((success <= 1 ? Math.round(success * 100) : success) + '%') : 'Theo đan sư';
        return '<article class="dao-compact-card" data-open-recipe="' + html(recipe.id) + '">' +
          '<div><span class="dao-card-tag">Công thức</span><h4>' + html(recipe.name || recipe.id) + '</h4></div>' +
          '<p>' + html((pill && pill.description) || recipe.description || 'Bấm để xem nguyên liệu và công hiệu.') + '</p>' +
          '<div class="dao-card-meta"><span>' + html(duration) + '</span><span>' + html(shownRate) + '</span></div>' +
          '<button class="ghost-btn" type="button" data-open-recipe="' + html(recipe.id) + '">Xem chi tiết</button>' +
        '</article>';
      }).join('') : '<p class="empty">Chưa có công thức luyện đan.</p>';
    }
    const pills = (Array.isArray(window.playerData.inventory) ? window.playerData.inventory : []).filter(function (item) {
      return item && (item.basePillId || item.pillId || String(item.id || '').toLowerCase().includes('dan'));
    });
    const pillBox = q('pill-list');
    if (pillBox) {
      pillBox.classList.add('dao-compact-card-grid');
      pillBox.innerHTML = pills.length ? pills.map(function (item) {
        const pill = findPill(item.basePillId || item.pillId || item.id) || item;
        return '<article class="dao-compact-card" data-open-pill="' + html(item.id) + '">' +
          '<div><span class="dao-card-tag">Linh đan</span><h4>' + html(item.name || pill.name || item.id) + '</h4></div>' +
          '<p>Số lượng: ' + html(num(item.amount || 1)) + ' · ' + html(item.quality || pill.quality || 'Đan dược') + '</p>' +
          '<div class="dao-card-meta"><span>' + html(pill.durationMs || pill.durationSeconds ? secondsText(pill.durationMs || pill.durationSeconds) : 'Dùng ngay') + '</span><span>Chi tiết</span></div>' +
          '<button class="ghost-btn" type="button" data-open-pill="' + html(item.id) + '">Xem / dùng</button>' +
        '</article>';
      }).join('') : '<p class="empty">Chưa có đan dược.</p>';
    }
    document.querySelectorAll('[data-open-recipe]').forEach(function (el) {
      el.addEventListener('click', function (ev) { ev.stopPropagation(); window.openDaoRecipePopup(el.dataset.openRecipe); });
    });
    document.querySelectorAll('[data-open-pill]').forEach(function (el) {
      el.addEventListener('click', function (ev) { ev.stopPropagation(); window.openDaoPillPopup(el.dataset.openPill); });
    });
  };
})();


// ===============================
// DAO_UI_POPUP_FIX_V4
// Ghi đè trực tiếp hàm renderActivityLog + renderAlchemy ở scope chính.
// Không dùng window.renderAlchemy vì renderAll gọi renderAlchemy lexical.
// ===============================
function daoUiEscape(value) {
  if (typeof escapeHtml === 'function') return escapeHtml(value);
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}
function daoUiFmt(value) {
  if (typeof fmt === 'function') return fmt(value);
  return Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
}
function daoUiMetaList(name) {
  return Array.isArray(metaData && metaData[name]) ? metaData[name] : [];
}
function daoUiCurrencyName(id) {
  return typeof currencyName === 'function' ? currencyName(id) : (id || '-');
}
function daoUiKnownItems() {
  return []
    .concat(daoUiMetaList('materials'))
    .concat(daoUiMetaList('herbs'))
    .concat(daoUiMetaList('lifespanPills'))
    .concat(daoUiMetaList('pills'))
    .concat(daoUiMetaList('items'))
    .concat(daoUiMetaList('seeds'));
}
function daoUiFindKnownItem(id) {
  return daoUiKnownItems().find(item => item && String(item.id) === String(id)) || null;
}
function daoUiItemName(id) {
  const found = daoUiFindKnownItem(id);
  return found?.name || daoUiCurrencyName(id) || id || '-';
}
function daoUiTimeText(msOrSec) {
  const raw = Number(msOrSec || 0);
  const sec = raw > 1000 ? Math.ceil(raw / 1000) : Math.ceil(raw);
  if (sec <= 0) return 'Hoàn tất';
  if (sec < 60) return sec + ' giây';
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  if (min < 60) return rest ? (min + ' phút ' + rest + ' giây') : (min + ' phút');
  const hour = Math.floor(min / 60);
  const m = min % 60;
  return m ? (hour + ' giờ ' + m + ' phút') : (hour + ' giờ');
}
function daoUiEffectText(effects = {}) {
  const labels = {
    cultivationSpeedBonus: 'Tốc độ tu luyện', auraBonus: 'Linh khí', tuViBonus: 'Tu vi', tuViGainPerSecond: 'Tu vi mỗi giây',
    hpBonus: 'Sinh mệnh', maxHpBonus: 'Sinh mệnh tối đa', defBonus: 'Phòng ngự', atkBonus: 'Công kích',
    bodyExpBonus: 'Kinh nghiệm luyện thể', soulExpBonus: 'Kinh nghiệm luyện hồn', soulPowerBonus: 'Hồn lực',
    critBonus: 'Bạo kích', damageMultiplier: 'Hệ số sát thương', extraDamage: 'Sát thương thêm', breakthroughBonus: 'Tỷ lệ đột phá'
  };
  return Object.entries(effects || {}).map(([key, value]) => {
    let shown = value;
    if (typeof shown === 'number' && Math.abs(shown) < 1) shown = Math.round(shown * 100) + '%';
    return (labels[key] || key) + ': ' + shown;
  }).join(' · ');
}
function daoUiPillEffectText(pill) {
  if (!pill) return 'Chưa rõ công hiệu.';
  const out = [];
  if (pill.description) out.push(pill.description);
  if (pill.addYears) out.push('Tăng ' + daoUiFmt(pill.addYears) + ' năm thọ nguyên');
  if (pill.durationMs || pill.durationSeconds) out.push('Hiệu lực ' + daoUiTimeText(pill.durationMs || pill.durationSeconds));
  if (pill.maxUses) out.push('Giới hạn dùng: ' + daoUiFmt(pill.maxUses) + ' lần');
  if (pill.realmMinOrder) out.push('Yêu cầu cảnh giới bậc ' + daoUiFmt(pill.realmMinOrder));
  const e = daoUiEffectText(pill.effects || pill.effect || pill.stats || {});
  if (e) out.push(e);
  return [...new Set(out.filter(Boolean))].join(' · ') || 'Công hiệu chưa được khai mở.';
}
function daoUiRecipeMaterials(recipe) {
  return recipe?.ingredients || recipe?.materials || recipe?.costItems || recipe?.requires || [];
}
function daoUiMaterialHtml(recipe) {
  const mats = daoUiRecipeMaterials(recipe);
  if (!mats.length) return '<div class="dao-popup-empty">Không yêu cầu nguyên liệu.</div>';
  return mats.map(mat => {
    const id = mat.id || mat.itemId || mat.materialId || mat.herbId || mat.currency;
    const amount = mat.amount || mat.count || mat.qty || 1;
    return '<div class="dao-popup-material"><span>' + daoUiEscape(daoUiItemName(id)) + '</span><b>x' + daoUiEscape(daoUiFmt(amount)) + '</b></div>';
  }).join('');
}
function daoUiRecipes() {
  const recipes = daoUiMetaList('recipes');
  return recipes.length ? recipes : (Array.isArray(playerData?.recipes) ? playerData.recipes : []);
}
function daoUiPillMetas() {
  return [].concat(daoUiMetaList('lifespanPills')).concat(daoUiMetaList('pills'));
}
function daoUiFindRecipe(id) {
  return daoUiRecipes().find(r => r && String(r.id) === String(id)) || null;
}
function daoUiFindPill(id) {
  return daoUiPillMetas().find(p => p && String(p.id) === String(id)) || daoUiFindKnownItem(id);
}
function daoUiRecipePill(recipe) {
  return daoUiFindPill(recipe?.pillId || recipe?.outputId || recipe?.resultId || recipe?.resultPillId);
}
function daoUiSuccessText(recipe) {
  const rate = recipe?.successRate ?? recipe?.baseSuccessRate ?? recipe?.rate ?? recipe?.chance;
  if (rate === undefined || rate === null || rate === '') return 'Theo bậc đan sư';
  const n = Number(rate);
  if (!Number.isFinite(n)) return String(rate);
  return (n <= 1 ? Math.round(n * 100) : n) + '%';
}
function daoUiCostText(recipe) {
  const cost = recipe?.cost ?? recipe?.lingStoneCost ?? recipe?.spiritStoneCost;
  return cost ? daoUiFmt(cost) : 'Không tốn';
}
function daoUiEnsurePopup() {
  let layer = document.getElementById('dao-detail-popup');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'dao-detail-popup';
    layer.className = 'dao-popup hidden';
    document.body.appendChild(layer);
  }
  return layer;
}
function daoUiClosePopup() {
  const layer = document.getElementById('dao-detail-popup');
  if (layer) layer.classList.add('hidden');
}
function daoUiOpenPopup(title, bodyHtml, actionHtml) {
  const layer = daoUiEnsurePopup();
  layer.className = 'dao-popup';
  layer.innerHTML = '' +
    '<div class="dao-popup-backdrop" data-dao-popup-close="1"></div>' +
    '<section class="dao-popup-card" role="dialog" aria-modal="true">' +
      '<header class="dao-popup-head"><div><span class="dao-popup-kicker">Đan Các Chi Tiết</span><h2>' + daoUiEscape(title) + '</h2></div><button class="ghost-btn dao-popup-x" data-dao-popup-close="1">Đóng</button></header>' +
      '<div class="dao-popup-body">' + bodyHtml + '</div>' +
      '<footer class="dao-popup-foot">' + (actionHtml || '') + '</footer>' +
    '</section>';
  layer.querySelectorAll('[data-dao-popup-close]').forEach(el => el.addEventListener('click', daoUiClosePopup));
  layer.querySelectorAll('[data-popup-craft]').forEach(btn => btn.addEventListener('click', () => { daoUiClosePopup(); craftPill(btn.dataset.popupCraft); }));
  layer.querySelectorAll('[data-popup-use-pill]').forEach(btn => btn.addEventListener('click', () => { daoUiClosePopup(); usePill(btn.dataset.popupUsePill); }));
}
document.addEventListener('keydown', ev => { if (ev.key === 'Escape') daoUiClosePopup(); });
function daoUiOpenRecipePopup(recipeId) {
  const recipe = daoUiFindRecipe(recipeId);
  if (!recipe) return;
  const pill = daoUiRecipePill(recipe);
  const body = '' +
    '<div class="dao-popup-grid">' +
      '<div class="dao-popup-section dao-popup-wide"><h3>Công hiệu</h3><p>' + daoUiEscape(daoUiPillEffectText(pill || recipe)) + '</p></div>' +
      '<div class="dao-popup-section"><h3>Yêu cầu luyện chế</h3>' +
        '<div class="dao-popup-stat"><span>Thời gian</span><b>' + daoUiEscape(daoUiTimeText(recipe.durationMs || recipe.durationSeconds || recipe.craftTime || 0)) + '</b></div>' +
        '<div class="dao-popup-stat"><span>Tỷ lệ thành công</span><b>' + daoUiEscape(daoUiSuccessText(recipe)) + '</b></div>' +
        '<div class="dao-popup-stat"><span>Linh thạch</span><b>' + daoUiEscape(daoUiCostText(recipe)) + '</b></div>' +
        '<div class="dao-popup-stat"><span>Bậc đan sư</span><b>' + daoUiEscape(recipe.alchemistRankName || recipe.rankName || recipe.requiredRank || 'Không yêu cầu') + '</b></div>' +
      '</div>' +
      '<div class="dao-popup-section"><h3>Nguyên liệu</h3>' + daoUiMaterialHtml(recipe) + '</div>' +
    '</div>';
  const disabled = (playerData?.activeTab || currentTab) !== 'alchemy';
  const action = '<button class="primary-btn" type="button" data-popup-craft="' + daoUiEscape(recipe.id) + '"' + (disabled ? ' disabled' : '') + '>' + (disabled ? 'Chuyển sang Đan Dược để luyện' : 'Khai lò luyện đan') + '</button>';
  daoUiOpenPopup(recipe.name || recipe.id, body, action);
}
function daoUiOpenPillPopup(itemId) {
  const inv = Array.isArray(playerData?.inventory) ? playerData.inventory : [];
  const item = inv.find(it => String(it.id) === String(itemId)) || {};
  const pill = daoUiFindPill(item.basePillId || item.pillId || item.id) || item;
  const body = '' +
    '<div class="dao-popup-grid">' +
      '<div class="dao-popup-section dao-popup-wide"><h3>Công hiệu</h3><p>' + daoUiEscape(daoUiPillEffectText(pill)) + '</p></div>' +
      '<div class="dao-popup-section"><h3>Thông tin linh đan</h3>' +
        '<div class="dao-popup-stat"><span>Số lượng</span><b>' + daoUiEscape(daoUiFmt(item.amount || 1)) + '</b></div>' +
        '<div class="dao-popup-stat"><span>Phẩm chất</span><b>' + daoUiEscape(item.quality || pill.quality || 'Đan dược') + '</b></div>' +
        '<div class="dao-popup-stat"><span>Hiệu lực</span><b>' + daoUiEscape(pill.durationMs || pill.durationSeconds ? daoUiTimeText(pill.durationMs || pill.durationSeconds) : 'Dùng ngay') + '</b></div>' +
      '</div>' +
    '</div>';
  const disabled = (playerData?.activeTab || currentTab) !== 'alchemy';
  const action = '<button class="primary-btn" type="button" data-popup-use-pill="' + daoUiEscape(item.id || itemId) + '"' + (disabled ? ' disabled' : '') + '>' + (disabled ? 'Chuyển sang Đan Dược để dùng' : 'Dùng linh đan') + '</button>';
  daoUiOpenPopup(item.name || pill.name || itemId, body, action);
}

function renderActivityLog() {
  const box = typeof ensureActionLogPanel === 'function' ? ensureActionLogPanel() : (typeof ensureActivityPanel === 'function' ? ensureActivityPanel() : document.getElementById('activity-log-list'));
  if (!box) return;
  const panel = box.closest('.panel') || box.parentElement;
  if (panel) panel.classList.add('activity-panel-scroll-host');
  box.classList.add('activity-log-scroll-box');
  const logs = Array.isArray(playerData?.activityLog) ? playerData.activityLog : [];
  if (!logs.length) {
    box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>';
    return;
  }
  box.innerHTML = logs.map(item => {
    const category = daoUiEscape(item.categoryLabel || item.category || 'Thiên Cơ');
    const text = daoUiEscape(item.text || item.message || 'Đạo hành biến động.');
    const detail = item.detail ? '<p>' + daoUiEscape(item.detail) + '</p>' : '';
    const at = Number(item.at || 0);
    const time = at ? new Date(at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
    const cls = daoUiEscape(item.category || 'system');
    return '<article class="log-entry log-' + cls + '"><div><b>' + category + '</b><span>' + daoUiEscape(time) + '</span></div><p>' + text + '</p>' + detail + '</article>';
  }).join('');
}

function renderAlchemy() {
  setText('alchemy-bonus', '+' + daoUiFmt(playerData?.cave?.alchemyBonus || 0) + '%');
  const recipeBox = document.getElementById('recipe-list');
  const pillBox = document.getElementById('pill-list');
  const recipes = daoUiRecipes();
  if (recipeBox) {
    recipeBox.classList.add('dao-compact-card-grid');
    recipeBox.innerHTML = recipes.length ? recipes.map(recipe => {
      const pill = daoUiRecipePill(recipe);
      return '<article class="dao-compact-card" data-open-recipe="' + daoUiEscape(recipe.id) + '">' +
        '<div><span class="dao-card-tag">Công thức</span><h4>' + daoUiEscape(recipe.name || recipe.id) + '</h4></div>' +
        '<p>' + daoUiEscape((pill && pill.description) || recipe.description || 'Bấm để xem nguyên liệu, công hiệu, thời gian và tỷ lệ thành công.') + '</p>' +
        '<div class="dao-card-meta"><span>' + daoUiEscape(daoUiTimeText(recipe.durationMs || recipe.durationSeconds || recipe.craftTime || 0)) + '</span><span>' + daoUiEscape(daoUiSuccessText(recipe)) + '</span></div>' +
        '<button class="ghost-btn" type="button" data-open-recipe="' + daoUiEscape(recipe.id) + '">Xem chi tiết</button>' +
      '</article>';
    }).join('') : '<p class="empty">Chưa có công thức luyện đan.</p>';
  }
  const pills = (Array.isArray(playerData?.inventory) ? playerData.inventory : []).filter(item => item && (item.basePillId || item.pillId || String(item.id || '').toLowerCase().includes('dan')));
  if (pillBox) {
    pillBox.classList.add('dao-compact-card-grid');
    pillBox.innerHTML = pills.length ? pills.map(item => {
      const pill = daoUiFindPill(item.basePillId || item.pillId || item.id) || item;
      return '<article class="dao-compact-card" data-open-pill="' + daoUiEscape(item.id) + '">' +
        '<div><span class="dao-card-tag">Linh đan</span><h4>' + daoUiEscape(item.name || pill.name || item.id) + '</h4></div>' +
        '<p>Số lượng: ' + daoUiEscape(daoUiFmt(item.amount || 1)) + ' · ' + daoUiEscape(item.quality || pill.quality || 'Đan dược') + '</p>' +
        '<div class="dao-card-meta"><span>' + daoUiEscape(pill.durationMs || pill.durationSeconds ? daoUiTimeText(pill.durationMs || pill.durationSeconds) : 'Dùng ngay') + '</span><span>Chi tiết</span></div>' +
        '<button class="ghost-btn" type="button" data-open-pill="' + daoUiEscape(item.id) + '">Xem / dùng</button>' +
      '</article>';
    }).join('') : '<p class="empty">Chưa có đan dược.</p>';
  }
  document.querySelectorAll('[data-open-recipe]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); daoUiOpenRecipePopup(el.dataset.openRecipe); }));
  document.querySelectorAll('[data-open-pill]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); daoUiOpenPillPopup(el.dataset.openPill); }));
}


/* ===== DAO_UI_POPUP_FINAL_V5_START ===== */
(function daoUiPopupFinalV5() {
  const daoModalId = 'dao-detail-modal';

  function daoEl(id) { return document.getElementById(id); }
  function daoSafe(text) { return typeof escapeHtml === 'function' ? escapeHtml(text) : String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function daoFmt(value) { return typeof fmt === 'function' ? fmt(value) : Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 }); }
  function daoCurrencyName(id) { return typeof currencyName === 'function' ? currencyName(id) : id; }

  function daoList(name) {
    if (Array.isArray(metaData && metaData[name])) return metaData[name];
    if (Array.isArray(playerData && playerData[name])) return playerData[name];
    return [];
  }

  function daoAllMetaItems() {
    return [
      ...daoList('materials'),
      ...daoList('herbs'),
      ...daoList('pills'),
      ...daoList('lifespanPills'),
      ...daoList('items'),
      ...daoList('recipes'),
    ].filter(Boolean);
  }

  function daoFindMeta(id) {
    if (!id) return null;
    return daoAllMetaItems().find(item => item && item.id === id) || null;
  }

  function daoName(id) {
    if (!id) return '-';
    return (daoFindMeta(id) && daoFindMeta(id).name) || daoCurrencyName(id) || id;
  }

  function daoTimeText(msOrSec) {
    let sec = Number(msOrSec || 0);
    if (sec > 1000) sec = Math.ceil(sec / 1000);
    sec = Math.ceil(sec);
    if (sec <= 0) return 'Hoàn tất ngay';
    if (sec < 60) return sec + ' giây';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m < 60) return s ? (m + ' phút ' + s + ' giây') : (m + ' phút');
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm ? (h + ' giờ ' + rm + ' phút') : (h + ' giờ');
  }

  function daoPercent(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return '-';
    return n <= 1 ? Math.round(n * 100) + '%' : Math.round(n) + '%';
  }

  function daoEffectText(effects) {
    const labels = {
      cultivationSpeedBonus: 'Tốc độ tu luyện', auraBonus: 'Linh khí', tuViBonus: 'Tu vi', tuViGainBonus: 'Tu vi',
      breakthroughRateBonus: 'Tỷ lệ đột phá', hpBonus: 'Sinh mệnh', atkBonus: 'Công kích', defBonus: 'Phòng ngự',
      bodyExpBonus: 'Kinh nghiệm luyện thể', soulExpBonus: 'Kinh nghiệm luyện hồn', soulPowerBonus: 'Hồn lực',
      critBonus: 'Bạo kích', damageMultiplier: 'Sát thương', extraDamage: 'Sát thương thêm', defDamageRatio: 'Lấy thủ hóa công'
    };
    const entries = Object.entries(effects || {});
    if (!entries.length) return '';
    return entries.map(([key, value]) => {
      let shown = value;
      if (typeof value === 'number') shown = Math.abs(value) <= 1 ? Math.round(value * 100) + '%' : daoFmt(value);
      return (labels[key] || key) + ': ' + shown;
    }).join(' · ');
  }

  function daoPillEffectText(pill) {
    if (!pill) return 'Công hiệu chưa được khai mở.';
    const parts = [];
    if (pill.description) parts.push(pill.description);
    if (pill.effectText) parts.push(pill.effectText);
    if (pill.addYears) parts.push('Tăng ' + daoFmt(pill.addYears) + ' năm thọ nguyên');
    if (pill.durationMs || pill.durationSeconds) parts.push('Hiệu lực ' + daoTimeText(pill.durationMs || pill.durationSeconds));
    if (pill.maxUses) parts.push('Giới hạn ' + daoFmt(pill.maxUses) + ' lần dùng');
    if (pill.realmMinOrder) parts.push('Yêu cầu cảnh giới bậc ' + daoFmt(pill.realmMinOrder) + ' trở lên');
    const effect = daoEffectText(pill.effects || pill.effect || {});
    if (effect) parts.push(effect);
    return [...new Set(parts.filter(Boolean))].join(' · ') || 'Công hiệu chưa được khai mở.';
  }

  function daoRecipeIngredients(recipe) {
    const list = recipe.ingredients || recipe.materials || recipe.costItems || recipe.requires || [];
    return Array.isArray(list) ? list : [];
  }

  function daoFormulaRows(recipe) {
    const rows = daoRecipeIngredients(recipe).map(item => ({
      name: daoName(item.id || item.itemId || item.materialId || item.herbId),
      amount: item.amount || item.count || item.qty || 1,
    }));
    if (recipe.cost || recipe.linhThachCost || recipe.spiritStoneCost) {
      rows.push({ name: 'Sơ Linh Thạch', amount: recipe.cost || recipe.linhThachCost || recipe.spiritStoneCost });
    }
    return rows;
  }

  function daoSuccessText(recipe) {
    const value = recipe.successRate ?? recipe.successChance ?? recipe.baseSuccessRate ?? recipe.rate;
    if (value === undefined || value === null) return 'Theo cảnh giới Đan Sư';
    return daoPercent(value);
  }

  function daoRequireText(recipe) {
    return recipe.alchemistLevel || recipe.requiredAlchemyLevel || recipe.danSuLevel || recipe.requiredDanSu
      ? 'Đan sư cấp ' + daoFmt(recipe.alchemistLevel || recipe.requiredAlchemyLevel || recipe.danSuLevel || recipe.requiredDanSu)
      : 'Không ghi yêu cầu';
  }

  function daoFindPillForRecipe(recipe) {
    const pillId = recipe.pillId || recipe.resultPillId || recipe.resultId || recipe.outputId;
    return daoFindMeta(pillId) || { id: pillId, name: recipe.name || pillId };
  }

  function daoRecipeCard(recipe) {
    const pill = daoFindPillForRecipe(recipe);
    const rows = daoFormulaRows(recipe);
    const ingSummary = rows.length ? rows.slice(0, 2).map(r => r.name + ' x' + daoFmt(r.amount)).join(', ') + (rows.length > 2 ? '...' : '') : 'Không cần nguyên liệu';
    const canAct = (playerData.activeTab || currentTab) === 'alchemy';
    return '<button type="button" class="dao-mini-card dao-recipe-card" data-dao-open-recipe="' + daoSafe(recipe.id) + '">' +
      '<span class="dao-mini-title">' + daoSafe(recipe.name || pill.name || recipe.id) + '</span>' +
      '<span class="dao-mini-meta">' + daoSafe(daoTimeText(recipe.durationMs || recipe.durationSeconds || recipe.craftTime || 0)) + ' · Tỷ lệ ' + daoSafe(daoSuccessText(recipe)) + '</span>' +
      '<span class="dao-mini-desc">' + daoSafe(ingSummary) + '</span>' +
      '<span class="dao-mini-action">' + (canAct ? 'Xem/Luyện' : 'Xem chi tiết') + '</span>' +
    '</button>';
  }

  function daoInventoryPills() {
    const inv = Array.isArray(playerData && playerData.inventory) ? playerData.inventory : [];
    return inv.filter(item => item && (item.basePillId || item.pillId || String(item.id || '').toLowerCase().includes('dan') || String(item.type || '').toLowerCase().includes('pill')));
  }

  function daoPillCard(item) {
    const pill = daoFindMeta(item.basePillId || item.pillId || item.id) || item;
    return '<button type="button" class="dao-mini-card dao-pill-card" data-dao-open-pill="' + daoSafe(item.id) + '">' +
      '<span class="dao-mini-title">' + daoSafe(item.name || pill.name || item.id) + '</span>' +
      '<span class="dao-mini-meta">Số lượng: ' + daoFmt(item.amount || item.count || 1) + ' · ' + daoSafe(item.quality || pill.quality || 'Đan dược') + '</span>' +
      '<span class="dao-mini-desc">' + daoSafe(daoPillEffectText(pill)).slice(0, 120) + '</span>' +
      '<span class="dao-mini-action">Xem/Dùng</span>' +
    '</button>';
  }

  function daoEnsureModal() {
    let modal = daoEl(daoModalId);
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = daoModalId;
    modal.className = 'dao-modal hidden';
    modal.innerHTML = '<div class="dao-modal-backdrop" data-dao-close-modal></div><div class="dao-modal-panel"><button type="button" class="dao-modal-close" data-dao-close-modal>×</button><div id="dao-modal-content"></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {
      if (e.target && e.target.hasAttribute('data-dao-close-modal')) daoCloseModal();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') daoCloseModal(); });
    return modal;
  }

  function daoOpenModal(html) {
    const modal = daoEnsureModal();
    const content = daoEl('dao-modal-content');
    if (content) content.innerHTML = html;
    modal.classList.remove('hidden');
    document.body.classList.add('dao-modal-open');
  }

  function daoCloseModal() {
    const modal = daoEl(daoModalId);
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('dao-modal-open');
  }

  function daoOpenRecipe(recipeId) {
    const recipes = [...daoList('recipes'), ...(Array.isArray(playerData && playerData.recipes) ? playerData.recipes : [])];
    const recipe = recipes.find(r => String(r.id) === String(recipeId));
    if (!recipe) return;
    const pill = daoFindPillForRecipe(recipe);
    const rows = daoFormulaRows(recipe);
    const canAct = (playerData.activeTab || currentTab) === 'alchemy';
    daoOpenModal('<div class="dao-detail-head"><div><div class="dao-detail-kicker">Đan phương</div><h2>' + daoSafe(recipe.name || pill.name || recipe.id) + '</h2><p>' + daoSafe(pill && pill.name ? ('Thành đan: ' + pill.name) : 'Phương đan chưa rõ thành phẩm') + '</p></div><span class="dao-detail-badge">' + daoSafe(daoRequireText(recipe)) + '</span></div>' +
      '<div class="dao-detail-grid"><section><h3>Công hiệu</h3><p>' + daoSafe(daoPillEffectText(pill)) + '</p></section><section><h3>Đạo hạnh luyện đan</h3><p>Thời gian: <b>' + daoSafe(daoTimeText(recipe.durationMs || recipe.durationSeconds || recipe.craftTime || 0)) + '</b></p><p>Tỷ lệ thành công: <b>' + daoSafe(daoSuccessText(recipe)) + '</b></p><p>Yêu cầu: <b>' + daoSafe(daoRequireText(recipe)) + '</b></p></section></div>' +
      '<section class="dao-detail-section"><h3>Linh tài cần dùng</h3>' + (rows.length ? '<div class="dao-material-list">' + rows.map(r => '<div><span>' + daoSafe(r.name) + '</span><b>x' + daoFmt(r.amount) + '</b></div>').join('') + '</div>' : '<p>Không cần nguyên liệu.</p>') + '</section>' +
      '<div class="dao-detail-actions"><button type="button" class="primary" data-dao-craft="' + daoSafe(recipe.id) + '" ' + (canAct ? '' : 'disabled') + '>' + (canAct ? 'Khai lò luyện đan' : 'Chỉ luyện khi đang ở tab Đan Dược') + '</button></div>');
    daoEl('dao-modal-content')?.querySelector('[data-dao-craft]')?.addEventListener('click', () => { daoCloseModal(); craftPill(recipe.id); });
  }

  function daoOpenPill(itemId) {
    const item = daoInventoryPills().find(p => String(p.id) === String(itemId));
    if (!item) return;
    const pill = daoFindMeta(item.basePillId || item.pillId || item.id) || item;
    daoOpenModal('<div class="dao-detail-head"><div><div class="dao-detail-kicker">Linh đan</div><h2>' + daoSafe(item.name || pill.name || item.id) + '</h2><p>Số lượng: ' + daoFmt(item.amount || item.count || 1) + ' · Phẩm chất: ' + daoSafe(item.quality || pill.quality || 'Thường') + '</p></div><span class="dao-detail-badge">Đan Dược</span></div>' +
      '<section class="dao-detail-section"><h3>Công hiệu</h3><p>' + daoSafe(daoPillEffectText(pill)) + '</p></section>' +
      '<section class="dao-detail-section"><h3>Ghi chú dùng đan</h3><p>Một số đan dược có giới hạn số lần dùng hoặc chỉ hiệu quả ở cảnh giới phù hợp.</p></section>' +
      '<div class="dao-detail-actions"><button type="button" class="primary" data-dao-use-pill="' + daoSafe(item.id) + '">Dùng đan</button></div>');
    daoEl('dao-modal-content')?.querySelector('[data-dao-use-pill]')?.addEventListener('click', () => { daoCloseModal(); usePill(item.id); });
  }

  function daoBindAlchemyEvents() {
    document.querySelectorAll('[data-dao-open-recipe]').forEach(btn => btn.addEventListener('click', () => daoOpenRecipe(btn.dataset.daoOpenRecipe)));
    document.querySelectorAll('[data-dao-open-pill]').forEach(btn => btn.addEventListener('click', () => daoOpenPill(btn.dataset.daoOpenPill)));
  }

  function daoRenderAlchemy() {
    setText('alchemy-bonus', '+' + daoFmt((playerData.cave && playerData.cave.alchemyBonus) || 0) + '%');
    const recipes = daoList('recipes');
    const recipeList = daoEl('recipe-list');
    if (recipeList) {
      recipeList.classList.add('dao-compact-grid');
      recipeList.innerHTML = recipes.length ? recipes.map(daoRecipeCard).join('') : '<p class="empty">Chưa có phương đan.</p>';
    }
    const pills = daoInventoryPills();
    const pillList = daoEl('pill-list');
    if (pillList) {
      pillList.classList.add('dao-compact-grid');
      pillList.innerHTML = pills.length ? pills.map(daoPillCard).join('') : '<p class="empty">Chưa có đan dược.</p>';
    }
    daoBindAlchemyEvents();
  }

  function daoEnsureActivityPanel() {
    let box = daoEl('activity-log-list');
    if (box) return box;
    const overview = daoEl('tab-overview');
    if (!overview) return null;
    const panel = document.createElement('div');
    panel.className = 'panel wide activity-panel dao-activity-panel';
    panel.innerHTML = '<h3>Nhật Ký Đạo Hành</h3><p>Ghi lại luyện đan, dùng đan, dược viên, kỳ ngộ, công pháp. Không gồm combat.</p><div id="activity-log-list" class="activity-log-list dao-activity-scroll"></div>';
    overview.appendChild(panel);
    return daoEl('activity-log-list');
  }

  function daoTime(at) {
    const time = Number(at || 0);
    if (!time) return '';
    return new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function daoRenderActivityLog() {
    const box = daoEnsureActivityPanel();
    if (!box) return;
    box.classList.add('dao-activity-scroll');
    const logs = Array.isArray(playerData && playerData.activityLog) ? playerData.activityLog : [];
    if (!logs.length) {
      box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>';
      return;
    }
    box.innerHTML = logs.map(item => {
      const category = daoSafe(item.categoryLabel || item.category || 'Thiên Cơ');
      const text = daoSafe(item.text || item.message || 'Đạo hành biến động.');
      const detail = item.detail ? '<div class="dao-log-detail">' + daoSafe(item.detail) + '</div>' : '';
      const time = daoSafe(daoTime(item.at));
      return '<article class="dao-log-item"><div class="dao-log-head"><b>' + category + '</b><span>' + time + '</span></div><div class="dao-log-text">' + text + '</div>' + detail + '</article>';
    }).join('');
  }

  window.renderActivityLog = daoRenderActivityLog;
  window.renderServerActionLog = daoRenderActivityLog;
  window.daoOpenRecipePopup = daoOpenRecipe;
  window.daoOpenPillPopup = daoOpenPill;

  // Ghi đè hàm nội bộ theo cơ chế function declaration cuối file.
  renderAlchemy = daoRenderAlchemy;
  renderActivityLog = daoRenderActivityLog;
  if (typeof renderServerActionLog !== 'undefined') renderServerActionLog = daoRenderActivityLog;
})();
/* ===== DAO_UI_POPUP_FINAL_V5_END ===== */


/* DAO_UI_REAL_V6_START */
(function DaoUiRealV6(){
  function q(id){ return document.getElementById(id); }
  function esc(v){ return String(v ?? '').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function num(v){ return Number(v || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 }); }
  function list(name){ return Array.isArray(window.metaData?.[name]) ? window.metaData[name] : (Array.isArray(metaData?.[name]) ? metaData[name] : []); }
  function allMeta(){ return [].concat(list('materials'), list('herbs'), list('lifespanPills'), list('pills'), list('recipes')); }
  function findMeta(id){ return allMeta().find(function(x){ return x && x.id === id; }) || null; }
  function itemName(id){ var m = findMeta(id); if (m && m.name) return m.name; if (typeof currencyName === 'function') return currencyName(id); return id || '-'; }
  function secText(msOrSec){ var raw = Number(msOrSec || 0); var s = raw > 1000 ? Math.ceil(raw / 1000) : Math.ceil(raw); if (s <= 0) return 'Tức thời'; if (s < 60) return s + ' giây'; var m = Math.floor(s / 60), r = s % 60; return r ? (m + ' phút ' + r + ' giây') : (m + ' phút'); }
  function effectText(effects){
    var labels = { cultivationSpeedBonus:'Tốc độ tu luyện', auraBonus:'Linh khí', tuViBonus:'Tu vi', tuViGainPerSecond:'Tu vi/giây', hpBonus:'Sinh mệnh', atkBonus:'Công kích', defBonus:'Phòng ngự', critBonus:'Bạo kích', damageMultiplier:'Sát thương', bodyExpBonus:'Kinh nghiệm luyện thể', soulExpBonus:'Kinh nghiệm luyện hồn', soulPowerBonus:'Hồn lực', breakthroughBonus:'Tỷ lệ đột phá' };
    var entries = Object.entries(effects || {});
    if (!entries.length) return 'Công hiệu chưa được khai mở.';
    return entries.map(function(pair){ var k=pair[0], v=pair[1]; var shown=v; if (typeof v === 'number') shown = Math.abs(v) < 1 ? Math.round(v * 100) + '%' : num(v); return (labels[k] || k) + ': ' + shown; }).join(' · ');
  }
  function pillEffect(pill){
    var arr = [];
    if (pill && pill.addYears) arr.push('Tăng thọ nguyên: ' + num(pill.addYears) + ' năm');
    if (pill && pill.durationMs) arr.push('Hiệu lực: ' + secText(pill.durationMs));
    if (pill && pill.maxUses) arr.push('Giới hạn dùng: ' + num(pill.maxUses) + ' lần');
    if (pill && pill.realmMinOrder) arr.push('Yêu cầu cảnh giới bậc ' + num(pill.realmMinOrder) + '+');
    if (pill && pill.effects) arr.push(effectText(pill.effects));
    if (pill && pill.description) arr.push(pill.description);
    return Array.from(new Set(arr.filter(Boolean))).join(' · ') || 'Công hiệu chưa được khai mở.';
  }
  function ingredientsOf(recipe){ return (recipe && (recipe.ingredients || recipe.materials || recipe.costItems)) || []; }
  function recipeCost(recipe){
    var lines = [];
    var ings = ingredientsOf(recipe);
    if (ings.length) lines.push(ings.map(function(x){ return itemName(x.id || x.itemId) + ' x' + num(x.amount || x.count || 1); }).join(', '));
    if (recipe && (recipe.cost || recipe.spiritStoneCost)) lines.push('Linh thạch: ' + num(recipe.cost || recipe.spiritStoneCost));
    return lines.join(' · ') || 'Không cần nguyên liệu.';
  }
  function successRate(recipe){ var v = recipe && (recipe.successRate ?? recipe.baseSuccessRate ?? recipe.rate); if (typeof v === 'number') return v <= 1 ? Math.round(v * 100) + '%' : Math.round(v) + '%'; return 'Theo bậc Đan Sư hiện tại'; }
  function alchemyRank(){ var a = window.playerData?.alchemy || window.playerData?.alchemyState || window.playerData?.cave?.alchemy || {}; return a.rankName || a.name || window.playerData?.alchemyRankName || 'Đan Sư hiện tại'; }
  function ensureModal(){
    var root = q('dao-info-modal'); if (root) return root;
    root = document.createElement('div'); root.id = 'dao-info-modal'; root.className = 'dao-modal hidden';
    root.innerHTML = '<div class="dao-modal-mask" data-dao-close="1"></div><div class="dao-modal-box"><button class="dao-modal-x" data-dao-close="1">×</button><div id="dao-modal-body"></div></div>';
    document.body.appendChild(root);
    root.addEventListener('click', function(e){ if (e.target.dataset.daoClose) closeDaoModal(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeDaoModal(); });
    return root;
  }
  window.closeDaoModal = function(){ var m = q('dao-info-modal'); if (m) m.classList.add('hidden'); };
  window.openDaoModal = function(html){ var root = ensureModal(); var body = q('dao-modal-body'); if (body) body.innerHTML = html; root.classList.remove('hidden'); };
  function pillMetaForItem(item){ return findMeta(item.basePillId || item.pillId || item.id) || item; }
  window.openRecipePopup = function(recipeId){
    var recipes = list('recipes').length ? list('recipes') : (window.playerData?.recipes || []);
    var recipe = recipes.find(function(r){ return r.id === recipeId; }); if (!recipe) return;
    var pill = findMeta(recipe.pillId || recipe.resultId || recipe.outputId) || {};
    var html = '<div class="dao-modal-head"><span>Đan Phương</span><h2>' + esc(recipe.name || pill.name || recipe.id) + '</h2><p>' + esc(recipe.description || 'Phương pháp luyện chế đan dược.') + '</p></div>' +
      '<div class="dao-modal-grid">' +
      '<section><b>Công hiệu</b><p>' + esc(pillEffect(pill)) + '</p></section>' +
      '<section><b>Công thức</b><p>' + esc(recipeCost(recipe)) + '</p></section>' +
      '<section><b>Thời gian luyện</b><p>' + esc(secText(recipe.durationMs || recipe.duration || recipe.craftTimeMs)) + '</p></section>' +
      '<section><b>Tỷ lệ thành công</b><p>' + esc(successRate(recipe)) + '</p></section>' +
      '<section><b>Yêu cầu Đan Sư</b><p>' + esc(recipe.alchemyRankName || recipe.requiredRankName || recipe.requiredAlchemyRank || 'Không rõ') + '</p></section>' +
      '<section><b>Đạo hạnh hiện tại</b><p>' + esc(alchemyRank()) + '</p></section>' +
      '</div><div class="dao-modal-actions"><button class="primary" data-craft="' + esc(recipe.id) + '">Khai Lô Luyện Đan</button></div>';
    openDaoModal(html);
    var btn = q('dao-modal-body')?.querySelector('[data-craft]'); if (btn) btn.addEventListener('click', async function(e){ closeDaoModal(); await craftPill(e.currentTarget.dataset.craft); });
  };
  window.openPillPopup = function(itemId){
    var item = (window.playerData?.inventory || []).find(function(x){ return String(x.id) === String(itemId); }); if (!item) return;
    var pill = pillMetaForItem(item);
    var html = '<div class="dao-modal-head"><span>Đan Dược</span><h2>' + esc(item.name || pill.name || item.id) + '</h2><p>' + esc(item.quality || pill.quality || 'Linh đan') + '</p></div>' +
      '<div class="dao-modal-grid">' +
      '<section><b>Số lượng</b><p>' + num(item.amount || item.count || 1) + '</p></section>' +
      '<section><b>Công hiệu</b><p>' + esc(pillEffect(pill)) + '</p></section>' +
      '<section><b>Phẩm chất</b><p>' + esc(item.quality || pill.quality || 'Thường') + '</p></section>' +
      '<section><b>Ghi chú</b><p>' + esc(pill.description || 'Bấm dùng để vận hóa đan lực.') + '</p></section>' +
      '</div><div class="dao-modal-actions"><button class="primary" data-use-pill="' + esc(item.id) + '">Dùng Đan</button></div>';
    openDaoModal(html);
    var btn = q('dao-modal-body')?.querySelector('[data-use-pill]'); if (btn) btn.addEventListener('click', async function(e){ closeDaoModal(); await usePill(e.currentTarget.dataset.usePill); });
  };
  renderActivityLog = window.renderActivityLog = function(){
    var box = q('activity-log-list'); if (!box) return;
    box.classList.add('dao-log-scroll');
    var logs = Array.isArray(window.playerData?.activityLog) ? window.playerData.activityLog : [];
    if (!logs.length) { box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>'; return; }
    box.innerHTML = logs.map(function(item){
      var time = item.at ? new Date(Number(item.at)).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit', second:'2-digit'}) : '';
      return '<article class="dao-log-row"><div class="dao-log-top"><b>' + esc(item.categoryLabel || item.category || 'Thiên Cơ') + '</b><span>' + esc(time) + '</span></div><div>' + esc(item.text || item.message || 'Đạo hành biến động.') + '</div>' + (item.detail ? '<p>' + esc(item.detail) + '</p>' : '') + '</article>';
    }).join('');
  };
  renderAlchemy = window.renderAlchemy = function(){
    if (typeof setText === 'function') setText('alchemy-bonus', '+' + num(window.playerData?.cave?.alchemyBonus || 0) + '%');
    var recipes = list('recipes').length ? list('recipes') : (window.playerData?.recipes || []);
    var recipeBox = q('recipe-list');
    if (recipeBox) {
      recipeBox.classList.add('alchemy-compact-grid');
      recipeBox.innerHTML = recipes.length ? recipes.map(function(r){
        var pill = findMeta(r.pillId || r.resultId || r.outputId) || {};
        return '<button class="dao-mini-card" data-open-recipe="' + esc(r.id) + '"><div><b>' + esc(r.name || pill.name || r.id) + '</b><span>' + esc(secText(r.durationMs || r.duration || r.craftTimeMs)) + '</span></div><p>' + esc((pillEffect(pill) || r.description || 'Xem chi tiết công thức').slice(0, 96)) + '</p><em>Ấn để xem đan phương</em></button>';
      }).join('') : '<p class="empty">Chưa có công thức luyện đan.</p>';
      recipeBox.querySelectorAll('[data-open-recipe]').forEach(function(btn){ btn.addEventListener('click', function(){ openRecipePopup(btn.dataset.openRecipe); }); });
    }
    var pills = (window.playerData?.inventory || []).filter(function(item){ return item.basePillId || item.pillId || String(item.id || '').toLowerCase().includes('dan'); });
    var pillBox = q('pill-list');
    if (pillBox) {
      pillBox.classList.add('alchemy-compact-grid');
      pillBox.innerHTML = pills.length ? pills.map(function(item){
        var pill = pillMetaForItem(item);
        return '<button class="dao-mini-card" data-open-pill="' + esc(item.id) + '"><div><b>' + esc(item.name || pill.name || item.id) + '</b><span>x' + num(item.amount || item.count || 1) + '</span></div><p>' + esc((pillEffect(pill) || 'Xem công hiệu').slice(0, 96)) + '</p><em>Ấn để xem chi tiết</em></button>';
      }).join('') : '<p class="empty">Chưa có đan dược.</p>';
      pillBox.querySelectorAll('[data-open-pill]').forEach(function(btn){ btn.addEventListener('click', function(){ openPillPopup(btn.dataset.openPill); }); });
    }
  };
})();
/* DAO_UI_REAL_V6_END */


/* DAO_ALCHEMY_REAL_POPUP_V9_START */
(function DaoAlchemyRealPopupV9() {
  const REALMS = [
    { level: 1, name: 'Luyện Khí' },
    { level: 2, name: 'Trúc Cơ' },
    { level: 3, name: 'Kim Đan' },
    { level: 4, name: 'Nguyên Anh' },
    { level: 5, name: 'Hóa Thần' },
    { level: 6, name: 'Luyện Hư' },
    { level: 7, name: 'Hợp Thể' },
    { level: 8, name: 'Đại Thừa' },
    { level: 9, name: 'Độ Kiếp' },
  ];

  function q(id) { return document.getElementById(id); }
  function safe(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  }
  function numberText(value) {
    if (typeof fmt === 'function') return fmt(value);
    return Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
  }
  function metaList(name) {
    if (typeof metaData !== 'undefined' && Array.isArray(metaData?.[name])) return metaData[name];
    if (typeof window !== 'undefined' && Array.isArray(window.metaData?.[name])) return window.metaData[name];
    if (typeof playerData !== 'undefined' && Array.isArray(playerData?.[name])) return playerData[name];
    return [];
  }
  function allMetaItems() {
    return []
      .concat(metaList('materials'))
      .concat(metaList('herbs'))
      .concat(metaList('pills'))
      .concat(metaList('lifespanPills'))
      .concat(metaList('items'))
      .filter(Boolean);
  }
  function findMeta(id) {
    if (!id) return null;
    return allMetaItems().find(item => String(item.id) === String(id)) || null;
  }
  function itemName(id) {
    const item = findMeta(id);
    if (item?.name) return item.name;
    if (typeof currencyName === 'function') return currencyName(id);
    return id || '-';
  }
  function timeText(msOrSec) {
    let sec = Number(msOrSec || 0);
    if (sec > 1000) sec = Math.ceil(sec / 1000);
    sec = Math.ceil(sec);
    if (sec <= 0) return 'Tức thời';
    if (sec < 60) return `${sec} giây`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m < 60) return s ? `${m} phút ${s} giây` : `${m} phút`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm ? `${h} giờ ${rm} phút` : `${h} giờ`;
  }
  function currentAlchemyLevel() {
    const a = playerData?.alchemy || playerData?.alchemyState || {};
    return Number(a.level || a.rank || playerData?.alchemyLevel || 1) || 1;
  }
  function recipes() {
    const fromMeta = metaList('recipes');
    const fromPlayer = Array.isArray(playerData?.recipes) ? playerData.recipes : [];
    const seen = new Set();
    return fromMeta.concat(fromPlayer).filter(recipe => {
      if (!recipe || !recipe.id || seen.has(recipe.id)) return false;
      seen.add(recipe.id);
      return true;
    });
  }
  function recipeLevel(recipe) {
    const direct = recipe?.alchemyLevel ?? recipe?.requiredAlchemyLevel ?? recipe?.danSuLevel ?? recipe?.requiredDanSu ?? recipe?.requiredRank ?? recipe?.level ?? recipe?.rank;
    const n = Number(direct);
    if (Number.isFinite(n) && n > 0) return Math.max(1, Math.min(9, Math.round(n)));

    const text = [
      recipe?.realmName, recipe?.realm, recipe?.requiredRealmName, recipe?.requiredRealm,
      recipe?.alchemistRankName, recipe?.rankName, recipe?.name, recipe?.id
    ].filter(Boolean).join(' ').toLowerCase();

    const aliases = [
      ['luyện khí', 'luyen khi', 'luyen_khi'],
      ['trúc cơ', 'truc co', 'truc_co'],
      ['kim đan', 'kim dan', 'kim_dan'],
      ['nguyên anh', 'nguyen anh', 'nguyen_anh'],
      ['hóa thần', 'hoa than', 'hoa_than'],
      ['luyện hư', 'luyen hu', 'luyen_hu'],
      ['hợp thể', 'hop the', 'hop_the'],
      ['đại thừa', 'dai thua', 'dai_thua'],
      ['độ kiếp', 'do kiep', 'do_kiep']
    ];
    const idx = aliases.findIndex(group => group.some(alias => text.includes(alias)));
    return idx >= 0 ? idx + 1 : 1;
  }
  function pillMetas() {
    const seen = new Set();
    return metaList('lifespanPills').concat(metaList('pills')).filter(pill => {
      if (!pill || !pill.id || seen.has(pill.id)) return false;
      seen.add(pill.id);
      return true;
    });
  }
  function findPill(id) {
    if (!id) return null;
    const cleanId = String(id).replace(/_(thuong|tot|cuc_pham|thuong_pham|trung_pham|cao_pham)$/i, '');
    return pillMetas().find(p => String(p.id) === String(id) || String(p.id) === cleanId) || findMeta(id);
  }
  function outputPill(recipe) {
    return findPill(recipe?.pillId || recipe?.resultPillId || recipe?.resultId || recipe?.outputId || recipe?.itemId) || null;
  }
  function materialList(recipe) {
    const arr = recipe?.ingredients || recipe?.materials || recipe?.costItems || recipe?.requires || [];
    return Array.isArray(arr) ? arr : [];
  }
  function materialHtml(recipe) {
    const mats = materialList(recipe);
    const rows = mats.map(mat => {
      const id = mat.id || mat.itemId || mat.materialId || mat.herbId || mat.currencyId || mat.currency;
      const amount = mat.amount || mat.count || mat.qty || 1;
      return `<div class="alchemy-material-row"><span>${safe(itemName(id))}</span><b>x${numberText(amount)}</b></div>`;
    });
    const cost = recipe?.cost ?? recipe?.linhThachCost ?? recipe?.spiritStoneCost;
    if (cost) rows.push(`<div class="alchemy-material-row"><span>Sơ Linh Thạch</span><b>x${numberText(cost)}</b></div>`);
    return rows.length ? rows.join('') : '<p class="alchemy-empty-line">Không yêu cầu nguyên liệu.</p>';
  }
  function successText(recipe) {
    const raw = recipe?.successRate ?? recipe?.successChance ?? recipe?.baseSuccessRate ?? recipe?.rate ?? recipe?.chance;
    const n = Number(raw);
    if (!Number.isFinite(n)) return 'Theo cảnh giới Đan Sư';
    return (n <= 1 ? Math.round(n * 100) : Math.round(n)) + '%';
  }
  function effectText(pill) {
    const labels = {
      cultivationSpeedBonus: 'Tốc độ tu luyện',
      auraBonus: 'Linh khí',
      tuViBonus: 'Tu vi',
      tuViGainBonus: 'Tu vi',
      tuViGainPerSecond: 'Tu vi mỗi giây',
      breakthroughBonus: 'Tỷ lệ đột phá',
      breakthroughRateBonus: 'Tỷ lệ đột phá',
      hpBonus: 'Sinh mệnh',
      maxHpBonus: 'Sinh mệnh tối đa',
      atkBonus: 'Công kích',
      defBonus: 'Phòng ngự',
      bodyExpBonus: 'Kinh nghiệm luyện thể',
      soulExpBonus: 'Kinh nghiệm luyện hồn',
      soulPowerBonus: 'Hồn lực',
      critBonus: 'Bạo kích',
      damageMultiplier: 'Hệ số sát thương',
      extraDamage: 'Sát thương thêm',
    };
    const out = [];
    if (pill?.description) out.push(pill.description);
    if (pill?.effectText) out.push(pill.effectText);
    if (pill?.addYears) out.push(`Tăng ${numberText(pill.addYears)} năm thọ nguyên`);
    if (pill?.durationMs || pill?.durationSeconds) out.push(`Hiệu lực ${timeText(pill.durationMs || pill.durationSeconds)}`);
    if (pill?.maxUses) out.push(`Giới hạn ${numberText(pill.maxUses)} lần dùng`);
    if (pill?.realmMinOrder) out.push(`Yêu cầu cảnh giới bậc ${numberText(pill.realmMinOrder)} trở lên`);
    Object.entries(pill?.effects || pill?.effect || pill?.stats || {}).forEach(([key, value]) => {
      let shown = value;
      if (typeof value === 'number') shown = Math.abs(value) <= 1 ? `${Math.round(value * 100)}%` : numberText(value);
      out.push(`${labels[key] || key}: ${shown}`);
    });
    return [...new Set(out.filter(Boolean))].join(' · ') || 'Công hiệu chưa được khai mở.';
  }
  function getInventoryPills() {
    const ids = new Set(pillMetas().map(p => String(p.id)));
    const inv = Array.isArray(playerData?.inventory) ? playerData.inventory : [];
    return inv.filter(item => {
      if (!item) return false;
      const id = String(item.id || '').toLowerCase();
      const name = String(item.name || '').toLowerCase();
      const type = String(item.type || item.category || item.kind || '').toLowerCase();
      const base = item.basePillId || item.pillId || item.pillBaseId;

      if (id.includes('hat_giong') || id.includes('seed') || id.includes('giong')) return false;
      if (name.includes('hạt giống') || name.includes('hat giống') || name.includes('seed')) return false;
      if (type.includes('seed') || type.includes('herb') || type.includes('material') || type.includes('nguyen_lieu') || type.includes('duoc_lieu')) return false;

      if (base) return true;
      if (ids.has(String(item.id))) return true;
      if (type === 'pill' || type === 'dan' || type.includes('alchemy_pill')) return true;
      return /(^|\s)(đan|dan)(\s|$)/i.test(item.name || '');
    });
  }
  function ensureModal() {
    let modal = q('alchemy-popup');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'alchemy-popup';
    modal.className = 'alchemy-popup hidden';
    modal.innerHTML = `
      <div class="alchemy-popup-mask" data-alchemy-close></div>
      <section class="alchemy-popup-box" role="dialog" aria-modal="true">
        <button type="button" class="alchemy-popup-close" data-alchemy-close>×</button>
        <div id="alchemy-popup-body"></div>
      </section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', ev => {
      if (ev.target.closest('[data-alchemy-close]')) closeAlchemyPopup();
    });
    document.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') closeAlchemyPopup();
    });
    return modal;
  }
  function openAlchemyPopup(html) {
    const modal = ensureModal();
    const body = q('alchemy-popup-body');
    if (body) body.innerHTML = html;
    modal.classList.remove('hidden');
    document.body.classList.add('alchemy-popup-open');
  }
  function closeAlchemyPopup() {
    const modal = q('alchemy-popup');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('alchemy-popup-open');
  }
  window.closeAlchemyPopup = closeAlchemyPopup;

  function openRealmPopup(level) {
    const realm = REALMS.find(r => r.level === Number(level)) || REALMS[0];
    const list = recipes().filter(recipe => recipeLevel(recipe) === realm.level);
    const unlocked = currentAlchemyLevel() >= realm.level;
    const body = `
      <header class="alchemy-popup-head">
        <span>Đan Các · Cảnh giới Đan Sư</span>
        <h2>${safe(realm.name)}</h2>
        <p>${unlocked ? 'Chọn một phương đan để xem chi tiết hoặc khai lò luyện chế.' : 'Cảnh giới Đan Sư hiện tại chưa đủ để luyện nhóm phương đan này.'}</p>
      </header>
      <div class="alchemy-recipe-popup-grid">
        ${list.length ? list.map(recipeCardInPopup).join('') : '<p class="empty">Cảnh giới này chưa có phương đan.</p>'}
      </div>`;
    openAlchemyPopup(body);
    q('alchemy-popup-body')?.querySelectorAll('[data-recipe-detail]').forEach(btn => {
      btn.addEventListener('click', () => openRecipeDetail(btn.dataset.recipeDetail));
    });
    q('alchemy-popup-body')?.querySelectorAll('[data-recipe-craft]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          closeAlchemyPopup();
          await craftPill(btn.dataset.recipeCraft);
        } catch (err) { alert(err.message); }
      });
    });
  }
  window.openAlchemyRealmPopup = openRealmPopup;

  function recipeCardInPopup(recipe) {
    const pill = outputPill(recipe);
    return `
      <article class="alchemy-popup-recipe-card">
        <div class="alchemy-card-title-row">
          <h3>${safe(recipe.name || pill?.name || recipe.id)}</h3>
          <span>${safe(timeText(recipe.durationMs || recipe.durationSeconds || recipe.craftTime || recipe.craftTimeMs))}</span>
        </div>
        <p>${safe(effectText(pill || recipe))}</p>
        <div class="alchemy-card-meta">
          <span>Tỷ lệ: ${safe(successText(recipe))}</span>
          <span>${materialList(recipe).length} linh tài</span>
        </div>
        <div class="alchemy-card-actions">
          <button type="button" class="ghost" data-recipe-detail="${safe(recipe.id)}">Chi tiết</button>
          <button type="button" data-recipe-craft="${safe(recipe.id)}" ${currentAlchemyLevel() >= recipeLevel(recipe) ? '' : 'disabled'}>Luyện</button>
        </div>
      </article>`;
  }
  function openRecipeDetail(recipeId) {
    const recipe = recipes().find(r => String(r.id) === String(recipeId));
    if (!recipe) return;
    const pill = outputPill(recipe);
    const body = `
      <header class="alchemy-popup-head">
        <span>Chi tiết Đan Phương</span>
        <h2>${safe(recipe.name || pill?.name || recipe.id)}</h2>
        <p>Thành đan: ${safe(pill?.name || recipe.pillId || recipe.resultId || 'Chưa rõ')}</p>
      </header>
      <div class="alchemy-detail-grid">
        <section>
          <h3>Công hiệu</h3>
          <p>${safe(effectText(pill || recipe))}</p>
        </section>
        <section>
          <h3>Đạo hạnh luyện chế</h3>
          <div class="alchemy-stat-line"><span>Thời gian</span><b>${safe(timeText(recipe.durationMs || recipe.durationSeconds || recipe.craftTime || recipe.craftTimeMs))}</b></div>
          <div class="alchemy-stat-line"><span>Tỷ lệ thành công</span><b>${safe(successText(recipe))}</b></div>
          <div class="alchemy-stat-line"><span>Yêu cầu Đan Sư</span><b>${safe(REALMS[recipeLevel(recipe)-1]?.name || 'Không rõ')}</b></div>
        </section>
        <section class="wide">
          <h3>Linh tài</h3>
          <div class="alchemy-material-list">${materialHtml(recipe)}</div>
        </section>
      </div>
      <div class="alchemy-popup-actions">
        <button type="button" data-recipe-craft="${safe(recipe.id)}" ${currentAlchemyLevel() >= recipeLevel(recipe) ? '' : 'disabled'}>Khai Lò Luyện Đan</button>
        <button type="button" class="ghost" data-back-realm="${recipeLevel(recipe)}">Quay lại</button>
      </div>`;
    openAlchemyPopup(body);
    q('alchemy-popup-body')?.querySelector('[data-recipe-craft]')?.addEventListener('click', async btn => {
      const id = btn.currentTarget.dataset.recipeCraft;
      closeAlchemyPopup();
      try { await craftPill(id); } catch (err) { alert(err.message); }
    });
    q('alchemy-popup-body')?.querySelector('[data-back-realm]')?.addEventListener('click', btn => openRealmPopup(btn.currentTarget.dataset.backRealm));
  }
  function openPillDetail(itemId) {
    const item = getInventoryPills().find(p => String(p.id) === String(itemId));
    if (!item) return;
    const pill = findPill(item.basePillId || item.pillId || item.id) || item;
    const body = `
      <header class="alchemy-popup-head">
        <span>Linh Đan</span>
        <h2>${safe(item.name || pill.name || item.id)}</h2>
        <p>Số lượng: ${numberText(item.amount || item.count || 1)} · Phẩm chất: ${safe(item.quality || pill.quality || 'Thường')}</p>
      </header>
      <div class="alchemy-detail-grid">
        <section class="wide">
          <h3>Công hiệu</h3>
          <p>${safe(effectText(pill))}</p>
        </section>
        <section>
          <h3>Thông tin</h3>
          <div class="alchemy-stat-line"><span>Số lượng</span><b>${numberText(item.amount || item.count || 1)}</b></div>
          <div class="alchemy-stat-line"><span>Hiệu lực</span><b>${safe(pill.durationMs || pill.durationSeconds ? timeText(pill.durationMs || pill.durationSeconds) : 'Dùng ngay')}</b></div>
        </section>
      </div>
      <div class="alchemy-popup-actions">
        <button type="button" data-use-pill="${safe(item.id)}">Dùng Đan</button>
      </div>`;
    openAlchemyPopup(body);
    q('alchemy-popup-body')?.querySelector('[data-use-pill]')?.addEventListener('click', async btn => {
      const id = btn.currentTarget.dataset.usePill;
      closeAlchemyPopup();
      try { await usePill(id); } catch (err) { alert(err.message); }
    });
  }
  window.openAlchemyPillPopup = openPillDetail;

  function renderAlchemyV9() {
    if (!playerData) return;
    if (typeof setText === 'function') setText('alchemy-bonus', `+${numberText(playerData.cave?.alchemyBonus || 0)}%`);

    const recipeBox = q('recipe-list');
    const allRecipes = recipes();
    const level = currentAlchemyLevel();

    if (recipeBox) {
      recipeBox.className = 'alchemy-realm-grid';
      recipeBox.innerHTML = REALMS.map(realm => {
        const count = allRecipes.filter(recipe => recipeLevel(recipe) === realm.level).length;
        const unlocked = level >= realm.level;
        return `
          <button type="button" class="alchemy-realm-card ${unlocked ? 'unlocked' : 'locked'}" data-open-alchemy-realm="${realm.level}">
            <div>
              <h3>${safe(realm.name)}</h3>
              <p>Đan sư cấp ${realm.level} · đã mở ${count}/6 phương đan</p>
            </div>
            <span>${unlocked ? 'Mở' : 'Chưa mở'}</span>
          </button>`;
      }).join('');
      recipeBox.querySelectorAll('[data-open-alchemy-realm]').forEach(btn => {
        btn.addEventListener('click', () => openRealmPopup(btn.dataset.openAlchemyRealm));
      });
    }

    const pillBox = q('pill-list');
    const pills = getInventoryPills();
    if (pillBox) {
      pillBox.className = 'alchemy-pill-grid';
      pillBox.innerHTML = pills.length ? pills.map(item => {
        const pill = findPill(item.basePillId || item.pillId || item.id) || item;
        return `
          <button type="button" class="alchemy-pill-card" data-open-alchemy-pill="${safe(item.id)}">
            <div class="pill-card-main">
              <h3>${safe(item.name || pill.name || item.id)}</h3>
              <p>${safe(item.quality || pill.quality || 'Đan dược')} · Số lượng: ${numberText(item.amount || item.count || 1)}</p>
            </div>
            <span>Xem</span>
          </button>`;
      }).join('') : '<p class="empty">Chưa có đan dược.</p>';

      pillBox.querySelectorAll('[data-open-alchemy-pill]').forEach(btn => {
        btn.addEventListener('click', () => openPillDetail(btn.dataset.openAlchemyPill));
      });
    }
  }

  renderAlchemy = renderAlchemyV9;
  window.renderAlchemy = renderAlchemyV9;
})();
/* DAO_ALCHEMY_REAL_POPUP_V9_END */

