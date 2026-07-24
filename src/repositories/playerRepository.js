const cultivationArtRuntime = require('../runtime/cultivationArtRuntime');
const inventoryService = require('../services/inventoryService');
const { getPool, transaction } = require('../db/mysql');
const dataManager = require('../config/dataManager');

async function findById(id, connection = getPool(), lock = false) {
  const [rows] = await connection.query(
    `SELECT
       p.*,
       c.main_realm_index,
       c.main_layer,
       c.main_exp,
       c.body_realm_index,
       c.body_layer,
       c.body_exp,
       c.soul_realm_index,
       c.soul_layer,
       c.soul_exp,
       a.max_hp,
       a.max_mp,
       a.attack_value,
       a.defense_value,
       a.accuracy,
       a.dodge_rate,
       a.crit_rate,
       a.crit_damage,
       a.speed_value,
       a.armor_penetration,
       a.crit_resistance,
       a.life_steal,
       a.hp_regen,
       a.mp_regen,
       a.cultivation_rate,
       s.map_id,
       s.monster_id,
       s.monster_hp,
       s.monster_max_hp,
       s.wins,
       s.losses
     FROM players p
     JOIN player_cultivation c ON c.player_id = p.id
     JOIN player_attributes a ON a.player_id = p.id
     JOIN player_combat_state s ON s.player_id = p.id
     WHERE p.id = ?
     ${lock ? 'FOR UPDATE' : ''}`,
    [id]
  );

  const player = rows[0] || null;
  if (player) {
    player.spiritual_root_scores = parseMetadata(player.spiritual_root_scores) || {};
    player.hidden_spiritual_roots = parseMetadata(player.hidden_spiritual_roots) || [];
  }
  if (player) await cultivationArtRuntime.applyToPlayer(player, connection); return player; }

async function findByName(name) {
  const [rows] = await getPool().query(
    'SELECT id FROM players WHERE name = ? LIMIT 1',
    [name]
  );
  return rows[0] ? findById(rows[0].id) : null;
}

