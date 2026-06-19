const API_BASE = '';
const $ = id => document.getElementById(id);
const fmt = value => Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
const pct = (cur, max) => max > 0 && Number.isFinite(max) ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0;

let username = localStorage.getItem('tuTienUsername') || '';
let playerData = null;
let metaData = null;
let refreshTimer = null;
const collapsedMapGroups = new Set();

const pageInfo = {
  overview: ['Tổng Quan', 'Chỉ tổng hợp cảnh giới, chiến lực và tài nguyên.'],
  cultivation: ['Tu Luyện', 'Ba thanh tu luyện riêng: Tu Luyện / Luyện Thể / Luyện Hồn.'],
  combat: ['Combat', 'Tự động đánh quái theo map đã mở.'],
  skills: ['Công Pháp', 'Công pháp 3 hệ và 1 vũ kỹ đang trang bị để chiến đấu.'],
  alchemy: ['Đan Dược', 'Luyện đan, dùng đan và quản lý buff.'],
  cave: ['Động Phủ', 'Linh khí, phòng luyện đan và dược viên.'],
  inventory: ['Túi Đồ', 'Tiền tệ, vật phẩm, đan dược và nguyên liệu.'],
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
  return {
    cultivation: 'Tu Luyện',
    body: 'Luyện Thể',
    soul: 'Luyện Hồn',
    main: 'Tu Luyện',
    active: 'Đang dùng',
  }[id] || id || '-';
}

function currencyName(id) {
  return {
    so_linh_thach: 'Sơ Linh Thạch',
    trung_linh_thach: 'Trung Linh Thạch',
    cao_linh_thach: 'Cao Linh Thạch',
    cuc_pham_linh_thach: 'Cực Phẩm Linh Thạch',
    tien_ngoc: 'Tiên Ngọc',
  }[id] || id;
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
  $('login-btn')?.addEventListener('click', login);
  $('username-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  $('logout-btn')?.addEventListener('click', logout);
  $('refresh-btn')?.addEventListener('click', loadPlayer);
  $('toggle-auto-btn')?.addEventListener('click', toggleAutoFight);
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab));
  });
}

async function login() {
  const name = $('username-input')?.value.trim() || 'dao_huu';
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
  setText('tuvi-text', 'Tổng quan chỉ hiển thị cảnh giới');
  setText('hp-text', `${fmt(combat.hp)} / ${fmt(combat.maxHp)}`);
  setText('atk-text', fmt(combat.atk));
  setText('def-text', fmt(combat.def));
  setText('spirit-root-name', root.name || 'Chưa ngộ linh căn');
  setText('spirit-root-desc', root.description || root.desc || '-');
  setText('body-rank', playerData.bodyCultivation?.info?.name || playerData.bodyCultivation?.name || '-');
  setText('soul-rank', playerData.soulCultivation?.info?.name || playerData.soulCultivation?.name || '-');
  const currencies = playerData.currencies || {};
  const html = Object.entries(currencies)
    .filter(([, amount]) => Number(amount) > 0)
    .map(([id, amount]) => `<span class="chip">${currencyName(id)}: ${fmt(amount)}</span>`)
    .join('') || '<span class="muted">Chưa có tài nguyên.</span>';
  if ($('currency-list')) $('currency-list').innerHTML = html;
}

function progressData(type) {
  if (type === 'main') {
    const c = playerData.cultivation || {};
    return {
      title: c.realmName || '-',
      cur: c.exp ?? c.tuVi ?? 0,
      max: c.maxExp ?? c.maxTuVi ?? 100,
      sub: c.info?.worldName || c.world || '-',
    };
  }
  if (type === 'body') {
    const b = playerData.bodyCultivation || {};
    return {
      title: b.info?.name || b.name || 'Luyện Thể',
      cur: b.exp || 0,
      max: b.maxExp || 100,
      sub: 'Khí huyết rèn thân',
    };
  }
  const so = playerData.soulCultivation || {};
  return {
    title: so.info?.name || so.name || 'Luyện Hồn',
    cur: so.exp || 0,
    max: so.maxExp || 100,
    sub: 'Thần thức dưỡng hồn',
  };
}

