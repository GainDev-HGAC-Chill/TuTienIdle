const fs = require('fs');
const path = require('path');

const root = process.cwd();
const scriptPath = path.join(root, 'frontend', 'script.js');
const stylePath = path.join(root, 'frontend', 'style.css');

function fail(msg) { console.error('[Lỗi] ' + msg); process.exit(1); }
function mustExist(file) { if (!fs.existsSync(file)) fail('Không tìm thấy ' + path.relative(root, file)); }
function backup(file) {
  const bak = file + '.bak_dao_ui_popup_v4';
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
}
function appendOnce(file, marker, content) {
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes(marker)) { console.log('[Bỏ qua] Đã có ' + marker); return; }
  backup(file);
  fs.writeFileSync(file, text.replace(/\s*$/, '') + '\n\n' + content + '\n', 'utf8');
  console.log('[OK] Đã vá ' + path.relative(root, file));
}
function assertContains(file, needles) {
  const text = fs.readFileSync(file, 'utf8');
  const miss = needles.filter(n => !text.includes(n));
  if (miss.length) fail(path.relative(root, file) + ' thiếu dấu hiệu: ' + miss.join(', '));
}

mustExist(scriptPath);
mustExist(stylePath);
assertContains(scriptPath, ['function renderAll', 'function renderAlchemy', 'activity-log-list', 'recipe-list', 'pill-list']);

