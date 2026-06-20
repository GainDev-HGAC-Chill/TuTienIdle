(function () {
  function byId(id) { return document.getElementById(id); }

  function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function fmtTime(at) {
    const n = Number(at || 0);
    if (!n) return '';
    return new Date(n).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  function getUsername() {
    const fromWindow = window.playerData && window.playerData.username;
    const fromStorage = localStorage.getItem('tuTienUsername');
    return String(fromWindow || fromStorage || '').trim();
  }

  function cleanupDuplicatedPanels() {
    const overview = byId('tab-overview');
    if (!overview) return;

    const keep = overview.querySelector('[data-dao-action-log-panel="1"]');
    const panels = Array.from(overview.querySelectorAll('.activity-panel, .dao-action-log-panel, .server-action-log-panel'));

    panels.forEach(function (panel) {
      if (keep && panel === keep) return;
      panel.remove();
    });
  }

  function ensurePanel() {
    const overview = byId('tab-overview');
    if (!overview) return null;

    cleanupDuplicatedPanels();

    let panel = overview.querySelector('[data-dao-action-log-panel="1"]');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'panel wide activity-panel dao-action-log-panel';
      panel.setAttribute('data-dao-action-log-panel', '1');
      panel.innerHTML = [
        '<div class="panel-head">',
        '<h3>Nhật Ký Đạo Hành</h3>',
        '<span>Không gồm combat</span>',
        '</div>',
        '<div id="activity-log-list" class="activity-log-list"></div>',
      ].join('');
      overview.appendChild(panel);
    }

    let box = byId('activity-log-list');
    if (!box) {
      box = document.createElement('div');
      box.id = 'activity-log-list';
      box.className = 'activity-log-list';
      panel.appendChild(box);
    }

    return box;
  }

  function renderLogs(box, logs) {
    if (!Array.isArray(logs) || !logs.length) {
      box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>';
      return;
    }

    box.innerHTML = logs.map(function (item) {
      const category = esc(item.categoryLabel || item.category || 'Thiên Cơ');
      const text = esc(item.text || item.message || 'Đạo hành biến động.');
      const detail = item.detail ? '<p>' + esc(item.detail) + '</p>' : '';
      const time = esc(fmtTime(item.at || item.time));
      const cls = esc(item.category || item.type || 'system');
      return '<div class="activity-log-item activity-' + cls + '">' +
        '<div><b>' + category + '</b><span>' + time + '</span></div>' +
        '<strong>' + text + '</strong>' + detail +
        '</div>';
    }).join('');
  }

  async function fetchServerLogs() {
    const username = getUsername();
    if (!username) return [];

    const res = await fetch('/api/player/' + encodeURIComponent(username) + '/action-log?limit=80', {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok || data.success === false) return [];
    return Array.isArray(data.logs) ? data.logs : [];
  }

  window.renderActivityLog = function renderActivityLogSafe() {
    const box = ensurePanel();
    if (!box) return;

    const data = window.playerData || null;
    const localLogs = Array.isArray(data && data.activityLog) ? data.activityLog : [];

    if (localLogs.length) {
      renderLogs(box, localLogs);
      return;
    }

    box.innerHTML = '<p class="empty">Đang soi nhật ký đạo hành...</p>';
    fetchServerLogs()
      .then(function (logs) { renderLogs(box, logs); })
      .catch(function () {
        box.innerHTML = '<p class="empty">Chưa đọc được nhật ký đạo hành.</p>';
      });
  };

  window.renderServerActionLog = function renderServerActionLogDisabled() {};

  document.addEventListener('DOMContentLoaded', function () {
    cleanupDuplicatedPanels();
  });
})();
