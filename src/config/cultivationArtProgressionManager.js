const path = require('path');
const { loadXml, arrayOf } = require('./xmlLoader');

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

class CultivationArtProgressionManager {
  constructor() { this.loaded = false; }

  load(worldDirectory) {
    const file = path.join(worldDirectory, 'CongPhap', 'TienGiaiCongPhap.xml');
    const document = loadXml(file);
    const root = document.CultivationArtProgression;
    if (!root) throw new Error('Thiếu cấu hình Tiến Giai Công Pháp.');

    this.maxLevelPerGrade = num(root.maxLevelPerGrade, 100);
    this.grades = new Map();
    for (const raw of arrayOf(root.Grades?.Grade)) {
      this.grades.set(String(raw.id), {
        id: String(raw.id), rank: num(raw.rank), multiplier: num(raw.multiplier, 1),
        next: String(raw.next || ''), realmIndexRequired: num(raw.realmIndexRequired),
        breakthroughStones: num(raw.breakthroughStones), breakthroughEssence: num(raw.breakthroughEssence)
      });
    }
    this.categories = new Map();
    for (const raw of arrayOf(root.Categories?.Category)) {
      this.categories.set(String(raw.id), {
        id: String(raw.id), resource: String(raw.resource), baseCost: num(raw.baseCost, 1), exponent: num(raw.exponent, 1)
      });
    }
    this.income = {
      spiritQiPerSecond: num(root.Income?.spiritQiPerSecond, 0.5),
      battleIntentPerKill: num(root.Income?.battleIntentPerKill, 2),
      bloodQiPerKill: num(root.Income?.bloodQiPerKill, 2),
      bloodQiBodyExpRate: num(root.Income?.bloodQiBodyExpRate, 0.1)
    };
    this.divineArt = {
      activationChance: num(root.DivineArt?.activationChance, 0.25),
      proficiencyPerUse: num(root.DivineArt?.proficiencyPerUse, 1),
      bossMultiplier: num(root.DivineArt?.bossMultiplier, 2)
    };
    this.loaded = true;
    return this.summary();
  }

  ensureLoaded() { if (!this.loaded) throw new Error('Tiến Giai Công Pháp chưa được khai mở.'); }
  getGrade(id) { this.ensureLoaded(); return this.grades.get(String(id)) || null; }
  getCategory(id) { this.ensureLoaded(); return this.categories.get(String(id)) || null; }
  requiredExp(category, grade, level) {
    const c = this.getCategory(category); const g = this.getGrade(grade);
    if (!c || !g) throw new Error('Cấu hình cấp Công Pháp không hợp lệ.');
    return Math.max(1, Math.floor(c.baseCost * g.multiplier * Math.pow(Math.max(1, Number(level)), c.exponent)));
  }
  levelRatio(level) { return 0.65 + Math.min(this.maxLevelPerGrade, Math.max(1, Number(level))) / this.maxLevelPerGrade * 0.35; }
  summary() { return { maxLevelPerGrade: this.maxLevelPerGrade, grades: [...this.grades.values()], categories: [...this.categories.values()] }; }
}
module.exports = new CultivationArtProgressionManager();
