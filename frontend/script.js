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
  alchemy: ['Đan Dược', 'Luyện đan, dùng đan và quản lý buff.'],
  cave: ['Động Phủ', 'Linh khí, phòng luyện đan và dược viên.'],
  inventory: ['Túi Đồ', 'Vật phẩm, đan dược và nguyên liệu.'],
};

function setText(id, value) { const el = $(id); if (el) el.textContent = value; }
function setWidth(id, value) { const el = $(id); if (el) el.style.width = `${Math.max(0, Math.min(100, value))}%`; }
function systemName(id) { return { cultivation: 'Tu Luyện', body: 'Luyện Thể', soul: 'Luyện Hồn', main: 'Tu Luyện' }[id] || id || '-'; }
function escapeHtml(text) { return String(text ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || data.reason || 'Lỗi máy chủ');
  return data;
}

function showApp() { $('login-screen').classList.add('hidden'); $('app').classList.remove('hidden'); }
function showLogin() { $('app').classList.add('hidden'); $('login-screen').classList.remove('hidden'); }

async function loadMeta() { try { metaData = await api('/api/meta'); } catch (err) { console.warn(err.message); } }
async function loadPlayer() {
  if (!username) return;
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}`);
    playerData = data.player;
    setText('connection-status', 'Đã kết nối');
    renderAll();
  } catch (err) { setText('connection-status', err.message); }
}
async function postPlayer(body) {
  const data = await api(`/api/player/${encodeURIComponent(username)}`, { method: 'POST', body: JSON.stringify(body) });
  playerData = data.player;
  renderAll();
}

function bindEvents() {
  $('login-btn').addEventListener('click', login);
  $('username-input').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  $('logout-btn').addEventListener('click', logout);
  $('refresh-btn').addEventListener('click', loadPlayer);
  $('toggle-auto-btn').addEventListener('click', toggleAutoFight);
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab)));
}
async function login() {
  username = $('username-input').value.trim() || 'dao_huu';
  localStorage.setItem('tuTienUsername', username);
  showApp(); await loadMeta(); await loadPlayer(); startTimer();
}
function logout() { localStorage.removeItem('tuTienUsername'); username = ''; playerData = null; if (refreshTimer) clearInterval(refreshTimer); showLogin(); }
function startTimer() { if (refreshTimer) clearInterval(refreshTimer); refreshTimer = setInterval(loadPlayer, 3000); }
function setTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  document.querySelectorAll('.tab-page').forEach(page => page.classList.toggle('active', page.id === `tab-${tab}`));
  const info = pageInfo[tab] || pageInfo.overview;
  setText('page-title', info[0]); setText('page-subtitle', info[1]);
}
function renderAll() { if (!playerData) return; renderHeader(); renderOverview(); renderCultivation(); renderCombat(); renderSkills(); renderAlchemy(); renderCave(); renderInventory(); }
function renderHeader() { setText('profile-name', playerData.username || '-'); setText('profile-realm', playerData.cultivation?.realmName || '-'); setText('toggle-auto-btn', playerData.autoFight ? 'Tạm dừng tự đánh' : 'Bật tự đánh'); }

function renderOverview() {
  const c = playerData.cultivation || {}, combat = playerData.combat || {}, root = playerData.spiritRootDisplay || {};
  setText('world-name', c.info?.worldName || c.info?.world || '-'); setText('realm-name', c.realmName || '-');
  setText('tuvi-text', 'Tổng quan chỉ hiển thị cảnh giới');
  setText('hp-text', `${fmt(combat.hp)} / ${fmt(combat.maxHp)}`); setText('atk-text', fmt(combat.atk)); setText('def-text', fmt(combat.def));
  setText('spirit-root-name', root.name || 'Chưa ngộ linh căn'); setText('spirit-root-desc', root.description || '-');
  setText('body-rank', playerData.bodyCultivation?.info?.name || '-'); setText('soul-rank', playerData.soulCultivation?.info?.name || '-');
  const currencies = playerData.currencies || {};
  $('currency-list').innerHTML = Object.entries(currencies).filter(([, amount]) => Number(amount) > 0).map(([id, amount]) => smallCard(currencyName(id), fmt(amount), 'Tiền tệ')).join('') || '<p class="empty">Chưa có tài nguyên.</p>';
}

function progressData(type) {
  if (type === 'main') { const c = playerData.cultivation || {}; return { title: c.realmName || '-', cur: c.exp ?? c.tuVi ?? 0, max: c.maxExp ?? c.maxTuVi ?? 100, sub: c.info?.worldName || '-' }; }
  if (type === 'body') { const b = playerData.bodyCultivation || {}; return { title: b.info?.name || 'Luyện Thể', cur: b.exp || 0, max: b.maxExp || 100, sub: 'Khí huyết rèn thân' }; }
  const s = playerData.soulCultivation || {}; return { title: s.info?.name || 'Luyện Hồn', cur: s.exp || 0, max: s.maxExp || 100, sub: 'Thần thức dưỡng hồn' };
}
function renderCultivation() {
  const c = playerData.cultivation || {};
  setText('cultivation-title', `${c.realmName || '-'} · ${fmt(c.exp ?? c.tuVi)} / ${fmt(c.maxExp ?? c.maxTuVi)}`);
  setText('cult-world', c.info?.worldName || '-'); setText('cult-type', c.info?.name || '-'); setText('tuvi-rate', `${fmt(playerData.pillEffects?.tuViGainPerSecond || 1)}/s`);
  const state = playerData.cultivationFocusState || { selected: ['main'], limit: 1, options: ['main', 'body', 'soul'] };
  setText('focus-limit', `Đang tu ${state.selected.length}/${state.limit} loại`);
  setText('focus-note', state.limit === 1 ? 'Nhấn thanh nào thì thanh đó chạy. Chưa đủ cảnh giới chỉ được chọn 1 loại.' : `Có thể đồng tu ${state.limit} loại.`);
  $('cultivation-progress-panels').innerHTML = state.options.map(type => { const d = progressData(type), w = pct(d.cur, d.max), active = state.selected.includes(type); return `<button class="progress-panel ${active ? 'active' : ''}" data-focus="${type}"><div class="progress-head"><b>${systemName(type)}</b><span>${Math.round(w)}%</span></div><h4>${escapeHtml(d.title)}</h4><p>${escapeHtml(d.sub)}</p><div class="bar"><i style="width:${w}%"></i></div><small>${fmt(d.cur)} / ${fmt(d.max)}</small></button>`; }).join('');
  $('focus-buttons').innerHTML = state.options.map(type => `<button class="chip ${state.selected.includes(type) ? 'active' : ''}" data-focus="${type}">${systemName(type)}</button>`).join('');
  document.querySelectorAll('[data-focus]').forEach(btn => btn.addEventListener('click', () => toggleFocus(btn.dataset.focus)));
  const buffs = playerData.activePillBuffs || [];
  $('pill-buffs').innerHTML = buffs.length ? buffs.map(buff => smallCard(buff.name || buff.id, 'Đang hiệu lực')).join('') : '<p class="empty">Chưa có buff đan.</p>';
}
async function toggleFocus(type) { try { const data = await api(`/api/player/${encodeURIComponent(username)}/cultivation/focus`, { method: 'POST', body: JSON.stringify({ type }) }); playerData = data.player; renderAll(); } catch (err) { alert(err.message); } }
async function toggleAutoFight() { try { await postPlayer({ autoFight: !playerData.autoFight }); } catch (err) { alert(err.message); } }

function mapGroupKey(map) { return `${map.worldName || '-'}|${map.realmName || 'Cảnh giới'}`; }
function renderMapGroups(maps) {
  if (!maps.length) return '<p class="empty">Chưa mở map.</p>';
  const groups = new Map(); maps.forEach(map => { const key = mapGroupKey(map); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(map); });
  return [...groups.entries()].map(([key, items]) => { const [world, realm] = key.split('|'); const collapsed = collapsedMapGroups.has(key); const body = collapsed ? '' : `<div class="map-group-body">${items.map(item => `<button class="map-card ${item.id === playerData.currentZone ? 'active' : ''}" data-map="${item.id}"><b>${escapeHtml(item.name)}</b><span>${escapeHtml(item.worldName || world)} · ${escapeHtml(item.realmName || realm)}</span>${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}</button>`).join('')}</div>`; return `<section class="map-group"><button class="map-group-head" data-map-group="${escapeHtml(key)}"><b>${escapeHtml(world)} · ${escapeHtml(realm)}</b><span>${collapsed ? 'Mở' : 'Thu gọn'} (${items.length})</span></button>${body}</section>`; }).join('');
}
function renderCombat() {
  const map = playerData.currentMap || {}, state = playerData.combatState || {}, combat = playerData.combat || {}, monster = state.currentMonster || {};
  setText('combat-zone', map.name || '-'); setText('monster-name', monster.name || 'Không rõ'); setText('combat-status', state.status || '-');
  setText('combat-player-hp', `${fmt(combat.hp)} / ${fmt(combat.maxHp)}`); setText('combat-monster-hp', `${fmt(state.monsterHp)} / ${fmt(state.monsterMaxHp)}`);
  setWidth('fight-progress-bar', pct(state.fightProgress || 0, state.fightDuration || 3000)); setWidth('player-hp-bar', pct(combat.hp, combat.maxHp)); setWidth('monster-hp-bar', pct(state.monsterHp, state.monsterMaxHp));
  setText('auto-fight-status', playerData.autoFight ? 'Đang bật' : 'Đang tắt'); setText('kill-count', fmt(playerData.stats?.totalKills || 0)); setText('death-penalty', `${fmt(state.deathPenaltyPercent || 0)}%`);
  $('map-list').innerHTML = renderMapGroups(playerData.unlockedMaps || []);
  document.querySelectorAll('[data-map-group]').forEach(btn => btn.addEventListener('click', () => { const key = btn.dataset.mapGroup; if (collapsedMapGroups.has(key)) collapsedMapGroups.delete(key); else collapsedMapGroups.add(key); renderCombat(); }));
  document.querySelectorAll('[data-map]').forEach(btn => btn.addEventListener('click', () => changeMap(btn.dataset.map)));
  const logs = state.logs || []; $('combat-logs').innerHTML = logs.length ? logs.map(line => `<p>${escapeHtml(line)}</p>`).join('') : '<p class="empty">Chưa có nhật ký.</p>';
}
async function changeMap(mapId) { try { const data = await api(`/api/player/${encodeURIComponent(username)}/zone`, { method: 'POST', body: JSON.stringify({ mapId }) }); playerData = data.player; renderAll(); } catch (err) { alert(err.message); } }

function smallCard(title, body = '', meta = '') { return `<article class="mini-card"><div><b>${escapeHtml(title)}</b>${body ? `<p>${escapeHtml(body)}</p>` : ''}</div>${meta ? `<span>${escapeHtml(meta)}</span>` : ''}</article>`; }
function actionCard(title, body = '', meta = '', action = '') { return `<article class="mini-card action-card"><div><b>${escapeHtml(title)}</b>${body ? `<p>${body}</p>` : ''}</div><div class="card-actions">${meta ? `<span>${escapeHtml(meta)}</span>` : ''}${action}</div></article>`; }
function currencyName(id) { return { so_linh_thach: 'Sơ Linh Thạch', trung_linh_thach: 'Trung Linh Thạch', cao_linh_thach: 'Cao Linh Thạch', cuc_pham_linh_thach: 'Cực Phẩm Linh Thạch', tien_ngoc: 'Tiên Ngọc' }[id] || id; }
function effectText(effects = {}) { const entries = Object.entries(effects); if (!entries.length) return 'Chưa có chỉ số.'; return entries.map(([k, v]) => `${escapeHtml(k)}: ${typeof v === 'number' ? (Math.abs(v) < 1 ? `${Math.round(v * 100)}%` : v) : escapeHtml(v)}`).join(' · '); }
function renderSkills() {
  const techState = playerData.techniques || { equipped: {}, learned: [] }, martialState = playerData.martialSkills || { equipped: {}, learned: [] };
  const techniques = Array.isArray(techState.learned) ? techState.learned : Object.values(techState.learned || {});
  const martial = Array.isArray(martialState.learned) ? martialState.learned : Object.values(martialState.learned || {});
  $('technique-list').innerHTML = techniques.length ? techniques.map(item => { const equipped = techState.equipped?.[item.system] === item.id; return actionCard(`${item.name} · ${systemName(item.system)}`, `${equipped ? '<b class="good">Đang vận chuyển</b><br>' : ''}${escapeHtml(item.description || '')}<br>${effectText(item.effects)}`, `Bậc ${item.rank || 1}`, equipped ? '<span class="good">Đã trang bị</span>' : `<button data-equip-kind="technique" data-equip-id="${item.id}">Trang bị</button>`); }).join('') : '<p class="empty">Chưa học công pháp.</p>';
  $('martial-list').innerHTML = martial.length ? martial.map(item => { const equipped = martialState.equipped?.active === item.id; return actionCard(`${item.name} · ${systemName(item.system)}`, `${equipped ? '<b class="good">Đang dùng khi chiến đấu</b><br>' : ''}${escapeHtml(item.description || '')}<br>${effectText(item.effects)}`, `Bậc ${item.rank || 1}`, equipped ? '<span class="good">Đã trang bị</span>' : `<button data-equip-kind="martial-skill" data-equip-id="${item.id}">Trang bị</button>`); }).join('') : '<p class="empty">Chưa học vũ kỹ.</p>';
  document.querySelectorAll('[data-equip-kind]').forEach(btn => btn.addEventListener('click', () => equipPracticeItem(btn.dataset.equipKind, btn.dataset.equipId)));
  $('skill-list').innerHTML = '<p class="empty">Skill theo linh căn sẽ mở sau khi hoàn thiện linh căn.</p>';
}
async function equipPracticeItem(kind, id) { try { const data = await api(`/api/player/${encodeURIComponent(username)}/${kind}/equip`, { method: 'POST', body: JSON.stringify({ id }) }); playerData = data.player; renderAll(); } catch (err) { alert(err.message); } }
function renderAlchemy() { setText('alchemy-bonus', `+${fmt(playerData.cave?.alchemyBonus || 0)}%`); $('recipe-list').innerHTML = '<p class="empty">Công thức luyện đan sẽ hiển thị ở bước sau.</p>'; const pills = (playerData.inventory || []).filter(item => item.basePillId || String(item.id || '').includes('dan')); $('pill-list').innerHTML = pills.length ? pills.map(item => smallCard(item.name || item.id, `Số lượng: ${fmt(item.amount)}`, 'Đan dược')).join('') : '<p class="empty">Chưa có đan dược.</p>'; }
function renderCave() { const cave = playerData.cave || {}; setText('cave-level', `Cấp ${cave.level || 1}`); setText('cave-aura', fmt(cave.resources?.aura || 0)); setText('cave-rate', `${fmt(cave.auraPerSecond || 0)}/s`); setText('cave-alchemy', `${fmt(cave.alchemyBonus || 0)}%`); $('cave-buildings').innerHTML = '<p class="empty">Kiến trúc động phủ sẽ mở ở bước sau.</p>'; $('herb-plots').innerHTML = '<p class="empty">Dược viên sẽ mở ở bước sau.</p>'; }
function renderInventory() { const inv = playerData.inventory || [], currencies = Object.entries(playerData.currencies || {}).filter(([, amount]) => Number(amount) > 0); setText('inventory-count', `${inv.length} vật phẩm · ${currencies.length} tiền tệ`); const currencyHtml = currencies.length ? `<h4>Tiền tệ</h4>${currencies.map(([id, amount]) => smallCard(currencyName(id), `Số lượng: ${fmt(amount)}`, 'Tiền tệ')).join('')}` : '<p class="empty">Chưa có tiền tệ.</p>'; const itemHtml = inv.length ? `<h4>Vật phẩm</h4>${inv.map(item => smallCard(item.name || item.id, `Số lượng: ${fmt(item.amount)}`, item.quality || '')).join('')}` : '<p class="empty">Chưa có vật phẩm rơi vào túi.</p>'; $('inventory-list').innerHTML = currencyHtml + itemHtml; }

window.addEventListener('DOMContentLoaded', async () => { bindEvents(); if (username) { $('username-input').value = username; showApp(); await loadMeta(); await loadPlayer(); startTimer(); } });
