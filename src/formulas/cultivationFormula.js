'use strict';

const potentialFormula = require('./potentialFormula');

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function expRequired(realm, layer) {
  const safeLayer = Math.max(1, number(layer, 1));
  const configuredLayer = realm?.layerData?.find(
    item => number(item.index) === safeLayer
  );

  if (configuredLayer && number(configuredLayer.requiredExp) > 0) {
    return Math.floor(number(configuredLayer.requiredExp));
  }

  // Công thức dự phòng cho những tầng chưa được khai báo chi tiết trong XML.
  const realmOrder = Math.max(1, number(realm?.order, 1));
  const realmMultiplier = Math.pow(5, realmOrder - 1);
  const layerMultiplier = Math.pow(1.75, safeLayer - 1);

  return Math.max(
    100,
    Math.floor(100 * realmMultiplier * layerMultiplier)
  );
}

function breakthroughRate(realm) {
  const configuredRate = number(realm?.breakthroughRate, 0);

  if (configuredRate > 0) {
    return Math.min(1, configuredRate);
  }

  // Các cảnh giới chưa khai báo Breakthrough trong XML vẫn có tỷ lệ mặc định.
  const order = Math.max(1, number(realm?.order, 1));
  return Math.max(0.2, 0.65 - (order - 1) * 0.05);
}

/**
 * Cổng tính Tiềm Lực thống nhất của Nhân Giới.
 * Tên kỹ thuật trên server là POT; giao diện chỉ hiển thị “Tiềm Lực”.
 */
function calcPotential(player, effects = player?.cultivation_art_effects || []) {
  return potentialFormula.calculatePotential(player, effects);
}

function calcPower(player, effects = player?.cultivation_art_effects || []) {
  return calcPotential(player, effects).totalPot;
}

module.exports = { expRequired, breakthroughRate, calcPotential, calcPower };
