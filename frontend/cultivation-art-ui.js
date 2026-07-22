(function () {
  'use strict';

  const CATEGORY_NAMES = {
    tam_phap: 'Tâm Pháp',
    chien_phap: 'Chiến Pháp',
    luyen_the: 'Luyện Thể Pháp',
    than_thong: 'Thần Thông'
  };

  const GRADE_NAMES = {
    pham: 'Phàm',
    hoang: 'Hoàng',
    huyen: 'Huyền',
    dia: 'Địa',
    thien: 'Thiên'
  };

  const state = {
    playerId: 0,
    loading: false,
    profile: null,
    timer: null
  };

  function getPlayerId() {
    return Number(localStorage.getItem('tutien_player_id') || 0);
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.error || 'Công Pháp Đạo Tàng không phản hồi.');
    }

    return data;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function ensureStyles() {
    if (document.getElementById('cultivation-art-ui-style')) return;

    const style = document.createElement('style');
    style.id = 'cultivation-art-ui-style';
    style.textContent = `
      .dao-art-panel{margin-top:18px;padding:16px;border:1px solid var(--border,#d5c5a3);border-radius:14px;background:var(--panel,#fffaf0)}
      .dao-art-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
      .dao-art-header h3{margin:0;font-size:18px}
      .dao-art-resources{display:flex;flex-wrap:wrap;gap:8px;font-size:12px;opacity:.85}
      .dao-art-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
      .dao-art-card{padding:12px;border:1px solid var(--border,#d5c5a3);border-radius:12px;background:rgba(255,255,255,.45)}
      body.dark .dao-art-card{background:rgba(0,0,0,.18)}
      .dao-art-card.inactive{opacity:.62}
      .dao-art-title{display:flex;justify-content:space-between;gap:8px;font-weight:700}
      .dao-art-meta,.dao-art-reason{margin-top:6px;font-size:12px;opacity:.82}
      .dao-art-progress{height:7px;margin-top:9px;border-radius:999px;overflow:hidden;background:rgba(127,127,127,.22)}
      .dao-art-progress>span{display:block;height:100%;background:currentColor}
      .dao-art-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
      .dao-art-actions button{padding:6px 9px;border-radius:8px;cursor:pointer}
      .dao-art-empty{padding:12px;opacity:.75}
      .dao-art-status{font-size:12px;min-height:18px;margin-top:8px}
    `;
    document.head.appendChild(style);
  }

  function findOverviewContainer() {
    return (
      document.getElementById('overview') ||
      document.getElementById('tab-overview') ||
      document.querySelector('[data-pane="overview"]') ||
      document.querySelector('.tab-pane.active')
    );
  }

  function ensurePanel() {
    let panel = document.getElementById('cultivation-art-panel');
    if (panel) return panel;

    const container = findOverviewContainer();
    if (!container) return null;

    panel = document.createElement('section');
    panel.id = 'cultivation-art-panel';
    panel.className = 'dao-art-panel';
    panel.innerHTML = `
      <div class="dao-art-header">
        <h3>Công Pháp Đạo Tàng</h3>
        <button type="button" id="dao-art-refresh">Làm mới</button>
      </div>
      <div class="dao-art-resources" id="dao-art-resources"></div>
      <div class="dao-art-grid" id="dao-art-grid"></div>
      <div class="dao-art-status" id="dao-art-status"></div>
    `;
    container.appendChild(panel);

    panel.querySelector('#dao-art-refresh').onclick = () => load(true);
    panel.addEventListener('click', handleAction);
    return panel;
  }

  function equippedMap(profile) {
    return new Map(
      (profile?.equipped || []).map(item => [String(item.category), String(item.art_id)])
    );
  }

  function render() {
    const panel = ensurePanel();
    if (!panel) return;

    const profile = state.profile;
    const grid = panel.querySelector('#dao-art-grid');
    const resources = panel.querySelector('#dao-art-resources');
    const equipped = equippedMap(profile);
    const owned = Array.isArray(profile?.owned) ? profile.owned : [];
    const resourceData = profile?.resources || {};

    resources.innerHTML = [
      ['Linh khí', resourceData.spirit_qi],
      ['Chiến ý', resourceData.battle_intent],
      ['Khí huyết', resourceData.blood_qi],
      ['Tinh hoa', resourceData.cultivation_essence]
    ].map(([label, value]) => `<span>${label}: <b>${Number(value || 0).toLocaleString('vi-VN')}</b></span>`).join('');

    if (!owned.length) {
      grid.innerHTML = '<div class="dao-art-empty">Chưa lĩnh ngộ Công Pháp.</div>';
      return;
    }

    grid.innerHTML = owned.map(item => {
      const art = item.art || {};
      const category = String(item.category || art.category || '');
      const isEquipped = equipped.get(category) === String(item.art_id);
      const progress = Math.max(0, Math.min(100, Number(item.progress_percent || 0)));
      const grade = GRADE_NAMES[item.grade] || item.grade || 'Phàm';
      const active = item.active !== false;
      const reason = item.inactiveReason || item.inactive_reason || '';

      return `
        <article class="dao-art-card${active ? '' : ' inactive'}">
          <div class="dao-art-title">
            <span>${escapeHtml(art.name || item.art_id)}</span>
            <span>${isEquipped ? 'Đang vận chuyển' : 'Chưa trang bị'}</span>
          </div>
          <div class="dao-art-meta">
            ${escapeHtml(CATEGORY_NAMES[category] || category)} · ${escapeHtml(grade)} phẩm · Cấp ${Number(item.art_level || 1)}
          </div>
          ${reason ? `<div class="dao-art-reason">${escapeHtml(reason)}</div>` : ''}
          <div class="dao-art-progress"><span style="width:${progress}%"></span></div>
          <div class="dao-art-meta">${progress.toFixed(2)}% · Thông thạo ${Number(item.proficiency || 0)}</div>
          <div class="dao-art-actions">
            ${isEquipped
              ? `<button type="button" data-art-action="unequip" data-category="${escapeHtml(category)}">Tháo</button>`
              : `<button type="button" data-art-action="equip" data-art-id="${escapeHtml(item.art_id)}">Trang bị</button>`}
            <button type="button" data-art-action="cultivate" data-art-id="${escapeHtml(item.art_id)}">Tu luyện</button>
            <button type="button" data-art-action="breakthrough" data-art-id="${escapeHtml(item.art_id)}">Đột phá</button>
          </div>
        </article>
      `;
    }).join('');
  }

  function setStatus(message) {
    const element = document.getElementById('dao-art-status');
    if (element) element.textContent = message || '';
  }

  async function refreshMainProfile() {
    if (!state.playerId || typeof window.openGame !== 'function') return;
    try {
      const data = await request(`/api/player/${state.playerId}`);
      window.openGame(data);
    } catch (_) {
      // UI Công Pháp vẫn hoạt động độc lập nếu giao diện chính không công khai openGame.
    }
  }

  async function handleAction(event) {
    const button = event.target.closest('[data-art-action]');
    if (!button || !state.playerId || state.loading) return;

    const action = button.dataset.artAction;
    const artId = button.dataset.artId;
    const category = button.dataset.category;
    const endpoint = `/api/cultivation-arts/player/${state.playerId}/${action}`;
    const body = action === 'unequip'
      ? { category }
      : action === 'cultivate'
        ? { artId, mode: 'one' }
        : { artId };

    state.loading = true;
    button.disabled = true;
    setStatus('Đạo vận đang chuyển hóa...');

    try {
      const data = await request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      state.profile = data;
      render();
      setStatus('Công Pháp đã cập nhật.');
      await refreshMainProfile();
    } catch (error) {
      setStatus(error.message);
    } finally {
      state.loading = false;
    }
  }

  async function load(force = false) {
    const playerId = getPlayerId();
    if (!playerId) {
      state.playerId = 0;
      state.profile = null;
      document.getElementById('cultivation-art-panel')?.remove();
      return;
    }

    if (state.loading) return;
    if (!force && state.playerId === playerId && state.profile) {
      ensurePanel();
      return;
    }

    state.loading = true;
    state.playerId = playerId;

    try {
      state.profile = await request(`/api/cultivation-arts/player/${playerId}`);
      ensureStyles();
      render();
      setStatus('');
    } catch (error) {
      ensureStyles();
      ensurePanel();
      setStatus(error.message);
    } finally {
      state.loading = false;
    }
  }

  window.addEventListener('thienmenh:created', () => {
    window.setTimeout(() => load(true), 100);
  });

  document.addEventListener('DOMContentLoaded', () => {
    load(true);
    state.timer = window.setInterval(() => load(false), 2000);
  });

  window.CongPhapUI = { load, render };
})();
