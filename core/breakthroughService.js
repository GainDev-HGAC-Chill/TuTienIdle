// ============================================
// CORE - BREAKTHROUGH SERVICE
// Đột phá chủ động: đủ tu vi mới được thử, có tỷ lệ thành công,
// đan đột phá chỉ được dùng 1 lần cho 1 lần thử.
// ============================================

const realmService = require('./realmService');
const pillService = require('./pillService');

const BASE_RATE = {
  stage: 0.85,       // lên tầng nhỏ
  realm: 0.65,       // lên đại cảnh giới trong cùng giới
  world: 0.45,       // phi thăng / sang giới mới
  minor_stage: 0.85,
};

const MIN_RATE = 0.05;
const MAX_RATE = 0.95;

function ensureBreakthroughState(player) {
  if (!player.breakthroughState) {
    player.breakthroughState = {
      failStreak: 0,
      lastAttemptAt: 0,
      lastResult: null,
    };
  }
  pillService.ensurePillState(player);
}

function clampRate(value) {
  return Math.max(MIN_RATE, Math.min(MAX_RATE, value));
}

function getPillBonusRate(player) {
  const lock = player.breakthroughPillLock;
  if (!lock || !lock.used) return 0;

  // Hỗ trợ nhiều tên field để hợp với data đan hiện tại/tương lai.
  const effects = lock.effects || {};
  const directPercent =
    effects.breakthroughRatePercent ||
    effects.successRatePercent ||
    effects.successBonusPercent ||
    effects.breakthroughSuccessPercent ||
    0;

  if (directPercent) return directPercent / 100;

  // Nếu đan chỉ có quality multiplier thì quy đổi tạm:
  // thường 50% => +5%, tốt 100% => +10%, cực phẩm 200% => +20%.
  const multiplier = Number(lock.effectMultiplier || 1);
  return 0.10 * multiplier;
}

function getBreakthroughType(next) {
  if (!next) return 'none';
  if (next.type === 'stage' || next.type === 'minor_stage') return 'stage';
  if (next.type === 'realm') return 'realm';
  if (next.type === 'world') return 'world';
  return next.type;
}

function getSuccessRate(player) {
  ensureBreakthroughState(player);

  const next = realmService.getNextRealmInfo(player.cultivation);
  const type = getBreakthroughType(next);
  const base = BASE_RATE[type] ?? 0.5;

  // Mỗi lần thất bại tăng nhẹ tỷ lệ lần sau để bớt ức chế.
  const failBonus = Math.min(0.20, (player.breakthroughState.failStreak || 0) * 0.05);
  const pillBonus = getPillBonusRate(player);

  return clampRate(base + failBonus + pillBonus);
}

function canBreakthrough(player, getRealmNeed) {
  ensureBreakthroughState(player);

  const next = realmService.getNextRealmInfo(player.cultivation);
  if (!next || next.type === 'max') {
    return { ok: false, reason: 'Đã đạt cảnh giới tối đa hiện tại.' };
  }

  const need = getRealmNeed(player.cultivation);
  player.cultivation.maxTuVi = need;

  if (player.cultivation.tuVi < need) {
    return {
      ok: false,
      reason: 'Tu vi chưa đủ để đột phá.',
      need,
      current: player.cultivation.tuVi,
    };
  }

  return {
    ok: true,
    next,
    need,
    current: player.cultivation.tuVi,
    rate: getSuccessRate(player),
  };
}

function advanceCultivationOnce(player, getRealmNeed) {
  const next = realmService.getNextRealmInfo(player.cultivation);
  if (!next || next.type === 'max' || next.type === 'dao_entry') return false;

  if (next.type === 'stage' || next.type === 'minor_stage') {
    player.cultivation.stage = next.stage;
  } else if (next.type === 'realm') {
    player.cultivation.realmIndex = next.realmIndex;
    player.cultivation.stage = next.stage;
  } else if (next.type === 'world') {
    player.cultivation.world = next.worldId;
    player.cultivation.realmIndex = 0;
    player.cultivation.stage = 1;
  }

  player.cultivation.tuVi = 0;
  player.cultivation.maxTuVi = getRealmNeed(player.cultivation);
  player.cultivation.readyToBreakthrough = false;

  if (player.combat) {
    const type = getBreakthroughType(next);
    const hpGain = type === 'world' ? 200 : type === 'realm' ? 80 : 20;
    const atkGain = type === 'world' ? 30 : type === 'realm' ? 10 : 3;
    const defGain = type === 'world' ? 15 : type === 'realm' ? 5 : 2;

    player.combat.maxHp += hpGain;
    player.combat.hp = player.combat.maxHp;
    player.combat.atk += atkGain;
    player.combat.def += defGain;
  }

  return true;
}

function clearUsedBreakthroughPill(player) {
  // Sau 1 lần thử, dù thành công hay thất bại đều mở khóa.
  // Nếu thất bại, người chơi có thể dùng tiếp đan mới cho lần thử sau.
  pillService.clearBreakthroughPillLock(player);
}

function attemptBreakthrough(player, getRealmNeed) {
  const check = canBreakthrough(player, getRealmNeed);
  if (!check.ok) return { success: false, reason: check.reason, check };

  const rate = check.rate;
  const roll = Math.random();
  const passed = roll <= rate;

  ensureBreakthroughState(player);

  if (passed) {
    const advanced = advanceCultivationOnce(player, getRealmNeed);
    clearUsedBreakthroughPill(player);

    if (!advanced) {
      return { success: false, reason: 'Không thể chuyển cảnh giới tiếp theo.' };
    }

    player.breakthroughState.failStreak = 0;
    player.breakthroughState.lastAttemptAt = Date.now();
    player.breakthroughState.lastResult = {
      success: true,
      rate,
      roll,
      at: Date.now(),
    };

    return {
      success: true,
      breakthroughSuccess: true,
      rate,
      roll,
      next: check.next,
      message: 'Đột phá thành công.',
    };
  }

  // Thất bại: mất 20% tu vi yêu cầu, phải tu lại phần thiếu.
  const lostTuVi = Math.floor(check.need * 0.20);
  player.cultivation.tuVi = Math.max(0, check.need - lostTuVi);
  player.cultivation.readyToBreakthrough = false;

  clearUsedBreakthroughPill(player);

  player.breakthroughState.failStreak = (player.breakthroughState.failStreak || 0) + 1;
  player.breakthroughState.lastAttemptAt = Date.now();
  player.breakthroughState.lastResult = {
    success: false,
    rate,
    roll,
    lostTuVi,
    at: Date.now(),
  };

  return {
    success: true,
    breakthroughSuccess: false,
    rate,
    roll,
    lostTuVi,
    next: check.next,
    message: `Đột phá thất bại, hao tổn ${lostTuVi} tu vi.`,
  };
}

function getBreakthroughPreview(player, getRealmNeed) {
  const next = realmService.getNextRealmInfo(player.cultivation);
  if (!next || next.type === 'max') {
    return {
      canAttempt: false,
      reason: 'Đã đạt cảnh giới tối đa hiện tại.',
      next,
    };
  }

  const need = getRealmNeed(player.cultivation);
  const current = player.cultivation.tuVi || 0;

  return {
    canAttempt: current >= need,
    current,
    need,
    missing: Math.max(0, need - current),
    successRate: getSuccessRate(player),
    next,
    failStreak: player.breakthroughState?.failStreak || 0,
    usedPill: player.breakthroughPillLock || null,
  };
}

module.exports = {
  ensureBreakthroughState,
  canBreakthrough,
  attemptBreakthrough,
  getBreakthroughPreview,
  getSuccessRate,
};
