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
  overview: ['Tổng Quan', 'Theo dõi cảnh giới, chiến lực và tài nguyên.'],
  cultivation: ['Tu Luyện', 'Điều phối tu luyện, luyện thể và luyện hồn.'],
  combat: ['Combat', 'Tự động đánh quái theo map đã mở.'],
  skills: ['Công Pháp', 'Công pháp và vũ kỹ cơ bản của ba hệ.'],
  alchemy: ['Đan Dược', 'Luyện đan, dùng đan và quản lý thọ nguyên.'],
  cave: ['Động Phủ', 'Linh khí, phòng luyện đan và dược viên.'],
  inventory: ['Túi Đồ', 'Vật phẩm, đan dược và nguyên liệu.'],
};

function setText(id, value) { const el = $(id); if (el) el.textContent = value; }
function setWidth(id, value) { const el = $(id); if (el) el.style.width = `${Math.max(0, Math.min(100, value))}%`; }
function systemName(id) { return { cultivation: 'Tu Luyện', body: 'Luyện Thể', soul: 'Luyện Hồn', main: 'Tu Luyện' }[id] || id || '-'; }
function escapeHtml(text) { return String(text ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function currencyName(id) { return { so_linh_thach: 'Sơ Linh Thạch', trung_linh_thach: 'Trung Linh Thạch', cao_linh_thach: 'Cao Linh Thạch', cuc_pham_linh_thach: 'Cực Phẩm Linh Thạch', tien_ngoc: 'Tiên Ngọc' }[id] || id; }

function prettyId(id) {
  return String(id || '-')
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function materialName(id) {
  return {
    linh_thao: 'Linh Thảo',
    huyen_tho_thao: 'Huyền Thọ Thảo',
    hat_giong_so_cap: 'Hạt Giống Sơ Cấp',
    hat_giong_trung_cap: 'Hạt Giống Trung Cấp',
    linh_thuy_so_cap: 'Linh Thủy Sơ Cấp',
    linh_thuy_trung_cap: 'Linh Thủy Trung Cấp',
    linh_nhuong_so_cap: 'Linh Nhưỡng Sơ Cấp',
    linh_nhuong_trung_cap: 'Linh Nhưỡng Trung Cấp',
  }[id] || currencyName(id) || prettyId(id);
}

function ingredientText(list = []) {
  return list.map(x => `${materialName(x.id)} x${fmt(x.amount)}`).join(' · ');
}

function itemKind(item = {}) {
  const id = String(item.id || '');
  if (id.includes('dan')) return 'Đan dược';
  if (id.includes('linh_thuy') || id.includes('linh_nhuong') || id.includes('hat_giong')) return 'Dược viên';
  if (id.includes('thao') || id.includes('duoc')) return 'Dược liệu';
  return item.quality || 'Vật phẩm';
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || data.reason || data.message || 'Lỗi máy chủ');
  return data;
}

function showApp() { $('login-screen')?.classList.add('hidden'); $('app')?.classList.remove('hidden'); }
function showLogin() { $('app')?.classList.add('hidden'); $('login-screen')?.classList.remove('hidden'); }

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
  ensureEncounterOverlay();
  renderHeader();
  renderOverview();
  renderCultivation();
  renderCombat();
  renderSkills();
  renderAlchemy();
  renderCave();
  renderInventory();
  renderEncounterOverlay();
}

function renderHeader() {
  setText('profile-name', playerData.username || '-');
  setText('profile-realm', playerData.cultivation?.realmName || '-');
  setText('toggle-auto-btn', playerData.autoFight ? 'Tạm dừng tự đánh' : 'Bật tự đánh');
}

function renderOverview() {
  const c = playerData.cultivation || {}, combat = playerData.combat || {}, root = playerData.spiritRootDisplay || {}, life = playerData.lifespan || {};
  setText('world-name', c.info?.worldName || c.info?.world || '-');
  setText('realm-name', c.realmName || '-');
  setText('tuvi-text', `Thọ nguyên: ${fmt(life.ageYears || 0)} / ${fmt(life.maxYears || 0)} năm · còn ${fmt(life.remainYears || 0)} năm`);
  setText('hp-text', `${fmt(combat.hp)} / ${fmt(combat.maxHp)}`);
  setText('atk-text', fmt(combat.atk));
  setText('def-text', fmt(combat.def));
  setText('spirit-root-name', root.name || 'Chưa ngộ linh căn');
  setText('spirit-root-desc', root.description || '-');
  setText('body-rank', playerData.bodyCultivation?.info?.name || '-');
  setText('soul-rank', playerData.soulCultivation?.info?.name || '-');
  const currencies = playerData.currencies || {};
  if ($('currency-list')) $('currency-list').innerHTML = Object.entries(currencies).filter(([, amount]) => Number(amount) > 0).map(([id, amount]) => smallCard(currencyName(id), fmt(amount), 'Tiền tệ')).join('') || '<p class="muted">Chưa có tài nguyên.</p>';
}

function progressData(type) {
  if (type === 'main') {
    const c = playerData.cultivation || {};
    return { title: c.realmName || '-', cur: c.exp ?? c.tuVi ?? 0, max: c.maxExp ?? c.maxTuVi ?? 100, sub: c.info?.worldName || '-' };
  }
  if (type === 'body') {
    const b = playerData.bodyCultivation || {};
    return { title: b.info?.name || 'Luyện Thể', cur: b.exp || 0, max: b.maxExp || 100, sub: 'Khí huyết rèn thân' };
  }
  const s = playerData.soulCultivation || {};
  return { title: s.info?.name || 'Luyện Hồn', cur: s.exp || 0, max: s.maxExp || 100, sub: 'Thần thức dưỡng hồn' };
}

function focusStatusText(state) {
  const selected = state?.selected || ['main'];
  return selected.map(systemName).join(' + ');
}

function renderCultivation() {
  const c = playerData.cultivation || {};
  const state = playerData.cultivationFocusState || { selected: ['main'], limit: 1, options: ['main', 'body', 'soul'] };
  const options = state.options || ['main', 'body', 'soul'];
  const selected = state.selected || ['main'];

  setText('cultivation-title', `${c.realmName || '-'} · ${fmt(c.exp ?? c.tuVi)} / ${fmt(c.maxExp ?? c.maxTuVi)}`);
  setText('cult-world', c.info?.worldName || '-');
  setText('cult-type', c.info?.name || '-');
  setText('tuvi-rate', `${fmt(playerData.pillEffects?.tuViGainPerSecond || 1)}/s`);
  setText('focus-limit', `Đang tu ${selected.length}/${state.limit} loại`);
  setText('focus-note', state.limit === 1
    ? 'Chưa đủ cảnh giới chỉ chọn được 1 mạch tu. Ô sáng xanh là mạch đang chạy.'
    : `Hiện có thể đồng tu ${state.limit} mạch. Ô sáng xanh là mạch đang chạy.`);

  const summaryHtml = `
    <div class="cultivation-summary">
      <div class="cult-summary-card active-now">
        <small>Đang hấp nạp</small>
        <b>${escapeHtml(focusStatusText(state))}</b>
        <em>${selected.length}/${state.limit} mạch</em>
      </div>
      <div class="cult-summary-card">
        <small>Cảnh giới chính</small>
        <b>${escapeHtml(c.realmName || '-')}</b>
        <em>${fmt(c.exp ?? c.tuVi)} / ${fmt(c.maxExp ?? c.maxTuVi)}</em>
      </div>
      <div class="cult-summary-card">
        <small>Luyện thể</small>
        <b>${escapeHtml(playerData.bodyCultivation?.info?.name || 'Luyện Thể')}</b>
        <em>${fmt(playerData.bodyCultivation?.exp || 0)} / ${fmt(playerData.bodyCultivation?.maxExp || 100)}</em>
      </div>
      <div class="cult-summary-card">
        <small>Luyện hồn</small>
        <b>${escapeHtml(playerData.soulCultivation?.info?.name || 'Luyện Hồn')}</b>
        <em>${fmt(playerData.soulCultivation?.exp || 0)} / ${fmt(playerData.soulCultivation?.maxExp || 100)}</em>
      </div>
    </div>
    <div class="focus-guide">
      <span><b>Trạng thái:</b> ${escapeHtml(focusStatusText(state))}</span>
      <span>Nhấn vào thẻ hoặc nút bên dưới để đổi mạch tu.</span>
    </div>
  `;

  const panels = options.map(type => {
    const d = progressData(type);
    const w = pct(d.cur, d.max);
    const active = selected.includes(type);
    return `
      <button class="progress-panel ${active ? 'active' : ''}" data-focus="${type}">
        <div class="progress-head">
          <span>${systemName(type)}</span>
          <b>${Math.round(w)}%</b>
        </div>
        <h4>${escapeHtml(d.title)}</h4>
        <p>${escapeHtml(d.sub)}</p>
        <div class="bar"><i style="width:${w}%"></i></div>
        <small>${fmt(d.cur)} / ${fmt(d.max)}</small>
      </button>
    `;
  }).join('');

  $('cultivation-progress-panels').innerHTML = summaryHtml + `<div class="progress-panels">${panels}</div>`;

  $('focus-buttons').innerHTML = options.map(type => {
    const active = selected.includes(type);
    return `<button class="chip ${active ? 'active' : ''}" data-focus="${type}">${active ? 'Đang tu: ' : 'Chọn: '}${systemName(type)}</button>`;
  }).join('');

  document.querySelectorAll('[data-focus]').forEach(btn => btn.addEventListener('click', () => toggleFocus(btn.dataset.focus)));

  const buffs = playerData.activePillBuffs || [];
  $('pill-buffs').innerHTML = buffs.length
    ? buffs.map(buff => smallCard(buff.name || buff.id, 'Đang hiệu lực')).join('')
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

function mapGroupKey(map) { return `${map.worldName || '-'}|${map.realmName || 'Cảnh giới'}`; }
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
    const body = collapsed ? '' : `
      <div class="map-group-body">
        ${items.map(item => `
          <button class="map-card ${playerData.currentZone === item.id ? 'active' : ''}" data-map="${item.id}">
            <b>${escapeHtml(item.name)}</b>
            <span>${escapeHtml(item.worldName || world)} · ${escapeHtml(item.realmName || realm)}</span>
            ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
          </button>
        `).join('')}
      </div>
    `;
    return `
      <div class="map-group">
        <button class="map-group-head" data-map-group="${escapeHtml(key)}">
          <b>${escapeHtml(world)} · ${escapeHtml(realm)}</b>
          <span>${collapsed ? 'Mở' : 'Thu gọn'} (${items.length})</span>
        </button>
        ${body}
      </div>
    `;
  }).join('');
}

