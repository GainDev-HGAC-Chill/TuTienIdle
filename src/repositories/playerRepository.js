const { query, transaction } = require('../db/mysql');

async function findById(playerId) {
  const rows = await query(`SELECT p.*, c.main_realm_id,c.main_layer,c.main_exp,c.body_realm_id,c.body_layer,c.body_exp,c.soul_realm_id,c.soul_layer,c.soul_exp FROM players p JOIN player_cultivation c ON c.player_id=p.id WHERE p.id=? LIMIT 1`, [playerId]);
  return rows[0] || null;
}

async function findByName(name) {
  const rows = await query(`SELECT p.*, c.main_realm_id,c.main_layer,c.main_exp,c.body_realm_id,c.body_layer,c.body_exp,c.soul_realm_id,c.soul_layer,c.soul_exp FROM players p JOIN player_cultivation c ON c.player_id=p.id WHERE p.name=? LIMIT 1`, [name]);
  return rows[0] || null;
}

async function listInventory(playerId) {
  return query('SELECT id,item_id,quantity,bind_type,slot_index,metadata FROM player_inventory WHERE player_id=? ORDER BY slot_index,id', [playerId]);
}

async function createPlayer(name) {
  return transaction(async conn => {
    const [existing] = await conn.execute('SELECT id FROM players WHERE name=? LIMIT 1', [name]);
    if (existing.length) {
      const error = new Error('Đạo hiệu đã tồn tại.');
      error.statusCode = 409;
      error.code = 'PLAYER_ALREADY_EXISTS';
      throw error;
    }
    const [result] = await conn.execute(`INSERT INTO players(name,world_id,spiritual_root_id,spirit_stones,current_hp,current_mp,current_activity) VALUES(?,?,?,?,?,?,?)`, [name, 'nhan_gioi', 'linh_can_pham', 0, 100, 0, 'idle']);
    const id = result.insertId;
    await conn.execute(`INSERT INTO player_cultivation(player_id,main_realm_id,main_layer,main_exp,body_realm_id,body_layer,body_exp,soul_realm_id,soul_layer,soul_exp) VALUES(?,?,?,?,?,?,?,?,?,?)`, [id, 'realm_luyen_khi', 1, 0, 'body_pham_the', 1, 0, 'soul_pham_hon', 1, 0]);
    await conn.execute('INSERT INTO player_attributes(player_id) VALUES(?)', [id]);
    await conn.execute('INSERT INTO player_activity(player_id) VALUES(?)', [id]);
    await conn.execute('INSERT INTO player_combat_state(player_id,player_current_hp) VALUES(?,?)', [id, 100]);
    await conn.execute('INSERT INTO player_map_unlocks(player_id,map_id) VALUES(?,?)', [id, 'map_ngoai_mon_son_lam']);
    await conn.execute('INSERT INTO player_cave(player_id) VALUES(?)', [id]);
    return id;
  });
}

async function addLog(playerId, category, action, title, message, detail = null) {
  await query('INSERT INTO player_logs(player_id,category,action,title,message,detail_data) VALUES(?,?,?,?,?,?)', [playerId, category, action, title, message, detail ? JSON.stringify(detail) : null]);
}

module.exports = { findById, findByName, listInventory, createPlayer, addLog };
