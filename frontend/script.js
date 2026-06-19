const API_BASE = '';

const $ = id => document.getElementById(id);
const fmt = value => Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
const pct = (cur, max) => max > 0 && Number.isFinite(max) ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0;

let username = localStorage.getItem('tuTienUsername') || '';
let playerData = null;
let metaData = null;
let refreshTimer = null;
let selectedHerbId = null;

const pageInfo = {
  overview: ['Tổng Quan', 'Theo dõi cảnh giới, chiến lực và tài nguyên.'],
  cultivation: ['Tu Luyện', 'Điều phối tu luyện, luyện thể và luyện hồn.'],
  combat: ['Combat', 'Tự động đánh quái theo map đã mở.'],
  skills: ['Công Pháp', 'Công pháp và vũ kỹ cơ bản của ba hệ.'],
  alchemy: ['Đan Dược', 'Luyện đan, dùng đan và quản lý buff.'],
  cave: ['Động Phủ', 'Linh khí, phòng luyện đan và dược viên.'],
  inventory: ['Túi Đồ', 'Vật phẩm, đan dược và nguyên liệu.'],
};

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function setWidth(id, value) {
  const el = $(id);
  if (el) el.style.width = `${Math.max(0, Math.min(100, value))}%`;
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
  $('login-screen').classList.add('hidden');
  $('app').classList.remove('hidden');
}

function showLogin() {
  $('app').classList.add('hidden');
  $('login-screen').classList.remove('hidden');
}

async function loadMeta() {
  try {
    const data = await api('/api/meta');
    metaData = data;
  } catch (err) {
    console.warn('Không tải được meta:', err.message);
  }
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
  const data = await api(`/api/player/${encodeURIComponent(username)}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  playerData = data.player;
  renderAll();
}

function bindEvents() {
  $('login-btn').addEventListener('click', login);
  $('username-input').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  $('logout-btn').addEventListener('click', logout);
  $('refresh-btn').addEventListener('click', loadPlayer);
  $('toggle-auto-btn').addEventListener('click', toggleAutoFight);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab));
  });
}

async function login() {
  const name = $('username-input').value.trim() || 'dao_huu';
  username = name;
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

function renderOverview() {
  const c = playerData.cultivation || {};
  const combat = playerData.combat || {};
  const root = playerData.spiritRootDisplay || {};

  setText('world-name', c.info?.worldName || c.world || '-');
  setText('realm-name', c.realmName || '-');
  setText('tuvi-text', `${fmt(c.exp ?? c.tuVi)} / ${fmt(c.maxExp ?? c.maxTuVi)}`);
  setWidth('cultivation-progress', pct(c.exp ?? c.tuVi, c.maxExp ?? c.maxTuVi));

  setText('hp-text', `${fmt(combat.hp)} / ${fmt(combat.maxHp)}`);
  setText('atk-text', fmt(combat.atk));
  setText('def-text', fmt(combat.def));

  setText('spirit-root-name', root.name || 'Chưa ngộ linh căn');
  setText('spirit-root-desc', root.description || root.desc || '-');

  setText('body-rank', playerData.bodyCultivation?.info?.name || playerData.bodyCultivation?.name || '-');
  setText('soul-rank', playerData.soulCultivation?.info?.name || playerData.soulCultivation?.name || '-');

  const currencies = playerData.currencies || {};
  $('currency-list').innerHTML = Object.entries(currencies)
    .filter(([, amount]) => Number(amount) > 0)
    .map(([id, amount]) => `<span class="chip">${id}: <b>${fmt(amount)}</b></span>`)
    .join('') || '<span class="muted">Chưa có tài nguyên.</span>';
}

function renderCultivation() {
  const c = playerData.cultivation || {};
  setText('cultivation-title', `${c.realmName || '-'} ${Math.round(pct(c.exp ?? c.tuVi, c.maxExp ?? c.maxTuVi))}%`);
  setWidth('cultivation-progress-2', pct(c.exp ?? c.tuVi, c.maxExp ?? c.maxTuVi));
  setText('cult-world', c.info?.worldName || c.world || '-');
  setText('cult-type', c.info?.progressType || '-');
  setText('tuvi-rate', `${fmt(playerData.pillEffects?.tuViGainPerSecond || 1)}/s`);

  const state = playerData.cultivationFocusState || { selected: ['main'], limit: 1, options: ['main', 'body', 'soul'] };
  setText('focus-limit', `Đang tu ${state.selected.length}/${state.limit} loại`);
  setText('focus-note', state.limit === 1 ? 'Chưa đủ cảnh giới, chỉ được chọn 1 loại.' : `Có thể đồng tu ${state.limit} loại.`);

  $('focus-buttons').innerHTML = state.options.map(type => {
    const active = state.selected.includes(type) ? 'active' : '';
    return `<button class="focus-btn ${active}" data-focus="${type}">${systemName(type)}</button>`;
  }).join('');
  document.querySelectorAll('[data-focus]').forEach(btn => {
    btn.addEventListener('click', () => toggleFocus(btn.dataset.focus));
  });

  const buffs = playerData.activePillBuffs || [];
  $('pill-buffs').innerHTML = buffs.length ? buffs.map(buff => card(buff.name || buff.id, `Còn hiệu lực: ${buff.endsAt ? new Date(buff.endsAt).toLocaleTimeString('vi-VN') : '-'}`)).join('') : '<p class="muted">Chưa có buff đan.</p>';
}

async function toggleFocus(type) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/cultivation/focus`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
    playerData = data.player;
    renderAll();
  } catch (err) {
    alert(err.message);
  }
}

