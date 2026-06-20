// Nhân Giới UI Patch: sửa layout Tu Luyện + Đan Dược + hiển thị tỷ lệ Đột Phá
(function installNhanGioiUiPatch() {
  const styleId = 'nhan-gioi-ui-polish-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .cultivation-panel-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:18px;}
      .progress-card{min-width:0;padding:16px 18px;border:1px solid rgba(148,163,184,.25);border-radius:16px;background:rgba(15,23,42,.72);}
      .progress-card.active{border-color:#facc15;background:linear-gradient(135deg,rgba(120,72,8,.78),rgba(51,65,85,.72));}
      .progress-card .card-head,.recipe-card .card-head,.alchemy-job-card .card-head,.pill-card .card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;}
      .progress-card .card-head strong,.recipe-card .card-head strong,.alchemy-job-card .card-head strong,.pill-card .card-head strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .progress-card h4{font-size:18px;margin:8px 0 8px;}
      .progress-card p{margin:0 0 14px;color:#dbeafe;}
      .progress-card .bar{height:12px;border-radius:999px;background:rgba(71,85,105,.9);overflow:hidden;}
      .progress-card .bar span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#86efac,#67e8f9);}
      .muted-line{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px;color:#f8fafc;}
      .breakthrough-box{margin-top:16px;padding:14px 16px;border:1px solid rgba(250,204,21,.45);border-radius:14px;background:rgba(113,63,18,.25);}
      .breakthrough-box strong{display:block;margin-bottom:8px;color:#fde68a;}
      .breakthrough-rates{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px;}
      .breakthrough-rate-cell{padding:10px;border-radius:12px;background:rgba(15,23,42,.58);border:1px solid rgba(148,163,184,.18);}
      .breakthrough-rate-cell span{display:block;font-size:12px;color:#bfdbfe;margin-bottom:4px;}
      .breakthrough-rate-cell b{font-size:18px;color:#fff7ed;}
      .focus-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:16px;}
      .alchemy-layout-fix{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:20px;align-items:start;}
      .alchemy-status-card{margin:14px 0 16px;padding:16px;border:1px solid rgba(148,163,184,.24);border-radius:16px;background:rgba(15,23,42,.62);}
      .alchemy-group{margin-bottom:12px;border:1px solid rgba(148,163,184,.22);border-radius:16px;overflow:hidden;background:rgba(15,23,42,.48);}
      .alchemy-group-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border:0;border-radius:0;background:linear-gradient(90deg,rgba(120,72,8,.9),rgba(30,41,59,.72));color:#fff7ed;cursor:pointer;text-align:left;}
      .alchemy-group-toggle small{display:block;margin-top:3px;color:#bfdbfe;font-weight:500;}
      .alchemy-recipes-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:14px;}
      .recipe-card{min-width:0;padding:16px;border:1px solid rgba(148,163,184,.22);border-radius:14px;background:rgba(15,23,42,.72);}
      .recipe-card.active{border-color:#86efac;box-shadow:0 0 0 1px rgba(134,239,172,.25) inset;}
      .recipe-card p{margin:8px 0;line-height:1.5;}
      .recipe-meta-row{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;}
      .recipe-chip{padding:5px 8px;border-radius:999px;background:rgba(30,41,59,.9);border:1px solid rgba(148,163,184,.2);font-size:12px;color:#dbeafe;}
      .alchemy-job-card{margin-bottom:14px;padding:16px;border-radius:16px;border:1px solid rgba(134,239,172,.45);background:rgba(20,83,45,.18);}
      .pill-list-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
      .pill-card{padding:16px;border-radius:16px;border:1px solid rgba(148,163,184,.22);background:rgba(15,23,42,.62);}
      @media (max-width:1100px){.cultivation-panel-grid,.alchemy-layout-fix,.alchemy-recipes-grid,.pill-list-grid{grid-template-columns:1fr;}}
    `;
    document.head.appendChild(style);
  }
})();

const collapsedAlchemyGroups = new Set(JSON.parse(localStorage.getItem('collapsedAlchemyGroups') || '[]'));
function saveCollapsedAlchemyGroups() {
  localStorage.setItem('collapsedAlchemyGroups', JSON.stringify([...collapsedAlchemyGroups]));
}
function realmNameByTier(tier) {
  const realm = (metaData?.realms || []).find(r => Number(r.order) === Number(tier));
  return realm?.name || `Cảnh giới cấp ${tier}`;
}
function percentText(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}
function recipeSuccessRate(recipe) {
  const alchemy = playerData?.alchemy || {};
  const cauldron = alchemy.cauldron || {};
  const levelGap = Number(alchemy.level || 1) - Number(recipe.alchemyLevel || 1);
  const caveBonus = Number(playerData?.cave?.alchemyBonus || 0) / 100;
  return Math.min(0.95, Math.max(0.25, 0.55 + levelGap * 0.04 + Number(cauldron.successBonus || 0) + caveBonus));
}
function recipeSuccessRateText(recipe) {
  return percentText(recipeSuccessRate(recipe));
}
function craftButtonText(recipe) {
  const job = playerData?.alchemy?.currentJob;
  if (job && job.recipeId === recipe.id) return Number(job.remainMs || 0) > 0 ? `Đang luyện: ${secondsText(job.remainMs)}` : 'Thu đan';
  if (job) return 'Đan lô đang bận';
  return (playerData.activeTab || currentTab) === 'alchemy' ? 'Khai lò' : 'Chuyển sang Đan Dược để luyện';
}
function canClickRecipe(recipe) {
  const job = playerData?.alchemy?.currentJob;
  if (job && job.recipeId !== recipe.id) return false;
  if (job && Number(job.remainMs || 0) > 0) return false;
  return (playerData.activeTab || currentTab) === 'alchemy';
}
function renderBreakthroughInfo(c) {
  const canBreak = !!c.canBreakthrough || Number(c.exp ?? c.tuVi ?? 0) >= Number(c.maxExp ?? c.maxTuVi ?? 1);
  if (!canBreak) return '';
  const base = Number(c.breakthroughBaseRate ?? c.info?.breakthroughRate ?? 1);
  const bonus = Number(c.breakthroughBonusRate ?? playerData?.permanentBonuses?.breakthroughBonus ?? 0);
  const finalRate = Number(c.breakthroughFinalRate ?? Math.min(0.98, Math.max(0.05, base + bonus)));
  return `
    <div class="breakthrough-box">
      <strong>Thiên Quan Đột Phá</strong>
      <div>Tu vi đã viên mãn. Có thể dùng Đột Phá Đan để tăng tỷ lệ trước khi bấm Đột Phá.</div>
      <div class="breakthrough-rates">
        <div class="breakthrough-rate-cell"><span>Cơ sở</span><b>${percentText(base)}</b></div>
        <div class="breakthrough-rate-cell"><span>Đan dược / kỳ ngộ</span><b>+${percentText(bonus)}</b></div>
        <div class="breakthrough-rate-cell"><span>Hiện tại</span><b>${percentText(finalRate)}</b></div>
      </div>
    </div>`;
}
function renderAlchemyJob() {
  const job = playerData?.alchemy?.currentJob;
  if (!job) return '';
  const done = Number(job.remainMs || 0) <= 0;
  return `
    <div class="alchemy-job-card">
      <div class="card-head">
        <strong>${escapeHtml(job.recipeName || 'Đan lô đang vận chuyển')}</strong>
        <span>${done ? 'Có thể thu đan' : secondsText(job.remainMs)}</span>
      </div>
      <p>Tỷ lệ thành công: <b>${percentText(job.successRate || 0)}</b> · Kinh nghiệm đan đạo: +${fmt(job.expGain || 0)}</p>
      <button ${done ? '' : 'disabled'} data-craft="${escapeHtml(job.recipeId)}">${done ? 'Thu đan' : 'Đang luyện'}</button>
    </div>`;
}
function renderRecipeGroups(recipes, pillsMeta) {
  if (!recipes.length) return '<p class="empty">Chưa có công thức luyện đan.</p>';
  const groups = new Map();
  recipes.forEach(recipe => {
    const tier = Number(recipe.tier || recipe.alchemyLevel || 1);
    if (!groups.has(tier)) groups.set(tier, []);
    groups.get(tier).push(recipe);
  });
  return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([tier, items]) => {
    const key = `alchemy-tier-${tier}`;
    const collapsed = collapsedAlchemyGroups.has(key);
    const opened = items.filter(r => Number(playerData?.alchemy?.level || 1) >= Number(r.alchemyLevel || tier)).length;
    const body = collapsed ? '' : `<div class="alchemy-recipes-grid">${items.map(recipe => {
      const pill = pillsMeta.find(p => p.id === recipe.pillId) || getMetaItem(recipe.pillId) || {};
      const locked = Number(playerData?.alchemy?.level || 1) < Number(recipe.alchemyLevel || tier);
      return `
        <div class="recipe-card ${playerData?.alchemy?.currentJob?.recipeId === recipe.id ? 'active' : ''}">
          <div class="card-head">
            <strong>${escapeHtml(recipe.name || recipe.id)}</strong>
            <span>${recipe.durationMs ? secondsText(recipe.durationMs) : 'Tức thời'}</span>
          </div>
          <div class="recipe-meta-row">
            <span class="recipe-chip">Tỷ lệ ${recipeSuccessRateText(recipe)}</span>
            <span class="recipe-chip">Yêu cầu Đan sư ${fmt(recipe.alchemyLevel || tier)}</span>
            ${locked ? '<span class="recipe-chip">Chưa đủ cấp</span>' : ''}
          </div>
          <p><b>Công hiệu:</b> ${escapeHtml(pillEffectText(pill))}</p>
          <p><b>Công thức:</b> ${escapeHtml(formulaText(recipe))}</p>
          <button ${(!locked && canClickRecipe(recipe)) ? '' : 'disabled'} data-craft="${escapeHtml(recipe.id)}">${locked ? 'Chưa mở' : craftButtonText(recipe)}</button>
        </div>`;
    }).join('')}</div>`;
    return `
      <div class="alchemy-group">
        <button class="alchemy-group-toggle" data-alchemy-group="${escapeHtml(key)}">
          <span>${escapeHtml(realmNameByTier(tier))}<small>Đan sư cấp ${tier} · đã mở ${opened}/${items.length} phương đan</small></span>
          <b>${collapsed ? 'Mở' : 'Thu gọn'}</b>
        </button>
        ${body}
      </div>`;
  }).join('');
}

renderCultivation = function renderCultivationPatched() {
  const c = playerData.cultivation || {};
  const tuviGain = playerData.pillEffects?.tuViGainPerSecond || playerData.tuViGainPerSecond || 1;
  const canBreak = !!c.canBreakthrough || Number(c.exp ?? c.tuVi ?? 0) >= Number(c.maxExp ?? c.maxTuVi ?? 1);
  setText('cultivation-title', `${c.realmName || '-'} · ${fmt(c.exp ?? c.tuVi)} / ${fmt(c.maxExp ?? c.maxTuVi)}`);
  setText('cult-world', c.info?.worldName || c.worldName || '-');
  setText('cult-type', canBreak ? 'Tu vi viên mãn, cần Đột Phá' : (c.info?.name || '-'));
  setText('tuvi-rate', canBreak ? 'Đang ngưng' : `${fmt(tuviGain)}/s`);
  const state = playerData.cultivationFocusState || { selected: ['main'], limit: 1, options: ['main', 'body', 'soul'] };
  const selected = Array.isArray(state.selected) ? state.selected : ['main'];
  const options = Array.isArray(state.options) ? state.options : ['main', 'body', 'soul'];
  setText('focus-limit', `Đang tu ${selected.length}/${state.limit || 1} mạch`);
  const activeMode = playerData.activeTab || currentTab;
  setText('focus-note', canBreak ? 'Tu vi đã viên mãn. Hãy dùng Đột Phá Đan nếu cần rồi bấm Đột Phá.' : (activeMode === 'cultivation' ? ((state.limit || 1) === 1 ? 'Đang vận chuyển tu luyện. Rời tab này thì tu luyện tạm dừng.' : `Có thể đồng tu ${state.limit} mạch. Rời tab này thì tu luyện tạm dừng.`) : 'Tu luyện đang tạm dừng vì đang ở mục khác. Chọn tab Tu Luyện để vận chuyển.'));
  const panels = options.map(type => {
    const d = progressData(type);
    const w = pct(d.cur, d.max);
    const active = selected.includes(type);
    return `
      <div class="progress-card ${active ? 'active' : ''}">
        <div class="card-head"><strong>${systemName(type)}</strong><span>${active ? 'Đang tu' : 'Tạm dừng'}</span></div>
        <h4>${escapeHtml(d.title)}</h4>
        <p>${escapeHtml(d.sub)}</p>
        <div class="bar"><span style="width:${w}%"></span></div>
        <div class="muted-line"><b>${fmt(d.cur)} / ${fmt(d.max)}</b><b>${Math.round(w)}%</b></div>
      </div>`;
  }).join('');
  $('cultivation-progress-panels').classList.add('cultivation-panel-grid');
  $('cultivation-progress-panels').innerHTML = panels;
  $('focus-buttons').classList.add('focus-actions');
  $('focus-buttons').innerHTML = options.map(type => {
    const active = selected.includes(type);
    return `<button class="${active ? 'primary' : ''}" data-focus="${escapeHtml(type)}">${active ? 'Đang tu' : 'Chọn'}: ${systemName(type)}</button>`;
  }).join('') + (canBreak ? `<button class="danger" data-breakthrough>Đột Phá</button>` : '') + renderBreakthroughInfo(c);
  document.querySelectorAll('[data-focus]').forEach(btn => btn.addEventListener('click', () => toggleFocus(btn.dataset.focus)));
  document.querySelector('[data-breakthrough]')?.addEventListener('click', breakthroughCultivation);
  const buffs = playerData.activePillBuffs || [];
  $('pill-buffs').innerHTML = buffs.length ? buffs.map(buff => smallCard(buff.name || buff.id, buff.remainingMs ? `Còn ${Math.ceil(buff.remainingMs / 1000)} giây` : 'Đang hiệu lực')).join('') : '<p class="empty">Chưa có buff đan.</p>';
};

async function breakthroughCultivation() {
  try {
    const data = await api(`/api/player/${encodeURIComponent(username)}/cultivation/breakthrough`, { method: 'POST', body: JSON.stringify({}) });
    playerData = data.player;
    if (data.message) alert(data.message);
    renderAll();
  } catch (err) {
    alert(err.message);
  }
}

renderAlchemy = function renderAlchemyPatched() {
  const alchemy = playerData.alchemy || {};
  setText('alchemy-bonus', `Đan sư cấp ${fmt(alchemy.level || 1)} · ${fmt(alchemy.exp || 0)} / ${fmt(alchemy.maxExp || 0)} · ${alchemy.cauldron?.name || 'Đan Lô Sơ Cấp'}`);
  const recipes = findMetaList('recipes');
  const pillsMeta = [...findMetaList('lifespanPills'), ...findMetaList('pills')];
  $('recipe-list').innerHTML = `
    <div class="alchemy-status-card">
      <b>Đạo hạnh luyện đan</b><br>
      Đan sư cấp ${fmt(alchemy.level || 1)} · Kinh nghiệm ${fmt(alchemy.exp || 0)} / ${fmt(alchemy.maxExp || 0)} · ${escapeHtml(alchemy.cauldron?.name || 'Đan Lô Sơ Cấp')}
    </div>
    ${renderAlchemyJob()}
    ${renderRecipeGroups(recipes, pillsMeta)}
  `;
  document.querySelectorAll('[data-alchemy-group]').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.alchemyGroup;
    if (collapsedAlchemyGroups.has(key)) collapsedAlchemyGroups.delete(key); else collapsedAlchemyGroups.add(key);
    saveCollapsedAlchemyGroups();
    renderAlchemy();
  }));
  document.querySelectorAll('[data-craft]').forEach(btn => btn.addEventListener('click', () => craftPill(btn.dataset.craft)));
  const pills = (playerData.inventory || []).filter(item => item.basePillId || String(item.id || '').includes('dan'));
  $('pill-list').classList.add('pill-list-grid');
  $('pill-list').innerHTML = pills.length ? pills.map(item => {
    const pill = pillsMeta.find(p => p.id === (item.basePillId || item.id)) || item;
    return `
      <div class="pill-card">
        <div class="card-head"><strong>${escapeHtml(item.name || pill.name || item.id)}</strong><span>${escapeHtml(item.quality || 'Đan dược')}</span></div>
        <p>Số lượng: ${fmt(item.amount)}</p>
        <p>Công hiệu: ${escapeHtml(pillEffectText(pill))}</p>
        <button data-use-pill="${escapeHtml(item.id)}">Dùng</button>
      </div>`;
  }).join('') : '<p class="empty">Chưa có đan dược.</p>';
  document.querySelectorAll('[data-use-pill]').forEach(btn => btn.addEventListener('click', () => usePill(btn.dataset.usePill)));
};
