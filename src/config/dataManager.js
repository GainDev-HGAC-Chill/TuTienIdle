const fs = require('fs');
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

function fileNameWithoutExtension(filePath) {
  return path.basename(filePath, path.extname(filePath)).toLowerCase();
}

class DataManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.loaded = false;
    this.world = null;

    this.realms = [];
    // Giữ mảng tương thích nội bộ, nhưng Đạo Tàng Đợt 4 không còn nạp hai hệ này.
    this.bodyRealms = [];
    this.soulRealms = [];

    this.maps = [];
    this.monsters = [];
    this.monsterSkills = new Map();
    this.monsterSkillSets = new Map();
    this.lootTables = new Map();

    this.spiritualRoots = [];

    this.realmByXmlId = new Map();
    this.mapByXmlId = new Map();
    this.mapByRuntimeId = new Map();
    this.monsterByXmlId = new Map();
    this.monsterByRuntimeId = new Map();
    this.spiritualRootById = new Map();

    this.items = new Map();
    this.pills = new Map();
    this.recipes = new Map();
    this.herbs = new Map();
    this.skills = new Map();

    this.loadedFiles = new Set();
    this.fileRegistry = new Map();
    this.rules = new Map();
    this.stackRules = new Map();
    this.currencies = new Map();
    this.startingPlayer = null;
  }

  load(manifestPath) {
    this.reset();

    const absoluteManifest = path.resolve(manifestPath);
    const baseDirectory = path.dirname(absoluteManifest);
    const document = loadXml(absoluteManifest);
    const manifest = document.World;

    if (!manifest) {
      throw new Error(`Đạo tàng không có thẻ World: ${absoluteManifest}`);
    }

    this.world = {
      id: String(manifest.id || ''),
      name: String(manifest.name || 'Vô Danh Giới'),
      version: String(
        manifest.schemaVersion ||
        manifest.version ||
        '1.0.0'
      ),
      enabled: asBoolean(manifest.enabled, true)
    };

    /*
     * Đạo Tàng 1.x:
     *
     * <Configs>
     *   <Config type="realms" path="TuyenDao/Realms.xml"/>
     * </Configs>
     */
    const legacyConfigs = arrayOf(manifest.Configs?.Config);

    if (legacyConfigs.length) {
      for (const reference of legacyConfigs) {
        const filePath = path.join(
          baseDirectory,
          String(reference.path || '')
        );

        if (!fs.existsSync(filePath)) {
          console.warn(
            `[ĐẠO TÀNG] Chưa có ${reference.path}, tạm bỏ qua.`
          );
          continue;
        }

        this.loadAndIngestFile(
          filePath,
          String(reference.type || '')
        );
      }
    }

    /*
     * Đạo Tàng 2.0:
     *
     * <Modules>
     *   <Module id="tuyen_dao" path="TuyenDao/Module.xml"/>
     * </Modules>
     */
    const moduleReferences = arrayOf(manifest.Modules?.Module);

    if (moduleReferences.length) {
      for (const reference of moduleReferences) {
        this.loadModule(
          baseDirectory,
          reference
        );
      }
    }

    if (!legacyConfigs.length && !moduleReferences.length) {
      throw new Error(
        'NhanGioi.xml không có Configs hoặc Modules để khai mở đạo tàng.'
      );
    }

    this.finalize();
    this.validate();

    this.loaded = true;
    return this.getWorldSummary();
  }

  loadModule(worldDirectory, reference) {
    const moduleRelativePath = String(reference.path || '').trim();

    if (!moduleRelativePath) {
      if (asBoolean(reference.required, false)) {
        throw new Error(
          `Module ${reference.id || 'vô danh'} thiếu đường dẫn.`
        );
      }
      return;
    }

    const modulePath = path.join(
      worldDirectory,
      moduleRelativePath
    );

    if (!fs.existsSync(modulePath)) {
      if (asBoolean(reference.required, false)) {
        throw new Error(
          `Không tìm thấy Module bắt buộc: ${moduleRelativePath}`
        );
      }

      console.warn(
        `[ĐẠO TÀNG] Chưa có ${moduleRelativePath}, tạm bỏ qua.`
      );
      return;
    }

    const moduleDocument = loadXml(modulePath);
    const moduleRoot = moduleDocument.Module;

    if (!moduleRoot) {
      throw new Error(
        `Đạo quyển Module không có thẻ Module: ${moduleRelativePath}`
      );
    }

    const moduleDirectory = path.dirname(modulePath);

    for (const fileReference of arrayOf(moduleRoot.Files?.File)) {
      const relativePath = String(fileReference.path || '').trim();
      if (!relativePath) continue;

      const filePath = path.join(
        moduleDirectory,
        relativePath
      );

      if (!fs.existsSync(filePath)) {
        if (asBoolean(fileReference.required, false)) {
          throw new Error(`Module ${moduleRoot.id || reference.id} thiếu đạo quyển bắt buộc: ${relativePath}`);
        }
        console.warn(`[ĐẠO TÀNG] Module ${moduleRoot.id || reference.id} chưa có ${relativePath}, tạm bỏ qua.`);
        continue;
      }

      this.loadAndIngestFile(filePath, String(fileReference.type || ''), {
        moduleId: String(moduleRoot.id || reference.id || ''),
        relativePath,
        required: asBoolean(fileReference.required, false)
      });
    }
  }

  loadAndIngestFile(filePath, declaredType = '', metadata = {}) {
    const absolutePath = path.resolve(filePath);

    if (this.loadedFiles.has(absolutePath)) {
      return;
    }

    const document = loadXml(absolutePath);
    const inferredType = declaredType || this.inferType(
      absolutePath,
      document
    );

    this.ingest(
      inferredType,
      document,
      absolutePath
    );

    this.loadedFiles.add(absolutePath);
    const rootTag = Object.keys(document || {})[0] || '';
    this.fileRegistry.set(absolutePath, { absolutePath, type: inferredType, rootTag, moduleId: metadata.moduleId || '', relativePath: metadata.relativePath || path.basename(absolutePath), required: Boolean(metadata.required), loaded: true });
  }

  inferType(filePath, document) {
    const fileName = fileNameWithoutExtension(filePath);

    const byFileName = {
      realms: 'realms',
      bodyrealms: 'bodyRealms',
      soulrealms: 'soulRealms',
      spiritualroots: 'spiritualRoots',
      maps: 'maps',
      monsters: 'monsters',
      monsterskills: 'monsterSkills',
      loottables: 'lootTables', droptables: 'lootTables',
      materials: 'items',
      ores: 'items',
      monstermaterials: 'items',
      consumables: 'items',
      equipment: 'items',
      treasures: 'items',
      bagitems: 'items',
      herbs: 'items',
      pillrecipes: 'recipes',
      cultivationarts: 'cultivationSkills',
      gamerules: 'gameRules', offlinerules: 'offlineRules', deathrules: 'deathRules', inventoryrules: 'inventoryRules', startingplayer: 'startingPlayer', currencies: 'currencies'
    };

    if (byFileName[fileName]) {
      return byFileName[fileName];
    }

    if (document.RealmPath) {
      const pathId = String(document.RealmPath.id || '');
      if (pathId === 'body') return 'bodyRealms';
      if (pathId === 'soul') return 'soulRealms';
      return 'realms';
    }

    if (document.Realms) return 'realms';
    if (document.Maps) return 'maps';
    if (document.Monsters) return 'monsters';
    if (document.MonsterSkills || document.MonsterSkillCatalog) {
      return 'monsterSkills';
    }
    if (document.DropTables || document.LootTables || document.MonsterDropTables) { return 'lootTables'; }
    if (document.SpiritualRoots) return 'spiritualRoots';
    if (document.Items) return 'items';
    if (document.Pills) return 'pills';
    if (document.AlchemyRecipes || document.PillRecipes) {
      return 'recipes';
    }
    if (document.Herbs) return 'herbs';
    if (document.Skills || document.CultivationArts) {
      return 'cultivationSkills';
    }

    return '';
  }

  ingest(type, document, sourcePath = '') {
    switch (type) {
      case 'realms':
        this.ingestRealms(document, this.realms);
        break;

      case 'bodyRealms':
        this.ingestRealms(document, this.bodyRealms);
        break;

      case 'soulRealms':
        this.ingestRealms(document, this.soulRealms);
        break;

      case 'maps':
        this.ingestMaps(document);
        break;

      case 'monsters':
        this.ingestMonsters(document);
        break;

      case 'monsterSkills':
        this.ingestMonsterSkills(document);
        break;

      case 'lootTables':
        this.ingestLootTables(document);
        break;

      case 'spiritualRoots':
        this.ingestSpiritualRoots(document);
        break;

      case 'items':
        this.ingestSimple(
          document.Items?.Item,
          this.items,
          type
        );
        break;

      case 'pills':
        this.ingestSimple(
          document.Pills?.Pill,
          this.pills,
          type
        );
        break;

      case 'recipes':
        this.ingestSimple(
          document.AlchemyRecipes?.Recipe ||
          document.PillRecipes?.Recipe,
          this.recipes,
          type
        );
        break;

      case 'herbs':
        this.ingestSimple(
          document.Herbs?.Herb,
          this.herbs,
          type
        );
        break;

      case 'gameRules':
      case 'offlineRules':
      case 'deathRules':
      case 'tradeRules':
      case 'alchemyRules':
      case 'caveUpgradeRules':
      case 'beastFeedingRules':
      case 'beastGrowthRules':
      case 'companionRules':
        this.ingestRules(document, type);
        break;

      case 'inventoryRules':
        this.ingestRules(document, type);
        this.ingestStackRules(document);
        break;

      case 'startingPlayer':
        this.startingPlayer = document.StartingPlayer || null;
        break;

      case 'currencies':
        this.ingestSimple(document.Currencies?.Currency, this.currencies, type);
        break;

      case 'cultivationSkills':
      case 'combatSkills':
        this.ingestSimple(
          document.Skills?.Skill ||
          document.CultivationArts?.Art,
          this.skills,
          type
        );
        break;

      default:
        console.log(
          `[ĐẠO TÀNG] Đã nhận ${path.basename(sourcePath)}, ` +
          'runtime hiện chưa cần nạp nội dung.'
        );
        break;
    }
  }

  ingestRules(document, type) {
    const root = Object.values(document || {})[0] || {};
    for (const row of arrayOf(root.Rule)) {
      const id = String(row.id || '').trim();
      if (!id) throw new Error(`${type} có luật thiếu id.`);
      if (this.rules.has(id)) throw new Error(`Trùng luật runtime: ${id}`);
      let value = row.value;
      if (String(row.unit || '') === 'boolean') value = asBoolean(value, false);
      else if (['percent','seconds','multiplier','count','point','slot','item','level','entry','stack','listing'].includes(String(row.unit || ''))) value = asNumber(value, 0);
      this.rules.set(id, { ...row, id, value, sourceType: type });
    }
  }

  ingestStackRules(document) {
    for (const row of arrayOf(document.InventoryRules?.StackRule)) {
      const itemType = String(row.itemType || '').trim();
      if (itemType) this.stackRules.set(itemType, Math.max(1, asNumber(row.limit, 1)));
    }
  }

  getRule(id, fallback = null) {
    const row = this.rules.get(String(id));
    return row ? row.value : fallback;
  }

  getRuleNumber(id, fallback = 0) { return asNumber(this.getRule(id, fallback), fallback); }
  getRuleBoolean(id, fallback = false) { return asBoolean(this.getRule(id, fallback), fallback); }
  getStackLimit(itemType, fallback = null) { return this.stackRules.get(String(itemType)) || this.getRuleNumber('default_stack_limit', fallback || 999); }
  getCurrency(id) { return this.currencies.get(String(id)) || null; }
  getStartingPlayer() { return this.startingPlayer; }
  getFileRegistry() { return [...this.fileRegistry.values()]; }

  ingestSimple(source, target, type) {
    for (const row of arrayOf(source)) {
      const id = String(row.id || '');

      if (!id) {
        throw new Error(`${type} có phần tử thiếu id.`);
      }

      if (target.has(id)) {
        throw new Error(`Trùng ID cấu hình: ${id}`);
      }

      target.set(id, row);
    }
  }

  ingestSpiritualRoots(document) {
    for (const raw of arrayOf(document.SpiritualRoots?.Root)) {
      const id = String(raw.id || '');

      if (!id) {
        throw new Error('Linh Căn thiếu id.');
      }

      if (this.spiritualRootById.has(id)) {
        throw new Error(`Trùng Linh Căn: ${id}`);
      }

      const growth = raw.Growth || {};

      const root = {
        id,
        name: String(raw.name || id),
        grade: String(
          raw.grade ||
          raw.qualityId ||
          'phàm'
        ),
        element: String(raw.element || 'vô'),
        weight: asNumber(raw.weight, 1),
        description: String(
          raw.description ||
          raw.Description ||
          ''
        ),

        growthHp: asNumber(
          raw.growthHp,
          growth.maxHp ??
          growth.hp ??
          1
        ),

        growthMp: asNumber(
          raw.growthMp,
          growth.maxMp ??
          growth.mp ??
          1
        ),

        growthAttack: asNumber(
          raw.growthAttack,
          growth.attack ??
          1
        ),

        growthDefense: asNumber(
          raw.growthDefense,
          growth.defense ??
          1
        ),

        bonusAccuracy: asNumber(raw.bonusAccuracy, 0),
        bonusDodgeRate: asNumber(
          raw.bonusDodgeRate,
          growth.dodge ?? 0
        ),
        bonusCritRate: asNumber(
          raw.bonusCritRate,
          growth.crit ?? 0
        ),
        bonusCritDamage: asNumber(
          raw.bonusCritDamage,
          growth.critDamage ?? 0
        ),
        bonusSpeed: asNumber(
          raw.bonusSpeed,
          growth.speed ?? 0
        ),
        bonusArmorPenetration: asNumber(
          raw.bonusArmorPenetration,
          0
        ),
        bonusCritResistance: asNumber(
          raw.bonusCritResistance,
          growth.resistance ?? 0
        ),
        bonusLifeSteal: asNumber(raw.bonusLifeSteal, 0),
        bonusHpRegen: asNumber(raw.bonusHpRegen, 0),
        bonusMpRegen: asNumber(raw.bonusMpRegen, 0)
      };

      this.spiritualRoots.push(root);
      this.spiritualRootById.set(root.id, root);
    }
  }

  ingestRealms(document, target) {
    const legacyRealms = arrayOf(document.Realms?.Realm);
    const v2Realms = arrayOf(document.RealmPath?.Realm);
    const source = legacyRealms.length
      ? legacyRealms
      : v2Realms;

    for (const rawRealm of source) {
      const xmlId = String(rawRealm.id || '');

      if (!xmlId) {
        throw new Error('Cảnh giới thiếu id.');
      }

      const maxLayer = Math.max(
        1,
        asNumber(
          rawRealm.maxLayer,
          rawRealm.layers ?? 9
        )
      );

      let layers = arrayOf(rawRealm.Layers?.Layer)
        .map(layer => ({
          index: asNumber(layer.index, 1),
          requiredExp: asNumber(layer.requiredExp, 0),
          hp: asNumber(layer.hp, 0),
          attack: asNumber(layer.attack, 0),
          defense: asNumber(layer.defense, 0)
        }))
        .sort((a, b) => a.index - b.index);

      /*
       * XML 2.0 chỉ khai số tầng. Runtime cũ cần layerData,
       * nên tạo dữ liệu nền để server vẫn vận hành.
       */
      if (!layers.length) {
        const realmOrder = asNumber(
          rawRealm.order,
          target.length + 1
        );

        layers = Array.from(
          { length: maxLayer },
          (_unused, index) => {
            const layer = index + 1;
            const scale = Math.max(1, realmOrder);

            return {
              index: layer,
              requiredExp: Math.round(
                100 *
                Math.pow(scale, 2) *
                Math.pow(layer, 1.35)
              ),
              hp: Math.round(
                10 * scale + 4 * layer
              ),
              attack: Math.round(
                2 * scale + layer
              ),
              defense: Math.round(
                1.5 * scale + 0.8 * layer
              )
            };
          }
        );
      }

      const baseRate = asNumber(
        rawRealm.Breakthrough?.baseSuccessRate,
        75
      );

      const realm = {
        id: xmlId,
        xmlId,
        order: asNumber(
          rawRealm.order,
          target.length + 1
        ),
        name: String(rawRealm.name || xmlId),
        maxLayer,
        description: String(
          rawRealm.Description || ''
        ),
        layerData: layers,
        breakthroughRate: baseRate > 1
          ? baseRate / 100
          : baseRate
      };

      target.push(realm);

      if (target === this.realms) {
        if (this.realmByXmlId.has(xmlId)) {
          throw new Error(`Trùng cảnh giới chính: ${xmlId}`);
        }

        this.realmByXmlId.set(xmlId, realm);
      }
    }
  }

  ingestMaps(document) {
    /*
     * XML 1.x:
     * <Maps><Region><Map>...</Map></Region></Maps>
     */
    const regions = arrayOf(document.Maps?.Region);

    if (regions.length) {
      for (const region of regions) {
        for (const rawMap of arrayOf(region.Map)) {
          this.pushMap(rawMap, {
            regionId: String(region.id || ''),
            regionName: String(region.name || '')
          });
        }
      }
      return;
    }

    /*
     * XML 2.0:
     * <Maps><Map>...</Map></Maps>
     */
    for (const rawMap of arrayOf(document.Maps?.Map)) {
      this.pushMap(rawMap, {
        regionId: String(rawMap.regionId || ''),
        regionName: String(rawMap.regionName || '')
      });
    }
  }

  pushMap(rawMap, region) {
    const xmlId = String(rawMap.id || '');

    if (!xmlId) {
      throw new Error('Bản đồ thiếu id.');
    }

    const recommendedMinLevel = Math.max(
      1,
      asNumber(rawMap.recommendedMinLevel, 1)
    );

    let realmId = String(
      rawMap.UnlockRequirement?.realmId ||
      rawMap.realmId ||
      ''
    );

    let layerRequired = Math.max(
      1,
      asNumber(
        rawMap.UnlockRequirement?.layer,
        rawMap.layerRequired ?? 1
      )
    );

    /*
     * XML 2.0 chưa khai UnlockRequirement:
     * tạm quy đổi 9 cấp = 1 cảnh giới, mỗi cấp = 1 tầng.
     */
    if (!realmId) {
      const realmIndex = Math.max(
        0,
        Math.floor((recommendedMinLevel - 1) / 9)
      );

      realmId = this.realms[realmIndex]?.xmlId ||
        this.realms[this.realms.length - 1]?.xmlId ||
        '';

      layerRequired =
        ((recommendedMinLevel - 1) % 9) + 1;
    }

    const monsterRefs = arrayOf(
      rawMap.Monsters?.MonsterRef ||
      rawMap.Encounters?.MonsterRef
    ).map(ref => ({
      monsterId: String(ref.monsterId || ''),
      weight: asNumber(ref.weight, 1)
    }));

    this.maps.push({
      id: 0,
      runtimeId: 0,
      xmlId,
      name: String(rawMap.name || xmlId),
      order: asNumber(
        rawMap.order,
        this.maps.length + 1
      ),
      enabled: asBoolean(rawMap.enabled, true),
      regionId: region.regionId,
      regionName: region.regionName,
      realmId,
      realmRequired: 0,
      layerRequired,
      recommendedMinLevel,
      recommendedMaxLevel: Math.max(
        recommendedMinLevel,
        asNumber(
          rawMap.recommendedMaxLevel,
          recommendedMinLevel
        )
      ),
      description: String(rawMap.Description || ''),
      monsterRefs
    });
  }

  ingestMonsterSkills(document) {
    const root =
      document.MonsterSkills ||
      document.MonsterSkillCatalog ||
      {};

    for (const raw of arrayOf(root.Skill)) {
      const id = String(raw.id || '').trim();

      if (!id) {
        throw new Error('Kỹ năng yêu thú thiếu id.');
      }

      if (this.monsterSkills.has(id)) {
        throw new Error(`Trùng kỹ năng yêu thú: ${id}`);
      }

      const formula = raw.Formula || {};

      const skill = {
        id,
        name: String(raw.name || id),
        type: String(raw.type || 'damage'),
        target: String(raw.target || 'player'),
        element: String(raw.element || 'physical'),
        powerMultiplier: asNumber(
          raw.powerMultiplier,
          formula.attackScale ?? 1
        ),
        flatDamage: asNumber(
          raw.flatDamage,
          formula.flatDamage ?? 0
        ),
        hitRate: asNumber(raw.hitRate, 1),
        cooldownRounds: Math.max(
          0,
          asNumber(raw.cooldownRounds, 0)
        ),
        priority: asNumber(raw.priority, 0),
        trigger: String(raw.trigger || 'random'),
        triggerValue: asNumber(raw.triggerValue, 0),
        effectId: String(
          raw.effectId ||
          raw.ApplyStatus?.statusEffectId ||
          ''
        ),
        enabled: asBoolean(raw.enabled, true),
        description: String(raw.Description || '')
      };

      this.monsterSkills.set(id, skill);
    }

    for (const rawSet of arrayOf(root.SkillSet)) {
      const id = String(rawSet.id || '').trim();
      if (!id) continue;

      const uses = arrayOf(rawSet.Use)
        .map(use => ({
          skillId: String(use.skillId || ''),
          weight: Math.max(0, asNumber(use.weight, 1))
        }))
        .filter(use => use.skillId);

      this.monsterSkillSets.set(id, uses);
    }
  }

  ingestLootTables(document) {
    const root =
      document.DropTables ||
      document.LootTables ||
      document.MonsterDropTables ||
      {};

    for (const rawTable of arrayOf(
      root.DropTable || root.LootTable
    )) {
      const id = String(rawTable.id || '').trim();

      if (!id) {
        throw new Error('DropTable thiếu id.');
      }

      if (this.lootTables.has(id)) {
        throw new Error(`Trùng DropTable: ${id}`);
      }

      const drops = arrayOf(rawTable.Drop).map(raw => {
        const minQuantity = Math.max(
          1,
          Math.floor(
            asNumber(
              raw.minQuantity,
              raw.min ?? 1
            )
          )
        );

        const maxQuantity = Math.max(
          minQuantity,
          Math.floor(
            asNumber(
              raw.maxQuantity,
              raw.max ?? minQuantity
            )
          )
        );

        return {
          itemId: String(raw.itemId || '').trim(),
          chance: Math.max(
            0,
            Math.min(
              100,
              asNumber(raw.chance, 0)
            )
          ),
          minQuantity,
          maxQuantity,
          bind: asBoolean(raw.bind, false),
          announce: asBoolean(raw.announce, false)
        };
      });

      this.lootTables.set(id, {
        id,
        rollMode: String(
          rawTable.rollMode || 'independent'
        ),
        rolls: Math.max(
          1,
          Math.floor(
            asNumber(rawTable.rolls, 1)
          )
        ),
        drops
      });
    }
  }

