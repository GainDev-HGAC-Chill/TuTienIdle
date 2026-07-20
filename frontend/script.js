const state = {
  playerId: Number(localStorage.getItem('tutien_player_id') || 0),
  profile: null,
  config: null,
  busy: false,
  refreshTimer: null,
  assessment: null,
  assessmentIndex: 0,
  assessmentAnswers: []
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

function fmt(value, maximumFractionDigits = 0) {
  return Number(value || 0).toLocaleString('vi-VN', {
    maximumFractionDigits
  });
}

function percent(value) {
  return `${fmt(Number(value || 0) * 100, 2)}%`;
}

function clampPercent(current, maximum) {
  const max = Number(maximum || 0);
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, Number(current || 0) / max * 100));
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
  $('#spiritualRoot').textContent = player.spiritual_root_name || 'Vô Danh Linh Căn';
  $('#power').textContent = fmt(player.power);
  $('#stones').textContent = fmt(player.spirit_stones);
  $('#expText').textContent = `${fmt(player.main_exp)} / ${fmt(player.exp_required)}`;
  $('#rateText').textContent = `${player.exp_percent}%`;
  $('#expBar').style.width = `${player.exp_percent}%`;
  $('#bodyExp').textContent = fmt(player.body_exp);
  $('#soulExp').textContent = fmt(player.soul_exp);
  $('#breakBtn').disabled = !player.can_breakthrough;

  const map = state.config.maps.find(item => String(item.id) === String(player.map_id));
  const monster = state.config.monsters.find(item => String(item.id) === String(player.monster_id));
  $('#mapName').textContent = map?.name || 'Chưa chọn';
  $('#monsterName').textContent = monster?.name || 'Chưa gặp yêu thú';

  const monsterPercent = player.monster_max_hp
    ? Math.max(0, player.monster_hp / player.monster_max_hp * 100)
    : 0;
  $('#monsterBar').style.width = `${monsterPercent}%`;
  $('#monsterHp').textContent = `${fmt(player.monster_hp)} / ${fmt(player.monster_max_hp)}`;
  $('#record').textContent = `${fmt(player.wins)} thắng · ${fmt(player.losses)} bại`;

  const playerHpPercent = clampPercent(player.current_hp, player.max_hp);
  const playerMpPercent = clampPercent(player.current_mp, player.max_mp);

  // Tổng Quan
  $('#overviewPlayerName').textContent = player.name;
  $('#overviewRealm').textContent =
    `${player.realm_name} · Tầng ${player.main_layer}`;
  $('#overviewHp').textContent =
    `${fmt(player.current_hp)} / ${fmt(player.max_hp)}`;
  $('#overviewMp').textContent =
    `${fmt(player.current_mp)} / ${fmt(player.max_mp)}`;
  $('#overviewHpBar').style.width = `${playerHpPercent}%`;
  $('#overviewMpBar').style.width = `${playerMpPercent}%`;
  $('#overviewActivity').textContent = activityName(player.current_activity);
  $('#overviewPower').textContent = fmt(player.power);
  $('#overviewStones').textContent = fmt(player.spirit_stones);
  $('#overviewRecord').textContent =
    `${fmt(player.wins)} thắng · ${fmt(player.losses)} bại`;

  $('#overviewRootName').textContent =
    player.spiritual_root_name || 'Vô Danh Linh Căn';
  const rootGradeDisplay = player.is_innate_special_root
    ? `${player.spiritual_root_grade || 'không rõ'} · Thiên sinh đặc tính`
    : (player.spiritual_root_grade || 'không rõ');
  $('#rootGrade').textContent = rootGradeDisplay;
  $('#rootGradeText').textContent = rootGradeDisplay;

  const rootConfig = state.config.spiritualRoots?.find(
    item => String(item.id) === String(player.spiritual_root)
  );

  $('#rootElement').textContent = rootConfig?.element || 'không rõ';
  $('#rootDescription').textContent =
    player.spiritual_root_description ||
    rootConfig?.description ||
    'Chưa có ghi chép về Linh Căn này.';

  $('#statHp').textContent =
    `${fmt(player.current_hp)} / ${fmt(player.max_hp)}`;
  $('#statMp').textContent =
    `${fmt(player.current_mp)} / ${fmt(player.max_mp)}`;
  $('#statAttack').textContent = fmt(player.attack_value);
  $('#statDefense').textContent = fmt(player.defense_value);
  $('#statAccuracy').textContent = fmt(player.accuracy);
  $('#statDodge').textContent = percent(player.dodge_rate);
  $('#statCrit').textContent = percent(player.crit_rate);
  $('#statCritDamage').textContent = percent(player.crit_damage);
  $('#statSpeed').textContent = fmt(player.speed_value);
  $('#statArmorPen').textContent = fmt(player.armor_penetration);
  $('#statCritResist').textContent = percent(player.crit_resistance);
  $('#statLifeSteal').textContent = percent(player.life_steal);
  $('#statHpRegen').textContent = `${fmt(player.hp_regen, 2)}/s`;
  $('#statMpRegen').textContent = `${fmt(player.mp_regen, 2)}/s`;
  $('#statCultivation').textContent =
    `${fmt(player.cultivation_rate, 2)}/s`;
  $('#statPower').textContent = fmt(player.power);

  const growth = player.spiritual_root_growth || {};
  $('#rootGrowth').innerHTML = [
    ['Sinh Lực', growth.hp],
    ['Nội Lực', growth.mp],
    ['Công Kích', growth.attack],
    ['Phòng Thủ', growth.defense]
  ].map(([label, value]) =>
    `<span>${label} ×${fmt(value || 1, 2)}</span>`
  ).join('');

  // Chiến Đạo chỉ giữ dữ liệu trực tiếp phục vụ giao chiến.
  $('#combatPlayerName').textContent = player.name;
  $('#combatPlayerRealm').textContent =
    `${player.realm_name} · Tầng ${player.main_layer}`;
  $('#combatPlayerHp').textContent =
    `${fmt(player.current_hp)} / ${fmt(player.max_hp)}`;
  $('#combatPlayerMp').textContent =
    `${fmt(player.current_mp)} / ${fmt(player.max_mp)}`;
  $('#playerHpBar').style.width = `${playerHpPercent}%`;
  $('#playerMpBar').style.width = `${playerMpPercent}%`;

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
  const unlockedIds = new Set(unlocked.map(item => String(item.id)));
  $('#mapList').innerHTML = state.config.maps.map(map => `
    <div class="map-option ${unlockedIds.has(String(map.id)) ? '' : 'locked'}">
      <div>
        <b>${map.name}</b>
        <small style="display:block">
          Yêu cầu: ${state.config.realms[map.realmRequired].name} tầng ${map.layerRequired}
        </small>
      </div>
      <button ${unlockedIds.has(String(map.id)) ? `onclick="selectMap(${JSON.stringify(map.id)})"` : 'disabled'}>Chọn</button>
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

function closeAssessment() {
  state.assessment = null;
  state.assessmentIndex = 0;
  state.assessmentAnswers = [];
  $('#assessmentModal').classList.add('hidden');
  $('#assessmentAnswers').innerHTML = '';
}

function renderAssessmentQuestion() {
  const assessment = state.assessment;
  if (!assessment) return;

  const question = assessment.questions[state.assessmentIndex];
  $('#assessmentProgress').textContent =
    `Thiên vấn ${state.assessmentIndex + 1} / ${assessment.total}`;
  $('#assessmentProgressBar').style.width =
    `${(state.assessmentIndex + 1) / assessment.total * 100}%`;
  $('#assessmentQuestion').textContent = question.text;
  $('#assessmentAnswers').innerHTML = question.answers.map((answer, index) => `
    <button class="assessment-answer" data-answer-id="${answer.id}">
      <span>${String.fromCharCode(65 + index)}</span>
      <b>${answer.text}</b>
    </button>
  `).join('');

  $$('.assessment-answer').forEach(button => {
    button.onclick = () => chooseAssessmentAnswer(button.dataset.answerId);
  });
}

async function beginAssessment() {
  const name = $('#nameInput').value.trim();
  if (name.length < 2 || name.length > 24) {
    $('#gateMsg').textContent = 'Đạo hiệu phải từ 2 đến 24 ký tự.';
    return;
  }

  $('#gateMsg').textContent = '';
  try {
    const data = await api('/api/player/assessment');
    state.assessment = data.assessment;
    state.assessmentIndex = 0;
    state.assessmentAnswers = [];
    $('#assessmentModal').classList.remove('hidden');
    renderAssessmentQuestion();
  } catch (error) {
    $('#gateMsg').textContent = error.message;
  }
}

async function chooseAssessmentAnswer(answerId) {
  if (!state.assessment) return;

  const question = state.assessment.questions[state.assessmentIndex];
  state.assessmentAnswers.push({
    questionId: question.id,
    answerId
  });

  state.assessmentIndex += 1;
  if (state.assessmentIndex < state.assessment.total) {
    renderAssessmentQuestion();
    return;
  }

  const name = $('#nameInput').value.trim();
  $('#assessmentQuestion').textContent = 'Thiên Mệnh đang hiển hóa...';
  $('#assessmentAnswers').innerHTML =
    '<div class="assessment-wait">Không thể quay đầu sau khi đạo cơ được định.</div>';

  try {
    openGame(await api('/api/player', {
      method: 'POST',
      body: JSON.stringify({
        name,
        assessmentToken: state.assessment.token,
        answers: state.assessmentAnswers
      })
    }));
    closeAssessment();
    toast('Thiên Mệnh đã định, tiên lộ chính thức khai mở.');
  } catch (error) {
    closeAssessment();
    $('#gateMsg').textContent = error.message;
  }
}

$('#createBtn').onclick = beginAssessment;
$('#cancelAssessment').onclick = closeAssessment;

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
