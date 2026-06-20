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

  function cleanupDuplicatedPanels() {
    const overview = byId('tab-overview');
    if (!overview) return;
    const panels = Array.from(overview.querySelectorAll('.activity-panel, .dao-action-log-panel, [data-dao-action-log-panel]'));
    panels.forEach(panel => panel.remove());
  }

  function ensurePanel() {
    const overview = byId('tab-overview');
    if (!overview) return null;

    let box = byId('dao-action-log-list');
    if (box) return box;

    cleanupDuplicatedPanels();

    const panel = document.createElement('div');
    panel.className = 'panel wide activity-panel dao-action-log-panel';
    panel.setAttribute('data-dao-action-log-panel', '1');
    panel.innerHTML = [
      '<div class="dao-action-log-head">',
      '<div>',
      '<h3>Nhật Ký Đạo Hành</h3>',
      '<p>Ghi lại luyện đan, dùng đan, dược viên, kỳ ngộ, công pháp. Không gồm combat.</p>',
      '</div>',
      '</div>',
      '<div id="dao-action-log-list" class="dao-action-log-list"></div>',
    ].join('');

    overview.appendChild(panel);
    return byId('dao-action-log-list');
  }

  window.renderActivityLog = function renderActivityLogSafe() {
    const box = ensurePanel();
    if (!box) return;

    const logs = Array.isArray(window.playerData && window.playerData.activityLog)
      ? window.playerData.activityLog
      : [];

    if (!logs.length) {
      box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>';
      return;
    }

    box.innerHTML = logs.map(function (item) {
      const category = esc(item.categoryLabel || item.category || 'Thiên Cơ');
      const text = esc(item.text || item.message || 'Đạo hành biến động.');
      const detail = item.detail ? '<p>' + esc(item.detail) + '</p>' : '';
      const time = esc(fmtTime(item.at || item.time));
      const cls = esc(item.category || item.type || 'system');
      return '<div class="dao-action-log-item dao-log-' + cls + '">' +
        '<div class="dao-action-log-meta"><b>' + category + '</b><span>' + time + '</span></div>' +
        '<strong>' + text + '</strong>' + detail +
        '</div>';
    }).join('');
  };

  window.renderServerActionLog = function renderServerActionLogDisabled() {};

  document.addEventListener('DOMContentLoaded', function () {
    cleanupDuplicatedPanels();
  });
})();
