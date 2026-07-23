const repo = require('../repositories/playerRepository'); const artProgression = require('./cultivationArtProgressionService');
const { transaction } = require('../db/mysql');
const dataManager = require('../config/dataManager');
const formula = require('../formulas/cultivationFormula');
const cultivationArtRuntime = require('../runtime/cultivationArtRuntime');
const inventoryService = require('./inventoryService');
const itemManager = require('../config/itemManager');
const monsterDropManager = require('../config/monsterDropManager'); const mapEnvironmentRuntime = require('../runtime/mapEnvironmentRuntime');
const combatEffects = require('./combatEffectService');

function ensurePlayer(player) {
  if (!player) {
    const error = new Error('Không tìm thấy đạo hữu.');
    error.statusCode = 404;
    throw error;
  }
}

function selectMonsterSkill(monster, monsterHp) {
  const skills = dataManager.getMonsterSkills(monster) || [];

  if (!skills.length) {
    return null;
  }

  const hpPercent = Math.max(
    0,
    Math.min(
      1,
      Number(monsterHp) /
        Math.max(1, Number(monster.hp || 1))
    )
  );

  const available = skills
    .filter(skill => skill && skill.enabled !== false)
    .filter(
      skill =>
        hpPercent <= Number(skill.unlockHpPercent ?? 1)
    )
    .filter(
      skill =>
        Math.random() < Number(skill.chance ?? 0)
    )
    .sort(
      (a, b) =>
        Number(b.priority || 0) -
        Number(a.priority || 0)
    );

  return available[0] || null;
}

function decorate(player) {
  const realm = dataManager.getRealm(player.main_realm_index);
  const required = formula.expRequired(realm, player.main_layer);

  const spiritualRoot = dataManager.resolvePlayerSpiritualRoot(player);

  return {
    ...player,
    spiritual_root_name: spiritualRoot?.name || 'Vô Danh Linh Căn',
    spiritual_root_grade: spiritualRoot?.grade || 'không rõ',
    spiritual_root_description: spiritualRoot?.description || '',
    spiritual_root_growth: spiritualRoot ? {
      hp: spiritualRoot.growthHp,
      mp: spiritualRoot.growthMp,
      attack: spiritualRoot.growthAttack,
      defense: spiritualRoot.growthDefense
    } : null,
    realm_name: realm?.name || 'Vô Danh Cảnh',
    exp_required: required,
    exp_percent: Math.min(
      100,
      Number((Number(player.main_exp || 0) / required * 100).toFixed(2))
    ),
    potential: player.potential || formula.calcPotential(
      player,
      player.cultivation_art_effects || []
    ),
    power: Number(
      player.combat_power ||
      formula.calcPower(player, player.cultivation_art_effects || [])
    ),
    can_breakthrough: Number(player.main_exp || 0) >= required,
    breakthrough_rate: formula.breakthroughRate(realm),
    unlocked_maps: dataManager.getUnlockedMaps(player)
  };
}

async function profile(id) {
  const playerRow = await repo.findById(id);
  ensurePlayer(playerRow);

  const runtimePlayer = await cultivationArtRuntime.applyToPlayer({ ...playerRow });
  const inventoryData = await repo.inventory(id);
  const inventory = inventoryData.items;
  const bag = inventoryData.bag;
  const logs = await repo.logs(id);
  const player = { ...decorate(runtimePlayer), inventory, bag };
  return { player, inventory, bag, logs };
}

async function byName(name) {
  const player = await repo.findByName(String(name || '').trim());
  ensurePlayer(player);
  return profile(player.id);
}

async function create(name, destiny) {
  if (!destiny) {
    const error = new Error(
      'Chưa hoàn thành khảo nghiệm Thiên Mệnh.'
    );
    error.statusCode = 400;
    throw error;
  }

  const player = await repo.create(name, destiny);
  return profile(player.id);
}

