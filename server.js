const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const serverActionLog = require('./core/serverActionLog');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'players.json');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'frontend')));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const REALMS = [
  { id: 'luyen_khi', world: 'Nhân Giới', name: 'Luyện Khí', stages: 9, order: 1, lifespanAdd: 20 },
  { id: 'truc_co', world: 'Nhân Giới', name: 'Trúc Cơ', stages: 9, order: 2, lifespanAdd: 40 },
  { id: 'kim_dan', world: 'Nhân Giới', name: 'Kim Đan', stages: 9, order: 3, lifespanAdd: 80 },
  { id: 'nguyen_anh', world: 'Nhân Giới', name: 'Nguyên Anh', stages: 9, order: 4, lifespanAdd: 160 },
  { id: 'hoa_than', world: 'Nhân Giới', name: 'Hóa Thần', stages: 9, order: 5, lifespanAdd: 260 },
  { id: 'luyen_hu', world: 'Nhân Giới', name: 'Luyện Hư', stages: 9, order: 6, lifespanAdd: 420 },
  { id: 'hop_the', world: 'Nhân Giới', name: 'Hợp Thể', stages: 9, order: 7, lifespanAdd: 700 },
  { id: 'dai_thua', world: 'Nhân Giới', name: 'Đại Thừa', stages: 9, order: 8, lifespanAdd: 1000 },
];

const MAPS = [
  {
    id: 'ap_suong_mu', name: 'Ấp Sương Mù', worldName: 'Nhân Giới', realmId: 'luyen_khi', realmName: 'Luyện Khí', requiredRealmOrder: 1,
    description: 'Một ngôi làng nhỏ bị sương mù bao phủ quanh năm.',
    monsters: [
      { id: 'yeu_tho_suong', name: 'Yêu Thỏ Sương', hp: 32, atk: 5, def: 1, tuViReward: 8, stoneReward: 2 },
      { id: 'mao_quy', name: 'Mao Quỷ', hp: 38, atk: 6, def: 2, tuViReward: 10, stoneReward: 3 },
    ],
  },
  {
    id: 'vuong_lao_ba_suong', name: 'Vườn Lão Bà Sương', worldName: 'Nhân Giới', realmId: 'luyen_khi', realmName: 'Luyện Khí', requiredRealmOrder: 1,
    description: 'Dược viên cũ bị yêu khí xâm thực, tân thủ dễ nhặt hạt giống và linh thủy.',
    monsters: [
      { id: 'doc_diep_trung', name: 'Độc Diệp Trùng', hp: 40, atk: 7, def: 2, tuViReward: 12, stoneReward: 3 },
      { id: 'suong_anh_yeu', name: 'Sương Ảnh Yêu', hp: 46, atk: 8, def: 3, tuViReward: 14, stoneReward: 4 },
    ],
  },
  {
    id: 'moc_than_khoc', name: 'Mộc Thần Khốc', worldName: 'Nhân Giới', realmId: 'luyen_khi', realmName: 'Luyện Khí', requiredRealmOrder: 1,
    description: 'Rừng cây rên khóc, có linh mộc hóa yêu.',
    monsters: [
      { id: 'moc_yeu_non', name: 'Mộc Yêu Non', hp: 52, atk: 8, def: 4, tuViReward: 16, stoneReward: 4 },
      { id: 'than_moc_am', name: 'Thân Mộc Ám', hp: 58, atk: 9, def: 4, tuViReward: 18, stoneReward: 5 },
    ],
  },
  { id: 'bach_thach_co_dao', name: 'Bạch Thạch Cổ Đạo', worldName: 'Nhân Giới', realmId: 'truc_co', realmName: 'Trúc Cơ', requiredRealmOrder: 2, description: 'Cổ đạo bạch thạch, yêu thú bắt đầu có linh trí.', monsters: [{ id: 'bach_thach_lang', name: 'Bạch Thạch Lang', hp: 120, atk: 18, def: 8, tuViReward: 45, stoneReward: 10 }] },
  { id: 'huyen_am_dong', name: 'Huyền Âm Động', worldName: 'Nhân Giới', realmId: 'truc_co', realmName: 'Trúc Cơ', requiredRealmOrder: 2, description: 'Hang động lạnh buốt, âm khí tụ thành linh quái.', monsters: [{ id: 'am_hon', name: 'Âm Hồn', hp: 140, atk: 20, def: 9, tuViReward: 55, stoneReward: 12 }] },
  { id: 'kim_quang_linh_coc', name: 'Kim Quang Linh Cốc', worldName: 'Nhân Giới', realmId: 'kim_dan', realmName: 'Kim Đan', requiredRealmOrder: 3, description: 'Linh cốc có kim quang bảo khí.', monsters: [{ id: 'kim_giap_yeu', name: 'Kim Giáp Yêu', hp: 260, atk: 36, def: 18, tuViReward: 110, stoneReward: 25 }] },
  { id: 'thanh_van_bi_canh', name: 'Thanh Vân Bí Cảnh', worldName: 'Nhân Giới', realmId: 'nguyen_anh', realmName: 'Nguyên Anh', requiredRealmOrder: 4, description: 'Bí cảnh giữa mây xanh, yêu linh rất mạnh.', monsters: [{ id: 'thanh_van_linh', name: 'Thanh Vân Linh', hp: 520, atk: 70, def: 35, tuViReward: 260, stoneReward: 55 }] },
];

const TECHNIQUES = [
  { id: 'tho_nap_quyet', name: 'Thổ Nạp Quyết', system: 'cultivation', grade: 'Cơ bản', description: 'Dẫn linh khí nhập thể, tăng tốc độ tu vi.', effects: { cultivationSpeedBonus: 0.05, auraBonus: 0.05, tuViBonus: 0.05 } },
  { id: 'man_nguu_luyen_the_quyet', name: 'Man Ngưu Luyện Thể Quyết', system: 'body', grade: 'Cơ bản', description: 'Rèn da thịt gân cốt, tăng sinh mệnh và phòng ngự.', effects: { hpBonus: 0.08, defBonus: 0.04, bodyExpBonus: 0.05 } },
  { id: 'duong_than_quyet', name: 'Dưỡng Thần Quyết', system: 'soul', grade: 'Cơ bản', description: 'Dưỡng thần thức, tăng hồn lực và bạo kích.', effects: { soulPowerBonus: 0.06, soulExpBonus: 0.05, critBonus: 0.02 } },
];

const MARTIAL_SKILLS = [
  { id: 'co_ban_kiem_quyet', name: 'Cơ Bản Kiếm Quyết', system: 'cultivation', grade: 'Cơ bản', description: 'Lấy linh khí ngự kiếm, sát thương ổn định.', effects: { damageMultiplier: 1.15, atkBonus: 0.03 } },
  { id: 'man_nguu_quyen', name: 'Man Ngưu Quyền', system: 'body', grade: 'Cơ bản', description: 'Dùng khí huyết cường công, lấy thủ hóa công.', effects: { damageMultiplier: 1.1, defDamageRatio: 0.2 } },
  { id: 'kinh_than_thu', name: 'Kinh Thần Thứ', system: 'soul', grade: 'Cơ bản', description: 'Ngưng thần thức thành mũi nhọn công kích.', effects: { damageMultiplier: 1.05, critBonus: 0.03 } },
];

const MATERIALS = [
  { id: 'hat_giong_linh_thao', name: 'Hạt Giống Linh Thảo', type: 'seed', tier: 1 },
  { id: 'linh_thuy_so_cap', name: 'Linh Thủy Sơ Cấp', type: 'water', tier: 1 },
  { id: 'linh_nhuong_so_cap', name: 'Linh Nhưỡng Sơ Cấp', type: 'soil', tier: 1 },
  { id: 'hat_giong_huyen_tho', name: 'Hạt Giống Huyền Thọ Thảo', type: 'seed', tier: 2 },
  { id: 'linh_thuy_trung_cap', name: 'Linh Thủy Trung Cấp', type: 'water', tier: 2 },
  { id: 'linh_nhuong_trung_cap', name: 'Linh Nhưỡng Trung Cấp', type: 'soil', tier: 2 },
];