const jsPatch = String.raw`
// ===============================
// DAO_UI_POPUP_FIX_V4
// Ghi đè trực tiếp hàm renderActivityLog + renderAlchemy ở scope chính.
// Không dùng window.renderAlchemy vì renderAll gọi renderAlchemy lexical.
// ===============================
function daoUiEscape(value) {
  if (typeof escapeHtml === 'function') return escapeHtml(value);
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}
function daoUiFmt(value) {
  if (typeof fmt === 'function') return fmt(value);
  return Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 });
}
function daoUiMetaList(name) {
  return Array.isArray(metaData && metaData[name]) ? metaData[name] : [];
}
function daoUiCurrencyName(id) {
  return typeof currencyName === 'function' ? currencyName(id) : (id || '-');
}
function daoUiKnownItems() {
  return []
    .concat(daoUiMetaList('materials'))
    .concat(daoUiMetaList('herbs'))
    .concat(daoUiMetaList('lifespanPills'))
    .concat(daoUiMetaList('pills'))
    .concat(daoUiMetaList('items'))
    .concat(daoUiMetaList('seeds'));
}
function daoUiFindKnownItem(id) {
  return daoUiKnownItems().find(item => item && String(item.id) === String(id)) || null;
}
function daoUiItemName(id) {
  const found = daoUiFindKnownItem(id);
  return found?.name || daoUiCurrencyName(id) || id || '-';
}
function daoUiTimeText(msOrSec) {
  const raw = Number(msOrSec || 0);
  const sec = raw > 1000 ? Math.ceil(raw / 1000) : Math.ceil(raw);
  if (sec <= 0) return 'Hoàn tất';
  if (sec < 60) return sec + ' giây';
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  if (min < 60) return rest ? (min + ' phút ' + rest + ' giây') : (min + ' phút');
  const hour = Math.floor(min / 60);
  const m = min % 60;
  return m ? (hour + ' giờ ' + m + ' phút') : (hour + ' giờ');
}
function daoUiEffectText(effects = {}) {
  const labels = {
    cultivationSpeedBonus: 'Tốc độ tu luyện', auraBonus: 'Linh khí', tuViBonus: 'Tu vi', tuViGainPerSecond: 'Tu vi mỗi giây',
    hpBonus: 'Sinh mệnh', maxHpBonus: 'Sinh mệnh tối đa', defBonus: 'Phòng ngự', atkBonus: 'Công kích',
    bodyExpBonus: 'Kinh nghiệm luyện thể', soulExpBonus: 'Kinh nghiệm luyện hồn', soulPowerBonus: 'Hồn lực',
    critBonus: 'Bạo kích', damageMultiplier: 'Hệ số sát thương', extraDamage: 'Sát thương thêm', breakthroughBonus: 'Tỷ lệ đột phá'
  };
  return Object.entries(effects || {}).map(([key, value]) => {
    let shown = value;
    if (typeof shown === 'number' && Math.abs(shown) < 1) shown = Math.round(shown * 100) + '%';
    return (labels[key] || key) + ': ' + shown;
  }).join(' · ');
}
function daoUiPillEffectText(pill) {
  if (!pill) return 'Chưa rõ công hiệu.';
  const out = [];
  if (pill.description) out.push(pill.description);
  if (pill.addYears) out.push('Tăng ' + daoUiFmt(pill.addYears) + ' năm thọ nguyên');
  if (pill.durationMs || pill.durationSeconds) out.push('Hiệu lực ' + daoUiTimeText(pill.durationMs || pill.durationSeconds));
  if (pill.maxUses) out.push('Giới hạn dùng: ' + daoUiFmt(pill.maxUses) + ' lần');
  if (pill.realmMinOrder) out.push('Yêu cầu cảnh giới bậc ' + daoUiFmt(pill.realmMinOrder));
  const e = daoUiEffectText(pill.effects || pill.effect || pill.stats || {});
  if (e) out.push(e);
  return [...new Set(out.filter(Boolean))].join(' · ') || 'Công hiệu chưa được khai mở.';
}
function daoUiRecipeMaterials(recipe) {
  return recipe?.ingredients || recipe?.materials || recipe?.costItems || recipe?.requires || [];
}
function daoUiMaterialHtml(recipe) {
  const mats = daoUiRecipeMaterials(recipe);
  if (!mats.length) return '<div class="dao-popup-empty">Không yêu cầu nguyên liệu.</div>';
  return mats.map(mat => {
    const id = mat.id || mat.itemId || mat.materialId || mat.herbId || mat.currency;
    const amount = mat.amount || mat.count || mat.qty || 1;
    return '<div class="dao-popup-material"><span>' + daoUiEscape(daoUiItemName(id)) + '</span><b>x' + daoUiEscape(daoUiFmt(amount)) + '</b></div>';
  }).join('');
}
function daoUiRecipes() {
  const recipes = daoUiMetaList('recipes');
  return recipes.length ? recipes : (Array.isArray(playerData?.recipes) ? playerData.recipes : []);
}
function daoUiPillMetas() {
  return [].concat(daoUiMetaList('lifespanPills')).concat(daoUiMetaList('pills'));
}
function daoUiFindRecipe(id) {
  return daoUiRecipes().find(r => r && String(r.id) === String(id)) || null;
}
function daoUiFindPill(id) {
  return daoUiPillMetas().find(p => p && String(p.id) === String(id)) || daoUiFindKnownItem(id);
}
function daoUiRecipePill(recipe) {
  return daoUiFindPill(recipe?.pillId || recipe?.outputId || recipe?.resultId || recipe?.resultPillId);
}
function daoUiSuccessText(recipe) {
  const rate = recipe?.successRate ?? recipe?.baseSuccessRate ?? recipe?.rate ?? recipe?.chance;
  if (rate === undefined || rate === null || rate === '') return 'Theo bậc đan sư';
  const n = Number(rate);
  if (!Number.isFinite(n)) return String(rate);
  return (n <= 1 ? Math.round(n * 100) : n) + '%';
}
function daoUiCostText(recipe) {
  const cost = recipe?.cost ?? recipe?.lingStoneCost ?? recipe?.spiritStoneCost;
  return cost ? daoUiFmt(cost) : 'Không tốn';
}
function daoUiEnsurePopup() {
  let layer = document.getElementById('dao-detail-popup');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'dao-detail-popup';
    layer.className = 'dao-popup hidden';
    document.body.appendChild(layer);
  }
  return layer;
}
function daoUiClosePopup() {
  const layer = document.getElementById('dao-detail-popup');
  if (layer) layer.classList.add('hidden');
}
function daoUiOpenPopup(title, bodyHtml, actionHtml) {
  const layer = daoUiEnsurePopup();
  layer.className = 'dao-popup';
  layer.innerHTML = '' +
    '<div class="dao-popup-backdrop" data-dao-popup-close="1"></div>' +
    '<section class="dao-popup-card" role="dialog" aria-modal="true">' +
      '<header class="dao-popup-head"><div><span class="dao-popup-kicker">Đan Các Chi Tiết</span><h2>' + daoUiEscape(title) + '</h2></div><button class="ghost-btn dao-popup-x" data-dao-popup-close="1">Đóng</button></header>' +
      '<div class="dao-popup-body">' + bodyHtml + '</div>' +
      '<footer class="dao-popup-foot">' + (actionHtml || '') + '</footer>' +
    '</section>';
  layer.querySelectorAll('[data-dao-popup-close]').forEach(el => el.addEventListener('click', daoUiClosePopup));
  layer.querySelectorAll('[data-popup-craft]').forEach(btn => btn.addEventListener('click', () => { daoUiClosePopup(); craftPill(btn.dataset.popupCraft); }));
  layer.querySelectorAll('[data-popup-use-pill]').forEach(btn => btn.addEventListener('click', () => { daoUiClosePopup(); usePill(btn.dataset.popupUsePill); }));
}
document.addEventListener('keydown', ev => { if (ev.key === 'Escape') daoUiClosePopup(); });
function daoUiOpenRecipePopup(recipeId) {
  const recipe = daoUiFindRecipe(recipeId);
  if (!recipe) return;
  const pill = daoUiRecipePill(recipe);
  const body = '' +
    '<div class="dao-popup-grid">' +
      '<div class="dao-popup-section dao-popup-wide"><h3>Công hiệu</h3><p>' + daoUiEscape(daoUiPillEffectText(pill || recipe)) + '</p></div>' +
      '<div class="dao-popup-section"><h3>Yêu cầu luyện chế</h3>' +
        '<div class="dao-popup-stat"><span>Thời gian</span><b>' + daoUiEscape(daoUiTimeText(recipe.durationMs || recipe.durationSeconds || recipe.craftTime || 0)) + '</b></div>' +
        '<div class="dao-popup-stat"><span>Tỷ lệ thành công</span><b>' + daoUiEscape(daoUiSuccessText(recipe)) + '</b></div>' +
        '<div class="dao-popup-stat"><span>Linh thạch</span><b>' + daoUiEscape(daoUiCostText(recipe)) + '</b></div>' +
        '<div class="dao-popup-stat"><span>Bậc đan sư</span><b>' + daoUiEscape(recipe.alchemistRankName || recipe.rankName || recipe.requiredRank || 'Không yêu cầu') + '</b></div>' +
      '</div>' +
      '<div class="dao-popup-section"><h3>Nguyên liệu</h3>' + daoUiMaterialHtml(recipe) + '</div>' +
    '</div>';
  const disabled = (playerData?.activeTab || currentTab) !== 'alchemy';
  const action = '<button class="primary-btn" type="button" data-popup-craft="' + daoUiEscape(recipe.id) + '"' + (disabled ? ' disabled' : '') + '>' + (disabled ? 'Chuyển sang Đan Dược để luyện' : 'Khai lò luyện đan') + '</button>';
  daoUiOpenPopup(recipe.name || recipe.id, body, action);
}
function daoUiOpenPillPopup(itemId) {
  const inv = Array.isArray(playerData?.inventory) ? playerData.inventory : [];
  const item = inv.find(it => String(it.id) === String(itemId)) || {};
  const pill = daoUiFindPill(item.basePillId || item.pillId || item.id) || item;
  const body = '' +
    '<div class="dao-popup-grid">' +
      '<div class="dao-popup-section dao-popup-wide"><h3>Công hiệu</h3><p>' + daoUiEscape(daoUiPillEffectText(pill)) + '</p></div>' +
      '<div class="dao-popup-section"><h3>Thông tin linh đan</h3>' +
        '<div class="dao-popup-stat"><span>Số lượng</span><b>' + daoUiEscape(daoUiFmt(item.amount || 1)) + '</b></div>' +
        '<div class="dao-popup-stat"><span>Phẩm chất</span><b>' + daoUiEscape(item.quality || pill.quality || 'Đan dược') + '</b></div>' +
        '<div class="dao-popup-stat"><span>Hiệu lực</span><b>' + daoUiEscape(pill.durationMs || pill.durationSeconds ? daoUiTimeText(pill.durationMs || pill.durationSeconds) : 'Dùng ngay') + '</b></div>' +
      '</div>' +
    '</div>';
  const disabled = (playerData?.activeTab || currentTab) !== 'alchemy';
  const action = '<button class="primary-btn" type="button" data-popup-use-pill="' + daoUiEscape(item.id || itemId) + '"' + (disabled ? ' disabled' : '') + '>' + (disabled ? 'Chuyển sang Đan Dược để dùng' : 'Dùng linh đan') + '</button>';
  daoUiOpenPopup(item.name || pill.name || itemId, body, action);
}

function renderActivityLog() {
  const box = typeof ensureActionLogPanel === 'function' ? ensureActionLogPanel() : (typeof ensureActivityPanel === 'function' ? ensureActivityPanel() : document.getElementById('activity-log-list'));
  if (!box) return;
  const panel = box.closest('.panel') || box.parentElement;
  if (panel) panel.classList.add('activity-panel-scroll-host');
  box.classList.add('activity-log-scroll-box');
  const logs = Array.isArray(playerData?.activityLog) ? playerData.activityLog : [];
  if (!logs.length) {
    box.innerHTML = '<p class="empty">Chưa có đạo hành nào được ghi nhận.</p>';
    return;
  }
  box.innerHTML = logs.map(item => {
    const category = daoUiEscape(item.categoryLabel || item.category || 'Thiên Cơ');
    const text = daoUiEscape(item.text || item.message || 'Đạo hành biến động.');
    const detail = item.detail ? '<p>' + daoUiEscape(item.detail) + '</p>' : '';
    const at = Number(item.at || 0);
    const time = at ? new Date(at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
    const cls = daoUiEscape(item.category || 'system');
    return '<article class="log-entry log-' + cls + '"><div><b>' + category + '</b><span>' + daoUiEscape(time) + '</span></div><p>' + text + '</p>' + detail + '</article>';
  }).join('');
}

function renderAlchemy() {
  setText('alchemy-bonus', '+' + daoUiFmt(playerData?.cave?.alchemyBonus || 0) + '%');
  const recipeBox = document.getElementById('recipe-list');
  const pillBox = document.getElementById('pill-list');
  const recipes = daoUiRecipes();
  if (recipeBox) {
    recipeBox.classList.add('dao-compact-card-grid');
    recipeBox.innerHTML = recipes.length ? recipes.map(recipe => {
      const pill = daoUiRecipePill(recipe);
      return '<article class="dao-compact-card" data-open-recipe="' + daoUiEscape(recipe.id) + '">' +
        '<div><span class="dao-card-tag">Công thức</span><h4>' + daoUiEscape(recipe.name || recipe.id) + '</h4></div>' +
        '<p>' + daoUiEscape((pill && pill.description) || recipe.description || 'Bấm để xem nguyên liệu, công hiệu, thời gian và tỷ lệ thành công.') + '</p>' +
        '<div class="dao-card-meta"><span>' + daoUiEscape(daoUiTimeText(recipe.durationMs || recipe.durationSeconds || recipe.craftTime || 0)) + '</span><span>' + daoUiEscape(daoUiSuccessText(recipe)) + '</span></div>' +
        '<button class="ghost-btn" type="button" data-open-recipe="' + daoUiEscape(recipe.id) + '">Xem chi tiết</button>' +
      '</article>';
    }).join('') : '<p class="empty">Chưa có công thức luyện đan.</p>';
  }
  const pills = (Array.isArray(playerData?.inventory) ? playerData.inventory : []).filter(item => item && (item.basePillId || item.pillId || String(item.id || '').toLowerCase().includes('dan')));
  if (pillBox) {
    pillBox.classList.add('dao-compact-card-grid');
    pillBox.innerHTML = pills.length ? pills.map(item => {
      const pill = daoUiFindPill(item.basePillId || item.pillId || item.id) || item;
      return '<article class="dao-compact-card" data-open-pill="' + daoUiEscape(item.id) + '">' +
        '<div><span class="dao-card-tag">Linh đan</span><h4>' + daoUiEscape(item.name || pill.name || item.id) + '</h4></div>' +
        '<p>Số lượng: ' + daoUiEscape(daoUiFmt(item.amount || 1)) + ' · ' + daoUiEscape(item.quality || pill.quality || 'Đan dược') + '</p>' +
        '<div class="dao-card-meta"><span>' + daoUiEscape(pill.durationMs || pill.durationSeconds ? daoUiTimeText(pill.durationMs || pill.durationSeconds) : 'Dùng ngay') + '</span><span>Chi tiết</span></div>' +
        '<button class="ghost-btn" type="button" data-open-pill="' + daoUiEscape(item.id) + '">Xem / dùng</button>' +
      '</article>';
    }).join('') : '<p class="empty">Chưa có đan dược.</p>';
  }
  document.querySelectorAll('[data-open-recipe]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); daoUiOpenRecipePopup(el.dataset.openRecipe); }));
  document.querySelectorAll('[data-open-pill]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); daoUiOpenPillPopup(el.dataset.openPill); }));
}
`;

