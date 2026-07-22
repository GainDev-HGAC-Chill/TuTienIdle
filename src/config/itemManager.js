const fs = require('fs');
const path = require('path');
const { loadXml, arrayOf } = require('./xmlLoader');

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  return String(value).toLowerCase() === 'true';
}

class ItemManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.loaded = false;
    this.items = new Map();
  }

  load(nhanGioiDirectory) {
    this.reset();
    const folder = path.join(nhanGioiDirectory, 'VatPham');
    if (!fs.existsSync(folder)) {
      throw new Error(`Không tìm thấy đạo tàng Vật Phẩm: ${folder}`);
    }

    const files = fs.readdirSync(folder)
      .filter(name => name.toLowerCase().endsWith('.xml'))
      .sort();

    for (const name of files) {
      const document = loadXml(path.join(folder, name));
      for (const raw of arrayOf(document.Items?.Item)) {
        this.ingest(raw, name);
      }
    }

    if (!this.items.size) {
      throw new Error('Đạo tàng Vật Phẩm không có vật phẩm nào.');
    }

    this.loaded = true;
    return { total: this.items.size, files: files.length };
  }

  ingest(raw, sourceFile) {
    const id = String(raw.id || '').trim();
    if (!id) throw new Error(`${sourceFile}: Item thiếu id.`);
    if (this.items.has(id)) throw new Error(`Trùng itemId "${id}" trong ${sourceFile}.`);

    const effectRaw = raw.UseEffect || null;
    const item = {
      id,
      name: String(raw.name || id),
      category: String(raw.category || 'material'),
      subCategory: String(raw.subCategory || ''),
      quality: String(raw.quality || 'pham'),
      stackLimit: Math.max(1, Math.floor(asNumber(raw.stackLimit, 1))),
      sellPrice: Math.max(0, Math.floor(asNumber(raw.sellPrice, 0))),
      tradable: asBoolean(raw.tradable, true),
      usable: asBoolean(raw.usable, false),
      description: String(raw.Description || ''),
      sourceFile,
      useEffect: effectRaw ? {
        type: String(effectRaw.type || ''),
        amount: asNumber(effectRaw.amount, 0),
        slots: Math.max(0, Math.floor(asNumber(effectRaw.slots, 0))),
        itemMaximumSlots: Math.max(0, Math.floor(asNumber(effectRaw.itemMaximumSlots, 0)))
      } : null
    };

    this.items.set(id, Object.freeze(item));
  }

  ensureLoaded() {
    if (!this.loaded) throw new Error('ItemManager chưa được khai mở.');
  }

  get(itemId) {
    this.ensureLoaded();
    return this.items.get(String(itemId)) || null;
  }

  require(itemId) {
    const item = this.get(itemId);
    if (!item) {
      const error = new Error(`Vật phẩm "${itemId}" không tồn tại trong đạo tàng.`);
      error.statusCode = 500;
      throw error;
    }
    return item;
  }

  all() {
    this.ensureLoaded();
    return [...this.items.values()];
  }

  publicItem(item) {
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      subCategory: item.subCategory,
      quality: item.quality,
      stackLimit: item.stackLimit,
      sellPrice: item.sellPrice,
      tradable: item.tradable,
      usable: item.usable,
      description: item.description
    };
  }
}

module.exports = new ItemManager();