const HERBS = [
  { id: 'linh_thao', name: 'Linh Thảo', tier: 1, growSeconds: 60, seedId: 'hat_giong_linh_thao', waterId: 'linh_thuy_so_cap', soilId: 'linh_nhuong_so_cap', cost: 10 },
  { id: 'huyen_tho_thao', name: 'Huyền Thọ Thảo', tier: 2, growSeconds: 180, seedId: 'hat_giong_huyen_tho', waterId: 'linh_thuy_trung_cap', soilId: 'linh_nhuong_trung_cap', cost: 80 },
];

const LIFESPAN_PILLS = [
  { id: 'tho_nguyen_dan', name: 'Thọ Nguyên Đan', category: 'lifespan', addYears: 30, maxUses: 5, realmMinOrder: 1, description: 'Tăng 30 năm thọ nguyên. Giới hạn 5 lần.' },
  { id: 'huyen_tho_dan', name: 'Huyền Thọ Đan', category: 'lifespan', addYears: 120, maxUses: 3, realmMinOrder: 3, description: 'Tăng 120 năm thọ nguyên. Giới hạn 3 lần.' },
];

const RECIPES = [
  { id: 'recipe_tho_nguyen_dan', name: 'Luyện Thọ Nguyên Đan', pillId: 'tho_nguyen_dan', cost: 50, durationMs: 30000, ingredients: [{ id: 'linh_thao', amount: 3 }] },
  { id: 'recipe_huyen_tho_dan', name: 'Luyện Huyền Thọ Đan', pillId: 'huyen_tho_dan', cost: 300, durationMs: 30000, ingredients: [{ id: 'huyen_tho_thao', amount: 2 }, { id: 'linh_thao', amount: 5 }] },
];

const ENCOUNTERS = [
  {
    id: 'co_mo_duoc_vien', name: 'Cổ Mộ Dược Viên', minRealmOrder: 1,
    text: 'Sau trận chiến, một khe đá phát sáng hé mở. Bên trong như có dược viên cổ bị phong ấn.',
    choices: [
      { id: 'hai_duoc', label: 'Hái linh dược', reward: { items: [{ id: 'hat_giong_linh_thao', amount: 2 }, { id: 'linh_thuy_so_cap', amount: 2 }, { id: 'linh_nhuong_so_cap', amount: 2 }] }, penalty: { hpPercent: 10 } },
      { id: 'tham_ngo', label: 'Ngồi tham ngộ', reward: { tuViPercent: 0.25 }, penalty: { statPercent: 2, minutes: 30 } },
      { id: 'rut_lui', label: 'Không mạo hiểm', reward: { stones: 20 }, penalty: null },
    ],
  },
  {
    id: 'thien_co_tho_nguyen', name: 'Thiên Cơ Thọ Nguyên', minRealmOrder: 3,
    text: 'Một lão đạo hư ảnh hỏi ngươi muốn cầu thọ nguyên, cầu tài nguyên hay cầu tu vi.',
    choices: [
      { id: 'cau_tho', label: 'Cầu thọ nguyên', reward: { lifespanYears: 50 }, penalty: { stones: 80 } },
      { id: 'cau_duoc', label: 'Cầu dược liệu cao cấp', reward: { items: [{ id: 'hat_giong_huyen_tho', amount: 2 }, { id: 'linh_thuy_trung_cap', amount: 2 }, { id: 'linh_nhuong_trung_cap', amount: 2 }] }, penalty: { hpPercent: 20 } },
      { id: 'cau_tu_vi', label: 'Cầu tu vi', reward: { tuViPercent: 0.8 }, penalty: { statPercent: 3, minutes: 60 } },
    ],
  },
];

function loadPlayers() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Lỗi đọc data:', err.message);
  }
  return {};
}

function savePlayers(players) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
}

function createProgress(id) {
  return { id, rank: 1, phase: 1, exp: 0, maxExp: 100 };
}

function createDefaultTechniques() {
  return {
    equipped: { cultivation: 'tho_nap_quyet', body: 'man_nguu_luyen_the_quyet', soul: 'duong_than_quyet' },
    learned: Object.fromEntries(TECHNIQUES.map(item => [item.id, createProgress(item.id)])),
  };
}

function createDefaultMartialSkills() {
  return {
    equipped: { active: 'co_ban_kiem_quyet' },
    learned: Object.fromEntries(MARTIAL_SKILLS.map(item => [item.id, createProgress(item.id)])),
  };
}

function getRealmInfo(cultivation) {
  const index = Math.max(0, Math.min(REALMS.length - 1, Number(cultivation.realmIndex || 0)));
  const realm = REALMS[index];
  const stage = Math.max(1, Math.min(realm.stages, Number(cultivation.stage || 1)));
  return { ...realm, realmIndex: index, stage, displayName: `${realm.name} ${stage}/${realm.stages}`, worldName: realm.world };
}

function getRealmNeed(cultivation) {
  const info = getRealmInfo(cultivation);
  return Math.floor(100 * Math.pow(1.45, info.realmIndex) * info.stage);
}

function getMainRealmOrder(player) {
  return getRealmInfo(player.cultivation).order;
}

function getUnlockedMaps(player) {
  const order = getMainRealmOrder(player);
  return MAPS.filter(map => map.requiredRealmOrder <= order);
}

function getMapById(id) {
  return MAPS.find(map => map.id === id) || null;
}

function getDefaultMapId() {
  return MAPS[0].id;
}

function ensureCurrentMap(player) {
  const unlocked = getUnlockedMaps(player);
  if (!unlocked.some(map => map.id === player.currentZone)) player.currentZone = unlocked[0]?.id || getDefaultMapId();
  return getMapById(player.currentZone) || unlocked[0] || MAPS[0];
}

function addInventoryItem(player, id, amount = 1, extra = {}) {
  if (!player.inventory) player.inventory = [];
  const known = [...MATERIALS, ...HERBS, ...LIFESPAN_PILLS].find(item => item.id === id);
  const name = extra.name || known?.name || id;
  const item = player.inventory.find(x => x.id === id && (x.quality || '') === (extra.quality || ''));
  if (item) item.amount = Number(item.amount || 0) + amount;
  else player.inventory.push({ id, name, amount, ...extra });
}

function removeInventoryItem(player, id, amount = 1) {
  const item = (player.inventory || []).find(x => x.id === id);
  if (!item || Number(item.amount || 0) < amount) return false;
  item.amount -= amount;
  if (item.amount <= 0) player.inventory = player.inventory.filter(x => x !== item);
  return true;
}

function countItem(player, id) {
  return Number((player.inventory || []).find(x => x.id === id)?.amount || 0);
}


function itemDisplayName(id) {
  const item = [...MATERIALS, ...HERBS, ...LIFESPAN_PILLS].find(x => x.id === id);
  return item?.name || id || 'không rõ';
}

function actionLog(player, category, text, detail = '', meta = {}) {
  try {
    serverActionLog.writeActionLog({
      username: player.username,
      category,
      text,
      detail,
      meta,
    });
  } catch (err) {
    console.warn('[ActionLog] Không thể ghi Nhật Ký Đạo Hành:', err.message);
  }
}

function describeIngredients(ingredients = []) {
  if (!Array.isArray(ingredients) || !ingredients.length) return 'Không tiêu hao nguyên liệu.';
  return ingredients.map(item => `${itemDisplayName(item.id)} x${Number(item.amount || 1)}`).join(', ');
}

