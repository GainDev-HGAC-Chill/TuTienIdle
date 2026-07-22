(() => {
  const qualityNames = {
    pham: 'Phàm phẩm',
    hoang: 'Hoàng phẩm',
    huyen: 'Huyền phẩm',
    dia: 'Địa phẩm',
    thien: 'Thiên phẩm',
    tien: 'Tiên phẩm',
    than: 'Thần phẩm'
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function bagFromProfile() {
    return state?.profile?.bag || {
      unlocked_slots: 30,
      maximum_slots: 200,
      used_slots: (state?.profile?.inventory || []).length,
      free_slots: 30 - (state?.profile?.inventory || []).length
    };
  }

  function renderInventory(items) {
    const grid = document.querySelector('#inventoryGrid');
    if (!grid) return;

    const bag = bagFromProfile();
    const bySlot = new Map(items.map(item => [Number(item.slot_index), item]));
    const slots = [];

    for (let index = 1; index <= Number(bag.maximum_slots || 200); index += 1) {
      const unlocked = index <= Number(bag.unlocked_slots || 30);
      const item = bySlot.get(index);

      if (!unlocked) {
        slots.push(`<div class="can-khon-slot locked" title="Ô chưa được khai mở">
          <span class="slot-number">${index}</span>
          <span class="slot-lock">🔒</span>
        </div>`);
        continue;
      }

      if (!item) {
        slots.push(`<div class="can-khon-slot empty">
          <span class="slot-number">${index}</span>
        </div>`);
        continue;
      }

      const action = item.usable
        ? `<button class="inventory-use-btn" data-inventory-id="${Number(item.id)}">Sử dụng</button>`
        : '';

      slots.push(`<article class="can-khon-slot occupied quality-${escapeHtml(item.quality)}"
          title="${escapeHtml(item.description || item.item_name)}">
        <span class="slot-number">${index}</span>
        <strong class="slot-item-name">${escapeHtml(item.item_name)}</strong>
        <span class="slot-quality">${escapeHtml(qualityNames[item.quality] || item.quality)}</span>
        <span class="slot-quantity">×${Number(item.quantity || 0).toLocaleString('vi-VN')}</span>
        ${action}
      </article>`);
    }

    const summary = `
      <div class="can-khon-summary">
        <strong>Túi Càn Khôn</strong>
        <span>Đã dùng ${bag.used_slots} / ${bag.unlocked_slots} ô</span>
        <span>Tối đa ${bag.maximum_slots} ô</span>
      </div>`;

    grid.innerHTML = summary + `<div class="can-khon-grid">${slots.join('')}</div>`;

    grid.querySelectorAll('.inventory-use-btn').forEach(button => {
      button.addEventListener('click', async event => {
        event.stopPropagation();
        if (!state.playerId || state.busy) return;
        state.busy = true;
        try {
          openGame(await api(`/api/inventory/${state.playerId}/use-slot`, {
            method: 'POST',
            body: JSON.stringify({
              inventoryId: Number(button.dataset.inventoryId)
            })
          }));
          toast('Đã sử dụng vật phẩm.');
        } catch (error) {
          toast(error.message);
        } finally {
          state.busy = false;
        }
      });
    });
  }

  window.CanKhonUI = { renderInventory };

  // Ghi đè hàm toàn cục của frontend cũ sau khi script.js đã được nạp.
  try {
    window.renderInventory = renderInventory;
    renderInventory = window.CanKhonUI.renderInventory;
  } catch (_error) {
    // Frontend module hóa vẫn có thể gọi CanKhonUI.renderInventory trực tiếp.
  }
})();
