const itemManager = require('../config/itemManager');
const dataManager = require('../config/dataManager');

const DEFAULT_SLOTS = 40;
const MAXIMUM_SLOTS = 200;
function initialSlots() { return Math.max(1, dataManager.getRuleNumber('initial_slot_count', DEFAULT_SLOTS)); }
function maximumSlots() { return Math.max(initialSlots(), dataManager.getRuleNumber('maximum_slot_count', MAXIMUM_SLOTS)); }

function json(value) {
  if (value === undefined || value === null) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

async function ensureBag(connection, playerId) {
  await connection.query(
    `INSERT INTO player_bags(player_id, unlocked_slots, maximum_slots)
     VALUES(?, ?, ?)
     ON DUPLICATE KEY UPDATE player_id = VALUES(player_id)`,
    [playerId, initialSlots(), maximumSlots()]
  );
}

async function getBag(connection, playerId, lock = false) {
  await ensureBag(connection, playerId);
  const [rows] = await connection.query(
    `SELECT player_id, unlocked_slots, maximum_slots
     FROM player_bags
     WHERE player_id = ?
     ${lock ? 'FOR UPDATE' : ''}`,
    [playerId]
  );
  return rows[0];
}

async function list(connection, playerId) {
  const bag = await getBag(connection, playerId, false);
  const [rows] = await connection.query(
    `SELECT id, slot_index, item_id, quantity, metadata
     FROM player_inventory
     WHERE player_id = ? AND quantity > 0
     ORDER BY slot_index ASC, id ASC`,
    [playerId]
  );

  const items = rows.map(row => {
    const definition = itemManager.require(row.item_id);
    let metadata = row.metadata;
    if (typeof metadata === 'string') {
      try { metadata = JSON.parse(metadata); } catch { metadata = null; }
    }
    return {
      id: row.id,
      slot_index: Number(row.slot_index),
      item_id: definition.id,
      item_name: definition.name,
      item_type: definition.category,
      category: definition.category,
      sub_category: definition.subCategory,
      quality: definition.quality,
      stack_limit: definition.stackLimit,
      sell_price: definition.sellPrice,
      tradable: definition.tradable,
      usable: definition.usable,
      description: definition.description,
      quantity: Number(row.quantity),
      metadata
    };
  });

  return {
    bag: {
      unlocked_slots: Number(bag.unlocked_slots),
      maximum_slots: Number(bag.maximum_slots),
      used_slots: items.length,
      free_slots: Math.max(0, Number(bag.unlocked_slots) - items.length)
    },
    items
  };
}

async function occupiedSlots(connection, playerId) {
  const [rows] = await connection.query(
    `SELECT slot_index FROM player_inventory
     WHERE player_id = ? AND quantity > 0
     ORDER BY slot_index ASC FOR UPDATE`,
    [playerId]
  );
  return new Set(rows.map(row => Number(row.slot_index)));
}

function findFreeSlot(occupied, unlockedSlots) {
  for (let slot = 1; slot <= unlockedSlots; slot += 1) {
    if (!occupied.has(slot)) return slot;
  }
  return null;
}

async function addItem(connection, playerId, itemId, quantity = 1, metadata = null) {
  const definition = itemManager.require(itemId);
  const numericQuantity = Math.floor(Number(quantity) || 0);
  if (numericQuantity < 0 && dataManager.getRuleBoolean('reject_negative_quantity', true)) {
    const error = new Error('Số lượng vật phẩm không được âm.');
    error.statusCode = 400;
    throw error;
  }
  let remaining = Math.max(0, numericQuantity);
  if (remaining <= 0) return { requested: 0, added: 0, rejected: 0, full: false };

  const requested = remaining;
  const bag = await getBag(connection, playerId, true);
  const unlockedSlots = Number(bag.unlocked_slots);
  const metadataJson = json(metadata);
  const stackLimit = Math.max(1, dataManager.getStackLimit(definition.category, definition.stackLimit || 999));
  const autoMerge = dataManager.getRuleBoolean('auto_merge_stacks', true);
  const separateMetadata = dataManager.getRuleBoolean('metadata_separates_stacks', true);
  let stackRows = [];

  if (autoMerge) {
    const metadataClause = separateMetadata
      ? "AND COALESCE(metadata, '{}') = COALESCE(?, '{}')"
      : '';
    const params = separateMetadata
      ? [playerId, definition.id, metadataJson, stackLimit]
      : [playerId, definition.id, stackLimit];
    const [rows] = await connection.query(
      `SELECT id, slot_index, quantity
       FROM player_inventory
       WHERE player_id = ?
         AND item_id = ?
         ${metadataClause}
         AND quantity < ?
       ORDER BY slot_index ASC
       FOR UPDATE`,
      params
    );
    stackRows = rows;
  }

  for (const stack of stackRows) {
    if (remaining <= 0) break;
    const capacity = stackLimit - Number(stack.quantity);
    const moved = Math.min(capacity, remaining);
    if (moved <= 0) continue;
    await connection.query(
      'UPDATE player_inventory SET quantity = quantity + ? WHERE id = ?',
      [moved, stack.id]
    );
    remaining -= moved;
  }

  const occupied = await occupiedSlots(connection, playerId);
  while (remaining > 0) {
    const slotIndex = findFreeSlot(occupied, unlockedSlots);
    if (slotIndex === null) break;

    const moved = Math.min(stackLimit, remaining);
    await connection.query(
      `INSERT INTO player_inventory(player_id, slot_index, item_id, quantity, metadata)
       VALUES(?, ?, ?, ?, ?)`,
      [playerId, slotIndex, definition.id, moved, metadataJson]
    );
    occupied.add(slotIndex);
    remaining -= moved;
  }

  return {
    requested,
    added: requested - remaining,
    rejected: remaining,
    full: remaining > 0
  };
}

async function removeItem(connection, playerId, inventoryId, quantity = 1) {
  const amount = Math.max(1, Math.floor(Number(quantity) || 1));
  const [rows] = await connection.query(
    `SELECT id, item_id, quantity
     FROM player_inventory
     WHERE player_id = ? AND id = ? AND quantity > 0
     FOR UPDATE`,
    [playerId, inventoryId]
  );
  const row = rows[0];
  if (!row || Number(row.quantity) < amount) {
    const error = new Error('Vật phẩm không đủ số lượng.');
    error.statusCode = 400;
    throw error;
  }

  await connection.query(
    'UPDATE player_inventory SET quantity = quantity - ? WHERE id = ?',
    [amount, row.id]
  );
  if (dataManager.getRuleBoolean('remove_zero_quantity_stack', true)) {
    await connection.query(
      'DELETE FROM player_inventory WHERE id = ? AND quantity <= 0',
      [row.id]
    );
  }
  return itemManager.require(row.item_id);
}

async function expandBag(connection, playerId, slots, itemMaximumSlots) {
  const bag = await getBag(connection, playerId, true);
  const hardMaximum = Math.min(
    Number(bag.maximum_slots),
    Number(itemMaximumSlots || bag.maximum_slots),
    maximumSlots()
  );
  const before = Number(bag.unlocked_slots);
  const after = Math.min(hardMaximum, before + Math.max(0, Number(slots) || 0));
  if (after <= before) {
    const error = new Error(`Túi Càn Khôn đã đạt giới hạn ${hardMaximum} ô của bảo vật này.`);
    error.statusCode = 400;
    throw error;
  }
  await connection.query(
    'UPDATE player_bags SET unlocked_slots = ? WHERE player_id = ?',
    [after, playerId]
  );
  return { before, after, added: after - before, maximum: Number(bag.maximum_slots) };
}

module.exports = {
  DEFAULT_SLOTS,
  MAXIMUM_SLOTS,
  ensureBag,
  getBag,
  list,
  addItem,
  removeItem,
  expandBag
};