function describeReward(reward = {}) {
  if (!reward || typeof reward !== 'object') return 'Không nhận được gì.';
  const parts = [];
  if (reward.stones) parts.push(`+${Number(reward.stones)} Sơ Linh Thạch`);
  if (reward.tuVi) parts.push(`+${Number(reward.tuVi)} tu vi`);
  if (reward.tuViPercent) parts.push(`+${Math.round(Number(reward.tuViPercent || 0) * 100)}% tu vi cảnh giới hiện tại`);
  if (reward.lifespanYears) parts.push(`+${Number(reward.lifespanYears)} năm thọ nguyên`);
  if (Array.isArray(reward.items)) {
    reward.items.forEach(item => parts.push(`${itemDisplayName(item.id)} x${Number(item.amount || 1)}`));
  }
  return parts.length ? parts.join(', ') : 'Không nhận được gì.';
}

function describePenalty(penalty = {}) {
  if (!penalty || typeof penalty !== 'object') return 'Không có phản phệ.';
  const parts = [];
  if (penalty.stones) parts.push(`-${Number(penalty.stones)} Sơ Linh Thạch`);
  if (penalty.hpPercent) parts.push(`Mất ${Number(penalty.hpPercent)}% HP tối đa`);
  if (penalty.statPercent) parts.push(`Giảm ${Number(penalty.statPercent)}% thuộc tính trong ${Number(penalty.minutes || 60)} phút`);
  return parts.length ? parts.join(', ') : 'Không có phản phệ.';
}

function focusText(list = []) {
  return (Array.isArray(list) ? list : []).map(item => ({
    main: 'Tu Luyện',
    body: 'Luyện Thể',
    soul: 'Luyện Hồn',
  }[item] || item)).join(', ') || 'Không rõ';
}

function addLog(player, text) {
  if (!player.combatState.logs) player.combatState.logs = [];
  const time = new Date().toLocaleTimeString('vi-VN');
  player.combatState.logs.push(`[${time}] ${text}`);
  while (player.combatState.logs.length > 8) player.combatState.logs.shift();
}

function getRandomMonster(map) {
  const list = Array.isArray(map.monsters) && map.monsters.length ? map.monsters : [{ id: 'vo_danh_yeu', name: 'Vô Danh Yêu', hp: 30, atk: 5, def: 1, tuViReward: 8, stoneReward: 2 }];
  return list[Math.floor(Math.random() * list.length)];
}

function buildMonsterStats(player, map, base) {
  const stageMul = 1 + (getRealmInfo(player.cultivation).stage - 1) * 0.04;
  return { ...base, mapId: map.id, hp: Math.floor(base.hp * stageMul), atk: Math.floor(base.atk * stageMul), def: Math.floor(base.def * stageMul) };
}

function resetMonster(player) {
  if (!player.combatState) return;
  player.combatState.currentMonster = null;
  player.combatState.monsterHp = 0;
  player.combatState.monsterMaxHp = 0;
  player.combatState.fightProgress = 0;
}

function ensureCombatState(player) {
  if (!player.combatState) {
    player.combatState = {
      fightProgress: 0,
      fightDuration: 3000,
      currentMonster: null,
      monsterHp: 0,
      monsterMaxHp: 0,
      status: 'Sẵn sàng',
      logs: [],
      deathCount: 0,
      deathPenaltyPercent: 0,
      lastPenaltyRecoverAt: Date.now(),
    };
  }
  if (!Array.isArray(player.combatState.logs)) player.combatState.logs = [];
  if (!player.combatState.fightDuration) player.combatState.fightDuration = 3000;
  const currentMap = ensureCurrentMap(player);
  if (player.combatState.currentMonster && player.combatState.currentMonster.mapId !== currentMap.id) resetMonster(player);
  if ((!player.combat.hp || player.combat.hp <= 0) && player.combatState.deathPenaltyPercent < 90) player.combat.hp = player.combat.maxHp;
}

function spawnMonster(player) {
  ensureCombatState(player);
  const map = ensureCurrentMap(player);
  const monster = buildMonsterStats(player, map, getRandomMonster(map));
  player.combatState.currentMonster = monster;
  player.combatState.monsterHp = monster.hp;
  player.combatState.monsterMaxHp = monster.hp;
  player.combatState.fightProgress = 0;
  player.combatState.status = `Đang đánh ${monster.name}`;
  return monster;
}

function getActiveMartial(player) {
  const state = player.martialSkills || createDefaultMartialSkills();
  const id = state.equipped?.active || 'co_ban_kiem_quyet';
  return MARTIAL_SKILLS.find(item => item.id === id) || MARTIAL_SKILLS[0];
}

function rollDamage(atk, def, options = {}) {
  const multiplier = Math.max(1, Number(options.damageMultiplier || 1));
  const extraDamage = Math.max(0, Number(options.extraDamage || 0));
  const critRate = Math.max(0, Math.min(0.95, Number(options.critRate || 0)));
  const critDmg = Math.max(1, Number(options.critDmg || 1.5));
  const raw = (Number(atk || 1) * multiplier + extraDamage) - Number(def || 0) * 0.45;
  const variance = 0.85 + Math.random() * 0.3;
  const crit = Math.random() < critRate;
  return Math.max(1, Math.floor(raw * variance * (crit ? critDmg : 1)));
}

function getDeathPenaltyMultiplier(player) {
  const penalty = Math.max(0, Math.min(90, Number(player.combatState?.deathPenaltyPercent || 0)));
  return Math.max(0.1, 1 - penalty / 100);
}

function getEncounterPenaltyPercent(player) {
  const now = Date.now();
  const penalties = Array.isArray(player.temporaryPenalties) ? player.temporaryPenalties : [];
  player.temporaryPenalties = penalties.filter(p => Number(p.until || 0) > now);
  return player.temporaryPenalties.reduce((sum, item) => sum + Number(item.percent || 0), 0);
}

function getFinalStatMultiplier(player) {
  const deathMul = getDeathPenaltyMultiplier(player);
  const encounterMul = Math.max(0.05, 1 - getEncounterPenaltyPercent(player) / 100);
  return deathMul * encounterMul;
}

function isInteractionLocked(player) {
  if (player.encounter?.active) return true;
  if (player.interaction?.until && player.interaction.until > Date.now()) return true;
  return false;
}

function lockInteraction(player, type, label, ms = 0) {
  player.interaction = { type, label, until: ms > 0 ? Date.now() + ms : 0, startedAt: Date.now() };
}

function clearInteraction(player) {
  player.interaction = { type: null, label: '', until: 0, startedAt: Date.now() };
}

function guardNormalAction(res, player) {
  if (player.encounter?.active) {
    res.status(423).json({ success: false, error: 'Thiên cơ đã hiện. Phải lựa chọn kỳ ngộ trước khi làm việc khác.' });
    return false;
  }
  if (player.interaction?.until && player.interaction.until > Date.now()) {
    res.status(423).json({ success: false, error: `Đang ${player.interaction.label || 'tương tác'}, thao tác khác tạm dừng.` });
    return false;
  }
  return true;
}

function maybeDropGardenMaterial(player) {
  const order = getMainRealmOrder(player);
  if (order > 2) return;
  if (Math.random() > 0.35) return;
  const pool = ['hat_giong_linh_thao', 'linh_thuy_so_cap', 'linh_nhuong_so_cap'];
  const id = pool[Math.floor(Math.random() * pool.length)];
  addInventoryItem(player, id, 1);
  addLog(player, `Nhặt được ${MATERIALS.find(x => x.id === id)?.name || id}.`);
}

