const fs = require('fs');
const path = require('path');
const { loadXml, arrayOf } = require('./xmlLoader');
const itemManager = require('./itemManager');

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

class MonsterDropManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.loaded = false;
    this.tables = new Map();
    this.sourceFile = null;
  }

  load(nhanGioiDirectory) {
    this.reset();

    const file = path.join(
      nhanGioiDirectory,
      'ChienDau',
      'DropTables.xml'
    );

    if (!fs.existsSync(file)) {
      throw new Error(
        'Không tìm thấy ChienDau/DropTables.xml. ' +
        'Đây là bảng chiến lợi phẩm duy nhất được phép sử dụng.'
      );
    }

    const document = loadXml(file);
    const root = document.DropTables;

    if (!root) {
      throw new Error('DropTables.xml thiếu thẻ gốc <DropTables>.');
    }

    for (const rawTable of arrayOf(root.DropTable)) {
      this.ingestTable(rawTable);
    }

    if (!this.tables.size) {
      throw new Error('DropTables.xml không có DropTable nào.');
    }

    this.loaded = true;
    this.sourceFile = file;

    return {
      tables: this.tables.size,
      source: path.basename(file)
    };
  }

  ingestTable(rawTable) {
    const id = String(rawTable.id || '').trim();

    if (!id) {
      throw new Error('DropTable thiếu id.');
    }

    if (this.tables.has(id)) {
      throw new Error(`Trùng DropTable "${id}".`);
    }

    const drops = arrayOf(rawTable.Drop).map(raw => {
      const itemId = String(raw.itemId || '').trim();

      if (!itemId) {
        throw new Error(`DropTable ${id} có Drop thiếu itemId.`);
      }

      itemManager.require(itemId);

      const chance = clamp(
        asNumber(raw.chance, 0),
        0,
        100
      );

      const minQuantity = Math.max(
        1,
        Math.floor(asNumber(raw.minQuantity, 1))
      );

      const maxQuantity = Math.max(
        minQuantity,
        Math.floor(
          asNumber(raw.maxQuantity, minQuantity)
        )
      );

      return Object.freeze({
        itemId,
        chance,
        minQuantity,
        maxQuantity
      });
    });

    if (!drops.length) {
      throw new Error(`DropTable ${id} không có Drop.`);
    }

    this.tables.set(id, Object.freeze(drops));
  }

  ensureLoaded() {
    if (!this.loaded) {
      throw new Error('MonsterDropManager chưa được khai mở.');
    }
  }

  resolveTableId(monster) {
    return String(
      monster?.lootTableId ||
      monster?.dropTableId ||
      monster?.loot_table_id ||
      ''
    ).trim();
  }

  getTable(tableId) {
    this.ensureLoaded();

    const table = this.tables.get(String(tableId));
    return table
      ? table.map(drop => ({ ...drop }))
      : null;
  }

  validateMonster(monster) {
    this.ensureLoaded();

    const monsterId = String(
      monster?.xmlId ||
      monster?.id ||
      ''
    ).trim();

    const tableId = this.resolveTableId(monster);

    if (!tableId) {
      return {
        valid: false,
        monsterId,
        reason: 'Quái chưa khai lootTableId.'
      };
    }

    const table = this.tables.get(tableId);

    if (!table) {
      return {
        valid: false,
        monsterId,
        tableId,
        reason: `Không tồn tại DropTable "${tableId}".`
      };
    }

    return {
      valid: true,
      monsterId,
      tableId,
      drops: table.length
    };
  }

  roll(monster) {
    if (!this.loaded || !monster) return [];

    const tableId = this.resolveTableId(monster);
    const table = this.tables.get(tableId);

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
