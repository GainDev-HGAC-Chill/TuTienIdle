// ============================================
// CORE - MAP SERVICE
// Quản lý map/quái theo giới/cảnh giới.
// ============================================

const MAPS = require('../config/maps');
const REALM_CONFIG = require('../config/realms');

function getWorldOrder(worldId) {
  const world = REALM_CONFIG.worlds.find(w => w.id === worldId);
  return world ? world.order : 1;
}

function getRealmOrder(worldId, realmId) {
  const world = REALM_CONFIG.worlds.find(w => w.id === worldId);
  if (!world) return 0;
  const index = world.realms.findIndex(r => r.id === realmId);
  return index >= 0 ? index + 1 : 0;
}

function getMapPower(map) {
  const worldOrder = getWorldOrder(map.world);
  const realmOrder = getRealmOrder(map.world, map.realm) || 1;

  // Scale tạm để test idle:
  // Nhân Giới đầu game nhẹ, càng lên giới/cảnh giới càng mạnh.
  return Math.max(1, (worldOrder - 1) * 10 + realmOrder);
}

function enrichMap(map) {
  if (!map) return null;

  const power = getMapPower(map);
  const hp = 40 + power * 35;
  const atk = 4 + power * 5;
  const def = 2 + power * 3;
  const tuViReward = 8 + power * 12;

  return {
    ...map,
    power,
    recommendedPower: power,
    monsterStats: {
      hp,
      atk,
      def,
      tuViReward,
    },
    bossStats: {
      hp: Math.floor(hp * 8),
      atk: Math.floor(atk * 3),
      def: Math.floor(def * 3),
      tuViReward: Math.floor(tuViReward * 20),
    },
  };
}

function getAllMaps() {
  return MAPS.map(enrichMap);
}

function getMapById(mapId) {
  return enrichMap(MAPS.find(m => m.id === mapId));
}

function getMapsByRealm(worldId, realmId) {
  return MAPS
    .filter(m => m.world === worldId && m.realm === realmId)
    .map(enrichMap);
}

function getCurrentRealmMaps(player) {
  const c = player.cultivation || {};
  const worldId = c.world || 'nhan_gioi';

  const world = REALM_CONFIG.worlds.find(w => w.id === worldId);
  const realm = world?.realms?.[c.realmIndex || 0];
  const realmId = realm?.id;

  return getMapsByRealm(worldId, realmId);
}

function getDefaultMapForPlayer(player) {
  const current = getCurrentRealmMaps(player);
  if (current.length > 0) return current[0];

  // Fallback đầu game.
  return getMapById('ap_suong_mu') || enrichMap(MAPS[0]);
}

function isMapUnlocked(player, mapId) {
  const map = MAPS.find(m => m.id === mapId);
  if (!map) return { ok: false, reason: 'Map không tồn tại.' };

  const c = player.cultivation || {};
  const playerWorldOrder = getWorldOrder(c.world || 'nhan_gioi');
  const mapWorldOrder = getWorldOrder(map.world);

  if (playerWorldOrder < mapWorldOrder) {
    return {
      ok: false,
      reason: 'Chưa mở giới này.',
      map,
    };
  }

  if ((c.world || 'nhan_gioi') === map.world) {
    const playerRealmOrder = (c.realmIndex || 0) + 1;
    const mapRealmOrder = getRealmOrder(map.world, map.realm);

    if (playerRealmOrder < mapRealmOrder) {
      return {
        ok: false,
        reason: 'Chưa đạt cảnh giới yêu cầu.',
        map,
      };
    }
  }

  return { ok: true, map: enrichMap(map) };
}

function normalizeOldZone(zoneId) {
  const legacy = {
    rung_thap: 'ap_suong_mu',
    rung_trung: 'rung_go_khoc',
    dong_ma: 'dong_ngan_ha',
    'rừng_thấp': 'ap_suong_mu',
    'rừng_trung': 'rung_go_khoc',
    'động_ma': 'dong_ngan_ha',
  };

  return legacy[zoneId] || zoneId;
}

function ensureValidCurrentMap(player) {
  player.currentZone = normalizeOldZone(player.currentZone);

  const current = getMapById(player.currentZone);
  if (!current) {
    const fallback = getDefaultMapForPlayer(player);
    player.currentZone = fallback.id;
    return fallback;
  }

  const unlock = isMapUnlocked(player, current.id);
  if (!unlock.ok) {
    const fallback = getDefaultMapForPlayer(player);
    player.currentZone = fallback.id;
    return fallback;
  }

  return unlock.map;
}

function getRandomMonster(map) {
  if (!map || !map.monsters || map.monsters.length === 0) return null;
  return map.monsters[Math.floor(Math.random() * map.monsters.length)];
}

function getCombatZone(player) {
  const map = ensureValidCurrentMap(player);
  const monster = getRandomMonster(map);

  return {
    id: map.id,
    name: map.name,
    world: map.world,
    realm: map.realm,
    monster: monster?.name || 'Yêu Thú',
    monsterInfo: monster,
    boss: map.boss,
    hp: map.monsterStats.hp,
    atk: map.monsterStats.atk,
    def: map.monsterStats.def,
    tuViReward: map.monsterStats.tuViReward,
    map,
  };
}

module.exports = {
  getAllMaps,
  getMapById,
  getMapsByRealm,
  getCurrentRealmMaps,
  getDefaultMapForPlayer,
  isMapUnlocked,
  ensureValidCurrentMap,
  normalizeOldZone,
  getCombatZone,
};
