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
 * Công thức Chiến Lực duy nhất của toàn bộ Nhân Giới.
 *
 * Quy ước dữ liệu phần trăm trong player:
 * - crit_rate = 0.05 nghĩa là 5%.
 * - dodge_rate = 0.05 nghĩa là 5%.
 * - armor_penetration có thể là tỷ lệ nhỏ hoặc trị số phẳng tùy XML hiện tại.
 *
 * Công thức này được cả gameService và cultivationArtRuntime sử dụng,
 * tránh tình trạng giao diện hiển thị một giá trị nhưng runtime tính giá trị khác.
 */
function calcPower(player, effects = player?.cultivation_art_effects || []) {
  const p = player || {};

  const basePower =
    number(p.max_hp) * 0.25 +
    number(p.max_mp) * 0.15 +
    number(p.attack_value) * 4 +
    number(p.defense_value) * 3;

  const secondaryPower =
    number(p.accuracy) * 0.4 +
    number(p.speed_value) * 1.5 +
    number(p.crit_rate) * 100 * 8 +
    number(p.dodge_rate) * 100 * 7 +
    number(p.crit_damage) * 100 * 2 +
    number(p.armor_penetration) * 100 * 4 +
    number(p.crit_resistance) * 100 * 5 +
    number(p.life_steal) * 100 * 10 +
    number(p.hp_regen) * 1.2 +
    number(p.mp_regen) * 0.8;

  // Cảnh giới vẫn có trọng lượng, nhưng không được lấn át toàn bộ thuộc tính thực chiến.
  const realmPower =
    number(p.main_realm_index) * 500 +
    number(p.main_layer) * 50 +
    number(p.body_realm_index) * 180 +
    number(p.body_layer) * 20 +
    number(p.soul_realm_index) * 180 +
    number(p.soul_layer) * 20;

  const effectPower = Array.isArray(effects)
    ? effects.reduce((sum, effect) => {
        const chance = number(effect?.chancePercent);
        const duration = Math.max(1, number(effect?.durationTurns, 1));
        const magnitude = Math.max(
          1,
          number(effect?.powerMultiplier, 1),
          Math.abs(number(effect?.value)),
          Math.abs(number(effect?.flatDamage)) / 10
        );

        return sum + chance * duration * magnitude * 2;
      }, 0)
    : 0;

  return Math.max(
    1,
    Math.round(basePower + secondaryPower + realmPower + effectPower)
  );
}

module.exports = {
  expRequired,
  breakthroughRate,
  calcPower
};
