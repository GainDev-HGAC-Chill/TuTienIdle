// ============================================
// CORE - MAP SERVICE
// Lọc map theo cảnh giới hiện tại, thay toàn bộ zone test cũ.
// ============================================

const RAW_MAPS = require('../config/maps');

const WORLD_ORDER = {
  nhan_gioi: 1,
  tien_gioi: 2,
  nguyen_gioi: 3,
  dao_gioi: 4,
  chung_cuc_gioi: 5,
};

function slugify(text) {
  return String(text || 'map')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function asArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.maps)) return data.maps;
  if (Array.isArray(data?.MAPS)) return data.MAPS;
  if (Array.isArray(data?.worlds)) {
    const result = [];
    for (const world of data.worlds) {
      for (const realm of world.realms || []) {
        for (const map of realm.maps || []) {
          result.push({
            ...map,
            world: map.world || world.id,
            worldName: map.worldName || world.name,
            realmIndex: map.realmIndex ?? realm.index,
            realmName: map.realmName || realm.name,
          });
        }
      }
    }
    return result;
  }
  if (data && typeof data === 'object') return Object.values(data).flatMap(value => asArray(value));
  return [];
}

function normalizeMonster(monster, map, index) {
  if (typeof monster === 'string') monster = { name: monster };
  const realmIndex = Number(map.realmIndex || 0);
  const stageReq = Number(map.required?.stage || 1);
  const worldMul = WORLD_ORDER[map.world] || 1;
  const power = Math.max(1, worldMul * 10 + realmIndex * 3 + stageReq + index);

  return {
    id: monster.id || `${map.id}_monster_${index + 1}`,
    name: monster.name || `Quái ${index + 1}`,
    description: monster.description || monster.desc || '',
    hp: Number(monster.hp || 45 + power * 8),
    atk: Number(monster.atk || 5 + power * 2),
    def: Number(monster.def || 1 + Math.floor(power / 2)),
    tuViReward: Number(monster.tuViReward || monster.exp || 6 + power * 2),
    stoneReward: Number(monster.stoneReward || monster.gold || Math.max(1, Math.floor(power / 4))),
    drop: monster.drop || [],
  };
}

function normalizeMap(map, index) {
  const id = map.id || slugify(map.name || `map_${index + 1}`);
  const world = map.world || map.worldId || 'nhan_gioi';
  const realmIndex = Number(map.realmIndex ?? map.realm ?? 0);
  const required = map.required || {
    world,
    realmIndex,
    stage: map.stageRequired || map.requiredStage || 1,
  };

  const normalized = {
    ...map,
    id,
    name: map.name || id,
    world,
    realmIndex,
    required: {
      world: required.world || world,
      realmIndex: Number(required.realmIndex ?? realmIndex),
      stage: Number(required.stage ?? 1),
    },
  };

  const monsters = map.monsters || map.mobs || [];
  normalized.monsters = monsters.map((monster, i) => normalizeMonster(monster, normalized, i));

  if (map.boss && typeof map.boss === 'object') {
    normalized.boss = normalizeMonster(map.boss, normalized, 99);
    normalized.boss.name = map.boss.name || normalized.boss.name;
  }

  return normalized;
}

function assignSequentialRequirements(maps) {
  const counters = {};

  return maps.map((map) => {
    const world = map.world || 'nhan_gioi';
    const indexInWorld = counters[world] || 0;
    counters[world] = indexInWorld + 1;

    // Mỗi cảnh giới có 2 map:
    // map 1 mở tầng 1, map 2 mở tầng 5.
    // Vẫn cho người chơi thấy map cảnh giới thấp hơn.
    const inferredRealmIndex = Math.floor(indexInWorld / 2);
    const inferredStage = indexInWorld % 2 === 0 ? 1 : 5;

    return {
      ...map,
      realmIndex: inferredRealmIndex,
      required: {
        world,
        realmIndex: inferredRealmIndex,
        stage: inferredStage,
      },
    };
  });
}

const MAPS = assignSequentialRequirements(asArray(RAW_MAPS).map(normalizeMap));

function getDefaultMapId() {
  return MAPS[0]?.id || null;
}

function getAllMaps() {
  return MAPS;
}

function getMapById(id) {
  return MAPS.find(map => map.id === id) || null;
}

function isMapUnlocked(player, map) {
  if (!player || !map) return false;

  const cult = player.cultivation || {};
  const req = map.required || {};

  const playerWorld = cult.world || 'nhan_gioi';
  const reqWorld = req.world || map.world || 'nhan_gioi';
  const playerWorldOrder = WORLD_ORDER[playerWorld] || 0;
  const reqWorldOrder = WORLD_ORDER[reqWorld] || 0;

  // Sang giới cao hơn thì vẫn thấy toàn bộ map giới thấp hơn.
  if (playerWorldOrder > reqWorldOrder) return true;
  if (playerWorldOrder < reqWorldOrder) return false;

  const playerRealm = Number(cult.realmIndex || 0);
  const playerStage = Number(cult.stage || 1);
  const reqRealm = Number(req.realmIndex || 0);
  const reqStage = Number(req.stage || 1);

  // Cùng giới: thấy map cảnh giới thấp hơn.
  if (playerRealm > reqRealm) return true;
  if (playerRealm < reqRealm) return false;

  // Cùng cảnh giới: map 1 tầng 1, map 2 tầng 5.
  return playerStage >= reqStage;
}

function getUnlockedMaps(player) {
  return MAPS.filter(map => isMapUnlocked(player, map));
}

function ensureCurrentMap(player) {
  const unlocked = getUnlockedMaps(player);
  if (!unlocked.length) {
    player.currentZone = null;
    return null;
  }

  const current = getMapById(player.currentZone);
  if (!current || !isMapUnlocked(player, current)) {
    player.currentZone = unlocked[0].id;
    if (player.combatState) {
      player.combatState.currentMonster = null;
      player.combatState.monsterHp = 0;
      player.combatState.monsterMaxHp = 0;
      player.combatState.fightProgress = 0;
    }
    return unlocked[0];
  }

  return current;
}

function getRandomMonster(map) {
  if (!map || !map.monsters || !map.monsters.length) return null;
  return map.monsters[Math.floor(Math.random() * map.monsters.length)];
}

function getPlayerMapState(player) {
  const currentMap = ensureCurrentMap(player);
  return {
    currentMap,
    unlockedMaps: getUnlockedMaps(player),
  };
}

function getZonesForMeta() {
  return Object.fromEntries(MAPS.map(map => [map.id, {
    id: map.id,
    name: map.name,
    monster: map.monsters?.[0]?.name || map.boss?.name || 'Không rõ',
    world: map.world,
    realmIndex: map.realmIndex,
    required: map.required,
  }]));
}

// Giữ hàm cũ để server cũ không chết, nhưng combat mới dùng combatService.
function fightMonster(player) {
  const map = ensureCurrentMap(player);
  const monster = getRandomMonster(map);
  if (!monster) return { killed: false, monster: { name: 'Không rõ' } };
  player.cultivation.tuVi += monster.tuViReward || 0;
  player.stats.totalKills = (player.stats.totalKills || 0) + 1;
  return { killed: true, monster };
}

module.exports = {
  getDefaultMapId,
  getAllMaps,
  getMapById,
  isMapUnlocked,
  getUnlockedMaps,
  ensureCurrentMap,
  getRandomMonster,
  getPlayerMapState,
  getZonesForMeta,
  fightMonster,
};