function renderCultivation() {
  const c = playerData.cultivation || {};
  setText('cultivation-title', `${c.realmName || '-'} · ${fmt(c.exp ?? c.tuVi)} / ${fmt(c.maxExp ?? c.maxTuVi)}`);
  setText('cult-world', c.info?.worldName || c.world || '-');
  setText('cult-type', c.info?.progressType || '-');
  setText('tuvi-rate', `${fmt(playerData.pillEffects?.tuViGainPerSecond || 1)}/s`);

  const state = playerData.cultivationFocusState || { selected: ['main'], limit: 1, options: ['main', 'body', 'soul'] };
  setText('focus-limit', `Đang tu ${state.selected.length}/${state.limit} loại`);
  setText('focus-note', state.limit === 1 ? 'Nhấn thanh nào thì thanh đó chạy. Chưa đủ cảnh giới chỉ được chọn 1 loại.' : `Có thể đồng tu ${state.limit} loại.`);

  const progressWrap = $('cultivation-progress-panels');
  if (progressWrap) {
    progressWrap.innerHTML = state.options.map(type => {
      const data = progressData(type);
      const active = state.selected.includes(type) ? 'active' : '';
      const width = pct(data.cur, data.max);
      return `
        <button class="cult-progress-card ${active}" data-focus="${type}">
          <div class="progress-label"><span>${systemName(type)}</span><b>${Math.round(width)}%</b></div>
          <h4>${data.title}</h4>
          <div class="progress-bar"><div style="width:${active ? width : 0}%"></div></div>
          <p>${data.sub}</p>
          <small>${fmt(data.cur)} / ${fmt(data.max)}</small>
        </button>`;
    }).join('');
  }

  if ($('focus-buttons')) {
    $('focus-buttons').innerHTML = state.options.map(type => {
      const active = state.selected.includes(type) ? 'active' : '';
      return `<button class="small-btn ${active}" data-focus="${type}">${systemName(type)}</button>`;
    }).join('');
  }

  document.querySelectorAll('[data-focus]').forEach(btn => {
    btn.addEventListener('click', () => toggleFocus(btn.dataset.focus));
  });

  const buffs = playerData.activePillBuffs || [];
  if ($('pill-buffs')) {
    $('pill-buffs').innerHTML = buffs.length
      ? buffs.map(buff => card(buff.name || buff.id, `Còn hiệu lực: ${buff.endsAt ? new Date(buff.endsAt).toLocaleTimeString('vi-VN') : '-'}`)).join('')
      : '<div class="empty-state">Chưa có buff đan.</div>';
  }
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

function mapGroupKey(map) {
  return `${map.worldName || map.world || '-'}|${map.realmName || 'Cảnh giới'}`;
}

function renderMapGroups(maps) {
  if (!maps.length) return '<div class="empty-state">Chưa mở map.</div>';
  const groups = new Map();
  for (const map of maps) {
    const key = mapGroupKey(map);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(map);
  }

  return [...groups.entries()].map(([key, items]) => {
    const [world, realm] = key.split('|');
    const collapsed = collapsedMapGroups.has(key);
    const body = collapsed ? '' : items.map(item => {
      const active = item.id === playerData.currentZone ? 'active' : '';
      return `
        <button class="data-card map-card ${active}" data-map="${item.id}">
          <h4>${item.name}</h4>
          <p>${item.worldName || world} · ${item.realmName || realm}</p>
          <small>${item.description || ''}</small>
        </button>`;
    }).join('');

    return `
      <div class="map-group">
        <button class="map-group-head" data-map-group="${key}">
          <b>${world} · ${realm}</b><span>${collapsed ? 'Mở' : 'Thu gọn'} (${items.length})</span>
        </button>
        <div class="map-group-body">${body}</div>
      </div>`;
  }).join('');
}

function renderCombat() {
  const map = playerData.currentMap || {};
  const state = playerData.combatState || {};
  const combat = playerData.combat || {};
  const monster = state.currentMonster || {};

  setText('combat-zone', map.name || '-');
  setText('monster-name', monster.name || 'Chưa gặp quái');
  setText('combat-status', state.status || '-');
  setText('combat-player-hp', `${fmt(combat.hp)} / ${fmt(combat.maxHp)}`);
  setText('combat-monster-hp', `${fmt(state.monsterHp)} / ${fmt(state.monsterMaxHp)}`);
  setWidth('player-hp-bar', pct(combat.hp, combat.maxHp));
  setWidth('monster-hp-bar', pct(state.monsterHp, state.monsterMaxHp));
  setText('auto-fight-status', playerData.autoFight ? 'Tự đánh đang bật' : 'Tự đánh đang tắt');
  setText('kill-count', fmt(playerData.stats?.totalKills || 0));
  setText('death-penalty', `${fmt(state.deathPenaltyPercent || 0)}%`);

  const maps = playerData.unlockedMaps || [];
  if ($('map-list')) $('map-list').innerHTML = renderMapGroups(maps);

  document.querySelectorAll('[data-map-group]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.mapGroup;
      if (collapsedMapGroups.has(key)) collapsedMapGroups.delete(key);
      else collapsedMapGroups.add(key);
      renderCombat();
    });
  });
  document.querySelectorAll('[data-map]').forEach(btn => btn.addEventListener('click', () => changeMap(btn.dataset.map)));

  const logs = state.logs || [];
  if ($('combat-logs')) {
    $('combat-logs').innerHTML = logs.length
      ? logs.map(line => `<div class="log-entry">${line}</div>`).join('')
      : '<div class="empty-state">Chưa có nhật ký.</div>';
  }
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
  return `
    <div class="data-card">
      <h4>${title}</h4>
      ${body ? `<p>${body}</p>` : ''}
      ${meta ? `<div class="meta"><span class="badge soft">${meta}</span></div>` : ''}
    </div>`;
}