ingestMonsters(document) {
  for (const raw of arrayOf(document.Monsters?.Monster)) {
    const xmlId = String(raw.id || '');

    if (!xmlId) {
      throw new Error('Yêu thú thiếu id.');
    }

    const stats = raw.Stats || {};
    const rewardsRoot = raw.Rewards || {};
    const rewardRows = arrayOf(rewardsRoot.Reward);

    const currencyReward = rewardRows.find(
      reward =>
        String(reward.type || '') === 'currency' &&
        String(reward.currencyId || '') === 'linh_thach'
    );

    const experienceAmount = pathId => {
      const reward = rewardRows.find(
        row =>
          String(row.type || '') === 'experience' &&
          String(row.path || '') === pathId
      );

      return asNumber(reward?.amount, 0);
    };

    let skillRefs = arrayOf(raw.Skills?.SkillRef)
      .map(ref => ({
        skillId: String(ref.skillId || '').trim(),
        chance: Math.min(
          1,
          Math.max(0, asNumber(ref.chance, 0))
        ),
        weight: 0,
        selectionMode: 'independent',
        unlockHpPercent: Math.min(
          1,
          Math.max(
            0,
            asNumber(ref.unlockHpPercent, 1)
          )
        ),
        enabled: asBoolean(ref.enabled, true)
      }))
      .filter(ref => ref.skillId);

    const skillSetId = String(
      raw.skillSetId || ''
    ).trim();

    if (!skillRefs.length && skillSetId) {
      const set =
        this.monsterSkillSets.get(skillSetId) || [];

      skillRefs = set.map(row => ({
        skillId: row.skillId,
        chance: 1,
        weight: Math.max(
          0,
          asNumber(row.weight, 0)
        ),
        selectionMode: 'weighted',
        unlockHpPercent: 1,
        enabled: true
      }));
    }

    this.monsters.push({
      id: 0,
      runtimeId: 0,
      xmlId,
      name: String(raw.name || xmlId),
      rank: String(raw.rank || 'normal'),
      level: asNumber(raw.level, 1),
      enabled: asBoolean(raw.enabled, true),
      hp: asNumber(stats.hp, 1),
      attack: asNumber(stats.attack, 1),
      defense: asNumber(stats.defense, 0),
      speed: asNumber(stats.speed, 0),
      crit: asNumber(stats.crit, 5),
      dodge: asNumber(stats.dodge, 3),
      stonesMin: currencyReward
        ? asNumber(currencyReward.min, 0)
        : asNumber(rewardsRoot.spiritStonesMin, 0),
      stonesMax: currencyReward
        ? asNumber(currencyReward.max, 0)
        : asNumber(rewardsRoot.spiritStonesMax, 0),
      bodyExp: rewardRows.length
        ? experienceAmount('body')
        : asNumber(rewardsRoot.bodyExp, 0),
      soulExp: rewardRows.length
        ? experienceAmount('soul')
        : asNumber(rewardsRoot.soulExp, 0),
      mainExp: rewardRows.length
        ? experienceAmount('main')
        : asNumber(rewardsRoot.mainExp, 0),
      lootTableId: String(
        raw.lootTableId || raw.dropTableId || ''
      ),
      skillSetId,
      skillRefs
    });
  }
}

