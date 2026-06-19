// ============================================
// CORE - COMBAT SERVICE
// Combat có HP quái, HP người chơi, phạt chết và log.
// ============================================
const mapService = require('./mapService');
const currencyService = require('./currencyService');
const martialSkillService = require('./martialSkillService');

const DEFAULT_FIGHT_DURATION = 3000;
const MAX_OFFLINE_COMBAT_MS = 5 * 60 * 1000;
const PENALTY_RECOVER_MS = 5 * 60 * 1000;
const MAX_DEATH_PENALTY_PERCENT = 90;

function ensureCombatState(player) {
  if (!player.combatState) {
    player.combatState = {
      fightProgress: 0,
      fightDuration: DEFAULT_FIGHT_DURATION,
      currentMonster: null,
      monsterHp: 0,
      monsterMaxHp: 0,
      status: 'Sẵn sàng',
      logs: [],
      deathCount: 0,
      deathPenaltyPercent: 0,
      lastPenaltyRecoverAt: Date.now(),
    };
  }
  const state = player.combatState;
  if (!Array.isArray(state.logs)) state.logs = [];
  if (!state.fightDuration) state.fightDuration = DEFAULT_FIGHT_DURATION;
  if (state.deathCount === undefined) state.deathCount = 0;
  if (state.deathPenaltyPercent === undefined) state.deathPenaltyPercent = 0;
  if (!state.lastPenaltyRecoverAt) state.lastPenaltyRecoverAt = Date.now();
  state.deathPenaltyPercent = Math.max(0, Math.min(MAX_DEATH_PENALTY_PERCENT, Number(state.deathPenaltyPercent || 0)));

  if (!player.combat) player.combat = { hp: 100, maxHp: 100, atk: 10, def: 5, speed: 5, critRate: 0.05, critDmg: 1.5 };
  if ((!player.combat.hp || player.combat.hp <= 0) && state.deathPenaltyPercent < MAX_DEATH_PENALTY_PERCENT) {
    player.combat.hp = player.combat.maxHp || 100;
  }
}

function addLog(player, text) {
  ensureCombatState(player);
  const time = new Date().toLocaleTimeString('vi-VN');
  player.combatState.logs.push(`[${time}] ${text}`);
  while (player.combatState.logs.length > 8) player.combatState.logs.shift();
}

function getDeathCount(player) {
  ensureCombatState(player);
  return Number(player.combatState.deathCount || 0);
}

function getDeathPenaltyPercent(player) {
  ensureCombatState(player);
  return Math.max(0, Math.min(MAX_DEATH_PENALTY_PERCENT, Number(player.combatState.deathPenaltyPercent || 0)));
}

function isCombatLocked(player) {
  return getDeathPenaltyPercent(player) >= MAX_DEATH_PENALTY_PERCENT;
}

function getPenaltyMultiplier(player) {
  return Math.max(0, 1 - getDeathPenaltyPercent(player) / 100);
}

function getEffectiveStat(value, player, minValue = 1) {
  return Math.max(minValue, Number(value || 0) * getPenaltyMultiplier(player));
}

function recoverDeathPenalty(player, currentTime = Date.now()) {
  ensureCombatState(player);
  const state = player.combatState;
  const penalty = getDeathPenaltyPercent(player);
  if (penalty <= 0) {
    state.deathPenaltyPercent = 0;
    state.lastPenaltyRecoverAt = currentTime;
    return 0;
  }
  const elapsed = currentTime - (state.lastPenaltyRecoverAt || currentTime);
  if (elapsed < PENALTY_RECOVER_MS) return 0;
  const recoverPercent = Math.floor(elapsed / PENALTY_RECOVER_MS);
  const before = state.deathPenaltyPercent;
  state.deathPenaltyPercent = Math.max(0, before - recoverPercent);
  state.lastPenaltyRecoverAt += recoverPercent * PENALTY_RECOVER_MS;
  const recovered = before - state.deathPenaltyPercent;
  if (recovered > 0) addLog(player, `Hồi phục ${recovered}% phạt chỉ số. Còn phạt ${state.deathPenaltyPercent}%.`);
  return recovered;
}

