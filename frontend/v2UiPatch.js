(function () {
  'use strict';

  const $id = id => document.getElementById(id);
  const viFmt = value => Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
  const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[c]));

  let selectedRecipeId = localStorage.getItem('tuTienSelectedRecipeId') || '';

  function currentPlayer() {
    return window.playerData || null;
  }

  function currentMetaList(name) {
    try {
      if (typeof window.findMetaList === 'function') return window.findMetaList(name) || [];
    } catch (err) {
      console.warn(err);
    }
    return [];
  }

  function currencyName(id) {
    if (typeof window.currencyName === 'function') return window.currencyName(id);
    return {
      so_linh_thach: 'Sơ Linh Thạch',
      trung_linh_thach: 'Trung Linh Thạch',
      cao_linh_thach: 'Cao Linh Thạch',
      cuc_pham_linh_thach: 'Cực Phẩm Linh Thạch',
      tien_ngoc: 'Tiên Ngọc'
    }[id] || id;
  }

  function getMetaItem(id) {
    try {
      if (typeof window.getMetaItem === 'function') return window.getMetaItem(id);
    } catch (err) {
      console.warn(err);
    }
    return null;
  }

  function getItemName(id) {
    const meta = getMetaItem(id);
    return meta?.name || currencyName(id) || id;
  }

  function secondsText(msOrSec) {
    const raw = Number(msOrSec || 0);
    const sec = raw > 1000 ? Math.ceil(raw / 1000) : Math.ceil(raw);
    if (sec <= 0) return 'Hoàn tất';
    if (sec < 60) return `${sec} giây`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s ? `${m} phút ${s} giây` : `${m} phút`;
  }

  function effectText(effects = {}) {
    const labels = {
      cultivationSpeedBonus: 'Tốc độ tu luyện',
      auraBonus: 'Linh khí',
      tuViBonus: 'Tu vi',
      hpBonus: 'Sinh mệnh',
      defBonus: 'Phòng ngự',
      bodyExpBonus: 'Kinh nghiệm luyện thể',
      soulPowerBonus: 'Hồn lực',
      soulExpBonus: 'Kinh nghiệm luyện hồn',
      critBonus: 'Bạo kích',
      damageMultiplier: 'Sát thương',
      atkBonus: 'Công kích',
      defDamageRatio: 'Lấy thủ hóa công',
      extraDamage: 'Sát thương thêm'
    };
    return Object.entries(effects || {}).map(([key, value]) => {
      let shown = value;
      if (typeof value === 'number') shown = Math.abs(value) < 1 ? `${Math.round(value * 100)}%` : viFmt(value);
      return `${labels[key] || key}: ${shown}`;
    }).join(' · ');
  }

  function pillEffectText(pill) {
    if (!pill) return 'Công hiệu chưa rõ.';
    const parts = [];
    if (pill.addYears) parts.push(`Tăng ${viFmt(pill.addYears)} năm thọ nguyên`);
    if (pill.maxUses) parts.push(`Giới hạn ${viFmt(pill.maxUses)} lần dùng`);
    if (pill.durationMs) parts.push(`Hiệu lực ${secondsText(pill.durationMs)}`);
    if (pill.effects) parts.push(effectText(pill.effects));
    if (pill.description) parts.push(pill.description);
    return parts.filter(Boolean).join(' · ') || 'Công hiệu chưa khai mở.';
  }

  function formulaText(recipe) {
    const ingredients = recipe?.ingredients || [];
    const materialText = ingredients.length
      ? ingredients.map(item => `${getItemName(item.id)} x${viFmt(item.amount || 1)}`).join(', ')
      : 'Không cần nguyên liệu';
    const cost = recipe?.cost ? `Linh thạch ${viFmt(recipe.cost)}` : 'Không tốn linh thạch';
    const time = recipe?.durationMs ? secondsText(recipe.durationMs) : 'Tức thời';
    return `${materialText} · ${cost} · ${time}`;
  }

  function topSpiritStone(currencies = {}) {
    return Number(currencies.so_linh_thach || 0)
      + Number(currencies.trung_linh_thach || 0) * 100
      + Number(currencies.cao_linh_thach || 0) * 10000
      + Number(currencies.cuc_pham_linh_thach || 0) * 1000000;
  }

  function setText(id, text) {
    const el = $id(id);
    if (el) el.textContent = text;
  }

  window.renderHeader = function renderHeaderV2() {
    const p = currentPlayer();
    if (!p) return;
    setText('profile-name', p.username || '-');
    setText('profile-realm', p.cultivation?.realmName || '-');
    setText('toggle-auto-btn', p.autoFight ? 'Tạm dừng tự đánh' : 'Bật tự đánh');
    setText('top-jade-text', viFmt(p.currencies?.tien_ngoc || 0));
    setText('top-spirit-stone-text', viFmt(topSpiritStone(p.currencies || {})));
    setText('atk-text', viFmt(p.combat?.atk || 0));
  };

  function openAlchemyModal() {
    const modal = $id('alchemy-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    renderAlchemyModal();
  }

  function closeAlchemyModal() {
    const modal = $id('alchemy-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  function recipes() {
    return currentMetaList('recipes');
  }

  function pillsMeta() {
    return [...currentMetaList('lifespanPills'), ...currentMetaList('pills')];
  }

  function getRecipe(id) {
    const list = recipes();
    return list.find(item => item.id === id) || list[0] || null;
  }

  function getRecipePill(recipe) {
    return pillsMeta().find(p => p.id === recipe?.pillId) || getMetaItem(recipe?.pillId) || null;
  }

  function recipeButton(recipe) {
    const pill = getRecipePill(recipe);
    const active = recipe.id === selectedRecipeId ? ' active' : '';
    return `<button class="recipe-picker-btn${active}" type="button" data-select-recipe="${html(recipe.id)}">
      <b>${html(recipe.name || recipe.id)}</b>
      <span>${html(pill?.name || recipe.pillId || 'Đan dược')}</span>
    </button>`;
  }

  function renderAlchemyModal() {
    const list = recipes();
    const picker = $id('alchemy-recipe-picker');
    const detail = $id('alchemy-recipe-detail');
    if (!picker || !detail) return;
    if (!list.length) {
      picker.innerHTML = '<p class="empty">Chưa có công thức.</p>';
      detail.innerHTML = '<p class="empty">Đan lô chưa có công thức để luyện.</p>';
      return;
    }
    if (!selectedRecipeId || !list.some(r => r.id === selectedRecipeId)) selectedRecipeId = list[0].id;
    const grouped = new Map();
    list.forEach(recipe => {
      const key = recipe.realmName || recipe.realm || recipe.group || 'Công thức';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(recipe);
    });
    picker.innerHTML = [...grouped.entries()].map(([name, items]) => `
      <div class="recipe-picker-group">
        <h3>${html(name)}</h3>
        ${items.map(recipeButton).join('')}
      </div>
    `).join('');
    picker.querySelectorAll('[data-select-recipe]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedRecipeId = btn.dataset.selectRecipe;
        localStorage.setItem('tuTienSelectedRecipeId', selectedRecipeId);
        renderAlchemyModal();
        renderSelectedRecipePreview();
      });
    });
    const recipe = getRecipe(selectedRecipeId);
    const pill = getRecipePill(recipe);
    detail.innerHTML = `
      <div class="recipe-detail-card">
        <p class="eyebrow">Công thức đã chọn</p>
        <h2>${html(recipe.name || recipe.id)}</h2>
        <div class="recipe-rune">丹</div>
        <div class="detail-line"><span>Sản phẩm</span><strong>${html(pill?.name || recipe.pillId || 'Đan dược')}</strong></div>
        <div class="detail-line"><span>Thời gian</span><strong>${html(recipe.durationMs ? secondsText(recipe.durationMs) : 'Tức thời')}</strong></div>
        <div class="detail-block"><b>Công hiệu</b><p>${html(pillEffectText(pill))}</p></div>
        <div class="detail-block"><b>Công thức</b><p>${html(formulaText(recipe))}</p></div>
        <button class="primary-action" type="button" data-craft="${html(recipe.id)}">Khai Lò Luyện Đan</button>
      </div>
    `;
    detail.querySelector('[data-craft]')?.addEventListener('click', () => {
      if (typeof window.craftPill === 'function') window.craftPill(recipe.id);
      closeAlchemyModal();
    });
  }

  function renderSelectedRecipePreview() {
    const box = $id('selected-recipe-preview');
    if (!box) return;
    const recipe = getRecipe(selectedRecipeId);
    if (!recipe) {
      box.innerHTML = 'Chưa chọn công thức.';
      return;
    }
    const pill = getRecipePill(recipe);
    box.innerHTML = `
      <div class="selected-recipe-name">${html(recipe.name || recipe.id)}</div>
      <div class="selected-recipe-meta">${html(pill?.name || recipe.pillId || 'Đan dược')} · ${html(recipe.durationMs ? secondsText(recipe.durationMs) : 'Tức thời')}</div>
      <div class="selected-recipe-desc">${html(pillEffectText(pill))}</div>
    `;
  }

  function itemTooltip(item, meta = {}) {
    const desc = [
      meta.description || item.description || '',
      item.quality ? `Phẩm chất: ${item.quality}` : '',
      item.type ? `Loại: ${item.type}` : '',
      item.basePillId ? `Đan gốc: ${getItemName(item.basePillId)}` : '',
      meta.effects ? effectText(meta.effects) : '',
      meta.addYears ? `Tăng thọ nguyên: ${viFmt(meta.addYears)} năm` : ''
    ].filter(Boolean).join('\n');
    return html(desc || 'Chưa có mô tả.');
  }

  function itemCell(item, options = {}) {
    const meta = getMetaItem(item.basePillId || item.id) || item || {};
    const amount = Number(item.amount || 0);
    const name = item.name || meta.name || item.id;
    const icon = options.icon || (item.basePillId || String(item.id || '').includes('dan') ? '丹' : '物');
    const action = options.usePill ? `<button type="button" data-use-pill="${html(item.id)}">Dùng</button>` : '';
    return `<div class="item-cell" data-tooltip="${itemTooltip(item, meta)}">
      <div class="item-icon">${html(icon)}</div>
      <b>${html(name)}</b>
      <span>x${viFmt(amount)}</span>
      ${action}
    </div>`;
  }

  function currencyCell(id, amount) {
    return `<div class="item-cell currency-cell" data-tooltip="Tiền tệ\n${html(currencyName(id))}: ${viFmt(amount)}">
      <div class="item-icon">灵</div>
      <b>${html(currencyName(id))}</b>
      <span>x${viFmt(amount)}</span>
    </div>`;
  }

  window.renderAlchemy = function renderAlchemyV2() {
    const p = currentPlayer();
    if (!p) return;
    setText('alchemy-bonus', `+${viFmt(p.cave?.alchemyBonus || 0)}%`);
    const recipeHost = $id('recipe-list');
    if (recipeHost) recipeHost.innerHTML = '';
    renderSelectedRecipePreview();
    const openBtn = $id('open-alchemy-modal');
    if (openBtn && !openBtn.dataset.bound) {
      openBtn.dataset.bound = '1';
      openBtn.addEventListener('click', openAlchemyModal);
    }
    const pills = (p.inventory || []).filter(item => item.basePillId || String(item.id || '').includes('dan'));
    const pillBox = $id('pill-list');
    if (!pillBox) return;
    pillBox.innerHTML = pills.length
      ? pills.map(item => itemCell(item, { icon: '丹', usePill: true })).join('')
      : '<p class="empty">Chưa có đan dược.</p>';
    pillBox.querySelectorAll('[data-use-pill]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof window.usePill === 'function') window.usePill(btn.dataset.usePill);
      });
    });
  };

  window.renderInventory = function renderInventoryV2() {
    const p = currentPlayer();
    if (!p) return;
    const inv = p.inventory || [];
    const currencies = Object.entries(p.currencies || {}).filter(([, amount]) => Number(amount) > 0);
    setText('inventory-count', `${inv.length} vật phẩm · ${currencies.length} tiền tệ`);
    const box = $id('inventory-list');
    if (!box) return;
    const currencyHtml = currencies.map(([id, amount]) => currencyCell(id, amount)).join('');
    const itemHtml = inv.map(item => itemCell(item)).join('');
    box.innerHTML = currencyHtml + itemHtml || '<p class="empty">Túi đồ trống.</p>';
  };

  function initTheme() {
    const saved = localStorage.getItem('tuTienTheme') || 'light';
    document.body.classList.toggle('theme-dark', saved === 'dark');
    const btn = $id('theme-toggle-btn');
    if (btn) btn.textContent = saved === 'dark' ? '☀' : '☾';
  }

  function toggleTheme() {
    const nextDark = !document.body.classList.contains('theme-dark');
    document.body.classList.toggle('theme-dark', nextDark);
    localStorage.setItem('tuTienTheme', nextDark ? 'dark' : 'light');
    const btn = $id('theme-toggle-btn');
    if (btn) btn.textContent = nextDark ? '☀' : '☾';
  }

  window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    $id('theme-toggle-btn')?.addEventListener('click', toggleTheme);
    $id('close-alchemy-modal')?.addEventListener('click', closeAlchemyModal);
    $id('alchemy-modal')?.addEventListener('click', event => {
      if (event.target?.id === 'alchemy-modal') closeAlchemyModal();
    });
  });
})();
