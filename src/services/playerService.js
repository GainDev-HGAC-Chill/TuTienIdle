const repo = require('../repositories/playerRepository');
const data = require('../config/dataManager');

async function hydratePlayer(player) {
  if (!player) return null;
  const realm = data.getRealm(player.main_realm_id);
  return { ...player, main_realm_name: realm?.name || player.main_realm_id, inventory: await repo.listInventory(player.id) };
}

async function getProfile(id) { return hydratePlayer(await repo.findById(id)); }
async function getProfileByName(name) { return hydratePlayer(await repo.findByName(String(name || '').trim())); }

async function create(name) {
  const normalized = String(name || '').trim();
  if (normalized.length < 2) throw Object.assign(new Error('Đạo hiệu phải có ít nhất 2 ký tự.'), { statusCode: 400 });
  const id = await repo.createPlayer(normalized);
  await repo.addLog(id, 'system', 'create_player', 'Khai mở đạo đồ', `Đạo hiệu ${normalized} đã bước vào Nhân Giới.`);
  return getProfile(id);
}

module.exports = { getProfile, getProfileByName, create };