function renderCombat() {
  const map = playerData.currentMap || {};
  const state = playerData.combatState || {};
  const combat = playerData.combat || {};
  const monster = state.currentMonster || {};
  const progress = pct(state.fightProgress || 0, state.fightDuration || 3000);
  const playerHp = pct(combat.hp, combat.maxHp);
  const monsterHp = pct(state.monsterHp, state.monsterMaxHp);

  setText('combat-zone', map.name || '-');
  setText('monster-name', monster.name || 'Không rõ');
  setText('combat-status', state.status || '-');
  setText('combat-player-hp', `${fmt(combat.hp)} / ${fmt(combat.maxHp)}`);
  setText('combat-monster-hp', `${fmt(state.monsterHp)} / ${fmt(state.monsterMaxHp)}`);
  setWidth('fight-progress-bar', progress);
  setWidth('player-hp-bar', playerHp);
  setWidth('monster-hp-bar', monsterHp);
  setText('auto-fight-status', playerData.autoFight ? 'Đang bật' : 'Đang tắt');
  setText('kill-count', fmt(playerData.stats?.totalKills || 0));
  setText('death-penalty', `${fmt(state.deathPenaltyPercent || 0)}%`);

  const card = document.querySelector('.combat-card');
  if (card) {
    card.innerHTML = `
      <div class="panel-head">
        <h3>Khu Vực Combat</h3>
        <span>${escapeHtml(map.name || '-')}</span>
      </div>
      <div class="combat-hero">
        <div class="monster-icon">獸</div>
        <div>
          <div class="combat-title-row">
            <h2>${escapeHtml(monster.name || 'Không rõ')}</h2>
            <span class="combat-badge">${playerData.autoFight ? 'Tự đánh đang bật' : 'Tự đánh đang tắt'}</span>
          </div>
          <div class="combat-sub">Trạng thái: <b>${escapeHtml(state.status || '-')}</b></div>
          <div class="combat-sub">Đang đánh tại: <b>${escapeHtml(map.name || '-')}</b></div>
        </div>
      </div>
      <div class="combat-stat-grid">
        <div class="combat-stat"><small>Công</small><b>${fmt(combat.atk || 0)}</b></div>
        <div class="combat-stat"><small>Thủ</small><b>${fmt(combat.def || 0)}</b></div>
        <div class="combat-stat"><small>Tốc</small><b>${fmt(combat.speed || 0)}</b></div>
      </div>
      <div class="bar-line"><span>Tiến độ ra chiêu</span><b>${Math.round(progress)}%</b><div class="bar"><i style="width:${progress}%"></i></div></div>
      <div class="bar-line"><span>HP Người chơi</span><b>${fmt(combat.hp)} / ${fmt(combat.maxHp)}</b><div class="bar hp"><i style="width:${playerHp}%"></i></div></div>
      <div class="bar-line"><span>HP Quái</span><b>${fmt(state.monsterHp)} / ${fmt(state.monsterMaxHp)}</b><div class="bar enemy"><i style="width:${monsterHp}%"></i></div></div>
    `;
  }

  $('map-list').innerHTML = renderMapGroups(playerData.unlockedMaps || []);
  document.querySelectorAll('[data-map-group]').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.mapGroup;
    if (collapsedMapGroups.has(key)) collapsedMapGroups.delete(key);
    else collapsedMapGroups.add(key);
    renderCombat();
  }));
  document.querySelectorAll('[data-map]').forEach(btn => btn.addEventListener('click', () => changeMap(btn.dataset.map)));

  const logs = state.logs || [];
  $('combat-logs').innerHTML = logs.length
    ? logs.map(line => `<p>${escapeHtml(line)}</p>`).join('')
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
  return `<div class="small-card">
    <div class="small-card-icon">✦</div>
    <div class="small-card-main">
      <b>${escapeHtml(title)}</b>
      ${body ? `<span>${escapeHtml(body)}</span>` : ''}
    </div>
    ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
  </div>`;
}

