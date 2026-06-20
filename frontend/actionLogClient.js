(function () {
  const API_BASE = '';

  function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function getUsername() {
    return localStorage.getItem('tuTienUsername') || '';
  }

  function formatTime(at) {
    const time = Number(at || 0);
    if (!time) return '';
    return new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function ensurePanel() {
    let list = document.getElementById('server-action-log-list');
    if (list) return list;
    const overview = document.getElementById('tab-overview');
    if (!overview) return null;
    const panel = document.createElement('div');
    panel.className = 'panel wide server-action-log-panel';
    panel.innerHTML = `
      <div class="panel-title-row">
        <div>
          <h3>Nhật Ký Đạo Hành</h3>
          <p>Ghi trực tiếp từ server, không phụ thuộc tab đang mở.</p>
        </div>
        <button id="server-action-log-refresh" type="button">Làm mới</button>
      </div>
      <div id="server-action-log-list" class="server-action-log-list"><p class="empty">Đang đọc thiên cơ...</p></div>
    `;
    overview.appendChild(panel);
    document.getElementById('server-action-log-refresh')?.addEventListener('click', loadServerActionLogs);
    return document.getElementById('server-action-log-list');
  }

  async function loadServerActionLogs() {
    const box = ensurePanel();
    const username = getUsername();
    if (!box || !username) return;
    try {
      const res = await fetch(`${API_BASE}/api/player/${encodeURIComponent(username)}/action-logs?limit=80&includeCombat=1`);
      const data = await res.json();
      const logs = Array.isArray(data.logs) ? data.logs : [];
      if (!logs.length) {
        box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>';
        return;
      }
      box.innerHTML = logs.map(item => `
        <div class="server-action-log-item action-${esc(item.category || 'system')}">
          <div class="server-action-log-head">
            <b>${esc(item.categoryLabel || item.category || 'Thiên Cơ')}</b>
            <span>${esc(formatTime(item.at))}</span>
          </div>
          <strong>${esc(item.text || item.action || 'Hoạt động')}</strong>
          ${item.detail ? `<p>${esc(item.detail)}</p>` : ''}
        </div>
      `).join('');
    } catch (err) {
      box.innerHTML = `<p class="empty">Không đọc được Nhật Ký Đạo Hành: ${esc(err.message)}</p>`;
    }
  }

  const oldRenderAll = window.renderAll;
  if (typeof oldRenderAll === 'function') {
    window.renderAll = function () {
      oldRenderAll.apply(this, arguments);
      loadServerActionLogs();
    };
  }

  window.loadServerActionLogs = loadServerActionLogs;
  document.addEventListener('DOMContentLoaded', () => {
    ensurePanel();
    loadServerActionLogs();
    setInterval(loadServerActionLogs, 3000);
  });
})();