function pickEncounter(player) {
  const order = getMainRealmOrder(player);
  const list = ENCOUNTERS.filter(item => order >= item.minRealmOrder);
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function trySpawnEncounter(player) {
  if (player.encounter?.active) return false;
  const order = getMainRealmOrder(player);
  const chance = order >= 3 ? 0.08 : 0.035;
  if (Math.random() > chance) return false;
  const cfg = pickEncounter(player);
  if (!cfg) return false;
  player.encounter.active = { id: cfg.id, name: cfg.name, text: cfg.text, choices: cfg.choices.map(c => ({ id: c.id, label: c.label })), appearedAt: Date.now() };
  lockInteraction(player, 'encounter', 'ứng đối kỳ ngộ', 0);
  addLog(player, `Kỳ ngộ xuất hiện: ${cfg.name}.`);
  return true;
}

function processCombatRound(player) {
  ensureCombatState(player);
  if (!player.autoFight) {
    player.combatState.status = 'Tự đánh đang tắt.';
    return;
  }
  let monster = player.combatState.currentMonster;
  if (!monster || player.combatState.monsterHp <= 0) monster = spawnMonster(player);
  const martial = getActiveMartial(player);
  const effects = martial.effects || {};
  const penaltyMul = getFinalStatMultiplier(player);
  const atk = Math.max(1, (player.combat.atk + (player.permanentBonuses.atk || 0)) * penaltyMul);
  const def = Math.max(0, (player.combat.def + (player.permanentBonuses.def || 0)) * penaltyMul);
  const damage = rollDamage(atk, monster.def, {
    damageMultiplier: effects.damageMultiplier || 1,
    extraDamage: def * Number(effects.defDamageRatio || 0),
    critRate: Number(player.combat.critRate || 0.05) + Number(effects.critBonus || 0),
    critDmg: player.combat.critDmg || 1.5,
  });
  player.combatState.monsterHp = Math.max(0, player.combatState.monsterHp - damage);
  addLog(player, `Thi triển ${martial.name}, đánh ${monster.name} -${damage} HP.`);
  if (player.combatState.monsterHp <= 0) {
    player.stats.totalKills += 1;
    player.cultivation.tuVi += monster.tuViReward || 0;
    player.stats.totalTuVi += monster.tuViReward || 0;
    player.currencies.so_linh_thach += monster.stoneReward || 0;
    addLog(player, `Hạ ${monster.name}, nhận ${monster.tuViReward || 0} tu vi và ${monster.stoneReward || 0} linh thạch.`);
    maybeDropGardenMaterial(player);
    trySpawnEncounter(player);
    if (!player.encounter?.active) spawnMonster(player);
    return;
  }
  const monsterDamage = rollDamage(monster.atk, def);
  player.combat.hp = Math.max(0, player.combat.hp - monsterDamage);
  addLog(player, `${monster.name} phản kích -${monsterDamage} HP.`);
  if (player.combat.hp <= 0) {
    player.autoFight = false;
    player.combatState.deathCount += 1;
    player.combatState.deathPenaltyPercent = Math.min(90, player.combatState.deathPenaltyPercent + Math.pow(2, player.combatState.deathCount - 1));
    player.combatState.status = `Trọng thương, bị phạt ${player.combatState.deathPenaltyPercent}% chỉ số.`;
    resetMonster(player);
  }
}

function processCombat(player, deltaMs) {
  ensureCombatState(player);
  if (isInteractionLocked(player)) {
    player.combatState.status = 'Đang ứng đối kỳ ngộ, combat tạm dừng.';
    return;
  }
  if (!player.autoFight) {
    player.combatState.status = 'Tự đánh đang tắt.';
    return;
  }
  if (player.combat.hp <= 0) {
    player.autoFight = false;
    player.combatState.status = 'Trọng thương, cần hồi phục.';
    return;
  }
  if (!player.combatState.currentMonster) spawnMonster(player);
  player.combatState.fightProgress += Math.min(Number(deltaMs || 0), 5 * 60 * 1000);
  let guard = 0;
  while (player.combatState.fightProgress >= player.combatState.fightDuration && guard < 200) {
    player.combatState.fightProgress -= player.combatState.fightDuration;
    processCombatRound(player);
    guard++;
    if (!player.autoFight || player.combat.hp <= 0 || isInteractionLocked(player)) break;
  }
}

function createDefaultPlots() {
  return Array.from({ length: 4 }, (_, index) => ({ index, state: 'empty', herbId: null, plantedAt: 0, readyAt: 0 }));
}

function createNewPlayer(username) {
  return {
    username,
    createdAt: Date.now(),
    lastSave: Date.now(),
    lastTick: Date.now(),
    cultivation: { world: 'nhan_gioi', realmIndex: 0, stage: 1, tuVi: 0, maxTuVi: 100 },
    bodyCultivation: { rank: 1, name: 'Phàm Thể', exp: 0, maxExp: 100 },
    soulCultivation: { rank: 1, name: 'Tĩnh Hồn', exp: 0, maxExp: 100 },
    cultivationFocus: ['main'],
    techniques: createDefaultTechniques(),
    martialSkills: createDefaultMartialSkills(),
    combat: { hp: 100, maxHp: 100, atk: 10, def: 5, speed: 5, critRate: 0.05, critDmg: 1.5 },
    inventory: [],
    currencies: { so_linh_thach: 0, trung_linh_thach: 0, cao_linh_thach: 0, cuc_pham_linh_thach: 0, tien_ngoc: 0 },
    currentZone: getDefaultMapId(),
    autoFight: true,
    activeTab: 'overview',
    stats: { totalKills: 0, totalTuVi: 0, playTime: 0 },
    permanentBonuses: { atk: 0, def: 0, tuViBonus: 0 },
    cave: { level: 1, resources: { aura: 0 }, buildings: {}, auraPerSecond: 1, alchemyBonus: 0 },
    herbPlots: createDefaultPlots(),
    activePillBuffs: [],
    lifespan: { ageYears: 16, maxYears: 120, usedPills: {} },
    interaction: { type: null, label: '', until: 0, startedAt: Date.now() },
    encounter: { active: null, history: [] },
    temporaryPenalties: [],
  };
}

function normalizePracticeState(player) {
  const defaultTech = createDefaultTechniques();
  if (!player.techniques || typeof player.techniques !== 'object') player.techniques = defaultTech;
  if (!player.techniques.learned) player.techniques.learned = {};
  if (!player.techniques.equipped || typeof player.techniques.equipped !== 'object') player.techniques.equipped = {};
  for (const item of TECHNIQUES) {
    if (!player.techniques.learned[item.id]) player.techniques.learned[item.id] = createProgress(item.id);
    if (player.techniques.equipped[item.system] === undefined) player.techniques.equipped[item.system] = item.id;
  }
  const defaultMartial = createDefaultMartialSkills();
  if (!player.martialSkills || typeof player.martialSkills !== 'object') player.martialSkills = defaultMartial;
  if (!player.martialSkills.learned) player.martialSkills.learned = {};
  if (!player.martialSkills.equipped || typeof player.martialSkills.equipped !== 'object') player.martialSkills.equipped = {};
  for (const item of MARTIAL_SKILLS) {
    if (!player.martialSkills.learned[item.id]) player.martialSkills.learned[item.id] = createProgress(item.id);
  }
  if (player.martialSkills.equipped.active === undefined) player.martialSkills.equipped.active = 'co_ban_kiem_quyet';
}

function ensurePlayerShape(player) {
  if (!player.cultivation) player.cultivation = createNewPlayer(player.username || 'dao_huu').cultivation;
  if (!player.bodyCultivation) player.bodyCultivation = { rank: 1, name: 'Phàm Thể', exp: 0, maxExp: 100 };
  if (!player.soulCultivation) player.soulCultivation = { rank: 1, name: 'Tĩnh Hồn', exp: 0, maxExp: 100 };
  if (!Array.isArray(player.cultivationFocus)) player.cultivationFocus = ['main'];
  if (!player.combat) player.combat = { hp: 100, maxHp: 100, atk: 10, def: 5, speed: 5, critRate: 0.05, critDmg: 1.5 };
  if (!player.inventory) player.inventory = [];
  if (!player.currencies) player.currencies = { so_linh_thach: 0, trung_linh_thach: 0, cao_linh_thach: 0, cuc_pham_linh_thach: 0, tien_ngoc: 0 };
  for (const id of ['so_linh_thach', 'trung_linh_thach', 'cao_linh_thach', 'cuc_pham_linh_thach', 'tien_ngoc']) if (player.currencies[id] === undefined) player.currencies[id] = 0;
  if (!player.stats) player.stats = { totalKills: 0, totalTuVi: 0, playTime: 0 };
  if (!['overview', 'cultivation', 'combat', 'skills', 'alchemy', 'cave', 'inventory'].includes(player.activeTab)) player.activeTab = 'overview';
  if (!player.permanentBonuses) player.permanentBonuses = { atk: 0, def: 0, tuViBonus: 0 };
  if (!player.cave) player.cave = { level: 1, resources: { aura: 0 }, buildings: {}, auraPerSecond: 1, alchemyBonus: 0 };
  if (!player.cave.resources) player.cave.resources = { aura: 0 };
  if (!player.activePillBuffs) player.activePillBuffs = [];
  if (!Array.isArray(player.herbPlots)) player.herbPlots = createDefaultPlots();
  if (!player.lifespan) player.lifespan = { ageYears: 16, maxYears: 120, usedPills: {} };
  if (!player.lifespan.usedPills) player.lifespan.usedPills = {};
  if (!player.interaction) clearInteraction(player);
  if (!player.encounter) player.encounter = { active: null, history: [] };
  if (!Array.isArray(player.encounter.history)) player.encounter.history = [];
  if (!Array.isArray(player.temporaryPenalties)) player.temporaryPenalties = [];
  normalizePracticeState(player);
  ensureCurrentMap(player);
  ensureCombatState(player);
  getEncounterPenaltyPercent(player);
  player.cultivation.maxTuVi = getRealmNeed(player.cultivation);
  if (!player.lastTick) player.lastTick = Date.now();
}

function getCultivationFocusLimit(player) {
  const mainOrder = getMainRealmOrder(player);
  const bodyRank = Number(player.bodyCultivation?.rank || 1);
  const soulRank = Number(player.soulCultivation?.rank || 1);
  if (mainOrder >= 8 && bodyRank >= 8 && soulRank >= 8) return 3;
  if (mainOrder >= 5 && bodyRank >= 5 && soulRank >= 5) return 2;
  return 1;
}

function normalizeCultivationFocus(player) {
  const valid = ['main', 'body', 'soul'];
  const limit = getCultivationFocusLimit(player);
  let selected = Array.isArray(player.cultivationFocus) ? player.cultivationFocus : ['main'];
  selected = [...new Set(selected.filter(item => valid.includes(item)))];
  if (!selected.length) selected = ['main'];
  player.cultivationFocus = selected.slice(0, limit);
  return player.cultivationFocus;
}

function addSubCultivationExp(progress, amount) {
  progress.exp = Number(progress.exp || 0) + amount;
  while (progress.exp >= progress.maxExp) {
    progress.exp -= progress.maxExp;
    progress.rank += 1;
    progress.maxExp = Math.floor(progress.maxExp * 1.35 + 50);
  }
}

function advanceMainCultivation(player) {
  const info = getRealmInfo(player.cultivation);
  if (player.cultivation.stage < info.stages) player.cultivation.stage += 1;
  else if (player.cultivation.realmIndex < REALMS.length - 1) {
    player.cultivation.realmIndex += 1;
    player.cultivation.stage = 1;
    const newInfo = getRealmInfo(player.cultivation);
    player.lifespan.maxYears += Number(newInfo.lifespanAdd || 0);
  } else {
    player.cultivation.tuVi = player.cultivation.maxTuVi;
    return false;
  }
  player.cultivation.tuVi = 0;
  player.cultivation.maxTuVi = getRealmNeed(player.cultivation);
  player.combat.maxHp += 10;
  player.combat.hp = player.combat.maxHp;
  player.combat.atk += 2;
  player.combat.def += 1;
  ensureCurrentMap(player);
  return true;
}

function updateCultivation(player) {
  player.cultivation.maxTuVi = getRealmNeed(player.cultivation);
  let guard = 0;
  while (player.cultivation.tuVi >= player.cultivation.maxTuVi && guard < 50) {
    if (!advanceMainCultivation(player)) break;
    guard++;
  }
}

function getTuViGainPerSecond(player) {
  return 1 + (player.permanentBonuses.tuViBonus || 0) / 100 + Math.floor((player.cave?.resources?.aura || 0) / 1000);
}

function processGameTick(player) {
  ensurePlayerShape(player);
  const now = Date.now();
  const deltaMs = now - player.lastTick;
  const ticks = Math.min(Math.floor(deltaMs / 1000), 60 * 60);
  if (ticks <= 0) return;
  player.lastTick = now;

  if (isInteractionLocked(player)) return;

  const activeTab = player.activeTab || 'overview';

  // Thọ nguyên là dòng thời gian chung của nhân vật.
  player.lifespan.ageYears += ticks / (60 * 60 * 24);

  // Chỉ tab Tu Luyện mới sinh tu vi/luyện thể/luyện hồn.
  if (activeTab === 'cultivation') {
    const gain = getTuViGainPerSecond(player) * ticks;
    const focus = normalizeCultivationFocus(player);
    if (focus.includes('main')) {
      player.cultivation.tuVi += gain;
      player.stats.totalTuVi += gain;
    }
    if (focus.includes('body')) addSubCultivationExp(player.bodyCultivation, gain);
    if (focus.includes('soul')) addSubCultivationExp(player.soulCultivation, gain);
    player.stats.playTime += ticks;
    updateCultivation(player);
    return;
  }

  // Chỉ tab Combat mới đánh quái. Tu vi ở đây là thưởng hạ quái, không phải tu luyện nền.
  if (activeTab === 'combat') {
    processCombat(player, Math.min(deltaMs, 5 * 60 * 1000));
    return;
  }

  // Chỉ tab Động Phủ mới tích linh khí động phủ.
  if (activeTab === 'cave') {
    player.cave.resources.aura += ticks * (player.cave.auraPerSecond || 1);
    return;
  }
}

function getPlayerOrCreate(players, username) {
  if (!players[username]) players[username] = createNewPlayer(username);
  ensurePlayerShape(players[username]);
  return players[username];
}

function getPublicTechniques(player) {
  normalizePracticeState(player);
  return {
    equipped: player.techniques.equipped,
    learned: Object.keys(player.techniques.learned).map(id => ({ ...TECHNIQUES.find(item => item.id === id), ...player.techniques.learned[id] })).filter(item => item.id),
  };
}

function getPublicMartialSkills(player) {
  normalizePracticeState(player);
  return {
    equipped: player.martialSkills.equipped,
    learned: Object.keys(player.martialSkills.learned).map(id => ({ ...MARTIAL_SKILLS.find(item => item.id === id), ...player.martialSkills.learned[id] })).filter(item => item.id),
  };
}

function publicHerbPlots(player) {
  const now = Date.now();
  return player.herbPlots.map(plot => {
    const herb = HERBS.find(x => x.id === plot.herbId);
    const ready = plot.state === 'growing' && now >= plot.readyAt;
    return { ...plot, state: ready ? 'ready' : plot.state, herbName: herb?.name || '', remainMs: plot.readyAt ? Math.max(0, plot.readyAt - now) : 0 };
  });
}

function sanitizePlayer(player) {
  ensurePlayerShape(player);
  const realmInfo = getRealmInfo(player.cultivation);
  const combatState = player.combatState || {};
  const penaltyMul = getFinalStatMultiplier(player);
  const currentMap = ensureCurrentMap(player);
  const temporaryPenaltyPercent = getEncounterPenaltyPercent(player);
  return {
    username: player.username,
    cultivation: { ...player.cultivation, realmName: realmInfo.displayName, exp: player.cultivation.tuVi, maxExp: player.cultivation.maxTuVi, info: realmInfo },
    cultivationFocusState: { selected: normalizeCultivationFocus(player), limit: getCultivationFocusLimit(player), options: ['main', 'body', 'soul'] },
    bodyCultivation: { ...player.bodyCultivation, info: { name: `Luyện Thể ${player.bodyCultivation.rank}` } },
    soulCultivation: { ...player.soulCultivation, info: { name: `Luyện Hồn ${player.soulCultivation.rank}` } },
    spiritRootDisplay: { name: 'Chưa ngộ linh căn', description: 'Tính năng linh căn sẽ mở ở bước sau.' },
    techniques: getPublicTechniques(player),
    martialSkills: getPublicMartialSkills(player),
    combat: {
      hp: Math.round(player.combat.hp),
      maxHp: player.combat.maxHp,
      atk: Math.round((player.combat.atk + (player.permanentBonuses.atk || 0)) * penaltyMul),
      def: Math.round((player.combat.def + (player.permanentBonuses.def || 0)) * penaltyMul),
      speed: Math.round(player.combat.speed * penaltyMul),
      critRate: player.combat.critRate,
      critDmg: player.combat.critDmg,
    },
    cave: { ...player.cave, auraPerSecond: player.cave.auraPerSecond || 1, alchemyBonus: player.cave.alchemyBonus || 0 },
    herbPlots: publicHerbPlots(player),
    activePillBuffs: player.activePillBuffs,
    currencies: player.currencies,
    inventory: player.inventory,
    currentZone: player.currentZone,
    zoneName: currentMap.name,
    currentMap,
    unlockedMaps: getUnlockedMaps(player),
    combatState: { ...combatState, monsterHp: Math.round(combatState.monsterHp || 0), monsterMaxHp: Math.round(combatState.monsterMaxHp || 0) },
    autoFight: player.autoFight,
    activeTab: player.activeTab || 'overview',
    stats: player.stats,
    permanentBonuses: player.permanentBonuses,
    lifespan: { ...player.lifespan, ageYears: Math.floor(player.lifespan.ageYears), remainYears: Math.max(0, Math.floor(player.lifespan.maxYears - player.lifespan.ageYears)) },
    interaction: player.interaction,
    encounter: { active: player.encounter.active, history: player.encounter.history.slice(-8) },
    temporaryPenaltyPercent,
    activityLog: serverActionLog.readPlayerLogs(player.username, 80), pillEffects: { tuViGainPerSecond: getTuViGainPerSecond(player) },
  };
}

function sendPlayer(res, players, player, extra = {}) {
  player.lastSave = Date.now();
  savePlayers(players);
  res.json({ success: true, player: sanitizePlayer(player), ...extra });
}

function getActiveEncounterConfig(player) {
  const id = player.encounter?.active?.id;
  return ENCOUNTERS.find(x => x.id === id) || null;
}

function applyReward(player, reward = {}) {
  if (reward.stones) player.currencies.so_linh_thach += Number(reward.stones || 0);
  if (reward.tuVi) {
    player.cultivation.tuVi += Number(reward.tuVi || 0);
    player.stats.totalTuVi += Number(reward.tuVi || 0);
  }
  if (reward.tuViPercent) {
    const amount = Math.floor(getRealmNeed(player.cultivation) * Number(reward.tuViPercent || 0));
    player.cultivation.tuVi += amount;
    player.stats.totalTuVi += amount;
  }
  if (reward.lifespanYears) player.lifespan.maxYears += Number(reward.lifespanYears || 0);
  if (Array.isArray(reward.items)) reward.items.forEach(item => addInventoryItem(player, item.id, Number(item.amount || 1)));
}

function applyPenalty(player, penalty = {}) {
  if (!penalty) return;
  if (penalty.stones) player.currencies.so_linh_thach = Math.max(0, player.currencies.so_linh_thach - Number(penalty.stones || 0));
  if (penalty.hpPercent) player.combat.hp = Math.max(1, player.combat.hp - Math.floor(player.combat.maxHp * Number(penalty.hpPercent || 0) / 100));
  if (penalty.statPercent) {
    player.temporaryPenalties.push({ percent: Number(penalty.statPercent || 0), until: Date.now() + Number(penalty.minutes || 60) * 60 * 1000, reason: 'Kỳ ngộ phản phệ' });
  }
}

function resolveEncounter(player, choiceId) {
  const cfg = getActiveEncounterConfig(player);
  if (!cfg) return { success: false, error: 'Không có kỳ ngộ đang chờ.' };
  const choice = cfg.choices.find(x => x.id === choiceId);
  if (!choice) return { success: false, error: 'Lựa chọn kỳ ngộ không hợp lệ.' };

  const rewardText = describeReward(choice.reward);
  const penaltyText = describePenalty(choice.penalty);

  applyReward(player, choice.reward);
  applyPenalty(player, choice.penalty);
  player.encounter.history.push({ name: cfg.name, choice: choice.label, reward: rewardText, penalty: penaltyText, at: Date.now() });
  player.encounter.active = null;
  clearInteraction(player);
  resetMonster(player);
  updateCultivation(player);
  return { success: true, message: `Đã chọn: ${choice.label}`, encounterName: cfg.name, choiceLabel: choice.label, rewardText, penaltyText };
}

function declineEncounter(player) {
  if (!player.encounter?.active) return { success: false, error: 'Không có kỳ ngộ để từ chối.' };
  const name = player.encounter.active.name;
  const penaltyText = 'Giảm 5% tổng thuộc tính trong 60 phút';
  player.temporaryPenalties.push({ percent: 5, until: Date.now() + 60 * 60 * 1000, reason: 'Từ chối kỳ ngộ' });
  player.encounter.history.push({ name, choice: 'Từ chối', at: Date.now(), penalty: penaltyText });
  player.encounter.active = null;
  clearInteraction(player);
  resetMonster(player);
  return { success: true, message: 'Đã từ chối kỳ ngộ. Bị thiên cơ phản phệ: -5% tổng thuộc tính trong 60 phút.', encounterName: name, choiceLabel: 'Từ chối', penaltyText };
}

function plantHerb(player, plotIndex, herbId) {
  const plot = player.herbPlots[plotIndex];
  const herb = HERBS.find(x => x.id === herbId);
  if (!plot) return { success: false, error: 'Ô trồng không tồn tại.' };
  if (!herb) return { success: false, error: 'Dược liệu không tồn tại.' };
  if (plot.state !== 'empty') return { success: false, error: 'Ô này chưa trống.' };
  if (countItem(player, herb.seedId) < 1) return { success: false, error: 'Thiếu hạt giống.' };
  if (countItem(player, herb.waterId) < 1) return { success: false, error: 'Thiếu linh thủy.' };
  if (countItem(player, herb.soilId) < 1) return { success: false, error: 'Thiếu linh nhưỡng.' };
  if (player.currencies.so_linh_thach < herb.cost) return { success: false, error: 'Thiếu linh thạch.' };
  removeInventoryItem(player, herb.seedId, 1);
  removeInventoryItem(player, herb.waterId, 1);
  removeInventoryItem(player, herb.soilId, 1);
  player.currencies.so_linh_thach -= herb.cost;
  plot.state = 'growing';
  plot.herbId = herb.id;
  plot.plantedAt = Date.now();
  plot.readyAt = Date.now() + herb.growSeconds * 1000;
  return { success: true, message: `Đã gieo ${herb.name}.` };
}

function harvestHerb(player, plotIndex) {
  const plot = player.herbPlots[plotIndex];
  if (!plot) return { success: false, error: 'Ô trồng không tồn tại.' };
  if (plot.state !== 'growing' || !plot.herbId) return { success: false, error: 'Ô này chưa có dược liệu.' };
  if (Date.now() < plot.readyAt) return { success: false, error: 'Dược liệu chưa chín.' };
  const herb = HERBS.find(x => x.id === plot.herbId);
  addInventoryItem(player, plot.herbId, 1 + Math.floor(Math.random() * 2));
  plot.state = 'empty';
  plot.herbId = null;
  plot.plantedAt = 0;
  plot.readyAt = 0;
  return { success: true, message: `Đã thu hoạch ${herb?.name || 'dược liệu'}.` };
}

function craftRecipe(player, recipeId) {
  const recipe = RECIPES.find(x => x.id === recipeId);
  if (!recipe) return { success: false, error: 'Công thức không tồn tại.' };
  if (player.currencies.so_linh_thach < recipe.cost) return { success: false, error: 'Thiếu linh thạch luyện đan.' };
  for (const ing of recipe.ingredients) {
    if (countItem(player, ing.id) < ing.amount) return { success: false, error: `Thiếu nguyên liệu: ${ing.id}` };
  }
  recipe.ingredients.forEach(ing => removeInventoryItem(player, ing.id, ing.amount));
  player.currencies.so_linh_thach -= recipe.cost;
  const qualityRoll = Math.random();
  const quality = qualityRoll > 0.9 ? 'Cực phẩm' : qualityRoll > 0.55 ? 'Tốt' : 'Thường';
  const pill = LIFESPAN_PILLS.find(x => x.id === recipe.pillId);
  addInventoryItem(player, recipe.pillId, 1, { quality, name: pill?.name || recipe.pillId });
  lockInteraction(player, 'alchemy', 'luyện đan', 1200);
  return { success: true, message: `Luyện thành ${pill?.name || recipe.pillId} phẩm chất ${quality}.` };
}

function useLifespanPill(player, itemId) {
  const pill = LIFESPAN_PILLS.find(x => x.id === itemId);
  if (!pill) return { success: false, error: 'Không phải đan thọ nguyên.' };
  if (getMainRealmOrder(player) < pill.realmMinOrder) return { success: false, error: 'Cảnh giới chưa đủ để dùng đan này.' };
  const used = Number(player.lifespan.usedPills[itemId] || 0);
  if (used >= pill.maxUses) return { success: false, error: 'Đã đạt giới hạn dùng đan này.' };
  if (!removeInventoryItem(player, itemId, 1)) return { success: false, error: 'Không có đan trong túi.' };
  player.lifespan.usedPills[itemId] = used + 1;
  player.lifespan.maxYears += pill.addYears;
  return { success: true, message: `Dùng ${pill.name}, tăng ${pill.addYears} năm thọ nguyên.` };
}

function setActiveTab(player, tab) {
  const valid = ['overview', 'cultivation', 'combat', 'skills', 'alchemy', 'cave', 'inventory'];
  if (!valid.includes(tab)) return false;
  player.activeTab = tab;
  if (tab !== 'combat' && player.combatState) {
    player.combatState.status = 'Combat tạm dừng do đang ở mục khác.';
  }
  return true;
}

function tabName(tab) {
  return {
    overview: 'Tổng Quan',
    cultivation: 'Tu Luyện',
    combat: 'Combat',
    skills: 'Công Pháp',
    alchemy: 'Đan Dược',
    cave: 'Động Phủ',
    inventory: 'Túi Đồ',
  }[tab] || tab;
}

function guardActiveTab(res, player, requiredTab, label) {
  const activeTab = player.activeTab || 'overview';
  if (activeTab !== requiredTab) {
    res.status(409).json({
      success: false,
      error: `Đang ở mục ${tabName(activeTab)}. Muốn ${label}, hãy chuyển sang mục ${tabName(requiredTab)} trước.`
    });
    return false;
  }
  return true;
}

app.get('/api/meta', (req, res) => {
  res.json({ success: true, maps: MAPS, realms: REALMS, techniques: TECHNIQUES, martialSkills: MARTIAL_SKILLS, materials: MATERIALS, herbs: HERBS, recipes: RECIPES, lifespanPills: LIFESPAN_PILLS, encounters: ENCOUNTERS });
});

app.get('/api/player/:username', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  processGameTick(player);
  sendPlayer(res, players, player);
});