const cssPatch = String.raw`
/* DAO_UI_POPUP_FIX_V4 */
.activity-panel-scroll-host { display: flex; flex-direction: column; min-height: 0; }
.activity-log-scroll-box { max-height: 360px; overflow-y: auto; overscroll-behavior: contain; padding-right: 8px; scrollbar-width: thin; }
.activity-log-scroll-box .log-entry { margin-bottom: 10px; }
.activity-log-scroll-box::-webkit-scrollbar { width: 8px; }
.activity-log-scroll-box::-webkit-scrollbar-thumb { border-radius: 999px; background: rgba(222, 184, 135, .35); }
.dao-compact-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; align-items: stretch; }
.dao-compact-card { cursor: pointer; border: 1px solid rgba(219, 170, 96, .24); border-radius: 16px; padding: 14px; background: linear-gradient(145deg, rgba(52, 34, 20, .88), rgba(23, 17, 13, .92)); box-shadow: inset 0 1px 0 rgba(255,255,255,.05); transition: transform .15s ease, border-color .15s ease, background .15s ease; }
.dao-compact-card:hover { transform: translateY(-2px); border-color: rgba(244, 201, 125, .58); background: linear-gradient(145deg, rgba(70, 43, 24, .92), rgba(28, 19, 13, .96)); }
.dao-compact-card h4 { margin: 4px 0 8px; color: #f6d59a; font-size: 15px; }
.dao-compact-card p { margin: 0 0 10px; color: rgba(255, 238, 212, .78); line-height: 1.5; }
.dao-card-tag { display: inline-flex; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #e7b76e; opacity: .9; }
.dao-card-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.dao-card-meta span { border: 1px solid rgba(222, 184, 135, .22); border-radius: 999px; padding: 3px 8px; color: #ead5b4; font-size: 12px; background: rgba(255,255,255,.04); }
.dao-popup.hidden { display: none !important; }
.dao-popup { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; padding: 18px; }
.dao-popup-backdrop { position: absolute; inset: 0; background: rgba(7, 5, 3, .72); backdrop-filter: blur(4px); }
.dao-popup-card { position: relative; width: min(860px, 96vw); max-height: min(760px, 90vh); overflow: hidden; display: flex; flex-direction: column; border: 1px solid rgba(241, 196, 115, .38); border-radius: 22px; background: radial-gradient(circle at top left, rgba(95, 58, 27, .96), rgba(18, 13, 10, .98) 45%, rgba(9, 7, 6, .99)); box-shadow: 0 24px 80px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.08); }
.dao-popup-head, .dao-popup-foot { padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(222, 184, 135, .18); }
.dao-popup-foot { border-top: 1px solid rgba(222, 184, 135, .18); border-bottom: 0; justify-content: flex-end; }
.dao-popup-kicker { color: #dca95f; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
.dao-popup-head h2 { margin: 4px 0 0; color: #ffe2a9; font-size: 22px; }
.dao-popup-body { overflow-y: auto; padding: 18px; overscroll-behavior: contain; }
.dao-popup-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.dao-popup-section { border: 1px solid rgba(222, 184, 135, .2); border-radius: 16px; padding: 14px; background: rgba(255,255,255,.045); }
.dao-popup-wide { grid-column: 1 / -1; }
.dao-popup-section h3 { margin: 0 0 10px; color: #f5c77d; font-size: 15px; }
.dao-popup-section p { margin: 0; color: rgba(255, 239, 216, .82); line-height: 1.65; }
.dao-popup-stat, .dao-popup-material { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-bottom: 1px dashed rgba(222, 184, 135, .18); color: rgba(255,239,216,.82); }
.dao-popup-stat:last-child, .dao-popup-material:last-child { border-bottom: 0; }
.dao-popup-stat b, .dao-popup-material b { color: #ffe2a9; text-align: right; }
.dao-popup-empty { color: rgba(255,239,216,.58); font-style: italic; }
.dao-popup-x { white-space: nowrap; }
@media (max-width: 720px) { .dao-popup-grid { grid-template-columns: 1fr; } .dao-popup-head { align-items: flex-start; } .activity-log-scroll-box { max-height: 300px; } }
`;

appendOnce(scriptPath, 'DAO_UI_POPUP_FIX_V4', jsPatch);
appendOnce(stylePath, 'DAO_UI_POPUP_FIX_V4', cssPatch);

console.log('\nHoàn tất. Chạy tiếp:');
console.log('node --check frontend/script.js');
console.log('npm start');
