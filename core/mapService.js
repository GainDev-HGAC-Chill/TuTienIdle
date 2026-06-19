// ============================================
// CORE - MAP SERVICE
// Dùng config/maps.js, tự fallback nếu config lỗi.
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
    description: 'Một ngôi làng nhỏ bị sương mù bao phủ quanh năm.',
    monsters: ['Lang Mồ Côi', 'Cú Rít', 'Hồn Ma Đèn'],
    boss: { name: 'Vương Lão Bà Sương' },
    rewards: ['Sương Châu', 'Linh thạch cấp 1'],
  },
  {
    id: 'rung_go_khoc',
    name: 'Rừng Gỗ Khóc',
    world: 'nhan_gioi',
    realmIndex: 0,
    description: 'Khu rừng nơi cổ thụ phát ra tiếng khóc than.',
    monsters: ['Khỉ Nhăn', 'Chim Than', 'Nhện Ve'],
    boss: { name: 'Mộc Thần Khóc' },
    rewards: ['Gỗ Khóc', 'Linh thạch cấp 1'],
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

function getWorldName(worldId) {
  const world = REALM_CONFIG.worlds?.find(w => w.id === worldId);
  return world?.name || world?.displayName || worldId || '-';
}

function getRealmName(worldId, realmIndex) {
  const world = REALM_CONFIG.worlds?.find(w => w.id === worldId);
  const realm = world?.realms?.[Number(realmIndex || 0)];
  return realm?.name || realm?.displayName || realm?.id || '-';
}

function worldOrder(worldId) {
  const world = REALM_CONFIG.worlds?.find(w => w.id === worldId);
  return world?.order || 1;
}

function isMapLike(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj)
    && (obj.name || obj.mapName || obj.title)
    && (obj.monsters || obj.monster || obj.mobs || obj.boss || obj.rewards || obj.reward);
}

function normalizeMonster(monster, index, map) {
  if (typeof monster === 'string') {
    return { id: `${map.id}_mob_${index + 1}`, name: monster, description: '' };
  }
  return {
    id: monster.id || `${map.id}_mob_${index + 1}`,
    name: monster.name || monster.title || `Quái ${index + 1}`,
    description: monster.description || monster.desc || '',
    hp: monster.hp,
    atk: monster.atk,
    def: monster.def,
    tuViReward: monster.tuViReward,
    stoneReward: monster.stoneReward,
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

function normalizeMap(raw, ctx = {}, index = 0) {
  const world = raw.world || raw.worldId || ctx.world || 'nhan_gioi';
  const realmIndex = Number(raw.realmIndex ?? raw.realmOrder ?? ctx.realmIndex ?? 0);
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
    realmIndex: input.realmIndex ?? input.realmOrder ?? ctx.realmIndex,
  };

  if (isMapLike(input)) out.push(normalizeMap(input, nextCtx, out.length));

  for (const key of ['maps', 'zones', 'areas', 'children', 'items', 'realms', 'worlds']) {
    if (input[key]) flattenMaps(input[key], nextCtx, out);
  }

  for (const [key, value] of Object.entries(input)) {
    if (['maps', 'zones', 'areas', 'children', 'items', 'realms', 'worlds'].includes(key)) continue;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenMaps({ id: value.id || key, ...value }, nextCtx, out);
    }
  }
  return out;
}

function getAllMaps() {
  const maps = flattenMaps(MAP_CONFIG);
  const source = maps.length ? maps : FALLBACK_MAPS.map((m, i) => normalizeMap(m, {}, i));
  const seen = new Set();
  return source.filter(map => {
    if (seen.has(map.id)) return false;
    seen.add(map.id);
    return true;
  });
}

function getMapById(mapId) {
  return getAllMaps().find(m => m.id === mapId) || null;
}

function getDefaultMapId() {
  return getAllMaps()[0]?.id || 'ap_suong_mu';
}

function isMapUnlocked(player, map) {
  if (!map) return false;
  const cult = player.cultivation || {};
  const req = map.required || {};
  const reqWorld = req.world || map.world || 'nhan_gioi';
  const reqRealmIndex = Number(req.realmIndex ?? map.realmIndex ?? 0);
  const reqStage = Number(req.stage ?? 1);
  if ((cult.world || 'nhan_gioi') !== reqWorld) return false;
  if (Number(cult.realmIndex || 0) < reqRealmIndex) return false;
  if (Number(cult.realmIndex || 0) === reqRealmIndex) {
    return Number(cult.stage || 1) >= reqStage;
  }
  return true;
}

function getUnlockedMaps(player) {
  return getAllMaps().filter(map => isMapUnlocked(player, map));
}

function ensureCurrentMap(player) {
  const unlocked = getUnlockedMaps(player);
  const fallback = unlocked[0] || getAllMaps()[0];
  if (!player.currentZone || !getMapById(player.currentZone) || !isMapUnlocked(player, getMapById(player.currentZone))) {
    player.currentZone = fallback?.id || getDefaultMapId();
  }
  return getMapById(player.currentZone) || fallback;
}

function getRandomMonster(map) {
  const list = map?.monsters || [];
  if (!list.length) return { id: 'unknown', name: 'Không rõ' };
  return list[Math.floor(Math.random() * list.length)];
}

function getScale(map) {
  const w = Math.max(1, worldOrder(map?.world));
  const r = Number(map?.realmIndex || 0) + 1;
  return Math.max(1, Math.floor(Math.pow(2.2, w - 1) * r));
}

function buildMonsterStats(player, map, monster) {
  const scale = getScale(map);
  return {
    id: monster.id,
    name: monster.name,
    hp: Number(monster.hp || 40 * scale),
    atk: Number(monster.atk || 5 * scale),
    def: Number(monster.def || 2 * scale),
    tuViReward: Number(monster.tuViReward || 10 * scale),
    stoneReward: Number(monster.stoneReward || Math.max(1, scale)),
  };
}

function fightMonster(player) {
  const map = ensureCurrentMap(player);
  const monster = buildMonsterStats(player, map, getRandomMonster(map));
  const atk = (player.combat?.atk || 1) + (player.permanentBonuses?.atk || 0);
  const def = (player.combat?.def || 0) + (player.permanentBonuses?.def || 0);
  const damage = Math.max(1, atk - monster.def / 2);
  const killChance = Math.min(0.95, damage / (monster.hp + def));
  const killed = Math.random() < killChance || damage >= monster.hp;
  if (killed) {
    player.stats.totalKills += 1;
    player.cultivation.tuVi += monster.tuViReward;
    player.stats.totalTuVi += monster.tuViReward;
  }
  return { killed, map, monster };
}

function publicMap(map) {
  return {
    id: map.id,
    name: map.name,
    world: map.world,
    worldName: map.worldName,
    realmIndex: map.realmIndex,
    realmName: map.realmName,
    description: map.description,
    monster: map.monsters?.[0]?.name || 'Không rõ',
    monsters: map.monsters || [],
    boss: map.boss,
    rewards: map.rewards,
  };
}

function getZonesForMeta() {
  const obj = {};
  for (const map of getAllMaps()) obj[map.id] = publicMap(map);
  return obj;
}

function getPlayerMapState(player) {
  const currentMap = ensureCurrentMap(player);
  return {
    currentMap: publicMap(currentMap),
    unlockedMaps: getUnlockedMaps(player).map(publicMap),
  };
}

module.exports = {
  getAllMaps,
  getMapById,
  getDefaultMapId,
  getUnlockedMaps,
  ensureCurrentMap,
  getRandomMonster,
  buildMonsterStats,
  fightMonster,
  getZonesForMeta,
  getPlayerMapState,
};
