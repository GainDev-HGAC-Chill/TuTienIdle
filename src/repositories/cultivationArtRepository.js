const { getPool, transaction } = require('../db/mysql');

async function getOwned(playerId, connection = getPool()) {
  const [rows] = await connection.query(`SELECT art_id, category, grade, art_level, art_exp, learned_at FROM player_cultivation_arts WHERE player_id=? ORDER BY category, art_id`, [playerId]);
  return rows;
}
async function getEquipped(playerId, connection = getPool()) {
  const [rows] = await connection.query(`SELECT category, art_id FROM player_equipped_arts WHERE player_id=?`, [playerId]);
  return rows;
}
async function learn(playerId, art, grade = 'pham', connection = getPool()) {
  await connection.query(`INSERT INTO player_cultivation_arts(player_id,art_id,category,grade) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE grade=grade`, [playerId, art.id, art.category, grade]);
}
async function equip(playerId, art, connection = getPool()) {
  await connection.query(`INSERT INTO player_equipped_arts(player_id,category,art_id) VALUES(?,?,?) ON DUPLICATE KEY UPDATE art_id=VALUES(art_id), equipped_at=CURRENT_TIMESTAMP`, [playerId, art.category, art.id]);
}
async function unequip(playerId, category, connection = getPool()) {
  await connection.query(`DELETE FROM player_equipped_arts WHERE player_id=? AND category=?`, [playerId, category]);
}
async function ensureStarterArts(player, artManager) {
  const existing = await getOwned(player.id);
  if (existing.length) return;
  const rootArts = artManager.getAll({rootId: player.spiritual_root});
  await transaction(async connection => {
    for (const category of ['tam_phap','chien_phap','luyen_the','than_thong']) {
      const art = rootArts.find(row => row.category === category);
      if (!art) continue;
      await learn(player.id, art, 'pham', connection);
      await equip(player.id, art, connection);
    }
  });
}
module.exports = { getOwned, getEquipped, learn, equip, unequip, ensureStarterArts };
