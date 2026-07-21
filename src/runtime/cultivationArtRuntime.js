const artManager = require('../config/cultivationArtManager');
const repository = require('../repositories/cultivationArtRepository');

const FIELD_MAP = {
  MAX_HP: 'max_hp', MAX_MP: 'max_mp', ATTACK: 'attack_value', DEFENSE: 'defense_value',
  ACCURACY: 'accuracy', DODGE: 'dodge_rate', DODGE_RATE: 'dodge_rate', CRIT_RATE: 'crit_rate',
  CRIT_DAMAGE: 'crit_damage', ACTION_SPEED: 'speed_value', SPEED: 'speed_value',
  ARMOR_PENETRATION: 'armor_penetration', CRIT_RESIST: 'crit_resistance', CRIT_RESISTANCE: 'crit_resistance',
  LIFE_STEAL: 'life_steal', HP_REGEN: 'hp_regen', MP_REGEN: 'mp_regen', CULTIVATION_RATE: 'cultivation_rate'
};
const PERCENT_AS_FRACTION = new Set(['dodge_rate','crit_rate','crit_damage','armor_penetration','crit_resistance','life_steal','cultivation_rate']);

function addStat(player, stat, affinityMultiplier) {
  const field = FIELD_MAP[stat.key];
  if (!field) return;
  const current = Number(player[field] || 0);
  let value = Number(stat.value || 0) * affinityMultiplier;
  if (stat.unit === 'percent') {
    if (PERCENT_AS_FRACTION.has(field)) value /= 100;
    else value = current * value / 100;
  }
  player[field] = current + value;
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
    const affinity = art.rootId === player.spiritual_root ? 1 + art.matchingBonusPercent / 100 : 1;
    for (const stat of grade.stats || []) addStat(player, stat, affinity);
    effects.push(...(grade.effects || []).map(effect => ({...effect, sourceArtId: art.id, sourceArtName: art.name})));
    arts.push({id: art.id, name: art.name, category: art.category, grade: ownedArt.grade, affinityMatched: affinity > 1});
  }
  player.cultivation_arts = arts;
  player.cultivation_art_effects = effects;
  player.combat_power = calculateCombatPower(player, effects);
  return player;
}
function calculateCombatPower(p, effects = []) {
  const base = Number(p.max_hp||0)*0.25 + Number(p.max_mp||0)*0.15 + Number(p.attack_value||0)*4 + Number(p.defense_value||0)*3;
  const secondary = Number(p.accuracy||0)*0.4 + Number(p.speed_value||0)*1.5 + Number(p.crit_rate||0)*100*8 + Number(p.dodge_rate||0)*100*7 + Number(p.life_steal||0)*100*10;
  const effectPower = effects.reduce((sum,e)=>sum + Number(e.chancePercent||0)*Math.max(1,Number(e.durationTurns||1))*2,0);
  return Math.max(1, Math.round(base + secondary + effectPower));
}
module.exports = { applyToPlayer, calculateCombatPower };
