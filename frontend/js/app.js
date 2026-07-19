'use strict';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const state = { player: null, world: null, maps: [] };
const activityNames = { idle: 'Tĩnh tu', cultivation: 'Đang tu luyện', combat: 'Đang chiến đấu', alchemy: 'Đang luyện đan', planting: 'Đang trồng dược', encounter: 'Đang xử lý kỳ ngộ' };

function setStatus(text, type = 'loading') {
  const node = $('#serverStatus');
  node.textContent = text;
  node.className = `status-pill is-${type}`;
}

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('is-visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('is-visible'), 2600);
}

async function api(url, options = {}) {
  const response = await fetch(url, options);
  let payload;
  try { payload = await response.json(); } catch { payload = {}; }
  if (!response.ok || payload.success === false) {
    const error = new Error(payload.error || `Yêu cầu thất bại (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function normalizeName(value) { return String(value || '').trim(); }
function safeNumber(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
function formatNumber(value) { return safeNumber(value).toLocaleString('vi-VN'); }
function realmLabel(name, layer) { return `${name || 'Chưa rõ'} · Tầng ${safeNumber(layer) || 1}`; }
function percent(exp) { return Math.max(0, Math.min(100, safeNumber(exp) % 100)); }

async function loadWorld() {
  const health = await api('/api/health');
  state.world = health.world;
  setStatus('Linh mạch thông suốt', 'online');
  renderWorld();
  try {
    const maps = await api('/api/config/maps');
    state.maps = Array.isArray(maps.data) ? maps.data : [];
  } catch { state.maps = []; }
  renderMaps();
}

function renderWorld() {
  const world = state.world || {};
  const entries = [
    ['Cảnh giới', world.realms], ['Bản đồ', world.maps], ['Yêu thú', world.monsters],
    ['Vật phẩm', world.items], ['Đan dược', world.pills], ['Đan phương', world.recipes]
  ];
  $('#worldSummary').innerHTML = entries.map(([label, value]) => `<div><strong>${formatNumber(value)}</strong><span>${label}</span></div>`).join('');
}

function renderMaps() {
  const box = $('#mapList');
  if (!state.maps.length) {
    box.innerHTML = '<div class="empty-state">Chưa tìm thấy bản đồ trong Đạo Tạng.</div>';
    return;
  }
  box.innerHTML = state.maps.map(map => {
    const req = map.UnlockRequirement || {};
    const desc = typeof map.Description === 'string' ? map.Description : 'Khu vực chiến đấu thuộc Nhân Giới.';
    return `<article class="map-card"><span class="eyebrow">${map.regionName || 'Nhân Giới'}</span><h4>${map.name || map.id}</h4><p>${desc}</p><p>Yêu cầu: ${req.realmId || 'Không'} · tầng ${req.layer || 1}</p><button type="button" data-map-id="${map.id}">Chọn khu vực</button></article>`;
  }).join('');
  $$('[data-map-id]').forEach(button => button.addEventListener('click', () => toast('API chiến đấu chưa được nối trong backend hiện tại.')));
}

async function enterWorld() {
  const name = normalizeName($('#playerNameInput').value);
  const message = $('#entryMessage');
  if (name.length < 2) { message.textContent = 'Đạo hiệu phải có ít nhất 2 ký tự.'; return; }
  message.textContent = 'Đang dò tìm đạo đồ...';
  $('#enterWorldButton').disabled = true;
  try {
    let payload;
    try {
      payload = await api(`/api/player/by-name/${encodeURIComponent(name)}`);
      toast('Đã tải đạo đồ hiện có.');
    } catch (error) {
      if (error.status !== 404) throw error;
      payload = await api('/api/player', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name })
      });
      toast('Khai lập đạo hiệu thành công.');
    }
    state.player = payload.player;
    localStorage.setItem('tutien.playerName', state.player.name);
    showGame();
  } catch (error) {
    message.textContent = error.message.includes('Duplicate entry') ? 'Đạo hiệu đã tồn tại. Hãy tải lại trang hoặc thử lại.' : error.message;
  } finally {
    $('#enterWorldButton').disabled = false;
  }
}

function showGame() {
  $('#entryGate').classList.add('is-hidden');
  $('#gameRoot').classList.remove('is-hidden');
  renderPlayer();
}

function renderPlayer() {
  const p = state.player || {};
  $('#playerName').textContent = p.name || 'Vô Danh';
  $('#combatPlayerName').textContent = p.name || 'Đạo hữu';
  $('#playerSubtitle').textContent = `${p.main_realm_name || p.main_realm_id || 'Luyện Khí'} · Linh căn ${String(p.spiritual_root_id || 'phàm phẩm').replaceAll('_', ' ')}`;
  $('#spiritStones').textContent = formatNumber(p.spirit_stones);
  $('#lifespan').textContent = `${formatNumber(p.age_years || 16)} / ${formatNumber(p.lifespan_years || 80)}`;
  $('#currentActivity').textContent = activityNames[p.current_activity] || p.current_activity || 'Tĩnh tu';

  $('#mainRealm').textContent = realmLabel(p.main_realm_name || p.main_realm_id, p.main_layer);
  $('#bodyRealm').textContent = realmLabel(String(p.body_realm_id || 'Phàm Thể').replaceAll('_', ' '), p.body_layer);
  $('#soulRealm').textContent = realmLabel(String(p.soul_realm_id || 'Phàm Hồn').replaceAll('_', ' '), p.soul_layer);
  $('#mainExp').textContent = `${formatNumber(p.main_exp)} tu vi`;
  $('#bodyExp').textContent = `${formatNumber(p.body_exp)} thể tu`;
  $('#soulExp').textContent = `${formatNumber(p.soul_exp)} hồn lực`;
  $('#mainProgress').style.width = `${percent(p.main_exp)}%`;
  $('#bodyProgress').style.width = `${percent(p.body_exp)}%`;
  $('#soulProgress').style.width = `${percent(p.soul_exp)}%`;

  const hp = safeNumber(p.current_hp || 100);
  $('#hpStat').textContent = `${formatNumber(hp)} / ${formatNumber(hp)}`;
  $('#combatPlayerHp').textContent = `${formatNumber(hp)} / ${formatNumber(hp)} HP`;
  $('#playerHpBar').style.width = hp > 0 ? '100%' : '0%';
  $('#mpStat').textContent = `${formatNumber(p.current_mp)} / ${formatNumber(p.current_mp)}`;
  $('#rootStat').textContent = String(p.spiritual_root_id || 'linh_can_pham').replaceAll('_', ' ');
  $('#mapStat').textContent = String(p.current_map_id || 'map_ngoai_mon_son_lam').replaceAll('_', ' ');
  renderInventory(p.inventory);
}

function renderInventory(items) {
  const list = Array.isArray(items) ? items : [];
  $('#inventoryCount').textContent = `${list.length} vật phẩm`;
  $('#inventoryGrid').innerHTML = list.length
    ? list.map(item => `<article class="inventory-item"><strong>${String(item.item_id).replaceAll('_', ' ')}</strong><span>Số lượng: ${formatNumber(item.quantity)}</span><span>${item.bind_type === 'bound' ? 'Đã khóa' : 'Không khóa'}</span></article>`).join('')
    : '<div class="empty-state">Túi đồ hiện đang trống.</div>';
}

function activateTab(name) {
  $$('.tab-button').forEach(button => button.classList.toggle('is-active', button.dataset.tab === name));
  $$('.tab-panel').forEach(panel => panel.classList.toggle('is-active', panel.id === `tab-${name}`));
}

function setupTheme() {
  const saved = localStorage.getItem('tutien.theme') || 'dark';
  document.documentElement.dataset.theme = saved;
  $('#themeToggle').textContent = saved === 'dark' ? '☀' : '☾';
  $('#themeToggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('tutien.theme', next);
    $('#themeToggle').textContent = next === 'dark' ? '☀' : '☾';
  });
}

async function init() {
  setupTheme();
  $$('.tab-button').forEach(button => button.addEventListener('click', () => activateTab(button.dataset.tab)));
  $$('[data-open-tab]').forEach(button => button.addEventListener('click', () => activateTab(button.dataset.openTab)));
  $$('.locked-action').forEach(button => button.addEventListener('click', () => toast('Tính năng này đang chờ API backend tương ứng.')));
  $('#enterWorldButton').addEventListener('click', enterWorld);
  $('#playerNameInput').addEventListener('keydown', event => { if (event.key === 'Enter') enterWorld(); });
  $('#playerNameInput').value = localStorage.getItem('tutien.playerName') || '';
  try { await loadWorld(); } catch (error) { setStatus('Linh mạch gián đoạn', 'offline'); $('#entryMessage').textContent = error.message; }
}

init();
