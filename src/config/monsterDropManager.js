const fs = require('fs');
const path = require('path');
const { loadXml, arrayOf } = require('./xmlLoader');
const itemManager = require('./itemManager');

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

class MonsterDropManager {
  constructor() {
    this.tables = new Map();
    this.monsterRefs = new Map();
    this.loaded = false;
  }

  load(nhanGioiDirectory) {
    this.tables.clear();
    this.monsterRefs.clear();

    const file = path.join(nhanGioiDirectory, 'ChienDau', 'MonsterDrops.xml');
    if (!fs.existsSync(file)) {
      console.warn('[CHIẾN LỢI PHẨM] Chưa có ChienDau/MonsterDrops.xml.');
      this.loaded = true;
      return { tables: 0, monsters: 0 };
    }

    const document = loadXml(file);
    const root = document.MonsterDropTables || {};

    for (const rawTable of arrayOf(root.DropTable)) {
      const id = String(rawTable.id || '');
      if (!id) throw new Error('DropTable thiếu id.');
      const drops = arrayOf(rawTable.Drop).map(raw => {
        const itemId = String(raw.itemId || '');
        itemManager.require(itemId);
        return {
          itemId,
          chance: Math.max(0, Math.min(100, number(raw.chance, 0))),
          minQuantity: Math.max(1, Math.floor(number(raw.minQuantity, 1))),
          maxQuantity: Math.max(1, Math.floor(number(raw.maxQuantity, 1)))
        };
      });
      this.tables.set(id, drops);
    }

    for (const rawRef of arrayOf(root.MonsterRef)) {
      const monsterId = String(rawRef.monsterId || '');
      const dropTableId = String(rawRef.dropTableId || '');
      if (!this.tables.has(dropTableId)) {
        throw new Error(`MonsterRef ${monsterId} tham chiếu DropTable không tồn tại: ${dropTableId}`);
      }
      this.monsterRefs.set(monsterId, dropTableId);
    }

    this.loaded = true;
    return { tables: this.tables.size, monsters: this.monsterRefs.size };
  }

  roll(monster) {
    if (!this.loaded || !monster) return [];
    const monsterKey = String(monster.xmlId || monster.id || '');
    const tableId = this.monsterRefs.get(monsterKey);
    const table = tableId ? this.tables.get(tableId) : null;
    if (!table) return [];

    const rewards = [];
    for (const drop of table) {
      if (Math.random() * 100 >= drop.chance) continue;
      const quantity = Math.floor(
        Math.random() * (drop.maxQuantity - drop.minQuantity + 1)
      ) + drop.minQuantity;
      rewards.push({ itemId: drop.itemId, quantity });
    }
    return rewards;
  }
}

module.exports = new MonsterDropManager();
