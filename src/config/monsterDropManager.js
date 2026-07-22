const path = require('path');
const dataManager = require('./dataManager');

/**
 * Cầu nối tương thích cho các service cũ.
 *
 * Đạo tắc duy nhất:
 * DropTables.xml → dataManager → rollMonsterDrops()
 *
 * File này không còn tự đọc XML và không giữ bảng rơi riêng.
 */
class MonsterDropManagerAdapter {
  constructor() {
    this.loaded = false;
    this.sourceFile = null;
  }

  reset() {
    this.loaded = false;
    this.sourceFile = null;
  }

  load(nhanGioiDirectory) {
    if (!dataManager.loaded) {
      throw new Error(
        'DataManager phải khai mở trước MonsterDropManager.'
      );
    }

    this.loaded = true;
    this.sourceFile = path.join(
      nhanGioiDirectory,
      'ChienDau',
      'DropTables.xml'
    );

    const summary = dataManager.getWorldSummary();

    return {
      tables: summary.lootTables,
      monsters: summary.monsters,
      source: path.basename(this.sourceFile),
      runtime: 'dataManager'
    };
  }

  ensureLoaded() {
    if (!this.loaded || !dataManager.loaded) {
      throw new Error(
        'Chiến Lợi Phẩm chưa được khai mở.'
      );
    }
  }

  getTable(id) {
    this.ensureLoaded();
    return dataManager.getLootTable(id);
  }

  roll(monster) {
    this.ensureLoaded();
    return dataManager.rollMonsterDrops(monster);
  }

  getSummary() {
    this.ensureLoaded();

    const summary = dataManager.getWorldSummary();

    return {
      tables: summary.lootTables,
      monsters: summary.monsters,
      source: this.sourceFile
        ? path.basename(this.sourceFile)
        : 'DropTables.xml',
      runtime: 'dataManager'
    };
  }
}

module.exports = new MonsterDropManagerAdapter();
