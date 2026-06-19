// ============================================
// CORE - MAP SERVICE
// Map theo cảnh giới. Chỉ mở map bằng hoặc thấp hơn cảnh giới hiện tại.
// ============================================
let MAP_CONFIG = [];
try {
  MAP_CONFIG = require('../config/maps');
} catch (err) {
  console.warn('[mapService] Không đọc được config/maps.js:', err.message);
}

const REALM_CONFIG = require('../config/realms');

const FALLBACK_MAPS = [
  {
    id: 'ap_suong_mu',
    name: 'Ấp Sương Mù',
    world: 'nhan_gioi',
    realmIndex: 0,
    description: 'Một ngôi làng nhỏ bị sương mù bao phủ quanh năm, người dân ở đây đã bị yêu ma chiếm giữ.',
    monsters: ['Lang Mồ Côi', 'Cú Rít', 'Hồn Ma Đèn'],
    boss: { name: 'Vương Lão Bà Sương' },
    rewards: ['Sương Châu', 'Sơ Linh Thạch'],
  },
  {
    id: 'vuong_lao_ba_suong',
    name: 'Vương Lão Bà Sương',
    world: 'nhan_gioi',
    realmIndex: 0,
    description: 'Sào huyệt yêu bà trong màn sương lạnh.',
    monsters: ['Sương Linh', 'Âm Hồn Sương', 'Yêu Bà Sương'],
    boss: { name: 'Vương Lão Bà Sương' },
    rewards: ['Sương Châu', 'Sơ Linh Thạch'],
  },
  {
    id: 'moc_than_khoc',
    name: 'Mộc Thần Khóc',
    world: 'nhan_gioi',
    realmIndex: 0,
    description: 'Khu rừng nơi cổ thụ phát ra tiếng khóc than.',
    monsters: ['Khỉ Nhăn', 'Chim Than', 'Nhện Ve'],
    boss: { name: 'Mộc Thần Khóc' },
    rewards: ['Gỗ Khóc', 'Sơ Linh Thạch'],
  },
];

function slug(input) {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getWorld(worldId) {
  return REALM_CONFIG.worlds?.find(w => w.id === worldId) || null;
}

function getWorldName(worldId) {
  const world = getWorld(worldId);
  return world?.name || world?.displayName || worldId || '-';
}

function getRealmName(worldId, realmIndex) {
  const world = getWorld(worldId);
  const realm = world?.realms?.[Number(realmIndex || 0)];
  return realm?.name || realm?.displayName || realm?.id || '-';
}

function worldOrder(worldId) {
  return getWorld(worldId)?.order || 1;
}

function inferRealmIndex(worldId, raw = {}, ctx = {}) {
  const direct = raw.realmIndex ?? raw.realmOrder ?? raw.required?.realmIndex ?? ctx.realmIndex;
  if (direct !== undefined && direct !== null && direct !== '') return Number(direct);
  const name = raw.realmName || raw.realmTitle || raw.realm || raw.realmId || ctx.realmName || ctx.realm;
  if (!name) return 0;
  const world = getWorld(worldId);
  const normalized = slug(name);
  const idx = world?.realms?.findIndex(realm => [realm.id, realm.name, realm.displayName].some(v => slug(v) === normalized));
  return idx >= 0 ? idx : 0;
}

function normalizeMonster(monster, index, map) {
  if (typeof monster === 'string') {
    return {
      id: `${map.id}_mob_${index + 1}`,
      name: monster,
      description: '',
    };
  }
  const raw = monster || {};
  return {
    id: raw.id || `${map.id}_mob_${index + 1}`,
    name: raw.name || raw.title || `Quái ${index + 1}`,
    description: raw.description || raw.desc || '',
    hp: raw.hp,
    atk: raw.atk,
    def: raw.def,
    tuViReward: raw.tuViReward,
    stoneReward: raw.stoneReward,
  };
}

function normalizeBoss(boss) {
  if (!boss) return null;
  if (typeof boss === 'string') return { id: slug(boss), name: boss, skills: [] };
  return {
    id: boss.id || slug(boss.name || boss.title || 'boss'),
    name: boss.name || boss.title || 'Boss',
    skills: boss.skills || boss.skill || [],
  };
}

function isMapLike(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj)
    && (obj.name || obj.mapName || obj.title)
    && (obj.monsters || obj.monster || obj.mobs || obj.boss || obj.rewards || obj.reward);
}

function normalizeMap(raw, ctx = {}, index = 0) {
  const world = raw.world || raw.worldId || ctx.world || 'nhan_gioi';
  const realmIndex = inferRealmIndex(world, raw, ctx);
  const name = raw.name || raw.mapName || raw.title || `Map ${index + 1}`;
  const id = raw.id || raw.mapId || slug(`${world}_${realmIndex}_${name}`);
  const map = {
    id,
    name,
    world,
    worldName: raw.worldName || ctx.worldName || getWorldName(world),
    realm: raw.realm || raw.realmId || ctx.realm || null,
    realmIndex,
    realmName: raw.realmName || ctx.realmName || getRealmName(world, realmIndex),
    description: raw.description || raw.desc || '',
    required: raw.required || { world, realmIndex, stage: 1 },
    rewards: raw.rewards || raw.reward || [],
    boss: normalizeBoss(raw.boss),
  };
  const monsters = raw.monsters || raw.monsterList || raw.mobs || raw.monster || [];
  map.monsters = Array.isArray(monsters)
    ? monsters.map((mob, i) => normalizeMonster(mob, i, map))
    : [normalizeMonster(monsters, 0, map)];
  return map;
}