async function create(name, destiny) {
  return transaction(async connection => {
    const clean = String(name || '')
      .trim()
      .replace(/\s+/g, ' ');

    if (clean.length < 2 || clean.length > 24) {
      const error = new Error('Đạo hiệu phải từ 2 đến 24 ký tự.');
      error.statusCode = 400;
      throw error;
    }

    if (!destiny?.mainRootId) {
      const error = new Error('Chưa hoàn thành khảo nghiệm Thiên Mệnh.');
      error.statusCode = 400;
      throw error;
    }

    const baseSpiritualRoot = dataManager.getSpiritualRoot(destiny.mainRootId);
    const visibleRootId = destiny.visibleRootId || destiny.mainRootId;
    const spiritualRoot = dataManager.getSpiritualRoot(visibleRootId);

    if (!baseSpiritualRoot || !['kim', 'mộc', 'thủy', 'hỏa', 'thổ'].includes(baseSpiritualRoot.element)) {
      const error = new Error('Thiên Mệnh Ngũ Hành không tồn tại trong Đạo Tạng.');
      error.statusCode = 400;
      throw error;
    }
    if (!spiritualRoot) {
      const error = new Error(`Linh Căn hiển lộ ${visibleRootId} không tồn tại trong LinhCan.xml.`);
      error.statusCode = 400;
      throw error;
    }

    try {
      const starting = dataManager.getStartingPlayer() || {};
      const startingBase = starting.Base || {};
      const startingRealm = dataManager.getRealm(String(startingBase.realmId || '')) || dataManager.getRealm(0);
      const startingMap = dataManager.getMap(String(startingBase.mapId || '')) || dataManager.getAllMaps()[0] || null;
      const startingStones = Math.max(0, Number(startingBase.spiritStones || 0));

      const [result] = await connection.query(
        `INSERT INTO players(
           name,
           spiritual_root,
           base_spiritual_root,
           spiritual_root_level,
           spiritual_root_scores,
           spiritual_root_trait_scores,
           hidden_spiritual_roots,
           missing_spiritual_root,
           innate_special_root,
           is_innate_special_root
         ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clean,
          visibleRootId,
          destiny.mainRootId,
          destiny.mainRootLevel,
          JSON.stringify(destiny.scores),
          JSON.stringify(destiny.traitScores),
          JSON.stringify(destiny.hiddenRootLevels),
          destiny.missingRootId,
          destiny.innateSpecialRootId,
          destiny.innateSpecialAwakened ? 1 : 0,
          startingStones
        ]
      );

      const playerId = result.insertId;
      await connection.query(
        `INSERT INTO player_cultivation(player_id, main_realm_index, main_layer, main_exp)
         VALUES(?, ?, ?, ?)`,
        [
          playerId,
          Number(startingRealm?.index || 0),
          Math.max(1, Number(startingBase.layer || 1)),
          Math.max(0, Number(startingBase.cultivation || 0))
        ]
      );

      await connection.query(
        `INSERT INTO player_attributes(
           player_id,
           accuracy,
           dodge_rate,
           crit_rate,
           crit_damage,
           speed_value,
           armor_penetration,
           crit_resistance,
           life_steal,
           hp_regen,
           mp_regen
         ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          playerId,
          100 + spiritualRoot.bonusAccuracy,
          spiritualRoot.bonusDodgeRate,
          0.05 + spiritualRoot.bonusCritRate,
          1.50 + spiritualRoot.bonusCritDamage,
          10 + spiritualRoot.bonusSpeed,
          spiritualRoot.bonusArmorPenetration,
          spiritualRoot.bonusCritResistance,
          spiritualRoot.bonusLifeSteal,
          spiritualRoot.bonusHpRegen,
          Math.max(2, Number(spiritualRoot.bonusMpRegen || 0))
        ]
      );

      // Nhập đạo với Sinh Lực và Nội Lực đầy theo thuộc tính thực tế.
      await connection.query(
        `UPDATE players AS p
         JOIN player_attributes AS a ON a.player_id = p.id
         SET p.current_hp = GREATEST(1, FLOOR(a.max_hp * ? / 100)),
             p.current_mp = GREATEST(0, FLOOR(a.max_mp * ? / 100))
         WHERE p.id = ?`,
        [
          Math.max(0, Math.min(100, Number(startingBase.hpPercent || 100))),
          Math.max(0, Math.min(100, Number(startingBase.mpPercent || 100))),
          playerId
        ]
      );

      await connection.query(
        'INSERT INTO player_combat_state(player_id, map_id) VALUES(?, ?)',
        [playerId, Number(startingMap?.id || 1)]
      );

      await inventoryService.ensureBag(connection, playerId);
      const configuredSlots = Math.max(1, Number(startingBase.inventorySlots || dataManager.getRuleNumber('initial_slot_count', 40)));
      await connection.query(
        `UPDATE player_bags SET unlocked_slots = LEAST(maximum_slots, ?) WHERE player_id = ?`,
        [configuredSlots, playerId]
      );
      for (const item of [].concat(starting.StartingItem || [])) {
        await inventoryService.addItem(
          connection,
          playerId,
          String(item.itemId || ''),
          Math.max(1, Number(item.quantity || 1)),
          { source: 'starting_player', bound: String(item.bound || 'false') === 'true' }
        );
      }
await addLog(
        connection,
        playerId,
        'system',
        destiny.innateSpecialAwakened
          ? `Đạo hiệu ${clean} khai mở tiên lộ, thiên địa dị tượng, thức tỉnh ${spiritualRoot.name} Phàm phẩm cấp ${destiny.mainRootLevel}.`
          : `Đạo hiệu ${clean} khai mở tiên lộ, Thiên Mệnh hiển hóa ${spiritualRoot.name} Phàm phẩm cấp ${destiny.mainRootLevel}.`
      );

      return findById(playerId, connection);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        error.statusCode = 409;
        error.message = 'Đạo hiệu đã tồn tại.';
      }
      throw error;
    }
  });
}

function parseMetadata(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function inventory(playerId, connection = getPool()) {
  return inventoryService.list(connection, playerId);
}

async function logs(playerId, limit = 80, connection = getPool()) {
  const safeLimit = Math.min(200, Math.max(1, Number(limit) || 80));
  const [rows] = await connection.query(
    `SELECT category, message, created_at
     FROM player_logs
     WHERE player_id = ?
     ORDER BY id DESC
     LIMIT ${safeLimit}`,
    [playerId]
  );
  return rows;
}

async function addLog(connection, playerId, category, message) {
  await connection.query(
    `INSERT INTO player_logs(player_id, category, message)
     VALUES(?, ?, ?)`,
    [playerId, category, message]
  );
}

async function addItem(connection, playerId, item) {
  return inventoryService.addItem(
    connection,
    playerId,
    item.id || item.itemId,
    item.quantity || 1,
    item.metadata || null
  );
}

async function bagInfo(playerId, connection = getPool()) {
  return inventoryService.getBag(connection, playerId, false);
}

module.exports = {findById,
  findByName,
  create,
  inventory,
  logs,
  addLog,
  addItem, bagInfo};
