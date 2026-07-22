const path = require('path');
const { loadXml, arrayOf } = require('./xmlLoader');

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function weighted(rows, getWeight = row => row.weight) {
  if (!rows.length) return null;
  const total = rows.reduce((sum, row) => sum + Math.max(0, num(getWeight(row), 0)), 0);
  if (total <= 0) return rows[Math.floor(Math.random() * rows.length)];
  let roll = Math.random() * total;
  for (const row of rows) {
    roll -= Math.max(0, num(getWeight(row), 0));
    if (roll <= 0) return row;
  }
  return rows[rows.length - 1];
}

class ExplorationManager {
  constructor() {
    this.loaded = false;
    this.resources = new Map();
    this.npcs = new Map();
    this.events = new Map();
    this.bosses = new Map();
  }

  load(nhanGioiDirectory) {
    const folder = path.join(nhanGioiDirectory, 'LichLuyen');
    this.loadResources(path.join(folder, 'Resources.xml'));
    this.loadNpcs(path.join(folder, 'NPCs.xml'));
    this.loadEvents(path.join(folder, 'RandomEvents.xml'));
    this.loadBosses(path.join(folder, 'Bosses.xml'));
    this.loaded = true;
    return this.summary();
  }

  loadResources(file) {
    const doc = loadXml(file);
    for (const raw of arrayOf(doc.ExplorationResources?.Resource)) {
      const item = {
        id: String(raw.id),
        name: String(raw.name || raw.id),
        type: String(raw.type || 'material'),
        minQuantity: Math.max(1, num(raw.minQuantity, 1)),
        maxQuantity: Math.max(1, num(raw.maxQuantity, 1))
      };
      this.resources.set(item.id, item);
    }
  }

  loadNpcs(file) {
    const doc = loadXml(file);
    for (const raw of arrayOf(doc.ExplorationNPCs?.NPC)) {
      const npc = {
        id: String(raw.id),
        name: String(raw.name || raw.id),
        weight: num(raw.weight, 1),
        description: String(raw.Description || ''),
        behavior: String(raw.Behavior || 'random_offer')
      };
      this.npcs.set(npc.id, npc);
    }
  }

  loadEvents(file) {
    const doc = loadXml(file);
    for (const raw of arrayOf(doc.RandomEvents?.Event)) {
      const event = {
        id: String(raw.id),
        name: String(raw.name || raw.id),
        weight: num(raw.weight, 1),
        prompt: String(raw.Prompt || ''),
        choices: arrayOf(raw.Choice).map(choice => ({
          id: String(choice.id),
          text: String(choice.text || choice.id),
          outcomes: arrayOf(choice.Outcome).map(outcome => ({
            weight: num(outcome.weight, 1),
            type: String(outcome.type || 'nothing'),
            message: String(outcome.message || ''),
            resourceId: outcome.resourceId ? String(outcome.resourceId) : null,
            quantity: num(outcome.quantity, 0),
            amount: num(outcome.amount, 0),
            bossId: outcome.bossId ? String(outcome.bossId) : null,
            npcId: outcome.npcId ? String(outcome.npcId) : null
          }))
        }))
      };
      this.events.set(event.id, event);
    }
  }

  loadBosses(file) {
    const doc = loadXml(file);
    for (const raw of arrayOf(doc.Bosses?.Boss)) {
      const boss = {
        id: String(raw.id),
        name: String(raw.name || raw.id),
        type: String(raw.type || 'normal'),
        monsterId: String(raw.monsterId),
        mapId: String(raw.mapId),
        respawnHours: Math.max(1, num(raw.respawnHours, 12))
      };
      this.bosses.set(boss.id, boss);
    }
  }

  ensure() {
    if (!this.loaded) throw new Error('Lịch Luyện đạo tàng chưa được khai mở.');
  }

  summary() {
    return {
      resources: this.resources.size,
      npcs: this.npcs.size,
      events: this.events.size,
      bosses: this.bosses.size
    };
  }

  getPublicMapDetail(map) {
    if (!map) return null;
    return {
      id: map.id,
      xmlId: map.xmlId,
      name: map.name,
      realmRequired: map.realmRequired,
      layerRequired: map.layerRequired,
      description: map.description || '',
      environment: map.environment || '',
      preparation: map.preparation || ''
    };
  }

  randomResource(preferredId) {
    this.ensure();
    const preferred = preferredId ? this.resources.get(String(preferredId)) : null;
    const item = preferred || weighted([...this.resources.values()]);
    if (!item) return null;
    const quantity = Math.floor(Math.random() * (item.maxQuantity - item.minQuantity + 1)) + item.minQuantity;
    return { ...item, quantity };
  }

  randomNpc() {
    this.ensure();
    return weighted([...this.npcs.values()]);
  }

  randomEvent() {
    this.ensure();
    return weighted([...this.events.values()]);
  }

  event(id) {
    this.ensure();
    return this.events.get(String(id)) || null;
  }

  boss(id) {
    this.ensure();
    return this.bosses.get(String(id)) || null;
  }

  worldBoss() {
    this.ensure();
    return [...this.bosses.values()].find(item => item.type === 'world') || null;
  }

  resolveChoice(eventId, choiceId) {
    const event = this.event(eventId);
    if (!event) throw new Error('Kỳ ngộ không tồn tại.');
    const choice = event.choices.find(item => item.id === String(choiceId));
    if (!choice) throw new Error('Lựa chọn không tồn tại.');
    return weighted(choice.outcomes);
  }
}

module.exports = new ExplorationManager();