function flattenMaps(input, ctx = {}, out = []) {
  if (!input) return out;
  if (Array.isArray(input)) {
    for (const item of input) flattenMaps(item, ctx, out);
    return out;
  }
  if (typeof input !== 'object') return out;

  const nextCtx = {
    ...ctx,
    world: input.world || input.worldId || ctx.world,
    worldName: input.worldName || ctx.worldName,
    realm: input.realm || input.realmId || ctx.realm,
    realmName: input.realmName || input.realmTitle || ctx.realmName,
    realmIndex: inferRealmIndex(input.world || input.worldId || ctx.world || 'nhan_gioi', input, ctx),
  };

  if (isMapLike(input)) out.push(normalizeMap(input, nextCtx, out.length));

  for (const key of ['maps', 'zones', 'areas', 'children', 'items', 'realms', 'worlds']) {
    if (input[key]) flattenMaps(input[key], nextCtx, out);
  }

  return out;
}

function uniqueMaps(maps) {
  const seen = new Set();
  const out = [];
  for (const map of maps) {
    if (!map || seen.has(map.id)) continue;
    seen.add(map.id);
    out.push(map);
  }
  return out;
}

function getAllMaps() {
  const maps = uniqueMaps(flattenMaps(MAP_CONFIG));
  return maps.length ? maps : FALLBACK_MAPS.map((m, i) => normalizeMap(m, {}, i));
}

function getMapById(id) {
  return getAllMaps().find(map => map.id === id) || null;
}

function getDefaultMapId() {
  return getAllMaps()[0]?.id || 'ap_suong_mu';
}

function getPlayerWorld(player) {
  return player?.cultivation?.world || 'nhan_gioi';
}

function getPlayerRealmIndex(player) {
  return Number(player?.cultivation?.realmIndex || 0);
}

function isMapUnlocked(player, map) {
  const playerWorld = getPlayerWorld(player);
  const pWorldOrder = worldOrder(playerWorld);
  const mWorldOrder = worldOrder(map.world);
  if (mWorldOrder < pWorldOrder) return true;
  if (mWorldOrder > pWorldOrder) return false;
  return Number(map.realmIndex || 0) <= getPlayerRealmIndex(player);
}

function getUnlockedMaps(player) {
  return getAllMaps().filter(map => isMapUnlocked(player, map));
}

function ensureCurrentMap(player) {
  const unlocked = getUnlockedMaps(player);
  const current = getMapById(player.currentZone);
  if (!current || !unlocked.some(map => map.id === current.id)) {
    player.currentZone = unlocked[0]?.id || getDefaultMapId();
  }
  return getMapById(player.currentZone) || unlocked[0] || getAllMaps()[0];
}

function getPlayerMapState(player) {
  const currentMap = ensureCurrentMap(player);
  return {
    currentMap,
    unlockedMaps: getUnlockedMaps(player),
  };
}

function getRandomMonster(map) {
  const monsters = Array.isArray(map?.monsters) && map.monsters.length ? map.monsters : [{ id: 'unknown', name: 'Yêu Thú Vô Danh' }];
  return monsters[Math.floor(Math.random() * monsters.length)];
}

function buildMonsterStats(player, map, baseMonster) {
  const realmIndex = Number(map?.realmIndex || 0);
  const stage = Number(player?.cultivation?.stage || 1);
  const scale = 1 + realmIndex * 0.65 + Math.max(0, stage - 1) * 0.08;
  const raw = baseMonster || getRandomMonster(map);
  return {
    id: raw.id || slug(raw.name || 'monster'),
    name: raw.name || 'Yêu Thú Vô Danh',
    description: raw.description || '',
    hp: Math.floor(Number(raw.hp || 35) * scale),
    atk: Math.floor(Number(raw.atk || 6) * scale),
    def: Math.floor(Number(raw.def || 2) * scale),
    tuViReward: Math.floor(Number(raw.tuViReward || 8) * scale),
    stoneReward: Math.max(1, Math.floor(Number(raw.stoneReward || 2) * scale)),
    mapId: map?.id,
  };
}

function fightMonster(player) {
  const map = ensureCurrentMap(player);
  const monster = buildMonsterStats(player, map, getRandomMonster(map));
  const damage = Math.max(1, Math.floor((player.combat?.atk || 10) - monster.def * 0.4));
  const killed = damage >= monster.hp;
  return { killed, monster, damage };
}

function getZonesForMeta() {
  return getAllMaps().map(map => ({
    id: map.id,
    name: map.name,
    world: map.world,
    worldName: map.worldName,
    realmIndex: map.realmIndex,
    realmName: map.realmName,
    description: map.description,
  }));
}

module.exports = {
  getAllMaps,
  getMapById,
  getDefaultMapId,
  getZonesForMeta,
  getUnlockedMaps,
  getPlayerMapState,
  ensureCurrentMap,
  getRandomMonster,
  buildMonsterStats,
  fightMonster,
};