function actionCard(title, body = '', meta = '', action = '') {
  return `<div class="action-card">
    <div class="card-main">
      <b>${escapeHtml(title)}</b>
      ${body ? `<p>${body}</p>` : ''}
    </div>
    <div class="card-actions">
      ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
      ${action || ''}
    </div>
  </div>`;
}

function effectText(effects = {}) {
  const entries = Object.entries(effects);
  if (!entries.length) return '<span class="muted">Chưa có chỉ số.</span>';
  return `<span class="effect-list">${entries.map(([k, v]) => {
    const value = typeof v === 'number' ? (Math.abs(v) < 1 ? `${Math.round(v * 100)}%` : v) : escapeHtml(v);
    return `<span class="effect-chip"><em>${escapeHtml(k)}</em><strong>${value}</strong></span>`;
  }).join('')}</span>`;
}

function renderSkills() {
  const techState = playerData.techniques || { equipped: {}, learned: [] }, martialState = playerData.martialSkills || { equipped: {}, learned: [] };
  const techniques = Array.isArray(techState.learned) ? techState.learned : Object.values(techState.learned || {});
  const martial = Array.isArray(martialState.learned) ? martialState.learned : Object.values(martialState.learned || {});
  if ($('technique-list')) $('technique-list').innerHTML = techniques.length ? techniques.map(item => {
    const equipped = techState.equipped?.[item.system] === item.id;
    return actionCard(`${item.name} · ${systemName(item.system)}`, `${equipped ? '<b>Đang vận chuyển</b><br>' : ''}${escapeHtml(item.description || '')}<br>${effectText(item.effects)}`, `Bậc ${item.rank || 1}`, equipped ? '<button disabled>Đã trang bị</button>' : `<button data-equip-kind="technique" data-equip-id="${item.id}">Trang bị</button>`);
  }).join('') : '<p class="muted">Chưa học công pháp.</p>';
  if ($('martial-list')) $('martial-list').innerHTML = martial.length ? martial.map(item => {
    const equipped = martialState.equipped?.active === item.id;
    return actionCard(`${item.name} · ${systemName(item.system)}`, `${equipped ? '<b>Đang dùng khi chiến đấu</b><br>' : ''}${escapeHtml(item.description || '')}<br>${effectText(item.effects)}`, `Bậc ${item.rank || 1}`, equipped ? '<button disabled>Đã trang bị</button>' : `<button data-equip-kind="martial-skill" data-equip-id="${item.id}">Trang bị</button>`);
  }).join('') : '<p class="muted">Chưa học vũ kỹ.</p>';
  document.querySelectorAll('[data-equip-kind]').forEach(btn => btn.addEventListener('click', () => equipPracticeItem(btn.dataset.equipKind, btn.dataset.equipId)));
  if ($('skill-list')) $('skill-list').innerHTML = '<p class="muted">Skill theo linh căn sẽ mở sau khi hoàn thiện linh căn.</p>';
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
  const recipes = metaData?.recipes || [];
  if ($('recipe-list')) $('recipe-list').innerHTML = recipes.length ? recipes.map(r => {
    const ing = ingredientText(r.ingredients || []);
    return actionCard(
      r.name,
      `<span class="line"><b>Nguyên liệu</b><span>${escapeHtml(ing || 'Không cần')}</span></span><span class="line"><b>Linh thạch</b><span>${fmt(r.cost)}</span></span>`,
      '30 giây',
      `<button data-craft-recipe="${r.id}">Luyện</button>`
    );
  }).join('') : '<p class="empty">Chưa có công thức.</p>';
  document.querySelectorAll('[data-craft-recipe]').forEach(btn => btn.addEventListener('click', () => craftRecipe(btn.dataset.craftRecipe)));

  const pills = (playerData.inventory || []).filter(item => item.id?.includes('dan'));
  if ($('pill-list')) $('pill-list').innerHTML = pills.length ? pills.map(item => actionCard(
    item.name || materialName(item.id),
    `<span class="line"><b>Số lượng</b><span>${fmt(item.amount)}</span></span>`,
    item.quality || 'Đan dược',
    `<button data-use-item="${item.id}">Dùng</button>`
  )).join('') : '<p class="empty">Chưa có đan dược.</p>';
  document.querySelectorAll('[data-use-item]').forEach(btn => btn.addEventListener('click', () => useItem(btn.dataset.useItem)));
}

