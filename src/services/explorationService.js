const crypto = require('crypto');
const dataManager = require('../config/dataManager');
const explorationManager = require('../config/explorationManager');
const repo = require('../repositories/playerRepository');
const { transaction } = require('../db/mysql');

function ensurePlayer(player) {
  if (!player) {
    const error = new Error('Không tìm thấy đạo hữu.');
    error.statusCode = 404;
    throw error;
  }
}

function publicEvent(event, token) {
  return {
    token,
    id: event.id,
    name: event.name,
    prompt: event.prompt,
    choices: event.choices.map(choice => ({ id: choice.id, text: choice.text }))
  };
}

async function setCombatMonster(connection, playerId, mapId, monster) {
  await connection.query(
    `UPDATE player_combat_state
     SET map_id = ?, monster_id = ?, monster_hp = ?, monster_max_hp = ?
     WHERE player_id = ?`,
    [mapId, monster.id, monster.hp, monster.hp, playerId]
  );
}

async function mapInfo(id) {
  const player = await repo.findById(id);
  ensurePlayer(player);
  const maps = dataManager.getUnlockedMaps(player).map(map => ({
    id: map.id,
    xmlId: map.xmlId,
    name: map.name,
    realmRequired: map.realmRequired,
    layerRequired: map.layerRequired,
    description: map.description || '',
    environment: map.environment || '',
    preparation: map.preparation || ''
  }));
  return { maps };
}

