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
  try { metaData = await api('/api/meta'); window.metaData = metaData; } catch (err) { console.warn(err.message); }
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
  renderActivityLog();
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
  const box = ensureActionLogPanel?.() || ensureActivityPanel?.() || $('activity-log-list');
  if (!box) return;
  const panel = box.closest('.panel') || box.parentElement;
  if (panel) panel.classList.add('activity-panel');
  box.classList.add('activity-log-list', 'dao-scroll-log');

  const logs = Array.isArray(playerData?.activityLog) ? playerData.activityLog : [];
  if (!logs.length) {
    box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>';
    return;
  }

  box.innerHTML = logs.map(item => {
    const category = escapeHtml(item.categoryLabel || item.category || 'Thiên Cơ');
    const text = escapeHtml(item.text || item.message || 'Đạo hành biến động.');
    const detail = item.detail ? '<p class="dao-log-detail">' + escapeHtml(item.detail) + '</p>' : '';
    const time = escapeHtml(formatActivityTime(item.at) || formatServerActionTime?.(item.at) || '');
    const cls = escapeHtml(item.category || 'system');
    return '<article class="dao-log-row activity-' + cls + '"><div class="dao-log-head"><b>' + category + '</b><span>' + time + '</span></div><div class="dao-log-text">' + text + '</div>' + detail + '</article>';
  }).join('');
}
window.renderActivityLog = renderActivityLog;

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

function daoAlchemyRecipes() {
  const metaRecipes = findMetaList('recipes');
  if (metaRecipes.length) return metaRecipes;
  return Array.isArray(playerData?.recipes) ? playerData.recipes : [];
}

function daoAlchemyPillMetas() {
  return [...findMetaList('lifespanPills'), ...findMetaList('pills')];
}

function daoAlchemyFindPill(id) {
  if (!id) return null;
  const clean = String(id).replace(/_(thuong|tot|cuc_pham)$/i, '');
  return daoAlchemyPillMetas().find(p => p && (p.id === id || p.id === clean)) || getMetaItem(id) || getMetaItem(clean);
}

function daoAlchemyRecipePill(recipe) {
  return daoAlchemyFindPill(recipe?.pillId || recipe?.resultPillId || recipe?.resultId || recipe?.outputId);
}

function daoAlchemyIngredients(recipe) {
  const list = recipe?.ingredients || recipe?.materials || recipe?.costItems || recipe?.requires || [];
  return Array.isArray(list) ? list : [];
}

function daoAlchemySuccessText(recipe) {
  const rate = recipe?.successRate ?? recipe?.successChance ?? recipe?.baseSuccessRate ?? recipe?.rate ?? recipe?.chance;
  if (rate === undefined || rate === null || rate === '') return 'Theo bậc Đan Sư';
  const n = Number(rate);
  if (!Number.isFinite(n)) return String(rate);
  return (n <= 1 ? Math.round(n * 100) : Math.round(n)) + '%';
}

function daoAlchemyRankText(recipe) {
  return recipe?.alchemistRankName || recipe?.rankName || recipe?.requiredRankName || recipe?.requiredRank || recipe?.requiredAlchemyRank || recipe?.alchemyLevel || recipe?.requiredAlchemyLevel || 'Không ghi yêu cầu';
}

function daoAlchemyCostText(recipe) {
  const cost = recipe?.cost ?? recipe?.lingStoneCost ?? recipe?.spiritStoneCost ?? recipe?.linhThachCost;
  return cost ? fmt(cost) : 'Không tốn';
}

function daoAlchemyInventoryAmount(id) {
  const inv = Array.isArray(playerData?.inventory) ? playerData.inventory : [];
  const item = inv.find(x => x && String(x.id) === String(id));
  return Number(item?.amount || item?.count || 0);
}

function daoAlchemyRecipeSummary(recipe) {
  const ingredients = daoAlchemyIngredients(recipe);
  if (!ingredients.length) return 'Không yêu cầu nguyên liệu';
  return ingredients.slice(0, 2).map(item => {
    const id = item.id || item.itemId || item.materialId || item.herbId || item.currency;
    return `${getItemName(id)} x${fmt(item.amount || item.count || item.qty || 1)}`;
  }).join(', ') + (ingredients.length > 2 ? '...' : '');
}