app.post('/api/player/:username', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  if (req.body.activeTab) setActiveTab(player, req.body.activeTab);
  if (req.body.autoFight !== undefined) player.autoFight = !!req.body.autoFight;
  if (req.body.currentZone) player.currentZone = req.body.currentZone;
  processGameTick(player);
  sendPlayer(res, players, player);
});

app.post('/api/player/:username/zone', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  if (!guardActiveTab(res, player, 'combat', 'đổi map đánh quái')) return;
  const mapId = req.body.mapId || req.body.zone;
  const map = getMapById(mapId);
  if (!map) return res.status(400).json({ success: false, error: 'Map không tồn tại.' });
  if (!getUnlockedMaps(player).some(item => item.id === map.id)) return res.status(400).json({ success: false, error: 'Map chưa mở theo cảnh giới hiện tại.' });
  player.currentZone = map.id;
  resetMonster(player);
  if (player.autoFight) spawnMonster(player);
  sendPlayer(res, players, player, { message: `Đã chuyển đến ${map.name}` });
});

app.post('/api/player/:username/cultivation/focus', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  if (!guardActiveTab(res, player, 'cultivation', 'đổi mạch tu luyện')) return;
  const type = req.body.type;
  if (!['main', 'body', 'soul'].includes(type)) return res.status(400).json({ success: false, error: 'Loại tu luyện không hợp lệ.' });
  const limit = getCultivationFocusLimit(player);
  let selected = normalizeCultivationFocus(player);
  if (selected.includes(type)) {
    if (selected.length <= 1) return res.status(400).json({ success: false, error: 'Ít nhất phải chọn 1 loại tu luyện.' });
    selected = selected.filter(item => item !== type);
  } else {
    if (selected.length >= limit) selected.shift();
    selected.push(type);
  }
  player.cultivationFocus = selected.slice(0, limit);
  actionLog(player, 'cultivation', `Đổi mạch tu luyện: ${focusText(player.cultivationFocus)}.`);
  sendPlayer(res, players, player, { message: 'Đã đổi trạng thái tu luyện.' });
});

