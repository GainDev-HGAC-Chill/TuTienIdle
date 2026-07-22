const progression = require('../config/cultivationArtProgressionManager');
const artManager = require('../config/cultivationArtManager');
const formula = require('../formulas/cultivationFormula');
const repository = require('../repositories/cultivationArtRepository');

const FIELD_MAP = {
  MAX_HP: 'max_hp',
  MAX_MP: 'max_mp',
  ATTACK: 'attack_value',
  DEFENSE: 'defense_value',
  ACCURACY: 'accuracy',
  DODGE: 'dodge_rate',
  DODGE_RATE: 'dodge_rate',
  CRIT_RATE: 'crit_rate',
  CRIT_DAMAGE: 'crit_damage',
  ACTION_SPEED: 'speed_value',
  SPEED: 'speed_value',
  ARMOR_PENETRATION: 'armor_penetration',
  CRIT_RESIST: 'crit_resistance',
  CRIT_RESISTANCE: 'crit_resistance',
  LIFE_STEAL: 'life_steal',
  HP_REGEN: 'hp_regen',
  MP_REGEN: 'mp_regen',
  CULTIVATION_RATE: 'cultivation_rate'
};

const PERCENT_AS_FRACTION = new Set([
  'dodge_rate',
  'crit_rate',
  'crit_damage',
  'armor_penetration',
  'crit_resistance',
  'life_steal',
  'cultivation_rate'
]);

function addStat(player, stat, affinityMultiplier, levelMultiplier = 1) {
  const field = FIELD_MAP[stat.key];
  if (!field) return;

  const current = Number(player[field] || 0);
  let value =
    Number(stat.value || 0) * affinityMultiplier * levelMultiplier;

  if (stat.unit === 'percent') {
    if (PERCENT_AS_FRACTION.has(field)) {
      value /= 100;
    } else {
      value = current * value / 100;
    }
  }

  player[field] = current + value;
}

function isAffinityMatched(player, art) {
  const artRootId = String(art?.rootId || '').trim();
  if (!artRootId) return false;

  const currentRootId = String(player?.spiritual_root || '').trim();
  const baseRootId = String(player?.base_spiritual_root || '').trim();

  return artRootId === currentRootId || artRootId === baseRootId;
}

async function applyToPlayer(player, connection) {
  if (!player?.id || !artManager.loaded) return player;

  const equipped = await repository.getEquipped(player.id, connection);
  const owned = await repository.getOwned(player.id, connection);
  const ownedById = new Map(owned.map(row => [row.art_id, row]));
  const effects = [];
  const arts = [];

  for (const slot of equipped) {
    const art = artManager.get(slot.art_id);
    const ownedArt = ownedById.get(slot.art_id);

    if (!art || !ownedArt) continue;

    const grade = artManager.getGrade(art.id, ownedArt.grade);
    if (!grade) continue;

    const affinityMatched = isAffinityMatched(player, art);

    // Công pháp ghi RequireMatch chỉ phát huy khi đúng Linh Căn hiện tại
    // hoặc đúng căn nguyên của Linh Căn đặc tính.
    if (art.requireMatch && !affinityMatched) {
      arts.push({
        id: art.id,
        name: art.name,
        category: art.category,
        grade: ownedArt.grade,
        level: Number(ownedArt.art_level),
        affinityMatched: false,
        active: false,
        inactiveReason: 'Linh Căn không tương hợp'
      });
      continue;
    }

    const affinity = affinityMatched
      ? 1 + Number(art.matchingBonusPercent || 0) / 100
      : 1;

    const levelMultiplier = progression.levelRatio(ownedArt.art_level);

    for (const stat of grade.stats || []) {
      addStat(player, stat, affinity, levelMultiplier);
    }

    effects.push(
      ...(grade.effects || []).map(effect => ({
        ...effect,
        sourceArtId: art.id,
        sourceArtName: art.name
      }))
    );

    arts.push({
      id: art.id,
      name: art.name,
      category: art.category,
      grade: ownedArt.grade,
      level: Number(ownedArt.art_level),
      affinityMatched,
      active: true
    });
  }

  player.cultivation_arts = arts;
  player.cultivation_art_effects = effects;
  player.combat_power = formula.calcPower(player, effects);

  return player;
}

function calculateCombatPower(player, effects = []) {
  return formula.calcPower(player, effects);
}

module.exports = {
  applyToPlayer,
  calculateCombatPower,
  isAffinityMatched
};