async function toggleAutoFight() {
  try {
    await postPlayer({ autoFight: !playerData.autoFight });
  } catch (err) {
    alert(err.message);
  }
}

function renderCombat() {
  const map = playerData.currentMap || {};
  const state = playerData.combatState || {};
  const combat = playerData.combat || {};
  const monster = state.currentMonster || {};

  setText('combat-zone', map.name || '-');
  setText('monster-name', monster.name || 'Không rõ');
  setText('combat-status', state.status || '-');
  setText('combat-player-hp', `${fmt(combat.hp)} / ${fmt(combat.maxHp)}`);
  setText('combat-monster-hp', `${fmt(state.monsterHp)} / ${fmt(state.monsterMaxHp)}`);
  setWidth('player-hp-bar', pct(combat.hp, combat.maxHp));
  setWidth('monster-hp-bar', pct(state.monsterHp, state.monsterMaxHp));
  setText('auto-fight-status', playerData.autoFight ? 'Tự đánh đang bật' : 'Tự đánh đang tắt');
  setText('kill-count', fmt(playerData.stats?.totalKills || 0));
  setText('death-penalty', `${fmt(state.deathPenaltyPercent || 0)}%`);

  $('map-list').innerHTML = (playerData.unlockedMaps || []).map(item => {
    const active = item.id === playerData.currentZone ? 'active' : '';
    return `<button class="map-item ${active}" data-map="${item.id}">
      <strong>${item.name}</strong>
      <span>${item.worldName || '-'} · ${item.realmName || '-'}</span>
      <small>${item.description || ''}</small>
    </button>`;
  }).join('') || '<p class="muted">Chưa mở map.</p>';
  document.querySelectorAll('[data-map]').forEach(btn => btn.addEventListener('click', () => changeMap(btn.dataset.map)));

  const logs = state.logs || [];
  $('combat-logs').innerHTML = logs.length ? logs.map(line => `<div>${line}</div>`).join('') : '<p class="muted">Chưa có nhật ký.</p>';
}