app.post('/api/player/:username/technique/equip', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  const id = req.body.id || req.body.techniqueId;
  const cfg = TECHNIQUES.find(item => item.id === id);
  if (!cfg) return res.status(400).json({ success: false, error: 'Công pháp không tồn tại.' });
  if (!player.techniques.learned[id]) return res.status(400).json({ success: false, error: 'Chưa học công pháp này.' });
  player.techniques.equipped[cfg.system] = id;
  actionLog(player, 'technique', `Vận chuyển công pháp: ${cfg.name}.`, `Hệ: ${systemName(cfg.system)} · Phẩm cấp: ${cfg.grade || 'Không rõ'}.`);
  sendPlayer(res, players, player, { message: `Đã vận chuyển ${cfg.name}.` });
});


app.post('/api/player/:username/technique/unequip', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  const system = req.body.system || req.body.slot;
  const id = req.body.id || req.body.techniqueId;
  let slot = system;
  if (!slot && id) {
    const cfg = TECHNIQUES.find(item => item.id === id);
    slot = cfg?.system;
  }
  if (!slot || !['cultivation', 'body', 'soul'].includes(slot)) {
    return res.status(400).json({ success: false, error: 'Vị trí công pháp không hợp lệ.' });
  }
  const oldId = player.techniques.equipped[slot];
  const oldCfg = TECHNIQUES.find(item => item.id === oldId);
  player.techniques.equipped[slot] = null;
  actionLog(player, 'technique', `Tháo công pháp ${oldCfg ? oldCfg.name : systemName(slot)}.`, `Vị trí: ${systemName(slot)}.`);
  sendPlayer(res, players, player, { message: `Đã tháo công pháp ${slot === 'cultivation' ? 'tu luyện' : slot === 'body' ? 'luyện thể' : 'luyện hồn'}.` });
});