function applyDeathPenalty(player) {
  ensureCombatState(player);
  const state = player.combatState;
  state.deathCount = getDeathCount(player) + 1;
  const addPenalty = Math.pow(2, state.deathCount - 1);
  state.deathPenaltyPercent = Math.min(MAX_DEATH_PENALTY_PERCENT, Number(state.deathPenaltyPercent || 0) + addPenalty);
  state.lastPenaltyRecoverAt = Date.now();
  return state.deathPenaltyPercent;
}

function spawnMonster(player) {
  ensureCombatState(player);
  recoverDeathPenalty(player);
  if (isCombatLocked(player)) {
    player.autoFight = false;
    player.combatState.currentMonster = null;
    player.combatState.monsterHp = 0;
    player.combatState.monsterMaxHp = 0;
    player.combatState.status = 'Phạt chỉ số đạt 90%, tạm cấm combat. Chờ hồi phục.';
    return null;
  }

  const map = mapService.ensureCurrentMap(player);
  const baseMonster = mapService.getRandomMonster(map);
  const monster = mapService.buildMonsterStats(player, map, baseMonster);
  player.combatState.currentMonster = monster;
  player.combatState.monsterMaxHp = monster.hp;
  player.combatState.monsterHp = monster.hp;
  player.combatState.fightProgress = 0;
  player.combatState.status = `Đang đánh ${monster.name}`;
  return monster;
}

function getPlayerAtk(player) {
  const base = Number(player.combat?.atk || 1);
  const bonus = Number(player.permanentBonuses?.atk || 0);
  return Math.max(1, getEffectiveStat(base + bonus, player, 1));
}

function getPlayerDef(player) {
  const base = Number(player.combat?.def || 0);
  const bonus = Number(player.permanentBonuses?.def || 0);
  return Math.max(0, getEffectiveStat(base + bonus, player, 0));
}

function rollDamage(atk, def, options = {}) {
  const multiplier = Math.max(1, Number(options.damageMultiplier || 1));
  const extraDamage = Math.max(0, Number(options.extraDamage || 0));
  const critRate = Math.max(0, Math.min(0.95, Number(options.critRate || 0)));
  const critDmg = Math.max(1, Number(options.critDmg || 1.5));
  const raw = (Number(atk || 1) * multiplier + extraDamage) - Number(def || 0) * 0.45;
  const variance = 0.85 + Math.random() * 0.3;
  const crit = Math.random() < critRate;
  return Math.max(1, Math.floor(raw * variance * (crit ? critDmg : 1)));
}

function grantKillReward(player, monster) {
  const stones = Number(monster.stoneReward || 0);
  const tuVi = Number(monster.tuViReward || 0);
  player.stats.totalKills = (player.stats.totalKills || 0) + 1;
  if (tuVi > 0) {
    player.cultivation.tuVi = Number(player.cultivation.tuVi || 0) + tuVi;
    player.stats.totalTuVi = Number(player.stats.totalTuVi || 0) + tuVi;
  }
  if (stones > 0) currencyService.addCurrency(player, 'so_linh_thach', stones);
  addLog(player, `Hạ ${monster.name}, nhận ${tuVi} tu vi và ${stones} linh thạch.`);
}

