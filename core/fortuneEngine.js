const fortunes = require('../config/fortunes');
const fortuneOutcomes = require('../config/fortuneOutcomes');

const TIER_WEIGHT = {
  PHAM: 9000,
  LINH: 900,
  HUYEN: 90,
  THIEN_MENH: 10
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWeighted(list) {
  const total = list.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  let roll = Math.random() * total;

  for (const item of list) {
    roll -= Number(item.weight || 0);
    if (roll <= 0) return item;
  }

  return list[0] || null;
}

function rollFortune() {
  const tierPool = Object.entries(TIER_WEIGHT).map(([tier, weight]) => ({ tier, weight }));
  const pickedTier = randomWeighted(tierPool)?.tier || 'PHAM';
  const pool = fortunes.filter(fortune => fortune.tier === pickedTier);

  if (!pool.length) return null;
  return pool[randomInt(0, pool.length - 1)];
}

function rollOutcome(fortuneId, choiceId) {
  const pool = fortuneOutcomes[fortuneId]?.[choiceId];
  if (!Array.isArray(pool) || !pool.length) return null;

  const picked = randomWeighted(pool);
  if (!picked) return null;

  const result = { ...picked.result };
  if (Array.isArray(result.amount)) {
    result.amount = randomInt(result.amount[0], result.amount[1]);
  }

  return result;
}

function applyOutcome(player, result) {
  if (!player || !result) return { ok: false, text: 'Không có gì xảy ra.' };

  switch (result.type) {
    case 'cultivation':
      player.cultivation = Number(player.cultivation || 0) + Number(result.amount || 0);
      break;
    case 'spiritStone':
      player.spiritStones = Number(player.spiritStones || 0) + Number(result.amount || 0);
      break;
    case 'lifespan':
      player.lifespan = Number(player.lifespan || 0) + Number(result.amount || 0);
      break;
    case 'luck':
      player.luck = Math.max(0, Math.min(10000, Number(player.luck || 100) + Number(result.amount || 0)));
      break;
    case 'nothing':
    default:
      break;
  }

  return { ok: true, text: result.text || 'Thiên cơ biến hóa khó lường.' };
}

module.exports = {
  fortunes,
  rollFortune,
  rollOutcome,
  applyOutcome,
  randomWeighted
};
