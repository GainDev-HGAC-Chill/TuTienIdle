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

  return rows[0] || null;
}

async function findByName(name) {
  const [rows] = await getPool().query(
    'SELECT id FROM players WHERE name = ? LIMIT 1',
    [name]
  );

  return rows[0] ? findById(rows[0].id) : null;
}

async function create(name) {
  return transaction(async connection => {
    const clean = String(name || '')
      .trim()
      .replace(/\s+/g, ' ');

    if (clean.length < 2 || clean.length > 24) {
      const error = new Error('Đạo hiệu phải từ 2 đến 24 ký tự.');
      error.statusCode = 400;
      throw error;
    }

    const spiritualRoot = dataManager.getRandomSpiritualRoot();

    try {
      const [result] = await connection.query(
        `INSERT INTO players(name, spiritual_root)
         VALUES(?, ?)`,
        [clean, spiritualRoot.id]
      );

      const playerId = result.insertId;

      await connection.query(
        'INSERT INTO player_cultivation(player_id) VALUES(?)',
        [playerId]
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
          spiritualRoot.bonusMpRegen
        ]
      );

      await connection.query(
        'INSERT INTO player_combat_state(player_id) VALUES(?)',
        [playerId]
      );

      await connection.query(
        `INSERT INTO player_inventory(
           player_id,
           item_id,
           item_name,
           item_type,
           quantity
         ) VALUES(?, ?, ?, ?, ?)`,
        [playerId, 'linh_thach', 'Linh Thạch', 'currency', 100]
      );

      await addLog(
        connection,
        playerId,
        'system',
        `Đạo hiệu ${clean} khai mở tiên lộ, thức tỉnh ${spiritualRoot.name}.`
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
  const [rows] = await connection.query(
    `SELECT item_id, item_name, item_type, quantity, metadata
     FROM player_inventory
     WHERE player_id = ?
       AND quantity > 0
     ORDER BY id`,
    [playerId]
  );

  return rows.map(row => ({
    ...row,
    metadata: parseMetadata(row.metadata)
  }));
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
  await connection.query(
    `INSERT INTO player_inventory(
       player_id,
       item_id,
       item_name,
       item_type,
       quantity,
       metadata
     ) VALUES(?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       quantity = quantity + VALUES(quantity),
       item_name = VALUES(item_name),
       item_type = VALUES(item_type),
       metadata = VALUES(metadata)`,
    [
      playerId,
      item.id,
      item.name,
      item.type,
      item.quantity || 1,
      item.metadata ? JSON.stringify(item.metadata) : null
    ]
  );
}

module.exports = {
  findById,
  findByName,
  create,
  inventory,
  logs,
  addLog,
  addItem
};