async function setActivity(id, activity) {
  const allowed = ['idle', 'spirit_cultivation', 'combat'];

  if (!allowed.includes(activity)) {
    const error = new Error('Hoạt động không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  const current = await repo.findById(id);
  ensurePlayer(current);

  if (current.current_activity === activity) {
    return profile(id);
  }

  await tick(id);

  await transaction(async connection => {
    const player = await repo.findById(id, connection, true);
    ensurePlayer(player);

    if (player.current_activity === activity) return;

    await connection.query(
      `UPDATE players
       SET current_activity = ?, last_tick_at = NOW(3)
       WHERE id = ?`,
      [activity, id]
    );

    await repo.addLog(
      connection,
      id,
      'system',
      activity === 'idle'
        ? 'Đã thu công, trở về trạng thái tĩnh tọa.'
        : activity === 'combat'
          ? 'Bước vào Chiến Đạo.'
          : 'Trở về động phủ tiến hành Linh Tu.'
    );
  });

  return profile(id);
}

function spawnData(monster) {
  return [monster.id, monster.hp, monster.hp];
}

async function selectMap(id, mapId) {
  await transaction(async connection => {
    const player = await repo.findById(id, connection, true);
    ensurePlayer(player);

    const map = dataManager.getMap(mapId);

    if (!map) {
      const error = new Error('Khu vực không tồn tại.');
      error.statusCode = 404;
      throw error;
    }

    const unlocked = dataManager
      .getUnlockedMaps(player)
      .some(item => Number(item.id) === Number(map.id));

    if (!unlocked) {
      const error = new Error(
        'Cảnh giới chưa đủ để đặt chân tới khu vực này.'
      );
      error.statusCode = 403;
      throw error;
    }

    const monster = dataManager.getRandomMonster(map.id);

    await connection.query(
      `UPDATE player_combat_state
       SET map_id = ?,
           monster_id = ?,
           monster_hp = ?,
           monster_max_hp = ?
       WHERE player_id = ?`,
      [map.id, ...spawnData(monster), id]
    );

    await repo.addLog(
      connection,
      id,
      'combat',
      `Đã tới ${map.name}, gặp ${monster.name}.`
    );
  });

  return profile(id);
}

async function tick(id) {
  await transaction(async connection => {
    const player = await repo.findById(id, connection, true);
    ensurePlayer(player);

    const [timeRows] = await connection.query(
      `SELECT GREATEST(
          0,
          TIMESTAMPDIFF(MICROSECOND, last_tick_at, NOW(3)) / 1000000
        ) AS elapsed
      FROM players
      WHERE id = ?`,
      [id]
    );

    const rawElapsed = Number(timeRows[0]?.elapsed || 0);
    const onlineCap = 300;
    const offlineMinimum = dataManager.getRuleNumber('offline_minimum_seconds', 60);
    const offlineMaximum = dataManager.getRuleNumber('offline_maximum_seconds', 43200);
    const isOffline = rawElapsed >= offlineMinimum;
    const elapsed = Math.min(rawElapsed, isOffline ? offlineMaximum : onlineCap);
    if (elapsed < 0.2) return;

    const runtimePlayer = await cultivationArtRuntime.applyToPlayer(
      { ...player },
      connection
    );

    await resourceRegenTick(connection, runtimePlayer, elapsed);

    if (runtimePlayer.current_activity === 'spirit_cultivation') {
      const cultivationElapsed = isOffline
        ? elapsed * Math.max(0, dataManager.getRuleNumber('offline_cultivation_efficiency', 70)) / 100
        : elapsed;
      await cultivationTick(connection, runtimePlayer, cultivationElapsed);
    }

    if (runtimePlayer.current_activity === 'combat') {
      if (!isOffline || dataManager.getRuleBoolean('offline_combat_enabled', false)) {
        await combatTick(connection, runtimePlayer, elapsed);
      }
    }

    await connection.query(
      'UPDATE players SET last_tick_at = NOW(3) WHERE id = ?',
      [id]
    );
  });

  return profile(id);
}

async function resourceRegenTick(connection, player, elapsed) {
  const maxHp = Math.max(1, Number(player.max_hp || 1));
  const maxMp = Math.max(1, Number(player.max_mp || 1));
  const regenMultiplier = player.current_activity === 'combat' ? 1 : Math.max(0, dataManager.getRuleNumber('out_of_combat_regeneration_multiplier', 2));
  const hpRegen = Math.max(0, Number(player.hp_regen || 0)) * regenMultiplier;
  const mpRegen = Math.max(2, Number(player.mp_regen || 0)) * regenMultiplier;

  const currentHp = Math.max(1, Number(player.current_hp || 1));
  const currentMp = Math.max(0, Number(player.current_mp || 0));
  const nextHp = Math.min(maxHp, currentHp + hpRegen * elapsed);
  const nextMp = Math.min(maxMp, currentMp + mpRegen * elapsed);

  player.current_hp = Math.floor(nextHp);
  player.current_mp = Math.floor(nextMp);

  await connection.query(
    `UPDATE players
     SET current_hp = ?, current_mp = ?
     WHERE id = ?`,
    [player.current_hp, player.current_mp, player.id]
  );
}

async function cultivationTick(connection, player, elapsed) {
  const realm = dataManager.getRealm(player.main_realm_index);
  const required = formula.expRequired(realm, player.main_layer);

  if (Number(player.main_exp) >= required) return;

  const gain = Math.max(
    1,
    Math.floor(elapsed * Number(player.cultivation_rate))
  );

  const next = Math.min(required, Number(player.main_exp) + gain);

  await connection.query(
    `UPDATE player_cultivation
     SET main_exp = ?
     WHERE player_id = ?`,
    [next, player.id]
  );
}

async function combatTick(connection, player, elapsed) {
  let map = dataManager.getMap(player.map_id);

  if (!map) {
    map = dataManager.getUnlockedMaps(player)[0] || null;

    if (!map) {
      await connection.query(
        `UPDATE players
         SET current_activity = 'idle'
         WHERE id = ?`,
        [player.id]
      );

      await repo.addLog(
        connection,
        player.id,
        'combat',
        'Không có khu vực chiến đấu phù hợp, đã tự động thu công.'
      );
      return;
    }

    await connection.query(
      `UPDATE player_combat_state
       SET map_id = ?
       WHERE player_id = ?`,
      [map.id, player.id]
    );
  }

  let monster = dataManager.getMonster(player.monster_id);

  if (!monster) {
    monster = dataManager.getRandomMonster(map.id);

    await connection.query(
      `UPDATE player_combat_state
       SET monster_id = ?,
           monster_hp = ?,
           monster_max_hp = ?
       WHERE player_id = ?`,
      [...spawnData(monster), player.id]
    );
  }

  let monsterHp = Number(player.monster_hp) > 0
    ? Number(player.monster_hp)
    : monster.hp;

  let hp = Number(player.current_hp); let mp = Number(player.current_mp); const environmentResult = await mapEnvironmentRuntime.process({ connection, player, map, elapsed, hp, mp }); hp = environmentResult.hp; mp = environmentResult.mp; const divineContexts = await artProgression.prepareDivineArt(connection, player.id);
  let playerEffects = [];
  let monsterEffects = [];
  const dropSummary = new Map();
  const skillSummary = new Map();
  const rounds = Math.min(30, Math.max(1, Math.floor(elapsed)));

  let wins = 0;
  let stones = 0;
  // Tu Thể và Tu Hồn đã tạm phong ấn khỏi gameplay Đợt 4.
  const bodyExp = 0;
  const soulExp = 0;

  for (let round = 0; round < rounds; round += 1) {
    const playerDot = combatEffects.startTurn(playerEffects, { hp, maxHp: player.max_hp });
    if (playerDot > 0) hp -= playerDot;
    const monsterDot = combatEffects.startTurn(monsterEffects, { hp: monsterHp, maxHp: monster.hp });
    if (monsterDot > 0) monsterHp -= monsterDot;
    const playerMods = combatEffects.modifiers(playerEffects);
    const monsterMods = combatEffects.modifiers(monsterEffects);
    const playerTurnBlocked = combatEffects.blocksTurn(playerEffects);
    const monsterTurnBlocked = combatEffects.blocksTurn(monsterEffects);

    const hitChance = Math.min(
      0.98,
      Math.max(
        0.35,
        Number(player.accuracy) /
          Math.max(1, Number(player.accuracy) + Number(monster.speed || 0) * 5)
      )
    );
	let playerDamage = 0;
    let playerHit = false;
    let critical = false;

    if (!playerTurnBlocked && Math.random() <= hitChance) {
      playerHit = true;

      const effectiveCritRate = Math.max(
          0,
          Number(player.crit_rate || 0) -
            Number(monster.critResistance || monster.crit_resistance || 0)
        );

      critical = Math.random() < effectiveCritRate;

      const effectiveDefense = Math.max(
        0,
        Number(monster.defense || 0) -
          Number(player.armor_penetration || 0)
      );

      playerDamage = Math.max(
        Math.max(0, dataManager.getRuleNumber('minimum_damage', 1)),
        Math.floor(
          Number(player.attack_value || 1) * playerMods.attack *
            (
              critical
                ? Number(player.crit_damage || 1.5)
                : 1
            ) -
          effectiveDefense
        )
      );

      const divineResult = await artProgression.tryUseDivineArt(connection, player, divineContexts, playerDamage, mp, { sealed: combatEffects.blocksSkill(playerEffects) });
      playerDamage = divineResult.damage; mp = divineResult.mp;
      if (divineResult.used) {
        skillSummary.set(divineResult.name, (skillSummary.get(divineResult.name) || 0) + 1);
        const applied = [];
        for (const effect of divineResult.effects || []) { const result = combatEffects.apply(monsterEffects, effect, divineResult.name); if (result) applied.push(result.name); }
        await repo.addLog(connection, player.id, 'combat', `[THẦN THÔNG] ${divineResult.name} tiêu hao ${divineResult.manaCost} Nội Lực, gây thêm ${divineResult.extraDamage} sát thương${applied.length ? ` và áp ${applied.join(', ')}` : ''}.`);
      }
      monsterHp -= playerDamage;
    }

    if (monsterHp <= 0) {
      wins += 1;
      const rolledDrops = monsterDropManager.roll(monster);
      for (const drop of rolledDrops) {
        const added = await inventoryService.addItem(
          connection,
          player.id,
          drop.itemId,
          drop.quantity,
          { source: 'monster', monsterId: String(monster.xmlId || monster.id) }
        );
        const itemDef = itemManager.require(drop.itemId);
        if (added.added > 0) {
          const current = dropSummary.get(drop.itemId) || { name: itemDef.name, quantity: 0 };
          current.quantity += added.added; dropSummary.set(drop.itemId, current);
        }
        if (added.rejected > 0) {
          await repo.addLog(
            connection,
            player.id,
            'item',
            `[TÚI CÀN KHÔN] Không đủ chỗ chứa ${itemDef.name} ×${added.rejected}.`
          );
        }
      }
      stones += dataManager.rollMonsterStones(monster);

      if (Math.random() < 0.12) {
        await repo.addItem(connection, player.id, { id: 'hoi_khi_dan', quantity: 1, metadata: { source: 'combat' } });
      }

      monster = dataManager.getRandomMonster(map.id);
      monsterEffects = [];
	  monsterHp = Number(monster.hp || 1);
      continue;
    }
	
    const dodgeChance = Math.min(
      Math.max(0, dataManager.getRuleNumber('maximum_dodge_rate', 75) / 100),
      Math.max(
        0,
        Number(player.dodge_rate || 0)
      )
    );

    if (!monsterTurnBlocked && Math.random() >= Math.min(0.9, dodgeChance + playerMods.dodge)) {
      const monsterSkill = selectMonsterSkill(
        monster,
        monsterHp
      );

      let monsterAttack = Number(monster.attack || 1);
      let monsterHitRate = 1;

      if (
        monsterSkill &&
        ['damage', 'damage_status'].includes(monsterSkill.type)
      ) {
        monsterAttack =
          monsterAttack * monsterMods.attack *
            Number(monsterSkill.powerMultiplier || 1) +
          Number(monsterSkill.flatDamage || 0);

        monsterHitRate = Math.min(
          1,
          Math.max(
            0,
            Number(monsterSkill.hitRate ?? 1)
          )
        );
      }

      if (Math.random() <= monsterHitRate) {
        const monsterDamage = Math.max(
          1,
          Math.floor(
            monsterAttack -
              Number(player.defense_value || 0) * playerMods.defense
          )
        );

        hp -= monsterDamage;
        if (monsterSkill?.effectId) {
          const applied = combatEffects.apply(playerEffects, { id: monsterSkill.effectId, chancePercent: 25, durationTurns: 2 }, monsterSkill.name);
          if (applied) await repo.addLog(connection, player.id, 'combat', `[YÊU THUẬT] ${monster.name} thi triển ${monsterSkill.name}, gây ${monsterDamage} sát thương và áp ${applied.name}.`);
        } else if (monsterSkill) {
          await repo.addLog(connection, player.id, 'combat', `[YÊU THUẬT] ${monster.name} thi triển ${monsterSkill.name}, gây ${monsterDamage} sát thương.`);
        }
      }
    }

	if (
	  playerHit &&
	  playerDamage > 0 &&
	  Number(player.life_steal || 0) > 0
	) {
	  hp = Math.min(
		Number(player.max_hp),
		hp + Math.floor(
		  playerDamage * Number(player.life_steal)
		)
	  );
	}
	
    playerEffects = combatEffects.endTurn(playerEffects);
    monsterEffects = combatEffects.endTurn(monsterEffects);

    if (hp <= 0) {
      const stoneLossPercent = Math.max(0, dataManager.getRuleNumber('spirit_stone_loss_percent', 0));
      const lost = Math.floor(Number(player.spirit_stones) * stoneLossPercent / 100);
      hp = Math.max(1, Math.floor(Number(player.max_hp) * dataManager.getRuleNumber('respawn_hp_percent', 30) / 100));
      mp = Math.max(0, Math.floor(Number(player.max_mp) * dataManager.getRuleNumber('respawn_mp_percent', 20) / 100));
      const stopCombat = dataManager.getRuleBoolean('stop_auto_combat_on_death', true);

      await connection.query(
        `UPDATE players
         SET current_activity = ?,
             spirit_stones = GREATEST(0, spirit_stones - ?)
         WHERE id = ?`,
        [stopCombat ? 'idle' : player.current_activity, lost, player.id]
      );

      await connection.query(
        `UPDATE player_combat_state
         SET losses = losses + 1
         WHERE player_id = ?`,
        [player.id]
      );

      await repo.addLog(
        connection,
        player.id,
        'combat',
        `Thân tử đạo tiêu, tổn thất ${lost} Linh Thạch; hồi sinh với ${hp} Sinh Mệnh và ${mp} Nội Lực${stopCombat ? ', đã tự rời chiến đấu' : ''}.`
      );

      break;
    }
  }

  if (wins > 0) { const artRewards = await artProgression.grantCombatResources(connection, player.id, wins, 0);
    await connection.query(
      `UPDATE players
       SET spirit_stones = spirit_stones + ?
       WHERE id = ?`,
      [stones, player.id]
    );


    await connection.query(
      `UPDATE player_combat_state
       SET wins = wins + ?
       WHERE player_id = ?`,
      [wins, player.id]
    );

    await repo.addLog(
      connection,
      player.id,
      'combat',
      `Chém hạ ${wins} yêu thú, nhận ${stones} Linh Thạch.`
    );

    await repo.addLog(connection, player.id, 'reward', `[THƯỞNG] Linh Thạch ×${stones}.`);
    if (dropSummary.size) {
      for (const drop of dropSummary.values()) await repo.addLog(connection, player.id, 'item', `[RƠI ĐỒ] ${drop.name} ×${drop.quantity}.`);
    } else {
      await repo.addLog(connection, player.id, 'item', '[RƠI ĐỒ] Không thu được vật phẩm trong lượt chiến đấu này.');
    }
  }

  await connection.query(
    'UPDATE players SET current_hp = ?, current_mp = ? WHERE id = ?',
    [Math.max(1, hp), Math.max(0, mp), player.id]
  );

  await connection.query(
    `UPDATE player_combat_state
     SET monster_id = ?,
         monster_hp = ?,
         monster_max_hp = ?
     WHERE player_id = ?`,
    [
      monster.id,
      Math.max(1, monsterHp),
      monster.hp,
      player.id
    ]
  );
}

async function breakthrough(id) {
  await tick(id);

  await transaction(async connection => {
    const player = await repo.findById(id, connection, true);
    ensurePlayer(player);

    const realm = dataManager.getRealm(player.main_realm_index);

    if (!realm) {
      throw new Error('Cảnh giới hiện tại không tồn tại trong đạo tàng.');
    }

    const required = formula.expRequired(realm, player.main_layer);

    if (Number(player.main_exp) < required) {
      const error = new Error('Tu vi chưa viên mãn.');
      error.statusCode = 400;
      throw error;
    }

    if (Number(player.main_layer) < Number(realm.maxLayer)) {
      const nextLayer = Number(player.main_layer) + 1;

      await connection.query(
        `UPDATE player_cultivation
         SET main_layer = ?,
             main_exp = 0
         WHERE player_id = ?`,
        [nextLayer, id]
      );

      await repo.addLog(
        connection,
        id,
        'cultivation',
        `Phá cảnh thành công, đạt ${realm.name} tầng ${nextLayer}.`
      );

      return;
    }

    const nextRealm = dataManager.getRealm(
      Number(player.main_realm_index) + 1
    );

    if (!nextRealm) {
      const error = new Error('Đã đứng tại đỉnh Nhân Giới.');
      error.statusCode = 400;
      throw error;
    }

    const success = Math.random() < formula.breakthroughRate(realm);

    if (success) {
      await connection.query(
        `UPDATE player_cultivation
         SET main_realm_index = ?,
             main_layer = 1,
             main_exp = 0
         WHERE player_id = ?`,
        [nextRealm.index, id]
      );

      /*
       * Phá đại cảnh giới chỉ tăng bốn chỉ số căn bản.
       * Linh Căn quyết định chỉ số nào được tăng mạnh hơn.
       */
      const growth = dataManager.getRealmGrowth(player.spiritual_root, {
        hp: 80,
        mp: 30,
        attack: 18,
        defense: 8
      });

      await connection.query(
        `UPDATE player_attributes
         SET max_hp = max_hp + ?,
             max_mp = max_mp + ?,
             attack_value = attack_value + ?,
             defense_value = defense_value + ?
         WHERE player_id = ?`,
        [growth.hp, growth.mp, growth.attack, growth.defense, id]
      );

      await connection.query(
        `UPDATE players AS p
         JOIN player_attributes AS a ON a.player_id = p.id
         SET p.current_hp = a.max_hp,
             p.current_mp = a.max_mp
         WHERE p.id = ?`,
        [id]
      );

      await repo.addLog(
        connection,
        id,
        'cultivation',
        `Thiên kiếp tan biến, chính thức bước vào ${nextRealm.name}.`
      );
    } else {
      await connection.query(
        `UPDATE player_cultivation
         SET main_exp = FLOOR(main_exp * 0.8)
         WHERE player_id = ?`,
        [id]
      );

      await repo.addLog(
        connection,
        id,
        'cultivation',
        'Đột phá thất bại, căn cơ chấn động và tổn thất 20% tu vi hiện tại.'
      );
    }
  });

  return profile(id);
}

async function useItem(id, itemId) {
  const inventoryData = await repo.inventory(id);
  const target = inventoryData.items.find(item => item.item_id === String(itemId));
  if (!target) {
    const error = new Error('Vật phẩm không tồn tại trong Túi Càn Khôn.');
    error.statusCode = 404;
    throw error;
  }
  return useInventorySlot(id, target.id);
}

async function useInventorySlot(id, inventoryId) {
  await transaction(async connection => {
    const player = await repo.findById(id, connection, true);
    ensurePlayer(player);

    const [rows] = await connection.query(
      `SELECT id, item_id, quantity
       FROM player_inventory
       WHERE player_id = ? AND id = ? AND quantity > 0
       FOR UPDATE`,
      [id, inventoryId]
    );
    const row = rows[0];
    if (!row) {
      const error = new Error('Ô vật phẩm không tồn tại.');
      error.statusCode = 404;
      throw error;
    }

    const definition = itemManager.require(row.item_id);
    if (!definition.usable || !definition.useEffect) {
      const error = new Error('Vật phẩm này chưa thể sử dụng.');
      error.statusCode = 400;
      throw error;
    }

    const effect = definition.useEffect;
    if (effect.type === 'restore_hp') {
      await connection.query(
        'UPDATE players SET current_hp = LEAST(?, current_hp + ?) WHERE id = ?',
        [player.max_hp, effect.amount, id]
      );
    } else if (effect.type === 'expand_bag') {
      const expansion = await inventoryService.expandBag(
        connection,
        id,
        effect.slots,
        effect.itemMaximumSlots
      );
      await repo.addLog(
        connection,
        id,
        'item',
        `Dùng ${definition.name}, Túi Càn Khôn mở từ ${expansion.before} lên ${expansion.after} ô.`
      );
    } else {
      const error = new Error('Hiệu quả vật phẩm chưa được hỗ trợ.');
      error.statusCode = 400;
      throw error;
    }

    await inventoryService.removeItem(connection, id, row.id, 1);
    await repo.addLog(connection, id, 'item', `Đã sử dụng ${definition.name}.`);
  });
  return profile(id);
}

module.exports = { profile,
  byName,
  create,
  setActivity,
  selectMap,
  tick,
  breakthrough,
  useItem, useInventorySlot };
