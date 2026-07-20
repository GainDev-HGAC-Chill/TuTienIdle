const repo = require('../repositories/playerRepository');
const { transaction } = require('../db/mysql');
const dataManager = require('../config/dataManager');
const formula = require('../formulas/cultivationFormula');

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

  const spiritualRoot = dataManager.getSpiritualRoot(player.spiritual_root);

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
    power: formula.calcPower(player),
    can_breakthrough: Number(player.main_exp || 0) >= required,
    breakthrough_rate: formula.breakthroughRate(realm),
    unlocked_maps: dataManager.getUnlockedMaps(player)
  };
}

async function profile(id) {
  const playerRow = await repo.findById(id);
  ensurePlayer(playerRow);

  const inventory = await repo.inventory(id);
  const logs = await repo.logs(id);

  const player = {
    ...decorate(playerRow),
    inventory
  };

  return { player, inventory, logs };
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
      `SELECT LEAST(
          300,
          GREATEST(
            0,
            TIMESTAMPDIFF(MICROSECOND, last_tick_at, NOW(3)) / 1000000
          )
        ) AS elapsed
       FROM players
       WHERE id = ?`,
      [id]
    );

    const elapsed = Number(timeRows[0]?.elapsed || 0);
    if (elapsed < 0.2) return;

    if (player.current_activity === 'spirit_cultivation') {
      await cultivationTick(connection, player, elapsed);
    }

    if (player.current_activity === 'combat') {
      await combatTick(connection, player, elapsed);
    }

    await connection.query(
      'UPDATE players SET last_tick_at = NOW(3) WHERE id = ?',
      [id]
    );
  });

  return profile(id);
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

  let hp = Number(player.current_hp);
  const rounds = Math.min(30, Math.max(1, Math.floor(elapsed)));

  let wins = 0;
  let stones = 0;
  let bodyExp = 0;
  let soulExp = 0;

  for (let round = 0; round < rounds; round += 1) {
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

    if (Math.random() <= hitChance) {
      playerHit = true;

      const effectiveCritRate = Math.max(
        0,
        Number(player.crit_rate || 0) -
          Number(player.crit_resistance || 0)
      );

      critical = Math.random() < effectiveCritRate;

      const effectiveDefense = Math.max(
        0,
        Number(monster.defense || 0) -
          Number(player.armor_penetration || 0)
      );

      playerDamage = Math.max(
        1,
        Math.floor(
          Number(player.attack_value || 1) *
            (
              critical
                ? Number(player.crit_damage || 1.5)
                : 1
            ) -
          effectiveDefense
        )
      );

      monsterHp -= playerDamage;
    }

    if (monsterHp <= 0) {
      wins += 1;
      stones += dataManager.rollMonsterStones(monster);
		bodyExp += Number(monster.bodyExp || 0);
		soulExp += Number(monster.soulExp || 0);
      if (Math.random() < 0.12) {
        await repo.addItem(connection, player.id, {
          id: 'hoi_khi_dan',
          name: 'Hồi Khí Đan',
          type: 'pill',
          quantity: 1,
          metadata: {
            effect: 'Khôi phục 25 sinh lực'
          }
        });
      }

      monster = dataManager.getRandomMonster(map.id);
	  monsterHp = Number(monster.hp || 1);
      continue;
    }
	
    const dodgeChance = Math.min(
      0.75,
      Math.max(
        0,
        Number(player.dodge_rate || 0)
      )
    );

    if (Math.random() >= dodgeChance) {
      const monsterSkill = selectMonsterSkill(
        monster,
        monsterHp
      );

      let monsterAttack = Number(monster.attack || 1);
      let monsterHitRate = 1;

      if (
        monsterSkill &&
        monsterSkill.type === 'damage'
      ) {
        monsterAttack =
          monsterAttack *
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
              Number(player.defense_value || 0)
          )
        );

        hp -= monsterDamage;
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
	
    if (hp <= 0) {
      const lost = Math.floor(Number(player.spirit_stones) * 0.01);
      hp = Number(player.max_hp);

      await connection.query(
        `UPDATE players
         SET current_activity = 'idle',
             spirit_stones = GREATEST(0, spirit_stones - ?)
         WHERE id = ?`,
        [lost, player.id]
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
        `Thân tử đạo tiêu, tổn thất ${lost} Linh Thạch và đã tự rời chiến đấu.`
      );

      break;
    }
  }

  if (wins > 0) {
    await connection.query(
      `UPDATE players
       SET spirit_stones = spirit_stones + ?
       WHERE id = ?`,
      [stones, player.id]
    );

    await connection.query(
      `UPDATE player_cultivation
       SET body_exp = body_exp + ?,
           soul_exp = soul_exp + ?
       WHERE player_id = ?`,
      [bodyExp, soulExp, player.id]
    );

    await connection.query(
      `UPDATE player_combat_state
       SET wins = wins + ?
       WHERE player_id = ?`,
      [wins, player.id]
    );

    await repo.addItem(connection, player.id, {
      id: 'linh_thach',
      name: 'Linh Thạch',
      type: 'currency',
      quantity: stones
    });

    await repo.addLog(
      connection,
      player.id,
      'combat',
      `Chém hạ ${wins} yêu thú, nhận ${stones} Linh Thạch, ` +
      `${bodyExp} Luyện Thể và ${soulExp} Luyện Hồn.`
    );
  }

  await connection.query(
    'UPDATE players SET current_hp = ? WHERE id = ?',
    [Math.max(1, hp), player.id]
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
  await transaction(async connection => {
    const player = await repo.findById(id, connection, true);
    ensurePlayer(player);

    const [rows] = await connection.query(
      `SELECT *
       FROM player_inventory
       WHERE player_id = ?
         AND item_id = ?
         AND quantity > 0
       FOR UPDATE`,
      [id, itemId]
    );

    const item = rows[0];

    if (!item) {
      const error = new Error('Vật phẩm không tồn tại.');
      error.statusCode = 404;
      throw error;
    }

    if (itemId === 'hoi_khi_dan') {
      await connection.query(
        `UPDATE players
         SET current_hp = LEAST(?, current_hp + 25)
         WHERE id = ?`,
        [player.max_hp, id]
      );
    } else {
      const error = new Error('Vật phẩm này chưa thể sử dụng.');
      error.statusCode = 400;
      throw error;
    }

    await connection.query(
      `UPDATE player_inventory
       SET quantity = quantity - 1
       WHERE id = ?`,
      [item.id]
    );

    await connection.query(
      `DELETE FROM player_inventory
       WHERE id = ?
         AND quantity <= 0`,
      [item.id]
    );

    await repo.addLog(
      connection,
      id,
      'item',
      `Đã sử dụng ${item.item_name}.`
    );
  });

  return profile(id);
}

module.exports = {
  profile,
  byName,
  create,
  setActivity,
  selectMap,
  tick,
  breakthrough,
  useItem
};