async function encounter(id) {
  return transaction(async connection => {
    const player = await repo.findById(id, connection, true);
    ensurePlayer(player);

    const [pendingRows] = await connection.query(
      `SELECT token, event_id
       FROM player_pending_events
       WHERE player_id = ? AND resolved_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [id]
    );
    if (pendingRows.length) {
      const event = explorationManager.event(pendingRows[0].event_id);
      return { kind: 'pending_event', event: publicEvent(event, pendingRows[0].token) };
    }

    const map = dataManager.getMap(player.map_id) || dataManager.getUnlockedMaps(player)[0];
    if (!map) throw new Error('Không có khu vực lịch luyện phù hợp.');

    const roll = Math.random() * 100;

    if (roll < 60) {
      const monster = dataManager.getRandomMonster(map.id);
      await setCombatMonster(connection, id, map.id, monster);
      await repo.addLog(connection, id, 'combat', `Tại ${map.name}, ngươi chạm trán ${monster.name}.`);
      return {
        kind: 'monster',
        map: { id: map.id, name: map.name },
        monster: { id: monster.id, name: monster.name, realm: `Cấp ${monster.level}` }
      };
    }

    if (roll < 76) {
      const resource = explorationManager.randomResource(map.focusResourceId);
      await repo.addItem(connection, id, {
        id: resource.id,
        name: resource.name,
        type: resource.type,
        quantity: resource.quantity,
        metadata: { sourceMap: map.xmlId }
      });
      await repo.addLog(connection, id, 'adventure', `Tại ${map.name}, thu được ${resource.quantity} ${resource.name}.`);
      return { kind: 'resource', resource };
    }

    if (roll < 86) {
      const npc = explorationManager.randomNpc();
      await repo.addLog(connection, id, 'adventure', `Tại ${map.name}, ngươi gặp ${npc.name}.`);
      return {
        kind: 'npc',
        npc: { id: npc.id, name: npc.name, description: npc.description, behavior: npc.behavior }
      };
    }

    if (roll < 98.5) {
      const event = explorationManager.randomEvent();
      const token = crypto.randomBytes(20).toString('hex');
      await connection.query(
        `INSERT INTO player_pending_events(player_id, token, event_id, map_id)
         VALUES(?,?,?,?)`,
        [id, token, event.id, map.id]
      );
      await repo.addLog(connection, id, 'adventure', `Kỳ ngộ xuất hiện: ${event.name}.`);
      return { kind: 'event', event: publicEvent(event, token) };
    }

    const bossCandidates = map.monsterRefs
      .map(ref => dataManager.getMonster(ref.monsterId))
      .filter(monster => monster && monster.rank === 'boss');
    const bossMonster = bossCandidates[0] || dataManager.getRandomMonster(map.id);
    await setCombatMonster(connection, id, map.id, bossMonster);
    await repo.addLog(connection, id, 'combat', `Hung uy giáng xuống: ${bossMonster.name} đã xuất hiện tại ${map.name}.`);
    return {
      kind: 'boss',
      map: { id: map.id, name: map.name },
      monster: { id: bossMonster.id, name: bossMonster.name, realm: `Cấp ${bossMonster.level}` }
    };
  });
}

async function choose(id, token, choiceId) {
  return transaction(async connection => {
    const player = await repo.findById(id, connection, true);
    ensurePlayer(player);

    const [rows] = await connection.query(
      `SELECT id, event_id, map_id
       FROM player_pending_events
       WHERE player_id = ? AND token = ? AND resolved_at IS NULL
       LIMIT 1 FOR UPDATE`,
      [id, token]
    );
    const pending = rows[0];
    if (!pending) {
      const error = new Error('Kỳ ngộ đã biến mất hoặc đã được xử lý.');
      error.statusCode = 409;
      throw error;
    }

    const outcome = explorationManager.resolveChoice(pending.event_id, choiceId);
    const result = { type: outcome.type, message: outcome.message };

    if (outcome.type === 'stones') {
      await connection.query(
        'UPDATE players SET spirit_stones = spirit_stones + ? WHERE id = ?',
        [Math.max(0, outcome.amount), id]
      );
      result.amount = outcome.amount;
    } else if (outcome.type === 'cultivation') {
      await connection.query(
        'UPDATE player_cultivation SET main_exp = main_exp + ? WHERE player_id = ?',
        [Math.max(0, outcome.amount), id]
      );
      result.amount = outcome.amount;
    } else if (outcome.type === 'resource') {
      const resource = explorationManager.resources.get(outcome.resourceId);
      if (resource) {
        const quantity = Math.max(1, outcome.quantity || 1);
        await repo.addItem(connection, id, {
          id: resource.id,
          name: resource.name,
          type: resource.type,
          quantity,
          metadata: { source: 'random_event' }
        });
        result.resource = { id: resource.id, name: resource.name, quantity };
      }
    } else if (outcome.type === 'injury') {
      const nextHp = Math.max(1, Math.floor(Number(player.max_hp || 1) * 0.15));
      await connection.query(
        `UPDATE players
         SET current_hp = ?, current_activity = 'idle'
         WHERE id = ?`,
        [nextHp, id]
      );
      result.currentHp = nextHp;
    } else if (outcome.type === 'secret_boss') {
      const boss = explorationManager.boss(outcome.bossId);
      const monster = boss ? dataManager.getMonster(boss.monsterId) : null;
      const map = boss ? dataManager.getMap(boss.mapId) : null;
      if (boss && monster && map) {
        await setCombatMonster(connection, id, map.id, monster);
        result.boss = { id: boss.id, name: boss.name, monsterName: monster.name, mapName: map.name };
      }
    } else if (outcome.type === 'npc') {
      const npc = explorationManager.npcs.get(outcome.npcId);
      if (npc) result.npc = { id: npc.id, name: npc.name, description: npc.description };
    }

    await connection.query(
      `UPDATE player_pending_events
       SET choice_id = ?, outcome_type = ?, outcome_payload = ?, resolved_at = NOW(3)
       WHERE id = ?`,
      [choiceId, outcome.type, JSON.stringify(result), pending.id]
    );
    await repo.addLog(connection, id, 'adventure', outcome.message);
    return { result };
  });
}

async function worldBossStatus() {
  const boss = explorationManager.worldBoss();
  if (!boss) return { boss: null };

  return transaction(async connection => {
    const [rows] = await connection.query(
      `SELECT boss_id, alive, spawned_at, defeated_at, next_spawn_at
       FROM world_boss_state WHERE boss_id = ? LIMIT 1 FOR UPDATE`,
      [boss.id]
    );

    let state = rows[0];
    if (!state) {
      await connection.query(
        `INSERT INTO world_boss_state(boss_id, alive, spawned_at, next_spawn_at)
         VALUES(?,1,NOW(3),DATE_ADD(NOW(3), INTERVAL ? HOUR))`,
        [boss.id, boss.respawnHours]
      );
      state = { boss_id: boss.id, alive: 1, spawned_at: new Date(), defeated_at: null, next_spawn_at: null };
    } else if (!state.alive && state.next_spawn_at && new Date(state.next_spawn_at) <= new Date()) {
      await connection.query(
        `UPDATE world_boss_state
         SET alive = 1, spawned_at = NOW(3), defeated_at = NULL,
             next_spawn_at = DATE_ADD(NOW(3), INTERVAL ? HOUR)
         WHERE boss_id = ?`,
        [boss.respawnHours, boss.id]
      );
      state.alive = 1;
      state.spawned_at = new Date();
      state.defeated_at = null;
    }

    const map = dataManager.getMap(boss.mapId);
    const monster = dataManager.getMonster(boss.monsterId);
    return {
      boss: {
        id: boss.id,
        name: boss.name,
        alive: Boolean(state.alive),
        spawnedAt: state.spawned_at,
        defeatedAt: state.defeated_at,
        nextSpawnAt: state.next_spawn_at,
        map: map ? { id: map.id, name: map.name } : null,
        monster: monster ? { id: monster.id, name: monster.name, realm: `Cấp ${monster.level}` } : null
      }
    };
  });
}

async function challengeWorldBoss(id) {
  return transaction(async connection => {
    const player = await repo.findById(id, connection, true);
    ensurePlayer(player);
    const boss = explorationManager.worldBoss();
    if (!boss) throw new Error('Nhân Giới chưa có Thế Giới Boss.');

    const [rows] = await connection.query(
      'SELECT alive FROM world_boss_state WHERE boss_id = ? LIMIT 1 FOR UPDATE',
      [boss.id]
    );
    if (!rows[0]?.alive) {
      const error = new Error('Thế Giới Boss chưa hồi sinh.');
      error.statusCode = 409;
      throw error;
    }

    const map = dataManager.getMap(boss.mapId);
    const monster = dataManager.getMonster(boss.monsterId);
    if (!map || !monster) throw new Error('Cấu hình Thế Giới Boss không hợp lệ.');

    await setCombatMonster(connection, id, map.id, monster);
    await connection.query(
      `UPDATE players SET current_activity = 'combat' WHERE id = ?`,
      [id]
    );
    await repo.addLog(connection, id, 'combat', `Thiên địa chấn động: ngươi đã khiêu chiến ${boss.name}.`);

    return {
      boss: { id: boss.id, name: boss.name },
      map: { id: map.id, name: map.name },
      monster: { id: monster.id, name: monster.name, maxHp: monster.hp }
    };
  });
}

module.exports = {
  mapInfo,
  encounter,
  choose,
  worldBossStatus,
  challengeWorldBoss
};
