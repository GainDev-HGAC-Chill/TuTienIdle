(function () {
  'use strict';

  const CATEGORY_NAMES = {
    tam_phap: 'Tâm Pháp',
    chien_phap: 'Chiến Pháp',
    luyen_the: 'Luyện Thể Pháp',
    than_thong: 'Thần Thông'
  };

  const CATEGORY_SIGILS = {
    tam_phap: '心',
    chien_phap: '戰',
    luyen_the: '體',
    than_thong: '神'
  };

  const GRADE_NAMES = {
    pham: 'Phàm',
    hoang: 'Hoàng',
    huyen: 'Huyền',
    dia: 'Địa',
    thien: 'Thiên'
  };

  const STAT_NAMES = {
    MAX_HP: 'Sinh lực tối đa',
    MAX_MP: 'Nội lực tối đa',
    ATTACK: 'Công kích',
    DEFENSE: 'Phòng thủ',
    ACCURACY: 'Chính xác',
    DODGE: 'Né tránh',
    DODGE_RATE: 'Né tránh',
    CRIT_RATE: 'Bạo kích',
    CRIT_DAMAGE: 'Bạo thương',
    ACTION_SPEED: 'Tốc độ',
    SPEED: 'Tốc độ',
    ARMOR_PENETRATION: 'Xuyên giáp',
    CRIT_RESIST: 'Kháng bạo',
    CRIT_RESISTANCE: 'Kháng bạo',
    LIFE_STEAL: 'Hút máu',
    HP_REGEN: 'Hồi sinh lực',
    MP_REGEN: 'Hồi nội lực',
    CULTIVATION_RATE: 'Tốc độ tu luyện'
  };

  const state = {
    playerId: 0,
    profile: null,
    category: 'all',
    query: '',
    loading: false,
    selectedSlot: null,
    timer: null
  };

  const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function getPlayerId() {
    return Number(
      window.state?.playerId ||
      window.state?.player?.id ||
      localStorage.getItem('tutien_player_id') ||
      0
    );
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.error || data.message || 'Thiên Cơ Công Pháp gián đoạn.');
    }
    return data;
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString('vi-VN', {
      maximumFractionDigits: 2
    });
  }

  function equippedBySlot() {
    const map = new Map();
    for (const item of state.profile?.equipped || []) {
      map.set(`${item.category}:${Number(item.slot_index)}`, item);
    }
    return map;
  }

  function equippedByArt() {
    return new Map(
      (state.profile?.equipped || []).map(item => [String(item.art_id), item])
    );
  }

  function ownedByArt() {
    return new Map(
      (state.profile?.owned || []).map(item => [String(item.art_id), item])
    );
  }

  function updateOverviewSummary() {
    const count = document.getElementById('overviewArtsCount');
    const potential = document.getElementById('overviewArtsPotential');
    if (count) {
      count.textContent = `${Number(state.profile?.equippedCount || 0)} / 12`;
    }
    if (potential) {
      potential.textContent = formatNumber(state.profile?.equippedPotential || 0);
    }
  }

  function renderResources() {
    const resources = state.profile?.resources || {};
    const host = document.getElementById('artResources');
    if (!host) return;

    host.innerHTML = [
      ['Linh khí', resources.spirit_qi],
      ['Chiến ý', resources.battle_intent],
      ['Khí huyết', resources.blood_qi],
      ['Tinh hoa', resources.cultivation_essence]
    ].map(([label, value]) => `
      <div><span>${label}</span><b>${formatNumber(value)}</b></div>
    `).join('');
  }

  function renderLoadouts() {
    const host = document.getElementById('artLoadoutGrid');
    if (!host) return;

    const slotMap = equippedBySlot();
    host.innerHTML = Object.keys(CATEGORY_NAMES).map(category => {
      const slots = [1, 2, 3].map(slotIndex => {
        const item = slotMap.get(`${category}:${slotIndex}`);
        if (!item) {
          return `
            <button type="button"
                    class="art-slot empty${isSelected(category, slotIndex) ? ' selected' : ''}"
                    data-slot-category="${category}"
                    data-slot-index="${slotIndex}">
              <span class="art-slot-number">Ô ${slotIndex}</span>
              <span class="art-slot-empty">Chưa vận hành</span>
            </button>
          `;
        }

        return `
          <button type="button"
                  class="art-slot occupied${isSelected(category, slotIndex) ? ' selected' : ''}"
                  data-slot-category="${category}"
                  data-slot-index="${slotIndex}"
                  data-tooltip-art="${escapeHtml(item.art_id)}">
            <span class="art-slot-number">Ô ${slotIndex}</span>
            <strong>${escapeHtml(item.art?.name || item.art_id)}</strong>
            <small>${escapeHtml(GRADE_NAMES[item.grade] || item.grade)} phẩm · Cấp ${Number(item.art_level || 1)}</small>
            <em>Tiềm lực ${formatNumber(item.potential)}</em>
          </button>
        `;
      }).join('');

      return `
        <article class="art-school" data-category="${category}">
          <div class="art-school-head">
            <span class="art-school-sigil">${CATEGORY_SIGILS[category]}</span>
            <div>
              <h3>${CATEGORY_NAMES[category]}</h3>
              <p>Tối đa 3 cuốn cùng vận hành</p>
            </div>
          </div>
          <div class="art-slot-row">${slots}</div>
        </article>
      `;
    }).join('');
  }

  function isSelected(category, slotIndex) {
    return state.selectedSlot?.category === category &&
      Number(state.selectedSlot?.slotIndex) === Number(slotIndex);
  }

  function filteredOwned() {
    const query = state.query.trim().toLowerCase();
    return (state.profile?.owned || []).filter(item => {
      const category = item.category || item.art?.category;
      if (state.category !== 'all' && category !== state.category) return false;
      if (!query) return true;

      const haystack = [
        item.art?.name,
        item.art?.description,
        CATEGORY_NAMES[category],
        item.grade
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }

  function renderLibrary() {
    const host = document.getElementById('artLibraryGrid');
    const count = document.getElementById('artLibraryCount');
    if (!host) return;

    const equipped = equippedByArt();
    const items = filteredOwned();
    if (count) count.textContent = `${items.length} công pháp`;

    if (!items.length) {
      host.innerHTML = '<div class="art-empty-state">Không tìm thấy Công Pháp phù hợp.</div>';
      return;
    }

    host.innerHTML = items.map(item => {
      const art = item.art || {};
      const category = item.category || art.category;
      const equippedSlot = equipped.get(String(item.art_id));
      const progress = Math.max(0, Math.min(100, Number(item.progress_percent || 0)));
      const progressValue = category === 'than_thong'
        ? item.proficiency
        : item.art_exp;

      return `
        <article class="art-library-card${equippedSlot ? ' equipped' : ''}"
                 data-tooltip-art="${escapeHtml(item.art_id)}">
          <div class="art-card-head">
            <span class="art-card-sigil">${CATEGORY_SIGILS[category] || '法'}</span>
            <div>
              <h4>${escapeHtml(art.name || item.art_id)}</h4>
              <p>${escapeHtml(CATEGORY_NAMES[category] || category)} · ${escapeHtml(GRADE_NAMES[item.grade] || item.grade)} phẩm</p>
            </div>
            <span class="art-pot">${formatNumber(item.potential)} Tiềm lực</span>
          </div>
          <p class="art-description">${escapeHtml(art.description || 'Chưa có mô tả.')}</p>
          <div class="art-level-line">
            <span>Cấp ${Number(item.art_level || 1)}</span>
            <span>${formatNumber(progressValue)} / ${item.required_exp ? formatNumber(item.required_exp) : 'Viên mãn'}</span>
          </div>
          <div class="art-progress"><i style="width:${progress}%"></i></div>
          <div class="art-card-actions">
            ${equippedSlot
              ? `<button type="button" data-art-action="unequip" data-category="${category}" data-slot-index="${Number(equippedSlot.slot_index)}">Tháo ô ${Number(equippedSlot.slot_index)}</button>`
              : `<button type="button" class="primary" data-art-action="equip" data-art-id="${escapeHtml(item.art_id)}">Vận hành</button>`}
            ${category !== 'than_thong'
              ? `<button type="button" data-art-action="cultivate" data-art-id="${escapeHtml(item.art_id)}">Tu luyện</button>`
              : '<span class="art-action-note">Thi triển để tăng thông thạo</span>'}
            ${Number(item.art_level || 1) >= 100
              ? `<button type="button" data-art-action="breakthrough" data-art-id="${escapeHtml(item.art_id)}">Đột phá phẩm</button>`
              : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  function renderFilters() {
    document.querySelectorAll('[data-art-filter]').forEach(button => {
      button.classList.toggle('active', button.dataset.artFilter === state.category);
    });
  }

  function render() {
    renderResources();
    renderLoadouts();
    renderLibrary();
    renderFilters();
    updateOverviewSummary();
  }

  function setStatus(message, type = '') {
    const host = document.getElementById('artStatus');
    if (!host) return;
    host.textContent = message || '';
    host.dataset.type = type;
  }

  function selectSlot(category, slotIndex) {
    state.selectedSlot = { category, slotIndex: Number(slotIndex) };
    state.category = category;
    render();
    setStatus(`Đã chọn ${CATEGORY_NAMES[category]} · Ô ${slotIndex}.`);
  }

  async function equipArt(artId) {
    const owned = ownedByArt().get(String(artId));
    if (!owned) throw new Error('Không tìm thấy Công Pháp đã lĩnh ngộ.');

    const category = owned.category || owned.art?.category;
    const body = { artId };
    if (state.selectedSlot?.category === category) {
      body.slotIndex = state.selectedSlot.slotIndex;
    }

    state.profile = await request(
      `/api/cultivation-arts/player/${state.playerId}/equip`,
      { method: 'POST', body: JSON.stringify(body) }
    );
    state.selectedSlot = null;
  }

  async function handleAction(event) {
    const slot = event.target.closest('[data-slot-category]');
    if (slot) {
      selectSlot(slot.dataset.slotCategory, slot.dataset.slotIndex);
      return;
    }

    const button = event.target.closest('[data-art-action]');
    if (!button || state.loading || !state.playerId) return;

    state.loading = true;
    button.disabled = true;
    setStatus('Đạo vận đang chuyển hóa...');

    try {
      const action = button.dataset.artAction;
      if (action === 'equip') {
        await equipArt(button.dataset.artId);
      } else if (action === 'unequip') {
        state.profile = await request(
          `/api/cultivation-arts/player/${state.playerId}/unequip`,
          {
            method: 'POST',
            body: JSON.stringify({
              category: button.dataset.category,
              slotIndex: Number(button.dataset.slotIndex)
            })
          }
        );
      } else if (action === 'cultivate') {
        state.profile = await request(
          `/api/cultivation-arts/player/${state.playerId}/cultivate`,
          {
            method: 'POST',
            body: JSON.stringify({ artId: button.dataset.artId, mode: 'one' })
          }
        );
      } else if (action === 'breakthrough') {
        state.profile = await request(
          `/api/cultivation-arts/player/${state.playerId}/breakthrough`,
          {
            method: 'POST',
            body: JSON.stringify({ artId: button.dataset.artId })
          }
        );
      }

      render();
      setStatus('Công Pháp đã cập nhật.', 'success');
      if (window.state?.playerId && typeof window.openGame === 'function') {
        const playerData = await request(`/api/player/${window.state.playerId}`);
        window.openGame(playerData);
      }
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      state.loading = false;
      button.disabled = false;
    }
  }

  function tooltipHtml(item) {
    const art = item?.art || {};
    const grade = art.grades?.[item.grade] || {};
    const stats = Array.isArray(grade.stats) ? grade.stats : [];
    const effects = Array.isArray(grade.effects) ? grade.effects : [];

    const statRows = stats.length
      ? stats.map(stat => {
          const unit = stat.unit === 'percent' ? '%' : '';
          return `<li><span>${escapeHtml(STAT_NAMES[stat.key] || stat.key)}</span><b>+${formatNumber(stat.value)}${unit}</b></li>`;
        }).join('')
      : '<li><span>Thuộc tính</span><b>Không có</b></li>';

    const effectRows = effects.map(effect => `
      <li><span>${escapeHtml(effect.id || 'Hiệu ứng')}</span><b>${formatNumber(effect.chancePercent)}%</b></li>
    `).join('');

    return `
      <div class="art-tooltip-title">${escapeHtml(art.name || item.art_id)}</div>
      <div class="art-tooltip-sub">${escapeHtml(CATEGORY_NAMES[item.category] || item.category)} · ${escapeHtml(GRADE_NAMES[item.grade] || item.grade)} phẩm · Cấp ${Number(item.art_level || 1)}</div>
      <p>${escapeHtml(art.description || 'Chưa có mô tả.')}</p>
      <div class="art-tooltip-pot">Tiềm lực hiện tại: <b>${formatNumber(item.potential)}</b></div>
      <ul>${statRows}${effectRows}</ul>
      <small>${art.rootName ? `Tương hợp: ${escapeHtml(art.rootName)}` : 'Không giới hạn căn nguyên'}</small>
    `;
  }

  function showTooltip(event) {
    const target = event.target.closest('[data-tooltip-art]');
    const tooltip = document.getElementById('artTooltip');
    if (!target || !tooltip) return;

    const item = ownedByArt().get(String(target.dataset.tooltipArt));
    if (!item) return;

    tooltip.innerHTML = tooltipHtml(item);
    tooltip.classList.remove('hidden');
    moveTooltip(event);
  }

  function moveTooltip(event) {
    const tooltip = document.getElementById('artTooltip');
    if (!tooltip || tooltip.classList.contains('hidden')) return;

    const margin = 16;
    let left = event.clientX + margin;
    let top = event.clientY + margin;
    const bounds = tooltip.getBoundingClientRect();

    if (left + bounds.width > window.innerWidth - margin) {
      left = event.clientX - bounds.width - margin;
    }
    if (top + bounds.height > window.innerHeight - margin) {
      top = window.innerHeight - bounds.height - margin;
    }

    tooltip.style.left = `${Math.max(margin, left)}px`;
    tooltip.style.top = `${Math.max(margin, top)}px`;
  }

  function hideTooltip() {
    document.getElementById('artTooltip')?.classList.add('hidden');
  }

  async function load(force = false) {
    const playerId = getPlayerId();
    if (!playerId) {
      state.playerId = 0;
      state.profile = null;
      return;
    }
    if (state.loading) return;
    if (!force && state.playerId === playerId && state.profile) return;

    state.loading = true;
    state.playerId = playerId;
    try {
      state.profile = await request(`/api/cultivation-arts/player/${playerId}`);
      render();
      setStatus('');
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      state.loading = false;
    }
  }

  function bindEvents() {
    const tab = document.getElementById('cultivationArtTab');
    if (!tab) return;

    tab.addEventListener('click', handleAction);
    tab.addEventListener('mouseover', showTooltip);
    tab.addEventListener('mousemove', moveTooltip);
    tab.addEventListener('mouseout', event => {
      if (!event.relatedTarget?.closest?.('[data-tooltip-art]')) hideTooltip();
    });

    document.querySelectorAll('[data-art-filter]').forEach(button => {
      button.addEventListener('click', () => {
        state.category = button.dataset.artFilter;
        state.selectedSlot = null;
        render();
      });
    });

    document.getElementById('artSearch')?.addEventListener('input', event => {
      state.query = event.target.value;
      renderLibrary();
    });

    document.getElementById('artRefreshBtn')?.addEventListener('click', () => load(true));

    document.querySelector('[data-tab="cultivationArtTab"]')?.addEventListener('click', () => {
      load(true);
    });
  }

  window.addEventListener('thienmenh:created', () => {
    window.setTimeout(() => load(true), 100);
  });

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    load(true);
    state.timer = window.setInterval(() => load(false), 3000);
  });

  window.CongPhapUI = { load, render };
})();