app.post('/api/player/:username/martial-skill/equip', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  const id = req.body.id || req.body.skillId || req.body.martialSkillId;
  const cfg = MARTIAL_SKILLS.find(item => item.id === id);
  if (!cfg) return res.status(400).json({ success: false, error: 'Vũ kỹ không tồn tại.' });
  if (!player.martialSkills.learned[id]) return res.status(400).json({ success: false, error: 'Chưa học vũ kỹ này.' });
  player.martialSkills.equipped.active = id;
  actionLog(player, 'martial', `Trang bị vũ kỹ: ${cfg.name}.`, `Hệ: ${systemName(cfg.system)} · Phẩm cấp: ${cfg.grade || 'Không rõ'}.`);
  sendPlayer(res, players, player, { message: `Đã trang bị ${cfg.name}.` });
});

app.post('/api/player/:username/martial-skill/unequip', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  const oldId = player.martialSkills.equipped.active;
  const oldCfg = MARTIAL_SKILLS.find(item => item.id === oldId);
  player.martialSkills.equipped.active = null;
  actionLog(player, 'martial', `Tháo vũ kỹ${oldCfg ? `: ${oldCfg.name}` : ' chiến đấu'}.`);
  sendPlayer(res, players, player, { message: 'Đã tháo vũ kỹ chiến đấu.' });
});

