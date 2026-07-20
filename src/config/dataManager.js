const path = require('path');
const { loadXml, arrayOf } = require('./xmlLoader');

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asBoolean(value, fallback = true) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() !== 'false';
}

function weightedRandom(rows, weightSelector) {
  if (!rows.length) return null;

  const total = rows.reduce(
    (sum, row) => sum + Math.max(0, asNumber(weightSelector(row), 0)),
    0
  );

  if (total <= 0) {
    return rows[Math.floor(Math.random() * rows.length)];
  }

  let roll = Math.random() * total;
  for (const row of rows) {
    roll -= Math.max(0, asNumber(weightSelector(row), 0));
    if (roll <= 0) return row;
  }

  return rows[rows.length - 1];
}

class DataManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.loaded = false;
    this.world = null;

    this.realms = [];
    this.maps = [];
    this.monsters = [];

    this.realmByXmlId = new Map();
    this.mapByXmlId = new Map();
    this.mapByRuntimeId = new Map();
    this.monsterByXmlId = new Map();
    this.monsterByRuntimeId = new Map();

    this.items = new Map();
    this.pills = new Map();
    this.recipes = new Map();
    this.herbs = new Map();
    this.skills = new Map();
  }

  load(manifestPath) {
    this.reset();

    const absoluteManifest = path.resolve(manifestPath);
    const baseDirectory = path.dirname(absoluteManifest);
    const document = loadXml(absoluteManifest);
    const manifest = document.World;

    if (!manifest) {
      throw new Error(`Đạo tàng không có thẻ <World>: ${absoluteManifest}`);
    }

    this.world = {
      id: String(manifest.id || ''),
      name: String(manifest.name || 'Vô Danh Giới'),
      version: String(manifest.version || '1.0.0'),
      enabled: asBoolean(manifest.enabled, true)
    };

    for (const reference of arrayOf(manifest.Configs?.Config)) {
      const filePath = path.join(baseDirectory, String(reference.path));
      const configDocument = loadXml(filePath);
      this.ingest(String(reference.type), configDocument);
    }

    this.finalize();
    this.validate();
    this.loaded = true;

    return this.getWorldSummary();
  }

  ingest(type, document) {
    switch (type) {
      case 'realms':
        this.ingestRealms(document);
        break;
      case 'maps':
        this.ingestMaps(document);
        break;
      case 'monsters':
        this.ingestMonsters(document);
        break;
      case 'items':
        this.ingestSimple(document.Items?.Item, this.items, type);
        break;
      case 'pills':
        this.ingestSimple(document.Pills?.Pill, this.pills, type);
        break;
      case 'recipes':
        this.ingestSimple(document.AlchemyRecipes?.Recipe, this.recipes, type);
        break;
      case 'herbs':
        this.ingestSimple(document.Herbs?.Herb, this.herbs, type);
        break;
      case 'cultivationSkills':
      case 'combatSkills':
        this.ingestSimple(document.Skills?.Skill, this.skills, type);
        break;
      default:
        console.warn(`[DAO_TANG] Bỏ qua loại cấu hình chưa hỗ trợ: ${type}`);
    }
  }

  ingestSimple(source, target, type) {
    for (const row of arrayOf(source)) {
      const id = String(row.id || '');
      if (!id) throw new Error(`${type} có phần tử thiếu id.`);
      if (target.has(id)) throw new Error(`Trùng ID cấu hình: ${id}`);
      target.set(id, row);
    }
  }

  ingestRealms(document) {
    for (const rawRealm of arrayOf(document.Realms?.Realm)) {
      const xmlId = String(rawRealm.id || '');
      if (!xmlId) throw new Error('Cảnh giới thiếu id.');
      if (this.realmByXmlId.has(xmlId)) {
        throw new Error(`Trùng cảnh giới: ${xmlId}`);
      }

      const layers = arrayOf(rawRealm.Layers?.Layer)
        .map(layer => ({
          index: asNumber(layer.index, 1),
          requiredExp: asNumber(layer.requiredExp, 0),
          hp: asNumber(layer.hp, 0),
          attack: asNumber(layer.attack, 0),
          defense: asNumber(layer.defense, 0)
        }))
        .sort((a, b) => a.index - b.index);

      const baseSuccessRate = asNumber(
        rawRealm.Breakthrough?.baseSuccessRate,
        0
      );

      const realm = {
        id: xmlId,
        xmlId,
        order: asNumber(rawRealm.order, this.realms.length + 1),
        name: String(rawRealm.name || xmlId),
        layers: asNumber(rawRealm.maxLayer, 9),
        maxLayer: asNumber(rawRealm.maxLayer, 9),
        description: String(rawRealm.Description || ''),
        layerData: layers,
        targetRealmId: rawRealm.Breakthrough?.targetRealmId
          ? String(rawRealm.Breakthrough.targetRealmId)
          : null,
        breakthroughRate: baseSuccessRate > 1
          ? baseSuccessRate / 100
          : baseSuccessRate
      };

      this.realms.push(realm);
      this.realmByXmlId.set(xmlId, realm);
    }
  }

  ingestMaps(document) {
    for (const region of arrayOf(document.Maps?.Region)) {
      for (const rawMap of arrayOf(region.Map)) {
        const xmlId = String(rawMap.id || '');
        if (!xmlId) throw new Error('Bản đồ thiếu id.');

        const monsterRefs = arrayOf(rawMap.Monsters?.MonsterRef).map(ref => ({
          monsterId: String(ref.monsterId || ''),
          weight: asNumber(ref.weight, 1)
        }));

        this.maps.push({
          id: 0,
          runtimeId: 0,
          xmlId,
          name: String(rawMap.name || xmlId),
          order: asNumber(rawMap.order, this.maps.length + 1),
          enabled: asBoolean(rawMap.enabled, true),
          regionId: String(region.id || ''),
          regionName: String(region.name || ''),
          realmId: String(rawMap.UnlockRequirement?.realmId || ''),
          realmRequired: 0,
          layerRequired: asNumber(rawMap.UnlockRequirement?.layer, 1),
          monsterRefs
        });
      }
    }
  }

  ingestMonsters(document) {
    for (const rawMonster of arrayOf(document.Monsters?.Monster)) {
      const xmlId = String(rawMonster.id || '');
      if (!xmlId) throw new Error('Yêu thú thiếu id.');

      const stats = rawMonster.Stats || {};
      const rewards = rawMonster.Rewards || {};

      this.monsters.push({
        id: 0,
        runtimeId: 0,
        xmlId,
        name: String(rawMonster.name || xmlId),
        rank: String(rawMonster.rank || 'normal'),
        level: asNumber(rawMonster.level, 1),
        hp: asNumber(stats.hp, 1),
        attack: asNumber(stats.attack, 1),
        defense: asNumber(stats.defense, 0),
        speed: asNumber(stats.speed, 0),
        stonesMin: asNumber(rewards.spiritStonesMin, 0),
        stonesMax: asNumber(rewards.spiritStonesMax, 0),
        bodyExp: asNumber(rewards.bodyExp, 0),
        soulExp: asNumber(rewards.soulExp, 0),
        mainExp: asNumber(rewards.mainExp, 0),
        dropTableId: String(rewards.dropTableId || 'none')
      });
    }
  }

  finalize() {
    this.realms.sort((a, b) => a.order - b.order);
    this.maps.sort((a, b) => a.order - b.order);
    this.monsters.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.xmlId.localeCompare(b.xmlId);
    });

    this.realms.forEach((realm, index) => {
      realm.index = index;
    });

    this.maps.forEach((map, index) => {
      map.id = index + 1;
      map.runtimeId = map.id;
      map.realmRequired = this.getRealmIndexById(map.realmId);

      this.mapByXmlId.set(map.xmlId, map);
      this.mapByRuntimeId.set(map.runtimeId, map);
    });

    this.monsters.forEach((monster, index) => {
      monster.id = index + 1;
      monster.runtimeId = monster.id;

      this.monsterByXmlId.set(monster.xmlId, monster);
      this.monsterByRuntimeId.set(monster.runtimeId, monster);
    });
  }

  validate() {
    if (!this.realms.length) {
      throw new Error('Đạo tàng không có cảnh giới.');
    }

    if (!this.maps.length) {
      throw new Error('Đạo tàng không có bản đồ.');
    }

    if (!this.monsters.length) {
      throw new Error('Đạo tàng không có yêu thú.');
    }

    for (const map of this.maps) {
      if (!this.realmByXmlId.has(map.realmId)) {
        throw new Error(
          `Bản đồ ${map.xmlId} yêu cầu cảnh giới không tồn tại: ${map.realmId}`
        );
      }

      if (!map.monsterRefs.length) {
        throw new Error(`Bản đồ ${map.xmlId} chưa khai báo yêu thú.`);
      }

      for (const reference of map.monsterRefs) {
        if (!this.monsterByXmlId.has(reference.monsterId)) {
          throw new Error(
            `Bản đồ ${map.xmlId} gọi yêu thú không tồn tại: ${reference.monsterId}`
          );
        }
      }
    }
  }

  ensureLoaded() {
    if (!this.loaded) {
      throw new Error(
        'Đạo tàng chưa được khai mở. Hãy gọi dataManager.load() khi server khởi động.'
      );
    }
  }

  getRealmIndexById(id) {
    const realm = this.realmByXmlId.get(String(id));
    if (!realm) return -1;
    return this.realms.indexOf(realm);
  }

  getRealm(indexOrId) {
    if (typeof indexOrId === 'string' && !/^\d+$/.test(indexOrId)) {
      return this.realmByXmlId.get(indexOrId) || null;
    }

    const index = asNumber(indexOrId, -1);
    return this.realms[index] || null;
  }

  getRealmName(indexOrId) {
    return this.getRealm(indexOrId)?.name || 'Vô Danh Cảnh';
  }

  getAllRealms() {
    this.ensureLoaded();
    return this.realms.map(realm => ({ ...realm }));
  }

  getMap(id) {
    this.ensureLoaded();

    if (typeof id === 'string' && !/^\d+$/.test(id)) {
      return this.mapByXmlId.get(id) || null;
    }

    return this.mapByRuntimeId.get(asNumber(id, -1)) || null;
  }

  getAllMaps() {
    this.ensureLoaded();
    return this.maps.map(map => ({
      ...map,
      monsterRefs: map.monsterRefs.map(ref => ({ ...ref }))
    }));
  }

  getMonster(id) {
    this.ensureLoaded();

    if (typeof id === 'string' && !/^\d+$/.test(id)) {
      return this.monsterByXmlId.get(id) || null;
    }

    return this.monsterByRuntimeId.get(asNumber(id, -1)) || null;
  }

  getAllMonsters() {
    this.ensureLoaded();
    return this.monsters.map(monster => ({ ...monster }));
  }

  getRandomMonster(mapId) {
    const map = this.getMap(mapId);
    if (!map) {
      throw new Error(`Không tìm thấy bản đồ: ${mapId}`);
    }

    const selectedReference = weightedRandom(
      map.monsterRefs,
      reference => reference.weight
    );

    const monster = selectedReference
      ? this.monsterByXmlId.get(selectedReference.monsterId)
      : null;

    if (!monster) {
      throw new Error(`Bản đồ ${map.name} không thể triệu hồi yêu thú.`);
    }

    return monster;
  }

  getUnlockedMaps(player) {
    this.ensureLoaded();

    const realmIndex = asNumber(player.main_realm_index, 0);
    const layer = asNumber(player.main_layer, 1);

    return this.maps.filter(map => {
      if (!map.enabled) return false;
      if (realmIndex > map.realmRequired) return true;
      if (realmIndex < map.realmRequired) return false;
      return layer >= map.layerRequired;
    });
  }

  rollMonsterStones(monster) {
    const min = Math.max(0, asNumber(monster.stonesMin, 0));
    const max = Math.max(min, asNumber(monster.stonesMax, min));
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getWorldSummary() {
    return {
      world: this.world,
      realms: this.realms.length,
      maps: this.maps.length,
      monsters: this.monsters.length,
      items: this.items.size,
      pills: this.pills.size,
      recipes: this.recipes.size,
      herbs: this.herbs.size,
      skills: this.skills.size
    };
  }
}

module.exports = new DataManager();
