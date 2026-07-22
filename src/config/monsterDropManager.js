const fs = require('fs');
const path = require('path');
const { loadXml, arrayOf } = require('./xmlLoader');
const itemManager = require('./itemManager');

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampChance(value) {
  return Math.max(0, Math.min(100, number(value, 0)));
}

class MonsterDropManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.tables = new Map();
    this.monsterRefs = new Map();
    this.loaded = false;
    this.sourceFile = null;
  }

  load(nhanGioiDirectory) {
    this.reset();

    const combatDirectory = path.join(
      nhanGioiDirectory,
      'ChienDau'
    );

    const modernFile = path.join(
      combatDirectory,
      'DropTables.xml'
    );

    const legacyFile = path.join(
      combatDirectory,
      'MonsterDrops.xml'
    );

    const file = fs.existsSync(modernFile)
      ? modernFile
      : legacyFile;

    if (!fs.existsSync(file)) {
      throw new Error(
        'Không tìm thấy ChienDau/DropTables.xml ' +
        'hoặc ChienDau/MonsterDrops.xml.'
      );
    }

    const document = loadXml(file);
    const root =
      document.DropTables ||
      document.MonsterDropTables;

    if (!root) {
      throw new Error(
        `${path.basename(file)} thiếu thẻ DropTables.`
      );
    }

    for (const rawTable of arrayOf(root.DropTable)) {
      this.ingestTable(rawTable, path.basename(file));
    }

    /*
     * Hỗ trợ cấu trúc cũ:
     * <MonsterRef monsterId="..." dropTableId="..."/>
     */
    for (const rawRef of arrayOf(root.MonsterRef)) {
      const monsterId = String(rawRef.monsterId || '').trim();
      const tableId = String(
        rawRef.lootTableId ||
        rawRef.dropTableId ||
        ''
      ).trim();

      if (!monsterId || !tableId) {
        throw new Error(
          'MonsterRef thiếu monsterId hoặc dropTableId.'
        );
      }

      if (!this.tables.has(tableId)) {
        throw new Error(
          `MonsterRef ${monsterId} tham chiếu ` +
          `DropTable không tồn tại: ${tableId}`
        );
      }

      this.monsterRefs.set(monsterId, tableId);
    }

    if (!this.tables.size) {
      throw new Error(
        `${path.basename(file)} không có DropTable nào.`
      );
    }

    this.loaded = true;
    this.sourceFile = file;

    return {
      tables: this.tables.size,
      monsters: this.monsterRefs.size,
      source: path.basename(file)
    };
  }

  ingestTable(rawTable, sourceName) {
    const id = String(rawTable.id || '').trim();

    if (!id) {
      throw new Error(`${sourceName}: DropTable thiếu id.`);
    }

    if (this.tables.has(id)) {
      throw new Error(`${sourceName}: trùng DropTable "${id}".`);
    }

    const drops = arrayOf(rawTable.Drop).map(raw => {
      const itemId = String(raw.itemId || '').trim();

      if (!itemId) {
        throw new Error(
          `${sourceName}: DropTable ${id} có Drop thiếu itemId.`
        );
      }

      itemManager.require(itemId);

      const minQuantity = Math.max(
        1,
        Math.floor(
          number(raw.minQuantity ?? raw.min, 1)
        )
      );

      const maxQuantity = Math.max(
        minQuantity,
        Math.floor(
          number(raw.maxQuantity ?? raw.max, minQuantity)
        )
      );

      return Object.freeze({
        itemId,
        chance: clampChance(
          raw.chance ?? raw.rate
        ),
        minQuantity,
        maxQuantity
      });
    });

    if (!drops.length) {
      throw new Error(
        `${sourceName}: DropTable ${id} không có vật phẩm.`
      );
    }

    this.tables.set(id, Object.freeze(drops));
  }

  ensureLoaded() {
    if (!this.loaded) {
      throw new Error('MonsterDropManager chưa được khai mở.');
    }
  }

  resolveTableId(monster) {
    if (!monster) return '';

    /*
     * Đạo tắc mới:
     * Monsters.xml tự mang lootTableId.
     */
    const direct = String(
      monster.lootTableId ||
      monster.dropTableId ||
      monster.loot_table_id ||
      ''
    ).trim();

    if (direct) return direct;

    /*
     * Tương thích dữ liệu cũ qua MonsterRef.
     */
    const monsterKey = String(
      monster.xmlId ||
      monster.id ||
      ''
    ).trim();

    return this.monsterRefs.get(monsterKey) || '';
  }

  getTable(tableId) {
    this.ensureLoaded();
    const table = this.tables.get(String(tableId)) || null;
    return table ? table.map(drop => ({ ...drop })) : null;
  }

  validateMonster(monster) {
    this.ensureLoaded();

    const monsterId = String(
      monster?.xmlId ||
      monster?.id ||
      ''
    );

    const tableId = this.resolveTableId(monster);

    if (!tableId) {
      return {
        valid: false,
        monsterId,
        reason: 'Quái chưa có lootTableId.'
      };
    }

    if (!this.tables.has(tableId)) {
      return {
        valid: false,
        monsterId,
        tableId,
        reason: `DropTable không tồn tại: ${tableId}`
      };
    }

    return {
      valid: true,
      monsterId,
      tableId,
      drops: this.tables.get(tableId).length
    };
  }

  roll(monster) {
    if (!this.loaded || !monster) return [];

    const tableId = this.resolveTableId(monster);
    const table = tableId
      ? this.tables.get(tableId)
      : null;

    if (!table) return [];

    const rewards = [];

    for (const drop of table) {
      if (Math.random() * 100 >= drop.chance) {
        continue;
      }

      const quantity =
        Math.floor(
          Math.random() *
          (
            drop.maxQuantity -
            drop.minQuantity +
            1
          )
        ) +
        drop.minQuantity;

      rewards.push({
        itemId: drop.itemId,
        quantity,
        lootTableId: tableId
      });
    }

    return rewards;
  }
}

module.exports = new MonsterDropManager();