app.get('/api/herbs', (req, res) => res.json({ success: true, herbs: HERBS, materials: MATERIALS }));
app.get('/api/recipes', (req, res) => res.json({ success: true, recipes: RECIPES }));
app.get('/api/lifespan-pills', (req, res) => res.json({ success: true, pills: LIFESPAN_PILLS }));
app.get('/api/encounters', (req, res) => res.json({ success: true, encounters: ENCOUNTERS }));

app.post('/api/player/:username/herb/plant', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  if (!guardActiveTab(res, player, 'cave', 'gieo trồng dược liệu')) return;
  const plotIndex = Number(req.body.plotIndex || 0);
  const herbId = req.body.herbId;
  const herb = HERBS.find(x => x.id === herbId);
  const result = plantHerb(player, plotIndex, herbId);
  if (!result.success) return res.status(400).json(result);
  lockInteraction(player, 'garden', 'gieo trồng dược liệu', 800);
  actionLog(player, 'garden', `Gieo trồng ${herb?.name || herbId} tại ô dược viên ${plotIndex + 1}.`, herb ? `Tiêu hao: ${itemDisplayName(herb.seedId)} x1, ${itemDisplayName(herb.waterId)} x1, ${itemDisplayName(herb.soilId)} x1, ${herb.cost} Sơ Linh Thạch. Thời gian: ${herb.growSeconds} giây.` : '');
  sendPlayer(res, players, player, result);
});

app.post('/api/player/:username/herb/harvest', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  if (!guardActiveTab(res, player, 'cave', 'thu hoạch dược liệu')) return;
  const plotIndex = Number(req.body.plotIndex || 0);
  const beforePlot = player.herbPlots[plotIndex];
  const herb = HERBS.find(x => x.id === beforePlot?.herbId);
  const beforeCount = herb ? countItem(player, herb.id) : 0;
  const result = harvestHerb(player, plotIndex);
  if (!result.success) return res.status(400).json(result);
  const gained = herb ? Math.max(0, countItem(player, herb.id) - beforeCount) : 0;
  lockInteraction(player, 'garden', 'thu hoạch dược liệu', 800);
  actionLog(player, 'garden', `Thu hoạch ${herb?.name || 'dược liệu'} tại ô dược viên ${plotIndex + 1}.`, gained ? `Nhận: ${herb.name} x${gained}.` : '');
  sendPlayer(res, players, player, result);
});

app.post('/api/player/:username/alchemy/craft', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  if (!guardActiveTab(res, player, 'alchemy', 'luyện đan')) return;
  const recipeId = req.body.recipeId;
  const recipe = RECIPES.find(x => x.id === recipeId);
  const pill = recipe ? LIFESPAN_PILLS.find(x => x.id === recipe.pillId) : null;
  const result = craftRecipe(player, recipeId);
  if (!result.success) return res.status(400).json(result);
  actionLog(player, 'alchemy', result.message || `Luyện thành ${pill?.name || recipe?.pillId || 'đan dược'}.`, recipe ? `Công thức: ${recipe.name}. Tiêu hao: ${describeIngredients(recipe.ingredients)}. Lệ phí: ${recipe.cost || 0} Sơ Linh Thạch.` : '');
  sendPlayer(res, players, player, result);
});

app.post('/api/player/:username/pill/use', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  const itemId = req.body.itemId || req.body.pillId;
  const pill = LIFESPAN_PILLS.find(x => x.id === itemId);
  const beforeMaxYears = Number(player.lifespan?.maxYears || 0);
  const result = useLifespanPill(player, itemId);
  if (!result.success) return res.status(400).json(result);
  const added = Math.max(0, Number(player.lifespan?.maxYears || 0) - beforeMaxYears);
  actionLog(player, 'pill', `Sử dụng ${pill?.name || itemId}.`, added ? `Tăng ${added} năm thọ nguyên. Đã dùng ${Number(player.lifespan.usedPills[itemId] || 0)}/${pill?.maxUses || '?'} lần.` : result.message);
  sendPlayer(res, players, player, result);
});

app.post('/api/player/:username/use', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  if (!guardNormalAction(res, player)) return;
  const itemId = req.body.itemId;
  if (LIFESPAN_PILLS.some(x => x.id === itemId)) {
    const pill = LIFESPAN_PILLS.find(x => x.id === itemId);
    const beforeMaxYears = Number(player.lifespan?.maxYears || 0);
    const result = useLifespanPill(player, itemId);
    if (!result.success) return res.status(400).json(result);
    const added = Math.max(0, Number(player.lifespan?.maxYears || 0) - beforeMaxYears);
    actionLog(player, 'pill', `Sử dụng ${pill?.name || itemId}.`, added ? `Tăng ${added} năm thọ nguyên.` : result.message);
    return sendPlayer(res, players, player, result);
  }
  actionLog(player, 'item', `Thử sử dụng vật phẩm: ${itemDisplayName(itemId) || 'không rõ'} nhưng chưa có logic.`);
  sendPlayer(res, players, player, { message: 'Vật phẩm này chưa có logic sử dụng.' });
});

app.post('/api/player/:username/encounter/choose', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  const result = resolveEncounter(player, req.body.choiceId);
  if (!result.success) return res.status(400).json(result);
  actionLog(player, 'encounter', `Kỳ ngộ ${result.encounterName || 'Thiên Cơ'}: chọn "${result.choiceLabel || req.body.choiceId}".`, `Nhận: ${result.rewardText || 'Không rõ'}. Phản phệ: ${result.penaltyText || 'Không có'}.`);
  sendPlayer(res, players, player, result);
});

app.post('/api/player/:username/encounter/decline', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  const result = declineEncounter(player);
  if (!result.success) return res.status(400).json(result);
  actionLog(player, 'encounter', `Từ chối kỳ ngộ ${result.encounterName || 'Thiên Cơ'}.`, result.penaltyText || 'Không rõ phản phệ.');
  sendPlayer(res, players, player, result);
});

app.get('/api/player/:username/action-log', (req, res) => {
  const limit = Math.max(1, Math.min(300, Number(req.query.limit || 80)));
  res.json({ success: true, logs: serverActionLog.readPlayerLogs(req.params.username, limit) });
});

app.listen(PORT, () => {
  console.log(`Tu Tien Idle server: http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
