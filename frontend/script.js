const state = {
  playerId: Number(localStorage.getItem('tutien_player_id') || 0),
  profile: null,
  config: null,
  busy: false,
  refreshTimer: null
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const error = new Error(data.error || 'Thiên Cơ không phản hồi.');
    error.statusCode = response.status;
    throw error;
  }
  return data;
}

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => element.classList.remove('show'), 2600);
}

function activityName(value) {
  return ({
    idle: 'Tĩnh tọa',
    spirit_cultivation: 'Linh Tu',
    combat: 'Chiến Đạo'
  })[value] || value;
}

function fmt(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function showGate(message = '') {
  state.playerId = 0;
  state.profile = null;
  localStorage.removeItem('tutien_player_id');
  $('#game').classList.add('hidden');
  $('#gate').classList.remove('hidden');
  $('#gateMsg').textContent = message;
}

async function loadConfig() {
  state.config = await api('/api/config');
}

function openGame(data) {
  state.profile = data;
  state.playerId = Number(data.player.id);
  localStorage.setItem('tutien_player_id', String(state.playerId));
  $('#gateMsg').textContent = '';
  $('#gate').classList.add('hidden');
  $('#game').classList.remove('hidden');
  render();
}

function render() {
  const data = state.profile;
  if (!data?.player || !state.config) return;

  const player = data.player;
  $('#playerName').textContent = player.name;
  $('#activityBadge').textContent = activityName(player.current_activity);
  $('#realm').textContent = `${player.realm_name} · Tầng ${player.main_layer}`;
  $('#power').textContent = fmt(player.power);
  $('#stones').textContent = fmt(player.spirit_stones);
  $('#hp').textContent = `${fmt(player.current_hp)} / ${fmt(player.max_hp)}`;
  $('#expText').textContent = `${fmt(player.main_exp)} / ${fmt(player.exp_required)}`;
  $('#rateText').textContent = `${player.exp_percent}%`;
  $('#expBar').style.width = `${player.exp_percent}%`;
  $('#bodyExp').textContent = fmt(player.body_exp);
  $('#soulExp').textContent = fmt(player.soul_exp);
  $('#breakBtn').disabled = !player.can_breakthrough;

  const map = state.config.maps.find(item => item.id === player.map_id);
  const monster = state.config.monsters.find(item => item.id === player.monster_id);
  $('#mapName').textContent = map?.name || 'Chưa chọn';
  $('#monsterName').textContent = monster?.name || 'Chưa gặp yêu thú';

  const monsterPercent = player.monster_max_hp
    ? Math.max(0, player.monster_hp / player.monster_max_hp * 100)
    : 0;
  $('#monsterBar').style.width = `${monsterPercent}%`;
  $('#monsterHp').textContent = `${fmt(player.monster_hp)} / ${fmt(player.monster_max_hp)}`;
  $('#record').textContent = `${fmt(player.wins)} thắng · ${fmt(player.losses)} bại`;

  renderInventory(data.inventory || []);
  renderLogs(data.logs || []);
  renderMaps(player.unlocked_maps || []);
}

function renderInventory(items) {
  $('#inventoryGrid').innerHTML = items.length
    ? items.map(item => `
      <article class="item">
        <h4>${item.item_name}</h4>
        <div class="qty">${fmt(item.quantity)}</div>
        <small>${item.item_type}</small>
        ${item.item_id === 'hoi_khi_dan' ? `
          <p>${item.metadata?.effect || ''}</p>
          <button onclick="useItem('${item.item_id}')">Sử dụng</button>
        ` : ''}
      </article>
    `).join('')
    : '<article class="card">Túi Càn Khôn trống.</article>';
}

function renderLogs(logs) {
  $('#logList').innerHTML = logs.length
    ? logs.map(item => `
      <div class="log">
        <b>[${item.category}]</b> ${item.message}
        <small>${new Date(item.created_at).toLocaleString('vi-VN')}</small>
      </div>
    `).join('')
    : 'Chưa có đạo hành được ghi nhận.';
}

function renderMaps(unlocked) {
  const unlockedIds = new Set(unlocked.map(item => item.id));
  $('#mapList').innerHTML = state.config.maps.map(map => `
    <div class="map-option ${unlockedIds.has(map.id) ? '' : 'locked'}">
      <div>
        <b>${map.name}</b>
        <small style="display:block">
          Yêu cầu: ${state.config.realms[map.realmRequired].name} tầng ${map.layerRequired}
        </small>
      </div>
      <button ${unlockedIds.has(map.id) ? `onclick="selectMap(${map.id})"` : 'disabled'}>Chọn</button>
    </div>
  `).join('');
}

async function refresh() {
  if (!state.playerId || state.busy) return;
  state.busy = true;
  try {
    openGame(await api(`/api/game/${state.playerId}/tick`, { method: 'POST' }));
  } catch (error) {
    if (error.statusCode === 404) {
      showGate('Nhân vật đã không còn trong đạo tàng. Hãy tạo mới hoặc nhập lại đạo hiệu.');
      return;
    }
    toast(error.message);
  } finally {
    state.busy = false;
  }
}

async function changeActivity(activity) {
  try {
    openGame(await api(`/api/game/${state.playerId}/activity`, {
      method: 'POST',
      body: JSON.stringify({ activity })
    }));
    toast(`Đã chuyển sang ${activityName(activity)}.`);
  } catch (error) {
    toast(error.message);
  }
}

async function selectMap(mapId) {
  try {
    openGame(await api(`/api/game/${state.playerId}/select-map`, {
      method: 'POST',
      body: JSON.stringify({ mapId })
    }));
    $('#modal').classList.add('hidden');
  } catch (error) {
    toast(error.message);
  }
}

async function useItem(itemId) {
  try {
    openGame(await api(`/api/game/${state.playerId}/use-item`, {
      method: 'POST',
      body: JSON.stringify({ itemId })
    }));
  } catch (error) {
    toast(error.message);
  }
}

window.selectMap = selectMap;
window.useItem = useItem;

$('#createBtn').onclick = async () => {
  const name = $('#nameInput').value.trim();
  if (name.length < 2) {
    $('#gateMsg').textContent = 'Đạo hiệu phải có ít nhất 2 ký tự.';
    return;
  }

  try {
    openGame(await api('/api/player', {
      method: 'POST',
      body: JSON.stringify({ name })
    }));
  } catch (error) {
    $('#gateMsg').textContent = error.message;
  }
};

$('#loadBtn').onclick = async () => {
  const name = $('#nameInput').value.trim();
  if (name.length < 2) {
    $('#gateMsg').textContent = 'Hãy nhập đạo hiệu cần tìm.';
    return;
  }

  try {
    openGame(await api(`/api/player/by-name/${encodeURIComponent(name)}`));
  } catch (error) {
    $('#gateMsg').textContent = error.statusCode === 404
      ? `Không tìm thấy đạo hữu “${name}”. Hãy kiểm tra đạo hiệu hoặc chọn Tạo nhân vật.`
      : error.message;
  }
};

$('#breakBtn').onclick = async () => {
  try {
    openGame(await api(`/api/game/${state.playerId}/breakthrough`, { method: 'POST' }));
  } catch (error) {
    toast(error.message);
  }
};

$$('[data-action]').forEach(button => {
  button.onclick = () => changeActivity(button.dataset.action);
});

$$('.tabs button').forEach(button => {
  button.onclick = () => {
    $$('.tabs button').forEach(item => item.classList.remove('active'));
    $$('.tab-pane').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    $('#' + button.dataset.tab).classList.add('active');
  };
});

$('#mapBtn').onclick = () => $('#modal').classList.remove('hidden');
$('#closeModal').onclick = () => $('#modal').classList.add('hidden');
$('#themeBtn').onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem(
    'tutien_theme',
    document.body.classList.contains('dark') ? 'dark' : 'light'
  );
};

if (localStorage.getItem('tutien_theme') === 'dark') {
  document.body.classList.add('dark');
}

(async function bootstrapFrontend() {
  try {
    await loadConfig();

    if (state.playerId) {
      try {
        openGame(await api(`/api/player/${state.playerId}`));
      } catch (error) {
        if (error.statusCode === 404) {
          showGate('Dữ liệu nhân vật cũ không còn tồn tại. Hãy tạo mới hoặc nhập lại đạo hiệu.');
        } else {
          throw error;
        }
      }
    }

    state.refreshTimer = window.setInterval(refresh, 2000);
  } catch (error) {
    toast(error.message);
  }
})();