finalize() {
    this.realms.sort((a, b) => a.order - b.order);
    this.bodyRealms.sort((a, b) => a.order - b.order);
    this.soulRealms.sort((a, b) => a.order - b.order);
    this.maps.sort((a, b) => a.order - b.order);

    this.monsters.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }

      return a.xmlId.localeCompare(b.xmlId);
    });

    this.realms.forEach((realm, index) => {
      realm.index = index;
    });

    this.maps.forEach((map, index) => {
      map.id = index + 1;
      map.runtimeId = map.id;
      map.realmRequired = this.getRealmIndexById(
        map.realmId
      );

      this.mapByXmlId.set(map.xmlId, map);
      this.mapByRuntimeId.set(map.runtimeId, map);
    });

    this.rebuildSpiritualRootAliases();

    this.monsters.forEach((monster, index) => {
      monster.id = index + 1;
      monster.runtimeId = monster.id;

      this.monsterByXmlId.set(
        monster.xmlId,
        monster
      );

      this.monsterByRuntimeId.set(
        monster.runtimeId,
        monster
      );
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

    if (!this.spiritualRoots.length) {
      throw new Error('Đạo tàng không có Linh Căn.');
    }

    for (const map of this.maps) {
      if (!this.realmByXmlId.has(map.realmId)) {
        throw new Error(
          `Bản đồ ${map.xmlId} yêu cầu cảnh giới ` +
          `không tồn tại: ${map.realmId}`
        );
      }

      if (!map.monsterRefs.length) {
        throw new Error(
          `Bản đồ ${map.xmlId} không có yêu thú.`
        );
      }

      for (const reference of map.monsterRefs) {
        if (!this.monsterByXmlId.has(reference.monsterId)) {
          throw new Error(
            `Bản đồ ${map.xmlId} gọi yêu thú ` +
            `không tồn tại: ${reference.monsterId}`
          );
        }
      }
    }

    for (const monster of this.monsters) {
      if (
        monster.lootTableId &&
        !this.lootTables.has(monster.lootTableId)
      ) {
        throw new Error(
          `Yêu thú ${monster.xmlId} gọi LootTable ` +
          `không tồn tại: ${monster.lootTableId}`
        );
      }

      for (const reference of monster.skillRefs) {
        if (!this.monsterSkills.has(reference.skillId)) {
          throw new Error(
            `Yêu thú ${monster.xmlId} gọi kỹ năng ` +
            `không tồn tại: ${reference.skillId}`
          );
        }
      }
    }

    for (const table of this.lootTables.values()) {
      for (const drop of table.drops) {
        if (!this.items.has(drop.itemId)) {
          throw new Error(
            `LootTable ${table.id} gọi vật phẩm ` +
            `không tồn tại: ${drop.itemId}`
          );
        }

        if (drop.maxQuantity < drop.minQuantity) {
          throw new Error(
            `LootTable ${table.id}: ${drop.itemId} ` +
            'có maxQuantity nhỏ hơn minQuantity.'
          );
        }
      }
    }
  }

  ensureLoaded() {
    if (!this.loaded) {
      throw new Error('Đạo tàng chưa được khai mở.');
    }
  }

  getRealmIndexById(id) {
    const realm = this.realmByXmlId.get(String(id));
    return realm
      ? this.realms.indexOf(realm)
      : -1;
  }

  getRealm(indexOrId) {
    if (
      typeof indexOrId === 'string' &&
      !/^\d+$/.test(indexOrId)
    ) {
      return this.realmByXmlId.get(indexOrId) || null;
    }

    return this.realms[
      asNumber(indexOrId, -1)
    ] || null;
  }

  getRealmName(indexOrId) {
    return this.getRealm(indexOrId)?.name ||
      'Vô Danh Cảnh';
  }

  getAllRealms() {
    this.ensureLoaded();
    return this.realms.map(item => ({
      ...item,
      layerData: item.layerData.map(layer => ({
        ...layer
      }))
    }));
  }

  getMap(id) {
    this.ensureLoaded();

    if (
      typeof id === 'string' &&
      !/^\d+$/.test(id)
    ) {
      return this.mapByXmlId.get(id) || null;
    }

    return this.mapByRuntimeId.get(
      asNumber(id, -1)
    ) || null;
  }

  getAllMaps() {
    this.ensureLoaded();

    return this.maps.map(item => ({
      ...item,
      monsterRefs: item.monsterRefs.map(
        reference => ({ ...reference })
      )
    }));
  }

  getMonsterSkill(id) {
    this.ensureLoaded();
    return this.monsterSkills.get(String(id)) || null;
  }

  getMonsterSkills(monster) {
    this.ensureLoaded();

    if (!monster) return [];

    const references = (monster.skillRefs || [])
      .filter(reference => reference.enabled);

    const weightedReferences = references.filter(
      reference =>
        reference.selectionMode === 'weighted'
    );

    if (weightedReferences.length) {
      const selected = weightedRandom(
        weightedReferences,
        reference => reference.weight
      );

      if (!selected) return [];

      const skill = this.monsterSkills.get(
        selected.skillId
      );

      if (!skill || !skill.enabled) {
        return [];
      }

      return [{
        ...skill,
        chance: 1,
        weight: selected.weight,
        selectionMode: 'weighted',
        unlockHpPercent:
          selected.unlockHpPercent
      }];
    }

    return references
      .map(reference => {
        const skill = this.monsterSkills.get(
          reference.skillId
        );

        if (!skill || !skill.enabled) {
          return null;
        }

        return {
          ...skill,
          chance: reference.chance,
          weight: reference.weight || 0,
          selectionMode:
            reference.selectionMode || 'independent',
          unlockHpPercent:
            reference.unlockHpPercent
        };
      })
      .filter(Boolean);
  }

getMonster(id) {
    this.ensureLoaded();

    if (
      typeof id === 'string' &&
      !/^\d+$/.test(id)
    ) {
      return this.monsterByXmlId.get(id) || null;
    }

    return this.monsterByRuntimeId.get(
      asNumber(id, -1)
    ) || null;
  }

  getAllMonsters() {
    this.ensureLoaded();
    return this.monsters.map(item => ({
      ...item,
      skillRefs: item.skillRefs.map(
        reference => ({ ...reference })
      )
    }));
  }

  normalizeSpiritualRootKey(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  rebuildSpiritualRootAliases() {
    this.spiritualRootAliases = new Map();

    const addAlias = (alias, root) => {
      const key = this.normalizeSpiritualRootKey(alias);
      if (key && root && !this.spiritualRootAliases.has(key)) {
        this.spiritualRootAliases.set(key, root);
      }
    };

    for (const root of this.spiritualRoots) {
      addAlias(root.id, root);
      addAlias(root.name, root);
      addAlias(root.element, root);

      const id = this.normalizeSpiritualRootKey(root.id);
      addAlias(id.replace(/_linh_can$/, ''), root);
      addAlias(id.replace(/_tap_linh_can$/, ''), root);
      addAlias(id.replace(/_thien_linh_can$/, ''), root);
      addAlias(id.replace(/_dia_linh_can$/, ''), root);
      addAlias(id.replace(/_pham_linh_can$/, ''), root);
    }
  }

  getSpiritualRoot(id) {
    this.ensureLoaded();

    const rawId = String(id ?? '').trim();
    if (!rawId) return null;

    const exact = this.spiritualRootById.get(rawId);
    if (exact) return exact;

    if (!this.spiritualRootAliases) {
      this.rebuildSpiritualRootAliases();
    }

    return this.spiritualRootAliases.get(
      this.normalizeSpiritualRootKey(rawId)
    ) || null;
  }

  resolvePlayerSpiritualRoot(player) {
    this.ensureLoaded();

    const candidates = [
      player?.spiritual_root,
      player?.base_spiritual_root,
      player?.spiritual_root_id,
      player?.base_spiritual_root_id,
      player?.root_id,
      player?.element
    ];

    for (const candidate of candidates) {
      const root = this.getSpiritualRoot(candidate);
      if (root) return root;
    }

    return this.getSpiritualRoot('ngu_hanh_tap_linh_can') ||
      this.spiritualRoots[0] ||
      null;
  }

  getAllSpiritualRoots() {
    this.ensureLoaded();
    return this.spiritualRoots.map(item => ({
      ...item
    }));
  }

  getRandomSpiritualRoot() {
    this.ensureLoaded();

    return weightedRandom(
      this.spiritualRoots,
      root => root.weight
    );
  }

  getRealmGrowth(spiritualRootId, baseGrowth) {
    const root =
      this.getSpiritualRoot(spiritualRootId) ||
      this.getSpiritualRoot('ngu_hanh_tap_linh_can') ||
      this.spiritualRoots[0];

    if (!root) {
      return {
        hp: Math.max(1, Math.round(asNumber(baseGrowth.hp, 1))),
        mp: Math.max(1, Math.round(asNumber(baseGrowth.mp, 1))),
        attack: Math.max(
          1,
          Math.round(asNumber(baseGrowth.attack, 1))
        ),
        defense: Math.max(
          1,
          Math.round(asNumber(baseGrowth.defense, 1))
        )
      };
    }

    return {
      hp: Math.max(
        1,
        Math.round(
          asNumber(baseGrowth.hp, 1) *
          root.growthHp
        )
      ),
      mp: Math.max(
        1,
        Math.round(
          asNumber(baseGrowth.mp, 1) *
          root.growthMp
        )
      ),
      attack: Math.max(
        1,
        Math.round(
          asNumber(baseGrowth.attack, 1) *
          root.growthAttack
        )
      ),
      defense: Math.max(
        1,
        Math.round(
          asNumber(baseGrowth.defense, 1) *
          root.growthDefense
        )
      )
    };
  }

  getRandomMonster(mapId) {
    const map = this.getMap(mapId);

    if (!map) {
      throw new Error(`Không tìm thấy bản đồ: ${mapId}`);
    }

    const selected = weightedRandom(
      map.monsterRefs,
      reference => reference.weight
    );

    const monster = selected
      ? this.monsterByXmlId.get(selected.monsterId)
      : null;

    if (!monster) {
      throw new Error(
        `Bản đồ ${map.name} không thể triệu hồi yêu thú.`
      );
    }

    return monster;
  }

  getUnlockedMaps(player) {
    this.ensureLoaded();

    const realmIndex = asNumber(
      player.main_realm_index,
      0
    );

    const layer = asNumber(
      player.main_layer,
      1
    );

    return this.maps.filter(map => {
      if (!map.enabled) return false;
      if (realmIndex > map.realmRequired) return true;
      if (realmIndex < map.realmRequired) return false;
      return layer >= map.layerRequired;
    });
  }

  rollMonsterStones(monster) {
    const min = Math.max(
      0,
      asNumber(monster.stonesMin, 0)
    );

    const max = Math.max(
      min,
      asNumber(monster.stonesMax, min)
    );

    return Math.floor(
      Math.random() * (max - min + 1)
    ) + min;
  }

  getLootTable(id) {
    this.ensureLoaded();
    return this.lootTables.get(String(id)) || null;
  }

  rollLootTable(id) {
    this.ensureLoaded();

    const table = this.getLootTable(id);
    if (!table) return [];

    const results = [];

    const maximumRolls = Math.max(1, this.getRuleNumber('maximum_drop_rolls', 20));
    const globalRate = Math.max(0, this.getRuleNumber('global_drop_rate', 100)) / 100;
    const actualRolls = Math.min(maximumRolls, Math.max(0, table.rolls));
    for (let rollIndex = 0; rollIndex < actualRolls; rollIndex += 1) {
      for (const drop of table.drops) {
        const adjustedChance = Math.min(100, Math.max(0, drop.chance * globalRate));
        if (Math.random() * 100 >= adjustedChance) {
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

        results.push({
          itemId: drop.itemId,
          quantity,
          bind: drop.bind,
          announce: drop.announce
        });
      }
    }

    return results;
  }

  rollMonsterDrops(monster) {
    if (!monster?.lootTableId) return [];
    const drops = this.rollLootTable(monster.lootTableId);
    const rank = String(monster.rank || '').toLowerCase();
    const bonus = ['boss','world_boss'].includes(rank) ? Math.max(0, this.getRuleNumber('boss_drop_rate', 100)) / 100 : 1;
    if (bonus <= 1) return drops;
    return drops.map(drop => ({ ...drop, quantity: Math.max(1, Math.floor(drop.quantity * bonus)) }));
  }

  getItem(id) {
    this.ensureLoaded();
    return this.items.get(String(id)) || null;
  }

  getAllItems() {
    this.ensureLoaded();
    return [...this.items.values()];
  }

  getWorldSummary() {
    return {
      world: this.world,
      realms: this.realms.length,
      maps: this.maps.length,
      monsters: this.monsters.length,
      spiritualRoots: this.spiritualRoots.length,
      items: this.items.size,
      pills: this.pills.size,
      recipes: this.recipes.size,
      herbs: this.herbs.size,
      skills: this.skills.size,
      monsterSkills: this.monsterSkills.size,
      monsterSkillSets: this.monsterSkillSets.size,
      lootTables: this.lootTables.size
    };
  }
}

module.exports = new DataManager();
