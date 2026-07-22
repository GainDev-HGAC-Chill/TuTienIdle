const path = require('path');
const { loadXml, arrayOf } = require('./xmlLoader');

function number(value, fallback = 0) {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function boolean(value, fallback = true) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() !== 'false';
}

class MapEnvironmentManager {
  constructor() {
    this.loaded = false;
    this.environments = new Map();
    this.environmentByMapId = new Map();
  }

  reset() {
    this.loaded = false;
    this.environments.clear();
    this.environmentByMapId.clear();
  }

  load(worldDirectory) {
    this.reset();

    const filePath = path.join(
      worldDirectory,
      'TheGioi',
      'MapEnvironments.xml'
    );

    const document = loadXml(filePath);
    const root = document.MapEnvironments;

    if (!root) {
      throw new Error('MapEnvironments.xml thiếu thẻ MapEnvironments.');
    }

    for (const rawEnvironment of arrayOf(root.Environment)) {
      const id = String(rawEnvironment.id || '').trim();
      const mapId = String(rawEnvironment.mapId || '').trim();

      if (!id || !mapId) {
        throw new Error('Thiên Tượng thiếu id hoặc mapId.');
      }

      if (this.environments.has(id)) {
        throw new Error(`Trùng Thiên Tượng: ${id}`);
      }

      if (this.environmentByMapId.has(mapId)) {
        throw new Error(`Bản đồ ${mapId} có nhiều Thiên Tượng.`);
      }

      const hazards = arrayOf(rawEnvironment.Hazards?.Hazard)
        .map(rawHazard => this.parseHazard(rawHazard, mapId))
        .filter(hazard => hazard.enabled);

      const environment = {
        id,
        mapId,
        name: String(rawEnvironment.name || id),
        hazards
      };

      this.environments.set(id, environment);
      this.environmentByMapId.set(mapId, environment);
    }

    this.loaded = true;

    return {
      environments: this.environments.size,
      hazards: [...this.environments.values()]
        .reduce((sum, environment) => sum + environment.hazards.length, 0)
    };
  }

  parseHazard(raw, mapId) {
    const id = String(raw.id || '').trim();

    if (!id) {
      throw new Error(`Thiên Tượng của ${mapId} có hiệu ứng thiếu id.`);
    }

    const chancePerMinute = Math.max(
      0,
      Math.min(100, number(raw.chancePerMinute, 0))
    );

    return {
      id,
      mapId,
      name: String(raw.name || id),
      chancePerMinute,
      cooldownSeconds: Math.max(
        0,
        Math.floor(number(raw.cooldownSeconds, 0))
      ),
      triggerActivity: String(raw.triggerActivity || 'combat'),
      enabled: boolean(raw.enabled, true),
      effects: arrayOf(raw.Effects?.Effect).map(effect => ({
        type: String(effect.type || ''),
        path: String(effect.path || ''),
        itemId: String(effect.itemId || ''),
        currencyId: String(effect.currencyId || ''),
        min: number(effect.min, 0),
        max: number(effect.max, effect.min ?? 0),
        maximum: Math.max(0, number(effect.maximum, 0)),
        cannotKill: boolean(effect.cannotKill, true)
      })),
      logTemplate: String(raw.Log || raw.name || id)
    };
  }

  ensureLoaded() {
    if (!this.loaded) {
      throw new Error('Thiên Tượng Bản Đồ chưa được khai mở.');
    }
  }

  getByMapId(mapId) {
    this.ensureLoaded();
    return this.environmentByMapId.get(String(mapId)) || null;
  }

  getAll() {
    this.ensureLoaded();
    return [...this.environments.values()].map(environment => ({
      ...environment,
      hazards: environment.hazards.map(hazard => ({
        ...hazard,
        effects: hazard.effects.map(effect => ({ ...effect }))
      }))
    }));
  }

  getSummary() {
    this.ensureLoaded();
    return {
      environments: this.environments.size,
      hazards: [...this.environments.values()]
        .reduce((sum, environment) => sum + environment.hazards.length, 0)
    };
  }
}

module.exports = new MapEnvironmentManager();