function actionCard(title, body = '', meta = '', action = '') {
  return `
    <div class="data-card">
      <h4>${title}</h4>
      ${body ? `<p>${body}</p>` : ''}
      ${meta ? `<div class="meta"><span class="badge soft">${meta}</span></div>` : ''}
      ${action ? `<div class="actions">${action}</div>` : ''}
    </div>`;
}

function effectText(effects = {}) {
  const entries = Object.entries(effects);
  if (!entries.length) return 'Chưa có chỉ số.';
  return entries.map(([k, v]) => `${k}: ${typeof v === 'number' ? (Math.abs(v) < 1 ? `${Math.round(v * 100)}%` : v) : v}`).join(' · ');
}

function isTechniqueEquipped(equipped, item) {
  const system = item.system || item.type || 'cultivation';
  return equipped && equipped[system] === item.id;
}

function isMartialEquipped(equipped, item) {
  return equipped && equipped.active === item.id;
}

function renderSkills() {
  const techState = playerData.techniques || { equipped: {}, learned: [] };
  const martialState = playerData.martialSkills || { equipped: {}, learned: [] };
  const techniques = Array.isArray(techState.learned) ? techState.learned : Object.values(techState.learned || {});
  const martial = Array.isArray(martialState.learned) ? martialState.learned : Object.values(martialState.learned || {});

  if ($('technique-list')) {
    $('technique-list').innerHTML = techniques.length ? techniques.map(item => {
      const equipped = isTechniqueEquipped(techState.equipped, item);
      return actionCard(
        `${item.name} · ${systemName(item.system || item.type)}`,
        `${equipped ? '<b>Đang vận chuyển</b><br>' : ''}${item.description || ''}<br>${effectText(item.effects)}`,
        `Bậc ${item.rank || 1}`,
        equipped ? '<span class="badge">Đã trang bị</span>' : `<button class="small-btn" data-equip-kind="technique" data-equip-id="${item.id}">Trang bị</button>`
      );
    }).join('') : '<div class="empty-state">Chưa học công pháp.</div>';
  }

  if ($('martial-list')) {
    $('martial-list').innerHTML = martial.length ? martial.map(item => {
      const equipped = isMartialEquipped(martialState.equipped, item);
      return actionCard(
        `${item.name} · ${systemName(item.system)}`,
        `${equipped ? '<b>Đang dùng khi chiến đấu</b><br>' : ''}${item.description || ''}<br>${effectText(item.effects)}`,
        `Bậc ${item.rank || 1}`,
        equipped
          ? `<button class="small-btn" data-unequip-kind="martial-skill" data-equip-id="${item.id}">Tháo ra</button>`
          : `<button class="small-btn primary" data-equip-kind="martial-skill" data-equip-id="${item.id}">Trang bị</button>`
      );
    }).join('') : '<div class="empty-state">Chưa học vũ kỹ.</div>';
  }

  document.querySelectorAll('[data-equip-kind]').forEach(btn => {
    btn.addEventListener('click', () => equipPracticeItem(btn.dataset.equipKind, btn.dataset.equipId));
  });
  document.querySelectorAll('[data-unequip-kind]').forEach(btn => {
    btn.addEventListener('click', () => unequipPracticeItem(btn.dataset.unequipKind, btn.dataset.equipId));
  });

  const skills = Array.isArray(playerData.skills?.learned) ? playerData.skills.learned : [];
  if ($('skill-list')) {
    $('skill-list').innerHTML = skills.length
      ? skills.map(item => card(item.name || item.id, item.description || '', item.level ? `Lv.${item.level}` : '')).join('')
      : '<div class="empty-state">Chưa có skill linh căn.</div>';
  }
}