async function changeMap(mapId) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/zone`, {
      method: 'POST',
      body: JSON.stringify({ mapId }),
    });
    playerData = data.player;
    renderAll();
  } catch (err) {
    alert(err.message);
  }
}

function card(title, body = '', meta = '') {
  return `<div class="mini-card"><div><strong>${title}</strong>${body ? `<p>${body}</p>` : ''}</div>${meta ? `<span>${meta}</span>` : ''}</div>`;
}

function effectText(effects = {}) {
  const entries = Object.entries(effects);
  if (!entries.length) return 'Chưa có chỉ số.';
  return entries.map(([k, v]) => `${k}: ${typeof v === 'number' ? (Math.abs(v) < 1 ? `${Math.round(v * 100)}%` : v) : v}`).join(' · ');
}

function renderSkills() {
  const techniques = playerData.techniques?.learned || [];
  const martial = playerData.martialSkills?.learned || [];

  $('technique-list').innerHTML = techniques.length ? techniques.map(item => card(
    `${item.name} <em>${systemName(item.system)}</em>`,
    `${item.description || ''}<br><small>${effectText(item.effects)}</small>`,
    `Bậc ${item.rank || 1}`
  )).join('') : '<p class="muted">Chưa học công pháp.</p>';

  $('martial-list').innerHTML = martial.length ? martial.map(item => card(
    `${item.name} <em>${systemName(item.system)}</em>`,
    `${item.description || ''}<br><small>${effectText(item.effects)}</small>`,
    `Bậc ${item.rank || 1}`
  )).join('') : '<p class="muted">Chưa học vũ kỹ.</p>';

  const skills = Array.isArray(playerData.skills?.learned) ? playerData.skills.learned : [];
  $('skill-list').innerHTML = skills.length ? skills.map(item => card(item.name || item.id, item.description || '', item.level ? `Lv.${item.level}` : '')).join('') : '<p class="muted">Chưa có skill linh căn.</p>';
}

function renderAlchemy() {
  setText('alchemy-bonus', `+${fmt(playerData.cave?.alchemyBonus || 0)}%`);
  $('recipe-list').innerHTML = '<p class="muted">Công thức luyện đan sẽ hiển thị ở bước sau.</p>';
  const pills = (playerData.inventory || []).filter(item => item.basePillId || String(item.id || '').includes('dan'));
  $('pill-list').innerHTML = pills.length ? pills.map(item => card(item.name || item.id, `Số lượng: ${fmt(item.amount)}`, '<button>Dùng</button>')).join('') : '<p class="muted">Chưa có đan dược.</p>';
}

function renderCave() {
  const cave = playerData.cave || {};
  setText('cave-level', `Cấp ${cave.level || 1}`);
  setText('cave-aura', fmt(cave.resources?.aura || 0));
  setText('cave-rate', `${fmt(cave.auraPerSecond || 0)}/s`);
  setText('cave-alchemy', `${fmt(cave.alchemyBonus || 0)}%`);

  const buildings = cave.buildings || {};
  $('cave-buildings').innerHTML = Object.entries(buildings).map(([id, building]) => card(building.name || id, `Cấp ${building.level || 1}`)).join('') || '<p class="muted">Chưa có kiến trúc.</p>';

  const plots = playerData.herbPlots || [];
  $('herb-plots').innerHTML = plots.length ? plots.map((plot, idx) => {
    const name = plot.herbName || plot.herbId || 'Ô trống';
    return `<button class="plot" data-plot="${idx}"><strong>Ô ${idx + 1}</strong><span>${name}</span></button>`;
  }).join('') : '<p class="muted">Chưa mở dược viên.</p>';
}

function renderInventory() {
  const inv = playerData.inventory || [];
  setText('inventory-count', `${inv.length} item`);
  $('inventory-list').innerHTML = inv.length ? inv.map(item => card(item.name || item.id, `Số lượng: ${fmt(item.amount)}`, item.quality || '')).join('') : '<p class="muted">Túi đồ trống.</p>';
}

window.addEventListener('DOMContentLoaded', async () => {
  bindEvents();
  if (username) {
    $('username-input').value = username;
    showApp();
    await loadMeta();
    await loadPlayer();
    startTimer();
  }
});