async function craftRecipe(recipeId) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/alchemy/craft`, { method: 'POST', body: JSON.stringify({ recipeId }) });
    playerData = data.player;
    renderAll();
  } catch (err) { alert(err.message); }
}

async function useItem(itemId) {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/use`, { method: 'POST', body: JSON.stringify({ itemId }) });
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
  if ($('cave-buildings')) $('cave-buildings').innerHTML = '<p class="muted">Kiến trúc động phủ sẽ mở ở bước sau.</p>';
  renderHerbGarden();
}

function renderHerbGarden() {
  if (!$('herb-plots')) return;
  const herbs = metaData?.herbs || [];
  const selectHtml = herbs.map(h => `<option value="${h.id}">${escapeHtml(h.name)}</option>`).join('');
  const plots = playerData.herbPlots || [];
  $('herb-plots').innerHTML = plots.map(plot => {
    if (plot.state === 'empty') {
      return `<div class="action-card"><div><b>Ô trồng ${plot.index + 1}</b><p>Trống · cần Hạt Giống + Linh Thủy + Linh Nhưỡng + Linh Thạch</p></div><div><select data-herb-select="${plot.index}">${selectHtml}</select><button data-plant-plot="${plot.index}">Trồng</button></div></div>`;
    }
    const ready = plot.state === 'ready';
    return `<div class="action-card"><div><b>Ô trồng ${plot.index + 1}</b><p>${escapeHtml(plot.herbName || plot.herbId)} · ${ready ? 'Đã chín' : `Còn ${fmt(Math.ceil((plot.remainMs || 0) / 1000))}s`}</p></div><div><button ${ready ? '' : 'disabled'} data-harvest-plot="${plot.index}">Thu hoạch</button></div></div>`;
  }).join('') || '<p class="muted">Chưa có ô trồng.</p>';
  document.querySelectorAll('[data-plant-plot]').forEach(btn => btn.addEventListener('click', () => {
    const plotIndex = Number(btn.dataset.plantPlot);
    const herbId = document.querySelector(`[data-herb-select="${plotIndex}"]`)?.value;
    plantHerb(plotIndex, herbId);
  }));
  document.querySelectorAll('[data-harvest-plot]').forEach(btn => btn.addEventListener('click', () => harvestHerb(Number(btn.dataset.harvestPlot))));
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

function renderInventory() {
  const inv = playerData.inventory || [];
  const currencies = Object.entries(playerData.currencies || {}).filter(([, amount]) => Number(amount) > 0);
  setText('inventory-count', `${inv.length} vật phẩm · ${currencies.length} tiền tệ`);

  const currencyHtml = currencies.length
    ? `<div class="section-title"><h4>Tiền tệ</h4><span>${currencies.length} loại</span></div><div class="grid-list compact-list">${currencies.map(([id, amount]) => smallCard(currencyName(id), `Số lượng: ${fmt(amount)}`, 'Tiền tệ')).join('')}</div>`
    : '<p class="empty">Chưa có tiền tệ.</p>';

  const materials = inv.filter(item => !String(item.id || '').includes('dan'));
  const pills = inv.filter(item => String(item.id || '').includes('dan'));

  const materialHtml = materials.length
    ? `<div class="section-title"><h4>Dược liệu / Nguyên liệu</h4><span>${materials.length} loại</span></div><div class="grid-list compact-list">${materials.map(item => smallCard(item.name || materialName(item.id), `Số lượng: ${fmt(item.amount)}`, itemKind(item))).join('')}</div>`
    : '<p class="empty">Chưa có nguyên liệu.</p>';

  const pillHtml = pills.length
    ? `<div class="section-title"><h4>Đan dược</h4><span>${pills.length} loại</span></div><div class="grid-list">${pills.map(item => actionCard(
        item.name || materialName(item.id),
        `<span class="line"><b>Số lượng</b><span>${fmt(item.amount)}</span></span>`,
        item.quality || 'Đan dược',
        `<button data-use-item="${item.id}">Dùng</button>`
      )).join('')}</div>`
    : '<p class="empty">Chưa có đan dược.</p>';

  if ($('inventory-list')) $('inventory-list').innerHTML = currencyHtml + materialHtml + pillHtml;
  document.querySelectorAll('[data-use-item]').forEach(btn => btn.addEventListener('click', () => useItem(btn.dataset.useItem)));
}

function ensureEncounterOverlay() {
  if ($('encounter-overlay')) return;
  const style = document.createElement('style');
  style.textContent = `
    .encounter-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:9999;display:none;align-items:center;justify-content:center;padding:24px}
    .encounter-overlay.active{display:flex}
    .encounter-box{max-width:680px;width:100%;background:#101827;border:1px solid #a1762b;border-radius:18px;box-shadow:0 30px 100px rgba(0,0,0,.5);padding:24px;color:#fff}
    .encounter-box h2{margin:0 0 10px;color:#f5c76b}.encounter-box p{line-height:1.6;color:#d8e1f1}.encounter-actions{display:grid;gap:10px;margin-top:18px}.encounter-actions button{padding:12px 14px;border-radius:12px;border:1px solid #a1762b;background:#271b0a;color:#fff;font-weight:700;cursor:pointer}.encounter-actions button:hover{background:#3b280d}.encounter-actions .danger{border-color:#913737;background:#2a1111}
  `;
  document.head.appendChild(style);
  const div = document.createElement('div');
  div.id = 'encounter-overlay';
  div.className = 'encounter-overlay';
  div.innerHTML = '<div class="encounter-box"><h2 id="encounter-title"></h2><p id="encounter-text"></p><div id="encounter-actions" class="encounter-actions"></div></div>';
  document.body.appendChild(div);
}

function renderEncounterOverlay() {
  const active = playerData?.encounter?.active;
  const overlay = $('encounter-overlay');
  if (!overlay) return;
  overlay.classList.toggle('active', !!active);
  if (!active) return;
  setText('encounter-title', active.name || 'Kỳ Ngộ Thiên Cơ');
  setText('encounter-text', active.text || 'Thiên cơ đã hiện, cần đạo hữu quyết đoán.');
  $('encounter-actions').innerHTML = (active.choices || []).map(choice => `<button data-encounter-choice="${choice.id}">${escapeHtml(choice.label)}</button>`).join('') + '<button class="danger" data-encounter-decline="1">Không thực hiện kỳ ngộ (-5% tổng thuộc tính 60 phút)</button>';
  document.querySelectorAll('[data-encounter-choice]').forEach(btn => btn.addEventListener('click', () => chooseEncounter(btn.dataset.encounterChoice)));
  document.querySelectorAll('[data-encounter-decline]').forEach(btn => btn.addEventListener('click', declineEncounter));
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
