const manager = require('../config/mapEnvironmentManager');
const inventoryService = require('../services/inventoryService');
const itemManager = require('../config/itemManager');

function randomBetween(min, max) {
  const lower = Number(min || 0);
  const upper = Math.max(lower, Number(max ?? lower));
  return lower + Math.random() * (upper - lower);
}

function randomInteger(min, max) {
  return Math.floor(randomBetween(min, max) + 1e-9);
}

function activationChance(chancePerMinute, elapsedSeconds) {
  const minuteChance = Math.max(
    0,
    Math.min(1, Number(chancePerMinute || 0) / 100)
  );

  const elapsed = Math.max(
    0,
    Math.min(300, Number(elapsedSeconds || 0))
  );

  if (minuteChance <= 0 || elapsed <= 0) return 0;
  if (minuteChance >= 1) return 1;

  return 1 - Math.pow(1 - minuteChance, elapsed / 60);
}

async function ensureCooldownTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS player_map_hazard_cooldowns (
      player_id BIGINT UNSIGNED NOT NULL,
      hazard_id VARCHAR(96) NOT NULL,
      next_available_at DATETIME(3) NOT NULL,
      triggered_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
      last_triggered_at DATETIME(3) NULL,
      PRIMARY KEY (player_id, hazard_id),
      INDEX idx_hazard_next_available (next_available_at),
      CONSTRAINT fk_hazard_cooldown_player
        FOREIGN KEY (player_id) REFERENCES players(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
  `);
}

async function isCoolingDown(connection, playerId, hazardId) {
  const [rows] = await connection.query(
    `SELECT next_available_at > NOW(3) AS cooling
       FROM player_map_hazard_cooldowns
      WHERE player_id = ? AND hazard_id = ?
      LIMIT 1`,
    [playerId, hazardId]
  );

  return Boolean(Number(rows[0]?.cooling || 0));
}

async function setCooldown(
  connection,
  playerId,
  hazardId,
  cooldownSeconds
) {
  await connection.query(
    `INSERT INTO player_map_hazard_cooldowns(
       player_id,
       hazard_id,
       next_available_at,
       triggered_count,
       last_triggered_at
     )
     VALUES(
       ?,
       ?,
       DATE_ADD(NOW(3), INTERVAL ? SECOND),
       1,
       NOW(3)
     )
     ON DUPLICATE KEY UPDATE
       next_available_at = VALUES(next_available_at),
       triggered_count = triggered_count + 1,
       last_triggered_at = NOW(3)`,
    [
      playerId,
      hazardId,
      Math.max(0, Math.floor(Number(cooldownSeconds || 0)))
    ]
  );
}

function replaceTokens(template, values) {
  return String(template || '').replace(
    /\{([a-zA-Z0-9_]+)\}/g,
    (_match, key) => values[key] ?? 0
  );
}

async function applyEffect(
  connection,
  player,
  state,
  effect,
  tokens
) {
  switch (effect.type) {
    case 'damage_max_hp_percent': {
      const percent = randomBetween(effect.min, effect.max);
      const damage = Math.max(
        1,
        Math.floor(Number(player.max_hp || 1) * percent / 100)
      );

      const minimumHp = effect.cannotKill ? 1 : 0;
      const before = state.hp;
      state.hp = Math.max(minimumHp, state.hp - damage);
      const actual = Math.max(0, before - state.hp);

      tokens.value = actual;
      tokens.hpDamage = (tokens.hpDamage || 0) + actual;
      break;
    }

    case 'drain_mp_percent': {
      const percent = randomBetween(effect.min, effect.max);
      const drain = Math.max(
        1,
        Math.floor(Number(player.max_mp || 0) * percent / 100)
      );

      const before = state.mp;
      state.mp = Math.max(0, state.mp - drain);
      const actual = Math.max(0, before - state.mp);

      tokens.value = actual;
      tokens.mpDamage = (tokens.mpDamage || 0) + actual;
      break;
    }

    case 'restore_hp_percent': {
      const percent = randomBetween(effect.min, effect.max);
      const restore = Math.max(
        1,
        Math.floor(Number(player.max_hp || 1) * percent / 100)
      );

      const before = state.hp;
      state.hp = Math.min(Number(player.max_hp || 1), state.hp + restore);
      const actual = Math.max(0, state.hp - before);

      tokens.value = actual;
      tokens.hpRestore = (tokens.hpRestore || 0) + actual;
      break;
    }

    case 'restore_mp_percent': {
      const percent = randomBetween(effect.min, effect.max);
      const restore = Math.max(
        1,
        Math.floor(Number(player.max_mp || 0) * percent / 100)
      );

      const before = state.mp;
      state.mp = Math.min(Number(player.max_mp || 0), state.mp + restore);
      const actual = Math.max(0, state.mp - before);

      tokens.value = actual;
      tokens.mpRestore = (tokens.mpRestore || 0) + actual;
      break;
    }

    case 'grant_experience': {
      const amount = Math.max(
        0,
        randomInteger(effect.min, effect.max)
      );

      if (effect.path === 'body') {
        await connection.query(
          `UPDATE player_cultivation
              SET body_exp = body_exp + ?
            WHERE player_id = ?`,
          [amount, player.id]
        );
        tokens.bodyExp = (tokens.bodyExp || 0) + amount;
      } else if (effect.path === 'soul') {
        await connection.query(
          `UPDATE player_cultivation
              SET soul_exp = soul_exp + ?
            WHERE player_id = ?`,
          [amount, player.id]
        );
        tokens.soulExp = (tokens.soulExp || 0) + amount;
      } else if (effect.path === 'main') {
        await connection.query(
          `UPDATE player_cultivation
              SET main_exp = main_exp + ?
            WHERE player_id = ?`,
          [amount, player.id]
        );
        tokens.mainExp = (tokens.mainExp || 0) + amount;
      }
      tokens.value = amount;
      break;
    }

    case 'grant_item': {
      const quantity = Math.max(
        1,
        randomInteger(effect.min, effect.max)
      );

      const definition = itemManager.require(effect.itemId);
      const result = await inventoryService.addItem(
        connection,
        player.id,
        effect.itemId,
        quantity,
        {
          source: 'map_environment',
          mapId: String(state.map.xmlId || state.map.id),
          hazardId: state.hazard.id
        }
      );

      const accepted = Math.max(0, quantity - Number(result.rejected || 0));

      tokens.itemName = definition.name;
      tokens.quantity = accepted;
      tokens.value = accepted;

      if (result.rejected > 0) {
        await connection.query(
          `INSERT INTO player_logs(player_id, category, message)
           VALUES(?, 'item', ?)`,
          [
            player.id,
            `[TÚI CÀN KHÔN] Không đủ chỗ chứa ` +
            `${definition.name} ×${result.rejected}.`
          ]
        );
      }
      break;
    }

    case 'lose_currency_percent': {
      if (effect.currencyId !== 'linh_thach') break;

      const percent = randomBetween(effect.min, effect.max);
      let loss = Math.floor(
        Number(player.spirit_stones || 0) * percent / 100
      );

      if (effect.maximum > 0) {
        loss = Math.min(loss, effect.maximum);
      }

      loss = Math.max(0, loss);

      if (loss > 0) {
        await connection.query(
          `UPDATE players
              SET spirit_stones = GREATEST(0, spirit_stones - ?)
            WHERE id = ?`,
          [loss, player.id]
        );
      }

      tokens.currencyLoss = (tokens.currencyLoss || 0) + loss;
      tokens.value = loss;
      break;
    }

    default:
      throw new Error(
        `Thiên Tượng chưa hỗ trợ Effect type="${effect.type}".`
      );
  }
}

async function process({
  connection,
  player,
  map,
  elapsed,
  hp,
  mp
}) {
  const environment = manager.getByMapId(
    map?.xmlId || map?.id
  );

  const state = {
    map,
    hp: Number(hp),
    mp: Number(mp),
    triggered: []
  };

  if (!environment) return state;

  await ensureCooldownTable(connection);

  for (const hazard of environment.hazards) {
    if (
      hazard.triggerActivity &&
      hazard.triggerActivity !== player.current_activity
    ) {
      continue;
    }

    if (
      await isCoolingDown(
        connection,
        player.id,
        hazard.id
      )
    ) {
      continue;
    }

    const chance = activationChance(
      hazard.chancePerMinute,
      elapsed
    );

    if (Math.random() >= chance) {
      continue;
    }

    state.hazard = hazard;
    const tokens = {};

    for (const effect of hazard.effects) {
      await applyEffect(
        connection,
        player,
        state,
        effect,
        tokens
      );
    }

    await setCooldown(
      connection,
      player.id,
      hazard.id,
      hazard.cooldownSeconds
    );

    const message = replaceTokens(
      hazard.logTemplate,
      tokens
    );

    await connection.query(
      `INSERT INTO player_logs(player_id, category, message)
       VALUES(?, 'environment', ?)`,
      [
        player.id,
        `[${environment.name}] ${message}`
      ]
    );

    state.triggered.push({
      environmentId: environment.id,
      hazardId: hazard.id,
      name: hazard.name,
      message,
      values: tokens
    });
  }

  delete state.hazard;
  return state;
}

module.exports = {
  process,
  activationChance
};
