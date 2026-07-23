const path = require('path');
const { loadXml, arrayOf } = require('./xmlLoader');

const GRADE_ORDER = ['pham', 'hoang', 'huyen', 'dia', 'thien'];
const CATEGORY_FILES = {
  tam_phap: 'TamPhap.xml',
  chien_phap: 'ChienPhap.xml',
  luyen_the: 'LuyenThePhap.xml',
  than_thong: 'ThanThong.xml'
};

function num(value, fallback = 0) {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}
function bool(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

class CultivationArtManager {
  constructor() { this.reset(); }
  reset() {
    this.loaded = false;
    this.arts = new Map();
    this.byCategory = new Map();
    this.byRoot = new Map();
  }
  load(worldDirectory) {
    this.reset();
    const folder = path.join(worldDirectory, 'CongPhap');
    for (const [category, filename] of Object.entries(CATEGORY_FILES)) {
      const document = loadXml(path.join(folder, filename));

      // Tâm Pháp, Chiến Pháp và Luyện Thể Pháp dùng:
      // <CultivationArts><Arts><RootGroup><Art .../></RootGroup></Arts></CultivationArts>
      //
      // Thần Thông dùng:
      // <DivineArts><Arts><RootGroup><DivineArt .../></RootGroup></Arts></DivineArts>
      //
      // Hỗ trợ đồng thời hai cấu trúc để không phải đổi dữ liệu XML đã khai mở.
      const rootDocument = document.CultivationArts || document.DivineArts;
      const groups = arrayOf(rootDocument?.Arts?.RootGroup);

      for (const group of groups) {
        const rawArts = category === 'than_thong'
          ? arrayOf(group.DivineArt || group.Art)
          : arrayOf(group.Art || group.DivineArt);

        for (const raw of rawArts) this.ingestArt(category, group, raw);
      }
    }
    if (this.arts.size !== 192) {
      throw new Error(`Đạo Tàng Công Pháp phải có 192 cuốn, hiện có ${this.arts.size}.`);
    }
    this.loaded = true;
    return this.summary();
  }
  ingestArt(category, group, raw) {
    const id = String(raw.id || '').trim();
    if (!id) throw new Error(`Công pháp ${category} thiếu id.`);
    if (this.arts.has(id)) throw new Error(`Trùng công pháp: ${id}`);
    const grades = {};
    for (const grade of arrayOf(raw.Grades?.Grade)) {
      const gradeId = String(grade.id || '').trim();
      grades[gradeId] = {
        id: gradeId,
        rank: num(grade.rank, GRADE_ORDER.indexOf(gradeId) + 1),
        manaCost: num(grade.manaCost, 0),
        cooldownTurns: num(grade.cooldownTurns, 0),
        stats: arrayOf(grade.Stats?.Stat).map(stat => ({
          key: String(stat.key || ''), value: num(stat.value), unit: String(stat.unit || 'flat')
        })),
        effects: arrayOf(grade.Effects?.Effect || grade.Effects?.ApplyStatus).map(effect => ({
          ...effect,
          id: String(effect.id || ''),
          chancePercent: num(effect.chancePercent, bool(effect.guaranteed) ? 100 : 0),
          durationTurns: num(effect.durationTurns, 0),
          guaranteed: bool(effect.guaranteed),
          ignoreNormalResistance: bool(effect.ignoreNormalResistance)
        })),
        damage: grade.Damage ? { ...grade.Damage, attackScale: num(grade.Damage.attackScale), flatDamage: num(grade.Damage.flatDamage) } : null,
        heal: grade.Heal ? { ...grade.Heal, attackScale: num(grade.Heal.attackScale), maxHpPercent: num(grade.Heal.maxHpPercent) } : null,
        shield: grade.Shield ? { ...grade.Shield, attackScale: num(grade.Shield.attackScale), maxHpPercent: num(grade.Shield.maxHpPercent), flatValue: num(grade.Shield.flatValue) } : null
      };
    }
    const art = {
      id,
      name: String(raw.name || id),
      category,
      categoryName: ({tam_phap:'Tâm Pháp',chien_phap:'Chiến Pháp',luyen_the:'Luyện Thể Pháp',than_thong:'Thần Thông'})[category],
      rootId: String(raw.compatibleRootId || group.rootId || ''),
      rootName: String(group.rootName || ''),
      element: String(raw.element || group.element || 'vô'),
      slot: String(raw.slot || category),
      description: String(raw.Description || ''),
      matchingBonusPercent: num(raw.Affinity?.matchingBonusPercent, 20),
      requireMatch: bool(raw.Affinity?.requireMatch, false),
      grades
    };
    this.arts.set(id, art);
    if (!this.byCategory.has(category)) this.byCategory.set(category, []);
    this.byCategory.get(category).push(art);
    if (!this.byRoot.has(art.rootId)) this.byRoot.set(art.rootId, []);
    this.byRoot.get(art.rootId).push(art);
  }
  ensureLoaded() { if (!this.loaded) throw new Error('Đạo Tàng Công Pháp chưa được khai mở.'); }
  get(id) { this.ensureLoaded(); return this.arts.get(String(id)) || null; }
  getAll(filters = {}) {
    this.ensureLoaded();
    let rows = [...this.arts.values()];
    if (filters.category) rows = rows.filter(row => row.category === filters.category);
    if (filters.rootId) rows = rows.filter(row => row.rootId === filters.rootId);
    return rows.map(row => ({...row, grades: {...row.grades}}));
  }
  getGrade(artId, gradeId = 'pham') { return this.get(artId)?.grades?.[gradeId] || null; }
  summary() {
    const categories = {};
    for (const [key, rows] of this.byCategory) categories[key] = rows.length;
    return { total: this.arts.size, roots: this.byRoot.size, categories };
  }
}
module.exports = new CultivationArtManager();
