const EXPECTED_COLUMNS = {
  players: [
    {
      name: 'world_id',
      sql: "ALTER TABLE players ADD COLUMN world_id VARCHAR(32) NOT NULL DEFAULT 'nhan_gioi' AFTER name"
    },
    {
      name: 'spiritual_root',
      sql: "ALTER TABLE players ADD COLUMN spiritual_root VARCHAR(32) NOT NULL DEFAULT 'ngu_hanh_tap_linh_can' AFTER world_id"
    },
    {
      name: 'spirit_stones',
      sql: 'ALTER TABLE players ADD COLUMN spirit_stones BIGINT NOT NULL DEFAULT 100 AFTER spiritual_root'
    },
    {
      name: 'current_hp',
      sql: 'ALTER TABLE players ADD COLUMN current_hp BIGINT NOT NULL DEFAULT 100 AFTER spirit_stones'
    },
    {
      name: 'current_mp',
      sql: 'ALTER TABLE players ADD COLUMN current_mp BIGINT NOT NULL DEFAULT 50 AFTER current_hp'
    },
    {
      name: 'current_activity',
      sql: "ALTER TABLE players ADD COLUMN current_activity ENUM('idle','spirit_cultivation','combat') NOT NULL DEFAULT 'idle' AFTER current_mp"
    },
    {
      name: 'last_tick_at',
      sql: 'ALTER TABLE players ADD COLUMN last_tick_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER current_activity'
    },
    {
      name: 'created_at',
      sql: 'ALTER TABLE players ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP'
    },
    {
      name: 'updated_at',
      sql: 'ALTER TABLE players ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    }
  ],

  player_cultivation: [
    {
      name: 'main_realm_index',
      sql: 'ALTER TABLE player_cultivation ADD COLUMN main_realm_index INT NOT NULL DEFAULT 0 AFTER player_id'
    },
    {
      name: 'main_layer',
      sql: 'ALTER TABLE player_cultivation ADD COLUMN main_layer INT NOT NULL DEFAULT 1 AFTER main_realm_index'
    },
    {
      name: 'main_exp',
      sql: 'ALTER TABLE player_cultivation ADD COLUMN main_exp BIGINT NOT NULL DEFAULT 0 AFTER main_layer'
    },
    {
      name: 'body_realm_index',
      sql: 'ALTER TABLE player_cultivation ADD COLUMN body_realm_index INT NOT NULL DEFAULT 0 AFTER main_exp'
    },
    {
      name: 'body_layer',
      sql: 'ALTER TABLE player_cultivation ADD COLUMN body_layer INT NOT NULL DEFAULT 1 AFTER body_realm_index'
    },
    {
      name: 'body_exp',
      sql: 'ALTER TABLE player_cultivation ADD COLUMN body_exp BIGINT NOT NULL DEFAULT 0 AFTER body_layer'
    },
    {
      name: 'soul_realm_index',
      sql: 'ALTER TABLE player_cultivation ADD COLUMN soul_realm_index INT NOT NULL DEFAULT 0 AFTER body_exp'
    },
    {
      name: 'soul_layer',
      sql: 'ALTER TABLE player_cultivation ADD COLUMN soul_layer INT NOT NULL DEFAULT 1 AFTER soul_realm_index'
    },
    {
      name: 'soul_exp',
      sql: 'ALTER TABLE player_cultivation ADD COLUMN soul_exp BIGINT NOT NULL DEFAULT 0 AFTER soul_layer'
    }
  ],

  player_attributes: [
    {
      name: 'max_hp',
      sql: 'ALTER TABLE player_attributes ADD COLUMN max_hp BIGINT NOT NULL DEFAULT 100 AFTER player_id'
    },
    {
      name: 'max_mp',
      sql: 'ALTER TABLE player_attributes ADD COLUMN max_mp BIGINT NOT NULL DEFAULT 50 AFTER max_hp'
    },
    {
      name: 'attack_value',
      sql: 'ALTER TABLE player_attributes ADD COLUMN attack_value BIGINT NOT NULL DEFAULT 12 AFTER max_mp'
    },
    {
      name: 'defense_value',
      sql: 'ALTER TABLE player_attributes ADD COLUMN defense_value BIGINT NOT NULL DEFAULT 5 AFTER attack_value'
    },
    {
      name: 'crit_rate',
      sql: 'ALTER TABLE player_attributes ADD COLUMN crit_rate DECIMAL(6,4) NOT NULL DEFAULT 0.0500 AFTER defense_value'
    },
    {
      name: 'cultivation_rate',
      sql: 'ALTER TABLE player_attributes ADD COLUMN cultivation_rate DECIMAL(10,4) NOT NULL DEFAULT 2.0000 AFTER crit_rate'
    }
  ],

  player_combat_state: [
    {
      name: 'map_id',
      sql: 'ALTER TABLE player_combat_state ADD COLUMN map_id INT NOT NULL DEFAULT 1 AFTER player_id'
    },
    {
      name: 'monster_id',
      sql: 'ALTER TABLE player_combat_state ADD COLUMN monster_id INT NULL AFTER map_id'
    },
    {
      name: 'monster_hp',
      sql: 'ALTER TABLE player_combat_state ADD COLUMN monster_hp BIGINT NOT NULL DEFAULT 0 AFTER monster_id'
    },
    {
      name: 'monster_max_hp',
      sql: 'ALTER TABLE player_combat_state ADD COLUMN monster_max_hp BIGINT NOT NULL DEFAULT 0 AFTER monster_hp'
    },
    {
      name: 'wins',
      sql: 'ALTER TABLE player_combat_state ADD COLUMN wins BIGINT NOT NULL DEFAULT 0 AFTER monster_max_hp'
    },
    {
      name: 'losses',
      sql: 'ALTER TABLE player_combat_state ADD COLUMN losses BIGINT NOT NULL DEFAULT 0 AFTER wins'
    }
  ],

  player_inventory: [
    {
      name: 'item_name',
      sql: "ALTER TABLE player_inventory ADD COLUMN item_name VARCHAR(128) NOT NULL DEFAULT 'Vật phẩm vô danh' AFTER item_id"
    },
    {
      name: 'item_type',
      sql: "ALTER TABLE player_inventory ADD COLUMN item_type VARCHAR(32) NOT NULL DEFAULT 'material' AFTER item_name"
    },
    {
      name: 'quantity',
      sql: 'ALTER TABLE player_inventory ADD COLUMN quantity BIGINT NOT NULL DEFAULT 0 AFTER item_type'
    },
    {
      name: 'metadata',
      sql: 'ALTER TABLE player_inventory ADD COLUMN metadata JSON NULL AFTER quantity'
    }
  ],

  player_logs: [
    {
      name: 'category',
      sql: "ALTER TABLE player_logs ADD COLUMN category VARCHAR(32) NOT NULL DEFAULT 'system' AFTER player_id"
    },
    {
      name: 'message',
      sql: "ALTER TABLE player_logs ADD COLUMN message VARCHAR(500) NOT NULL DEFAULT '' AFTER category"
    },
    {
      name: 'created_at',
      sql: 'ALTER TABLE player_logs ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER message'
    }
  ]
};

async function tableExists(connection, databaseName, tableName) {
  const [rows] = await connection.query(
    `SELECT 1
       FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
      LIMIT 1`,
    [databaseName, tableName]
  );

  return rows.length > 0;
}

async function columnExists(connection, databaseName, tableName, columnName) {
  const [rows] = await connection.query(
    `SELECT 1
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1`,
    [databaseName, tableName, columnName]
  );

  return rows.length > 0;
}

async function indexExists(connection, databaseName, tableName, indexName) {
  const [rows] = await connection.query(
    `SELECT 1
       FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
      LIMIT 1`,
    [databaseName, tableName, indexName]
  );

  return rows.length > 0;
}

async function addMissingColumns(connection, databaseName) {
  for (const [tableName, columns] of Object.entries(EXPECTED_COLUMNS)) {
    if (!(await tableExists(connection, databaseName, tableName))) {
      continue;
    }

    for (const column of columns) {
      if (await columnExists(connection, databaseName, tableName, column.name)) {
        continue;
      }

      console.log(`[HO_MACH] Bổ sung ${tableName}.${column.name}`);
      await connection.query(column.sql);
    }
  }
}

async function migrateLegacyInventory(connection, databaseName) {
  if (!(await tableExists(connection, databaseName, 'player_inventory'))) {
    return;
  }

  const hasLegacyName = await columnExists(
    connection,
    databaseName,
    'player_inventory',
    'name'
  );

  const hasLegacyType = await columnExists(
    connection,
    databaseName,
    'player_inventory',
    'type'
  );

  if (hasLegacyName) {
    await connection.query(`
      UPDATE player_inventory
         SET item_name = COALESCE(NULLIF(item_name, ''), NULLIF(name, ''), 'Vật phẩm vô danh')
    `);
  }

  if (hasLegacyType) {
    await connection.query(`
      UPDATE player_inventory
         SET item_type = COALESCE(NULLIF(item_type, ''), NULLIF(type, ''), 'material')
    `);
  }

  await connection.query(`
    UPDATE player_inventory
       SET item_name = CASE
         WHEN item_id = 'linh_thach' THEN 'Linh Thạch'
         WHEN item_name IS NULL OR item_name = '' THEN 'Vật phẩm vô danh'
         ELSE item_name
       END,
           item_type = CASE
         WHEN item_id = 'linh_thach' THEN 'currency'
         WHEN item_type IS NULL OR item_type = '' THEN 'material'
         ELSE item_type
       END
  `);
}

async function addMissingIndexes(connection, databaseName) {
  if (
    await tableExists(connection, databaseName, 'player_inventory') &&
    !(await indexExists(
      connection,
      databaseName,
      'player_inventory',
      'uq_inventory_item'
    ))
  ) {
    const [duplicates] = await connection.query(`
      SELECT player_id, item_id, COUNT(*) AS duplicate_count
        FROM player_inventory
       GROUP BY player_id, item_id
      HAVING COUNT(*) > 1
       LIMIT 1
    `);

    if (duplicates.length === 0) {
      console.log('[HO_MACH] Bổ sung unique index uq_inventory_item');
      await connection.query(`
        ALTER TABLE player_inventory
        ADD UNIQUE KEY uq_inventory_item (player_id, item_id)
      `);
    } else {
      console.warn(
        '[HO_MACH] Chưa thể tạo uq_inventory_item vì tồn tại vật phẩm trùng dòng.'
      );
    }
  }

  if (
    await tableExists(connection, databaseName, 'player_logs') &&
    !(await indexExists(
      connection,
      databaseName,
      'player_logs',
      'idx_player_logs'
    ))
  ) {
    console.log('[HO_MACH] Bổ sung index idx_player_logs');
    await connection.query(`
      ALTER TABLE player_logs
      ADD INDEX idx_player_logs (player_id, id)
    `);
  }
}

async function runMigrations(pool, databaseName) {
  const connection = await pool.getConnection();

  try {
    await addMissingColumns(connection, databaseName);
    await migrateLegacyInventory(connection, databaseName);
    await addMissingIndexes(connection, databaseName);
    console.log('[HO_MACH] Đối chiếu cấu trúc MySQL hoàn tất.');
  } finally {
    connection.release();
  }
}

module.exports = {
  runMigrations
};