function doCombatRound(player) {
  ensureCombatState(player);
  recoverDeathPenalty(player);
  if (isCombatLocked(player)) {
    player.autoFight = false;
    player.combatState.status = 'Phạt chỉ số đạt 90%, tạm cấm combat. Chờ hồi phục.';
    addLog(player, 'Phạt chỉ số đạt 90%, không thể tiếp tục combat.');
    return;
  }

  let monster = player.combatState.currentMonster;
  if (!monster || player.combatState.monsterHp <= 0) monster = spawnMonster(player);
  if (!monster) return;

  const martialEffects = martialSkillService.getEquippedMartialEffects(player.martialSkills);
  const playerDef = getPlayerDef(player);
  const playerDamage = rollDamage(getPlayerAtk(player), monster.def || 0, {
    damageMultiplier: martialEffects.damageMultiplier,
    extraDamage: playerDef * martialEffects.defDamageRatio,
    critRate: Number(player.combat?.critRate || 0) + martialEffects.critBonus,
    critDmg: Number(player.combat?.critDmg || 1.5),
  });
  player.combatState.monsterHp = Math.max(0, player.combatState.monsterHp - playerDamage);
  addLog(player, `Bạn thi triển vũ kỹ đánh ${monster.name} -${playerDamage} HP.`);

  if (player.combatState.monsterHp <= 0) {
    grantKillReward(player, monster);
    spawnMonster(player);
    return;
  }

  const monsterDamage = rollDamage(monster.atk || 1, playerDef);
  player.combat.hp = Math.max(0, player.combat.hp - monsterDamage);
  addLog(player, `${monster.name} đánh lại -${monsterDamage} HP.`);

  if (player.combat.hp <= 0) {
    const penalty = applyDeathPenalty(player);
    player.autoFight = false;
    player.combatState.currentMonster = null;
    player.combatState.monsterHp = 0;
    player.combatState.monsterMaxHp = 0;
    player.combatState.status = penalty >= MAX_DEATH_PENALTY_PERCENT
      ? 'Phạt chỉ số đạt 90%, tạm cấm combat. Chờ hồi phục.'
      : `Trọng thương, bị phạt ${penalty}% chỉ số.`;
    addLog(player, `Bạn bị trọng thương. Tự đánh đã dừng. Phạt ${penalty}% chỉ số.`);
  }
}

function processCombat(player, deltaMs) {
  ensureCombatState(player);
  recoverDeathPenalty(player);
  mapService.ensureCurrentMap(player);

  if (isCombatLocked(player)) {
    player.autoFight = false;
    player.combatState.status = 'Phạt chỉ số đạt 90%, tạm cấm combat. Chờ hồi phục.';
    return;
  }
  if (!player.autoFight) {
    player.combatState.status = 'Tự đánh đang tắt.';
    return;
  }
  if (player.combat.hp <= 0) {
    player.autoFight = false;
    player.combatState.status = 'Trọng thương, cần hồi phục.';
    return;
  }
  if (!player.combatState.currentMonster || player.combatState.monsterHp <= 0) spawnMonster(player);

  const safeDelta = Math.min(Number(deltaMs || 0), MAX_OFFLINE_COMBAT_MS);
  player.combatState.fightProgress += safeDelta;
  let guard = 0;
  while (player.combatState.fightProgress >= player.combatState.fightDuration && guard < 200) {
    player.combatState.fightProgress -= player.combatState.fightDuration;
    doCombatRound(player);
    guard++;
    if (!player.autoFight || player.combat.hp <= 0 || isCombatLocked(player)) break;
  }
}

function getPublicCombatState(player) {
  ensureCombatState(player);
  recoverDeathPenalty(player);
  const penalty = getDeathPenaltyPercent(player);
  const nextRecoverAt = penalty > 0 ? (player.combatState.lastPenaltyRecoverAt || Date.now()) + PENALTY_RECOVER_MS : null;
  return {
    ...player.combatState,
    monsterHp: Math.round(player.combatState.monsterHp || 0),
    monsterMaxHp: Math.round(player.combatState.monsterMaxHp || 0),
    deathCount: getDeathCount(player),
    deathPenaltyPercent: penalty,
    deathPenaltyLocked: penalty >= MAX_DEATH_PENALTY_PERCENT,
    nextPenaltyRecoverAt: nextRecoverAt,
    penaltyRecoverSecondsLeft: nextRecoverAt ? Math.max(0, Math.ceil((nextRecoverAt - Date.now()) / 1000)) : 0,
  };
}

module.exports = {
  ensureCombatState,
  spawnMonster,
  processCombat,
  getPublicCombatState,
  getDeathPenaltyPercent,
  getPenaltyMultiplier,
  isCombatLocked,
  recoverDeathPenalty,
};
