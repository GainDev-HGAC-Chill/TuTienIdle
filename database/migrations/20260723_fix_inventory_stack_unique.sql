-- Sửa khóa duy nhất cũ khiến vật phẩm rơi lặp lại báo ER_DUP_ENTRY.
-- Sau migration, mỗi ô túi là duy nhất; một item có thể có nhiều chồng khi vượt stack_limit.

SET @db_name := DATABASE();

SET @has_slot_index := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'player_inventory'
    AND COLUMN_NAME = 'slot_index'
);
SET @sql := IF(
  @has_slot_index = 0,
  'ALTER TABLE player_inventory ADD COLUMN slot_index INT UNSIGNED NULL AFTER player_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Gán ô cho dữ liệu cũ chưa có slot_index, tuần tự theo từng người chơi.
SET @current_player := NULL;
SET @slot_no := 0;
UPDATE player_inventory pi
JOIN (
  SELECT id,
         @slot_no := IF(@current_player = player_id, @slot_no + 1, 1) AS generated_slot,
         @current_player := player_id AS assigned_player
  FROM player_inventory
  ORDER BY player_id, COALESCE(slot_index, 4294967295), id
) ranked ON ranked.id = pi.id
SET pi.slot_index = ranked.generated_slot
WHERE pi.slot_index IS NULL;

SET @has_old_index := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'player_inventory'
    AND INDEX_NAME = 'uq_inventory_item'
);
SET @sql := IF(
  @has_old_index > 0,
  'ALTER TABLE player_inventory DROP INDEX uq_inventory_item',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_slot_index_key := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'player_inventory'
    AND INDEX_NAME = 'uq_inventory_slot'
);
SET @sql := IF(
  @has_slot_index_key = 0,
  'ALTER TABLE player_inventory ADD UNIQUE KEY uq_inventory_slot (player_id, slot_index)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_item_index := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'player_inventory'
    AND INDEX_NAME = 'ix_inventory_item'
);
SET @sql := IF(
  @has_item_index = 0,
  'ALTER TABLE player_inventory ADD INDEX ix_inventory_item (player_id, item_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
