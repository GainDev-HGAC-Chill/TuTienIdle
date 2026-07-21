const { transaction } = require('../db/mysql');
const playerRepository = require('../repositories/playerRepository');
const repository = require('../repositories/cultivationArtRepository');
const artManager = require('../config/cultivationArtManager');

async function ensurePlayer(id) {
  const player = await playerRepository.findById(id);
  if (!player) { const error = new Error('Không tìm thấy đạo hữu.'); error.statusCode = 404; throw error; }
  await repository.ensureStarterArts(player, artManager);
  return player;
}
async function profile(playerId) {
  const player = await ensurePlayer(playerId);
  const owned = await repository.getOwned(playerId);
  const equipped = await repository.getEquipped(playerId);
  return { playerId: Number(playerId), rootId: player.spiritual_root, owned: owned.map(row => ({...row, art: artManager.get(row.art_id)})), equipped };
}
async function catalog(filters) { return { summary: artManager.summary(), arts: artManager.getAll(filters) }; }
async function learn(playerId, artId, grade='pham') {
  await ensurePlayer(playerId);
  const art = artManager.get(artId);
  if (!art) { const error = new Error('Công pháp không tồn tại trong Đạo Tàng.'); error.statusCode=404; throw error; }
  await repository.learn(playerId, art, grade);
  return profile(playerId);
}
async function equip(playerId, artId) {
  await ensurePlayer(playerId);
  const art = artManager.get(artId);
  if (!art) { const error = new Error('Công pháp không tồn tại trong Đạo Tàng.'); error.statusCode=404; throw error; }
  const owned = await repository.getOwned(playerId);
  if (!owned.some(row => row.art_id === art.id)) { const error = new Error('Đạo hữu chưa lĩnh ngộ công pháp này.'); error.statusCode=400; throw error; }
  await repository.equip(playerId, art);
  return profile(playerId);
}
async function unequip(playerId, category) { await ensurePlayer(playerId); await repository.unequip(playerId, category); return profile(playerId); }
module.exports = { profile, catalog, learn, equip, unequip };