async function equipPracticeItem(kind, id) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/${kind}/equip`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
    playerData = data.player;
    renderAll();
  } catch (err) {
    alert(err.message);
  }
}

async function unequipPracticeItem(kind, id) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/${kind}/unequip`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
    playerData = data.player;
    renderAll();
  } catch (err) {
    alert(err.message);
  }
}

function renderAlchemy() {
  setText('alchemy-bonus', `+${fmt(playerData.cave?.alchemyBonus || 0)}%`);
  if ($('recipe-list')) $('recipe-list').innerHTML = '<div class="empty-state">Công thức luyện đan sẽ hiển thị ở bước sau.</div>';
  const pills = (playerData.inventory || []).filter(item => item.basePillId || String(item.id || '').includes('dan'));
  if ($('pill-list')) {
    $('pill-list').innerHTML = pills.length
      ? pills.map(item => card(item.name || item.id, `Số lượng: ${fmt(item.amount)}`, 'Dùng')).join('')
      : '<div class="empty-state">Chưa có đan dược.</div>';
  }
}

function renderCave() {
  const cave = playerData.cave || {};
  setText('cave-level', `Cấp ${cave.level || 1}`);
  setText('cave-aura', fmt(cave.resources?.aura || 0));
  setText('cave-rate', `${fmt(cave.auraPerSecond || 0)}/s`);
  setText('cave-alchemy', `${fmt(cave.alchemyBonus || 0)}%`);
  const buildings = cave.buildings || {};
  if ($('cave-buildings')) $('cave-buildings').innerHTML = Object.entries(buildings).map(([id, building]) => card(building.name || id, `Cấp ${building.level || 1}`)).join('') || '<div class="empty-state">Chưa có kiến trúc.</div>';
  const plots = playerData.herbPlots || [];
  if ($('herb-plots')) $('herb-plots').innerHTML = plots.length ? plots.map((plot, idx) => `<div class="plot-card"><h4>Ô ${idx + 1}</h4><p>${plot.herbName || plot.herbId || 'Ô trống'}</p></div>`).join('') : '<div class="empty-state">Chưa mở dược viên.</div>';
}

function renderInventory() {
  const inv = playerData.inventory || [];
  const currencies = Object.entries(playerData.currencies || {}).filter(([, amount]) => Number(amount) > 0);
  setText('inventory-count', `${inv.length} vật phẩm · ${currencies.length} tiền tệ`);
  const currencyHtml = currencies.length
    ? `<h4>Tiền tệ</h4><div class="inventory-grid">${currencies.map(([id, amount]) => card(currencyName(id), `Số lượng: ${fmt(amount)}`, 'Tiền tệ')).join('')}</div>`
    : '';
  const itemHtml = inv.length
    ? `<h4>Vật phẩm</h4><div class="inventory-grid">${inv.map(item => card(item.name || item.id, `Số lượng: ${fmt(item.amount)}`, item.quality || '')).join('')}</div>`
    : '<div class="empty-state">Chưa có vật phẩm rơi vào túi.</div>';
  if ($('inventory-list')) $('inventory-list').innerHTML = currencyHtml + itemHtml;
}

window.addEventListener('DOMContentLoaded', async () => {
  bindEvents();
  if (username) {
    if ($('username-input')) $('username-input').value = username;
    showApp();
    await loadMeta();
    await loadPlayer();
    startTimer();
  }
});
