'use strict';

const SOURCE_KEYS = Object.freeze({
  REALM: 'realm',
  SPIRITUAL_ROOT: 'spiritualRoot',
  CULTIVATION_ART: 'cultivationArt',
  EQUIPMENT: 'equipment',
  PILL: 'pill',
  DIVINE_ART: 'divineArt',
  ACHIEVEMENT: 'achievement',
  PERMANENT: 'permanent',
  ATTRIBUTE: 'attribute'
});

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nonNegative(value) {
  return Math.max(0, number(value));
}

function configuredPot(source, ...keys) {
  if (!source || typeof source !== 'object') return 0;

  for (const key of keys) {
    const value = number(source[key], Number.NaN);
    if (Number.isFinite(value)) return Math.max(0, value);
  }

  return 0;
}

function realmPot(player) {
  const configured =
    nonNegative(player.realm_pot) +
    nonNegative(player.body_realm_pot) +
    nonNegative(player.soul_realm_pot);

  if (configured > 0) return configured;

  return (
    nonNegative(player.main_realm_index) * 500 +
    nonNegative(player.main_layer) * 50 +
    nonNegative(player.body_realm_index) * 180 +
    nonNegative(player.body_layer) * 20 +
    nonNegative(player.soul_realm_index) * 180 +
    nonNegative(player.soul_layer) * 20
  );
}

function spiritualRootPot(player) {
  const root = player.spiritual_root_data || player.spiritualRoot || null;
  const configured =
    nonNegative(player.spiritual_root_pot) ||
    configuredPot(root, 'pot', 'basePot', 'potentialPot');

  if (configured > 0) {
    const level = Math.max(1, number(player.spiritual_root_level, 1));
    const perLevel = configuredPot(root, 'potPerLevel', 'potentialPerLevel');
    return configured + Math.max(0, level - 1) * perLevel;
  }

  // Giá trị dự phòng trong thời gian XML cũ chưa có trường pot.
  const level = Math.max(1, number(player.spiritual_root_level, 1));
  return 100 + level * 25;
}

function cultivationArtPot(player) {
  const direct = nonNegative(player.cultivation_art_pot);
  if (direct > 0) return direct;

  const arts = Array.isArray(player.cultivation_arts)
    ? player.cultivation_arts
    : [];

  return arts.reduce((sum, art) => {
    if (art?.active === false) return sum;

    const base = configuredPot(art, 'pot', 'basePot', 'potentialPot');
    const perLevel = configuredPot(art, 'potPerLevel', 'potentialPerLevel');
    const level = Math.max(1, number(art?.level, 1));

    // Công pháp XML cũ chưa có pot vẫn nhận một mức dự phòng ổn định.
    return sum + (base > 0 ? base : 40) + Math.max(0, level - 1) * (perLevel > 0 ? perLevel : 10);
  }, 0);
}

function attributePot(player, effects = []) {
  const p = player || {};

  const base =
    nonNegative(p.max_hp) * 0.25 +
    nonNegative(p.max_mp) * 0.15 +
    nonNegative(p.attack_value) * 4 +
    nonNegative(p.defense_value) * 3;

  const secondary =
    nonNegative(p.accuracy) * 0.4 +
    nonNegative(p.speed_value) * 1.5 +
    nonNegative(p.crit_rate) * 100 * 8 +
    nonNegative(p.dodge_rate) * 100 * 7 +
    nonNegative(p.crit_damage) * 100 * 2 +
    nonNegative(p.armor_penetration) * 100 * 4 +
    nonNegative(p.crit_resistance) * 100 * 5 +
    nonNegative(p.life_steal) * 100 * 10 +
    nonNegative(p.hp_regen) * 1.2 +
    nonNegative(p.mp_regen) * 0.8;

  const effectPot = Array.isArray(effects)
    ? effects.reduce((sum, effect) => {
        const chance = nonNegative(effect?.chancePercent);
        const duration = Math.max(1, number(effect?.durationTurns, 1));
        const magnitude = Math.max(
          1,
          nonNegative(effect?.powerMultiplier),
          Math.abs(number(effect?.value)),
          Math.abs(number(effect?.flatDamage)) / 10
        );
        return sum + chance * duration * magnitude * 2;
      }, 0)
    : 0;

  return base + secondary + effectPot;
}

function calculatePotential(player, effects = player?.cultivation_art_effects || []) {
  const p = player || {};

  const sources = {
    [SOURCE_KEYS.REALM]: realmPot(p),
    [SOURCE_KEYS.SPIRITUAL_ROOT]: spiritualRootPot(p),
    [SOURCE_KEYS.CULTIVATION_ART]: cultivationArtPot(p),
    [SOURCE_KEYS.EQUIPMENT]: nonNegative(p.equipment_pot),
    [SOURCE_KEYS.PILL]: nonNegative(p.pill_pot),
    [SOURCE_KEYS.DIVINE_ART]: nonNegative(p.divine_art_pot),
    [SOURCE_KEYS.ACHIEVEMENT]: nonNegative(p.achievement_pot),
    [SOURCE_KEYS.PERMANENT]: nonNegative(p.permanent_pot),
    [SOURCE_KEYS.ATTRIBUTE]: attributePot(p, effects)
  };

  for (const key of Object.keys(sources)) {
    sources[key] = Math.round(Math.max(0, sources[key]));
  }

  const totalPot = Math.max(
    1,
    Object.values(sources).reduce((sum, value) => sum + value, 0)
  );

  return {
    totalPot,
    sources
  };
}

module.exports = {
  SOURCE_KEYS,
  calculatePotential
};