function daoEnsureDetailModal() {
  let modal = $('dao-detail-modal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'dao-detail-modal';
  modal.className = 'dao-detail-modal hidden';
  modal.innerHTML = '<div class="dao-detail-mask" data-dao-detail-close></div><section class="dao-detail-box" role="dialog" aria-modal="true"><button type="button" class="dao-detail-close" data-dao-detail-close>×</button><div id="dao-detail-content"></div></section>';
  document.body.appendChild(modal);
  modal.addEventListener('click', event => {
    if (event.target?.hasAttribute('data-dao-detail-close')) daoCloseDetailModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') daoCloseDetailModal();
  });
  return modal;
}

function daoOpenDetailModal(html) {
  const modal = daoEnsureDetailModal();
  const content = $('dao-detail-content');
  if (content) content.innerHTML = html;
  modal.classList.remove('hidden');
  document.body.classList.add('dao-modal-open');
}

function daoCloseDetailModal() {
  const modal = $('dao-detail-modal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('dao-modal-open');
}

function daoOpenRecipeDetail(recipeId) {
  const recipe = daoAlchemyRecipes().find(r => String(r.id) === String(recipeId));
  if (!recipe) return alert('Không tìm thấy đan phương.');
  const pill = daoAlchemyRecipePill(recipe) || recipe;
  const ingredients = daoAlchemyIngredients(recipe);
  const canCraft = (playerData?.activeTab || currentTab) === 'alchemy';
  const ingredientHtml = ingredients.length ? ingredients.map(item => {
    const id = item.id || item.itemId || item.materialId || item.herbId || item.currency;
    const need = Number(item.amount || item.count || item.qty || 1);
    const have = daoAlchemyInventoryAmount(id);
    const ok = have >= need;
    return '<div class="dao-material-row ' + (ok ? 'enough' : 'missing') + '"><span>' + escapeHtml(getItemName(id)) + '</span><b>' + fmt(have) + ' / ' + fmt(need) + '</b></div>';
  }).join('') : '<p class="empty">Không yêu cầu nguyên liệu.</p>';

  daoOpenDetailModal(`
    <div class="dao-detail-head">
      <div><span>Đan Phương</span><h2>${escapeHtml(recipe.name || pill.name || recipe.id)}</h2><p>Thành đan: ${escapeHtml(pill.name || recipe.pillId || 'Chưa rõ')}</p></div>
      <b>${escapeHtml(daoAlchemyRankText(recipe))}</b>
    </div>
    <div class="dao-detail-grid">
      <section><h3>Công hiệu</h3><p>${escapeHtml(pillEffectText(pill))}</p></section>
      <section><h3>Luyện chế</h3>
        <div class="dao-stat-row"><span>Thời gian</span><b>${escapeHtml(secondsText(recipe.durationMs || recipe.durationSeconds || recipe.craftTimeMs || recipe.craftTime || 0))}</b></div>
        <div class="dao-stat-row"><span>Tỷ lệ thành công</span><b>${escapeHtml(daoAlchemySuccessText(recipe))}</b></div>
        <div class="dao-stat-row"><span>Linh thạch</span><b>${escapeHtml(daoAlchemyCostText(recipe))}</b></div>
      </section>
      <section class="wide"><h3>Linh tài cần dùng</h3><div class="dao-material-list">${ingredientHtml}</div></section>
    </div>
    <div class="dao-detail-actions"><button type="button" class="primary" data-dao-craft="${escapeHtml(recipe.id)}" ${canCraft ? '' : 'disabled'}>${canCraft ? 'Khai lò luyện đan' : 'Chỉ luyện khi đang ở tab Đan Dược'}</button></div>
  `);
  $('dao-detail-content')?.querySelector('[data-dao-craft]')?.addEventListener('click', () => {
    daoCloseDetailModal();
    craftPill(recipe.id);
  });
}

function daoInventoryPills() {
  const inv = Array.isArray(playerData?.inventory) ? playerData.inventory : [];
  return inv.filter(item => item && (item.basePillId || item.pillId || String(item.id || '').toLowerCase().includes('dan') || String(item.type || '').toLowerCase().includes('pill')));
}

function daoOpenPillDetail(itemId) {
  const item = daoInventoryPills().find(x => String(x.id) === String(itemId));
  if (!item) return alert('Không tìm thấy đan dược.');
  const pill = daoAlchemyFindPill(item.basePillId || item.pillId || item.id) || item;
  const canUse = (playerData?.activeTab || currentTab) === 'alchemy';
  daoOpenDetailModal(`
    <div class="dao-detail-head">
      <div><span>Linh Đan</span><h2>${escapeHtml(item.name || pill.name || item.id)}</h2><p>Số lượng: ${fmt(item.amount || item.count || 1)} · Phẩm chất: ${escapeHtml(item.quality || pill.quality || 'Thường')}</p></div>
      <b>Đan Dược</b>
    </div>
    <div class="dao-detail-grid">
      <section class="wide"><h3>Công hiệu</h3><p>${escapeHtml(pillEffectText(pill))}</p></section>
      <section><h3>Thông tin</h3>
        <div class="dao-stat-row"><span>Số lượng</span><b>${fmt(item.amount || item.count || 1)}</b></div>
        <div class="dao-stat-row"><span>Hiệu lực</span><b>${escapeHtml(pill.durationMs || pill.durationSeconds ? secondsText(pill.durationMs || pill.durationSeconds) : 'Dùng ngay')}</b></div>
      </section>
      <section><h3>Ghi chú</h3><p>Một số linh đan có giới hạn số lần dùng hoặc chỉ hiệu quả ở cảnh giới phù hợp.</p></section>
    </div>
    <div class="dao-detail-actions"><button type="button" class="primary" data-dao-use-pill="${escapeHtml(item.id)}" ${canUse ? '' : 'disabled'}>${canUse ? 'Dùng linh đan' : 'Chỉ dùng khi đang ở tab Đan Dược'}</button></div>
  `);
  $('dao-detail-content')?.querySelector('[data-dao-use-pill]')?.addEventListener('click', () => {
    daoCloseDetailModal();
    usePill(item.id);
  });
}

function renderAlchemy() {
  setText('alchemy-bonus', `+${fmt(playerData.cave?.alchemyBonus || 0)}%`);

  const recipes = daoAlchemyRecipes();
  const recipeBox = $('recipe-list');
  if (recipeBox) {
    recipeBox.className = 'card-list dao-alchemy-grid';
    recipeBox.innerHTML = recipes.length ? recipes.map(recipe => {
      const pill = daoAlchemyRecipePill(recipe) || recipe;
      return `<button type="button" class="dao-alchemy-card" data-recipe-detail="${escapeHtml(recipe.id)}">
        <span class="dao-card-kicker">Đan phương</span>
        <b>${escapeHtml(recipe.name || pill.name || recipe.id)}</b>
        <p>${escapeHtml(daoAlchemyRecipeSummary(recipe))}</p>
        <small>${escapeHtml(secondsText(recipe.durationMs || recipe.durationSeconds || recipe.craftTimeMs || recipe.craftTime || 0))} · Thành công: ${escapeHtml(daoAlchemySuccessText(recipe))}</small>
      </button>`;
    }).join('') : '<p class="empty">Chưa có công thức luyện đan.</p>';
  }

  const pillBox = $('pill-list');
  const pills = daoInventoryPills();
  if (pillBox) {
    pillBox.className = 'card-list dao-alchemy-grid';
    pillBox.innerHTML = pills.length ? pills.map(item => {
      const pill = daoAlchemyFindPill(item.basePillId || item.pillId || item.id) || item;
      return `<button type="button" class="dao-alchemy-card" data-pill-detail="${escapeHtml(item.id)}">
        <span class="dao-card-kicker">Linh đan</span>
        <b>${escapeHtml(item.name || pill.name || item.id)}</b>
        <p>Số lượng: ${fmt(item.amount || item.count || 1)} · ${escapeHtml(item.quality || pill.quality || 'Đan dược')}</p>
        <small>Bấm để xem công hiệu / dùng đan</small>
      </button>`;
    }).join('') : '<p class="empty">Chưa có đan dược.</p>';
  }

  document.querySelectorAll('[data-recipe-detail]').forEach(btn => btn.addEventListener('click', () => daoOpenRecipeDetail(btn.dataset.recipeDetail)));
  document.querySelectorAll('[data-pill-detail]').forEach(btn => btn.addEventListener('click', () => daoOpenPillDetail(btn.dataset.pillDetail)));
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

