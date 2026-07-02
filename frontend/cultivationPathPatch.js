(function cultivationPathPatch() {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const fmt = (value) => Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
  const pct = (cur, max) => max > 0 ? Math.max(0, Math.min(100, (Number(cur || 0) / Number(max || 1)) * 100)) : 0;
  const esc = (text) => String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const oldRenderAll = window.renderAll;
  const oldRenderOverview = window.renderOverview;
  const oldRenderCombat = window.renderCombat;
  const oldRenderAlchemy = window.renderAlchemy;
  const oldRenderCave = window.renderCave;
  const oldSetTab = window.setTab;

  function getPlayer() {
    return window.playerData || null;
  }

  function progressBlock(title, sub, cur, max, status) {
    const w = pct(cur, max);
    return `
      <article class="path-progress-card">
        <div class="path-progress-head">
          <div>
            <b>${esc(title)}</b>
            <span>${esc(sub)}</span>
          </div>
          <em>${esc(status || '')}</em>
        </div>
        <div class="bar labeled"><span style="width:${w}%"></span><b>${Math.round(w)}%</b></div>
        <small>${fmt(cur)} / ${fmt(max)}</small>
      </article>
    `;
  }

  function resourceRow(label, value) {
    return `<div class="stat-row"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
  }

  function normalizeNavigation() {
    const cultivationBtn = q('.nav-btn[data-tab="cultivation"]');
    if (cultivationBtn) cultivationBtn.remove();

    const alchemyBtn = q('.nav-btn[data-tab="alchemy"]');
    if (alchemyBtn) {
      alchemyBtn.innerHTML = '<span>☯</span>Đa Dụng';
      alchemyBtn.title = 'Đa Dụng: luyện hồn, luyện đan, luyện khí, luyện phù, khôi lỗi.';
    }

    const caveBtn = q('.nav-btn[data-tab="cave"]');
    if (caveBtn) caveBtn.innerHTML = '<span>⛰</span>Động Phủ';

    const stored = localStorage.getItem('tuTienActiveTab');
    if (stored === 'cultivation') localStorage.setItem('tuTienActiveTab', 'cave');
  }

  function normalizeTitles() {
    const active = q('.nav-btn.active')?.dataset?.tab || localStorage.getItem('tuTienActiveTab');
    if (active === 'cave') {
      const title = $('page-title');
      const sub = $('page-subtitle');
      if (title) title.textContent = 'Động Phủ';
      if (sub) sub.textContent = 'Linh Tu, linh mạch, dược viên và căn cơ tu luyện.';
    }
    if (active === 'alchemy') {
      const title = $('page-title');
      const sub = $('page-subtitle');
      if (title) title.textContent = 'Đa Dụng';
      if (sub) sub.textContent = 'Luyện Hồn và các nghề phụ: đan, khí, phù, khôi lỗi, trận pháp.';
    }
    if (active === 'combat') {
      const title = $('page-title');
      const sub = $('page-subtitle');
      if (title) title.textContent = 'Chiến Đấu';
      if (sub) sub.textContent = 'Đánh quái để nhận huyết khí, tinh huyết và tăng Luyện Thể.';
    }
  }

  window.setTab = function patchedSetTab(tab, shouldSync) {
    if (tab === 'cultivation') tab = 'cave';
    if (typeof oldSetTab === 'function') oldSetTab(tab, shouldSync);
    normalizeNavigation();
    normalizeTitles();
  };

  window.renderOverview = function patchedRenderOverview() {
    if (typeof oldRenderOverview === 'function') oldRenderOverview();

    const p = getPlayer();
    if (!p) return;

    const body = p.bodyCultivation || {};
    const soul = p.soulCultivation || {};
    const bodyText = body.info?.name || body.name || '-';
    const soulText = soul.info?.name || soul.name || '-';

    const bodyEl = $('body-rank');
    const soulEl = $('soul-rank');
    if (bodyEl) bodyEl.textContent = bodyText + ' · Combat';
    if (soulEl) soulEl.textContent = soulText + ' · Đa Dụng';

    const subPanel = bodyEl?.closest('.panel') || soulEl?.closest('.panel');
    if (subPanel && !q('.path-note', subPanel)) {
      subPanel.insertAdjacentHTML('beforeend', `
        <div class="path-note">
          <b>Phân nhánh mới</b>
          <span>Linh Tu về Động Phủ, Luyện Thể qua Combat, Hồn lực dùng cho Đa Dụng.</span>
        </div>
      `);
    }
  };

  window.renderCave = function patchedRenderCave() {
    if (typeof oldRenderCave === 'function') oldRenderCave();

    const p = getPlayer();
    if (!p) return;

    const cave = p.cave || {};
    const c = p.cultivation || {};
    const tuviRate = p.pillEffects?.tuViGainPerSecond || p.tuViGainPerSecond || cave.tuViPerSecond || 0;
    const active = (p.activeTab || localStorage.getItem('tuTienActiveTab')) === 'cave';
    const caveMain = q('#tab-cave .cave-main');

    if (caveMain) {
      caveMain.innerHTML = `
        <div class="panel-title"><span>Động Phủ</span><small id="cave-level">Cấp ${fmt(cave.level || 1)}</small></div>
        ${resourceRow('Linh khí tích lũy', fmt(cave.resources?.aura || 0))}
        ${resourceRow('Sinh linh khí', `${fmt(cave.auraPerSecond || 0)}/s`)}
        ${resourceRow('Tốc độ Linh Tu', `${fmt(tuviRate)}/s`)}
        ${resourceRow('Bonus luyện đan', `${fmt(cave.alchemyBonus || 0)}%`)}
      `;
    }

    const grid = q('#tab-cave .cave-grid');
    if (!grid) return;

    let linhTuPanel = $('linh-tu-panel');
    if (!linhTuPanel) {
      linhTuPanel = document.createElement('article');
      linhTuPanel.id = 'linh-tu-panel';
      linhTuPanel.className = 'panel wide linh-tu-panel';
      grid.insertBefore(linhTuPanel, grid.children[1] || null);
    }

    linhTuPanel.innerHTML = `
      <div class="panel-title"><span>Linh Tu</span><small>Về động phủ tu luyện</small></div>
      <div class="path-split-layout">
        <div>
          <h2>${esc(c.realmName || '-')}</h2>
          <p class="muted">${esc(c.info?.worldName || c.worldName || 'Đạo giới chưa rõ')} · ${esc(c.info?.name || 'Căn cơ chưa rõ')}</p>
          ${progressBlock('Tu vi cảnh giới', 'Linh khí nhập thể', c.exp ?? c.tuVi ?? 0, c.maxExp ?? c.maxTuVi ?? 100, active ? 'Đang vận chuyển' : 'Tạm dừng')}
        </div>
        <div class="path-factor-list">
          ${resourceRow('Nguồn tăng', 'Linh mạch / công pháp / đan dược')}
          ${resourceRow('Yêu cầu thao tác', 'Ở tab Động Phủ')}
          ${resourceRow('Không còn dùng', 'Tab Tu Luyện riêng')}
        </div>
      </div>
    `;

    let buildingBox = $('cave-buildings');
    if (buildingBox) {
      buildingBox.innerHTML = `
        <div class="path-feature-card"><b>Linh Mạch</b><span>Tăng tốc Linh Tu và sinh linh khí.</span></div>
        <div class="path-feature-card"><b>Tĩnh Thất</b><span>Nơi vận chuyển công pháp, sau này có thể nâng cấp.</span></div>
        <div class="path-feature-card"><b>Dược Viên</b><span>Trồng linh dược phục vụ luyện đan.</span></div>
        <div class="path-feature-card"><b>Linh Tuyền</b><span>Dự kiến tăng hồi phục, giảm phạt đột phá.</span></div>
      `;
    }
  };

  window.renderCombat = function patchedRenderCombat() {
    if (typeof oldRenderCombat === 'function') oldRenderCombat();

    const p = getPlayer();
    if (!p) return;

    const body = p.bodyCultivation || {};
    const state = p.combatState || {};
    const active = (p.activeTab || localStorage.getItem('tuTienActiveTab')) === 'combat';
    const statusPanel = q('#tab-combat .status-panel');

    if (statusPanel && !$('body-combat-panel')) {
      statusPanel.insertAdjacentHTML('afterend', '<article id="body-combat-panel" class="panel combat-side-card body-combat-panel"></article>');
    }

    const panel = $('body-combat-panel');
    if (panel) {
      const bodyExp = body.exp || 0;
      const bodyMax = body.maxExp || 100;
      const bloodQi = p.currencies?.bloodQi || p.currencies?.huyetKhi || state.bloodQi || 0;
      const essenceBlood = p.currencies?.essenceBlood || p.currencies?.tinhHuyet || state.essenceBlood || 0;

      panel.innerHTML = `
        <div class="panel-title"><span>Luyện Thể</span><small>Huyết khí rèn thân</small></div>
        ${progressBlock(body.info?.name || body.name || 'Phàm Thể', 'Chỉ tăng khi đánh quái', bodyExp, bodyMax, active ? 'Đang tôi thể' : 'Tạm dừng')}
        <div class="combat-state-grid compact">
          <div><span>Huyết Khí</span><strong>${fmt(bloodQi)}</strong></div>
          <div><span>Tinh Huyết</span><strong>${fmt(essenceBlood)}</strong></div>
          <div><span>Nguồn tăng</span><strong>Combat</strong></div>
        </div>
        <p class="path-note slim">Quái thường cho Huyết Khí, boss hoặc kỳ ngộ chiến đấu có thể cho Tinh Huyết.</p>
      `;
    }

    const status = $('combat-status');
    if (status && active && !status.textContent.includes('Luyện Thể')) {
      status.textContent += ' · Luyện Thể đang nhận huyết khí.';
    }
  };

  window.renderAlchemy = function patchedRenderAlchemy() {
    if (typeof oldRenderAlchemy === 'function') oldRenderAlchemy();

    const p = getPlayer();
    if (!p) return;

    const tab = $('tab-alchemy');
    if (!tab) return;

    const soul = p.soulCultivation || {};
    const soulCur = soul.exp || soul.power || p.soulPower || 0;
    const soulMax = soul.maxExp || soul.maxPower || 100;
    const soulRate = p.soulGainPerSecond || p.soulRate || 0;

    let soulPanel = $('soul-utility-panel');
    if (!soulPanel) {
      soulPanel = document.createElement('article');
      soulPanel.id = 'soul-utility-panel';
      soulPanel.className = 'panel wide soul-utility-panel';
      const grid = q('#tab-alchemy .panel-grid');
      if (grid) grid.insertBefore(soulPanel, grid.firstChild);
    }

    soulPanel.innerHTML = `
      <div class="panel-title"><span>Luyện Hồn</span><small>Nền tảng Đa Dụng</small></div>
      <div class="path-split-layout">
        <div>
          ${progressBlock(soul.info?.name || soul.name || 'Phàm Hồn', 'Hồn lực dùng cho nghề phụ', soulCur, soulMax, 'Tài nguyên tiêu hao')}
        </div>
        <div class="path-factor-list">
          ${resourceRow('Hồn lực hồi phục', soulRate ? `${fmt(soulRate)}/s` : 'Chưa mở')}
          ${resourceRow('Dùng cho', 'Đan / Khí / Phù / Khôi Lỗi')}
          ${resourceRow('Đề xuất', 'Luyện Hồn không tăng chung với Linh Tu')}
        </div>
      </div>
    `;

    const alchemyTitle = q('#tab-alchemy .alchemy-panel .panel-title span');
    if (alchemyTitle) alchemyTitle.textContent = 'Luyện Đan';

    let utilityPanel = $('utility-feature-panel');
    if (!utilityPanel) {
      utilityPanel = document.createElement('article');
      utilityPanel.id = 'utility-feature-panel';
      utilityPanel.className = 'panel wide utility-feature-panel';
      q('#tab-alchemy .panel-grid')?.appendChild(utilityPanel);
    }

    utilityPanel.innerHTML = `
      <div class="panel-title"><span>Nghề Phụ Đa Dụng</span><small>Đề xuất mở rộng</small></div>
      <div class="utility-feature-grid">
        <div><b>Luyện Khí</b><span>Rèn pháp bảo, vũ khí, trang bị.</span></div>
        <div><b>Luyện Phù</b><span>Tạo phù tăng tốc, hộ thân, sát thương.</span></div>
        <div><b>Khôi Lỗi</b><span>Tự farm map thấp, thu hoạch dược viên.</span></div>
        <div><b>Trận Pháp</b><span>Tụ linh, hộ sơn, tăng hiệu quả động phủ.</span></div>
        <div><b>Cấm Chế</b><span>Phong ấn bí cảnh, mở khóa cơ duyên.</span></div>
        <div><b>Ngự Thú</b><span>Nuôi linh thú, cộng chỉ số và kỹ năng phụ.</span></div>
      </div>
    `;
  };

  window.renderAll = function patchedRenderAll() {
    normalizeNavigation();
    if (typeof oldRenderAll === 'function') oldRenderAll();
    normalizeNavigation();
    normalizeTitles();
  };

  function bootPatch() {
    normalizeNavigation();
    normalizeTitles();
    qa('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => setTimeout(() => {
        normalizeNavigation();
        normalizeTitles();
      }, 0));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootPatch);
  } else {
    bootPatch();
  }
})();
