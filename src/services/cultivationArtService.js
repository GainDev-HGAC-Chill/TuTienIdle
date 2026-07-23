'use strict';

const playerRepository = require('../repositories/playerRepository');
const repository = require('../repositories/cultivationArtRepository');
const artManager = require('../config/cultivationArtManager');
const progression = require('../config/cultivationArtProgressionManager');
const progressService = require('./cultivationArtProgressionService');

async function ensurePlayer(id) {
  const player = await playerRepository.findById(id);
  if (!player) {
    const error = new Error('Không tìm thấy đạo hữu.');
    error.statusCode = 404;
    throw error;
  }
  await repository.ensureStarterArts(player, artManager);
  return player;
}

function calculateArtPotential(row, art) {
  const level = Math.max(1, Number(row.art_level || 1));
  const basePot = Number(art?.basePot || art?.pot || 40);
  const potPerLevel = Number(art?.potPerLevel || 10);
  return Math.max(0, basePot + Math.max(0, level - 1) * potPerLevel);
}

function decorateOwned(row) {
  const art = artManager.get(row.art_id);
  const required = Number(row.art_level) >= progression.maxLevelPerGrade
    ? 0
    : progression.requiredExp(row.category, row.grade, row.art_level);
  const currentProgress = row.category === 'than_thong'
    ? Number(row.proficiency || 0)
    : Number(row.art_exp || 0);

  return {
    ...row,
    art,
    potential: calculateArtPotential(row, art),
    required_exp: required,
    progress_percent: required
      ? Math.min(100, Number(((currentProgress / required) * 100).toFixed(2)))
      : 100
  };
}

async function profile(playerId) {
  const player = await ensurePlayer(playerId);
  const ownedRows = await repository.getOwned(playerId);
  const equippedRows = await repository.getEquipped(playerId);
  const resources = await repository.getResources(playerId);

  const owned = ownedRows.map(decorateOwned);
  const ownedById = new Map(owned.map(item => [String(item.art_id), item]));
  const equipped = equippedRows.map(slot => {
    const ownedArt = ownedById.get(String(slot.art_id));
    return {
      ...slot,
      grade: ownedArt?.grade || 'pham',
      art_level: Number(ownedArt?.art_level || 1),
      proficiency: Number(ownedArt?.proficiency || 0),
      potential: Number(ownedArt?.potential || 0),
      art: ownedArt?.art || artManager.get(slot.art_id)
    };
  });

  return {
    playerId: Number(playerId),
    rootId: player.spiritual_root,
    owned,
    equipped,
    equippedCount: equipped.length,
    equippedPotential: equipped.reduce(
      (sum, item) => sum + Number(item.potential || 0),
      0
    ),
    resources,
    progression: progression.summary()
  };
}

async function catalog(filters) {
  return {
    summary: artManager.summary(),
    progression: progression.summary(),
    arts: artManager.getAll(filters)
  };
}

async function learn(playerId, artId, grade = 'pham') {
  await ensurePlayer(playerId);
  const art = artManager.get(artId);
  if (!art) {
    const error = new Error('Công pháp không tồn tại trong Đạo Tàng.');
    error.statusCode = 404;
    throw error;
  }

  const inserted = await repository.learn(playerId, art, grade);
  if (!inserted) {
    const currentGrade = progression.getGrade(grade) || progression.getGrade('pham');
    await repository.addResources(playerId, {
      cultivation_essence: ({ pham: 1, hoang: 3, huyen: 8, dia: 20, thien: 50 })[currentGrade.id] || 1
    });
  }
  return profile(playerId);
}

async function equip(playerId, artId, requestedSlotIndex) {
  await ensurePlayer(playerId);
  const art = artManager.get(artId);
  if (!art) {
    const error = new Error('Công pháp không tồn tại trong Đạo Tàng.');
    error.statusCode = 404;
    throw error;
  }

  const owned = await repository.getOwned(playerId);
  if (!owned.some(item => item.art_id === art.id)) {
    const error = new Error('Đạo hữu chưa lĩnh ngộ công pháp này.');
    error.statusCode = 400;
    throw error;
  }

  let slotIndex = Number(requestedSlotIndex);
  if (!Number.isInteger(slotIndex)) {
    slotIndex = await repository.findFirstFreeSlot(playerId, art.category);
  }
  if (slotIndex < 1 || slotIndex > 3) {
    const error = new Error('Ô vận hành Công Pháp phải từ 1 đến 3.');
    error.statusCode = 400;
    throw error;
  }

  await repository.equip(playerId, art, slotIndex);
  return profile(playerId);
}

async function unequip(playerId, category, slotIndex) {
  await ensurePlayer(playerId);
  const normalizedSlot = Number(slotIndex);
  if (!category || !Number.isInteger(normalizedSlot) || normalizedSlot < 1 || normalizedSlot > 3) {
    const error = new Error('Vị trí tháo Công Pháp không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  await repository.unequip(playerId, category, normalizedSlot);
  return profile(playerId);
}

async function cultivate(playerId, artId, mode) {
  await ensurePlayer(playerId);
  await progressService.cultivate(playerId, artId, mode);
  return profile(playerId);
}

async function breakthrough(playerId, artId) {
  await ensurePlayer(playerId);
  await progressService.breakthrough(playerId, artId);
  return profile(playerId);
}

module.exports = {
  profile,
  catalog,
  learn,
  equip,
  unequip,
  cultivate,
  breakthrough
};
