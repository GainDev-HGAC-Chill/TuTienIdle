USE tutien_idle;

SET @db_name = DATABASE();

SET @has_item_name = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'player_inventory'
    AND COLUMN_NAME = 'item_name'
);

SET @sql = IF(
  @has_item_name = 0,
  "ALTER TABLE player_inventory ADD COLUMN item_name VARCHAR(128) NOT NULL DEFAULT 'Vật phẩm vô danh' AFTER item_id",
  "SELECT 'player_inventory.item_name đã tồn tại'"
);

PREPARE statement_to_run FROM @sql;
EXECUTE statement_to_run;
DEALLOCATE PREPARE statement_to_run;

SET @has_item_type = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'player_inventory'
    AND COLUMN_NAME = 'item_type'
);

SET @sql = IF(
  @has_item_type = 0,
  "ALTER TABLE player_inventory ADD COLUMN item_type VARCHAR(32) NOT NULL DEFAULT 'material' AFTER item_name",
  "SELECT 'player_inventory.item_type đã tồn tại'"
);

PREPARE statement_to_run FROM @sql;
EXECUTE statement_to_run;
DEALLOCATE PREPARE statement_to_run;

SET @has_metadata = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'player_inventory'
    AND COLUMN_NAME = 'metadata'
);

SET @sql = IF(
  @has_metadata = 0,
  "ALTER TABLE player_inventory ADD COLUMN metadata JSON NULL AFTER quantity",
  "SELECT 'player_inventory.metadata đã tồn tại'"
);

PREPARE statement_to_run FROM @sql;
EXECUTE statement_to_run;
DEALLOCATE PREPARE statement_to_run;

UPDATE player_inventory
SET item_name = CASE
      WHEN item_id = 'linh_thach' THEN 'Linh Thạch'
      WHEN item_name IS NULL OR item_name = '' THEN 'Vật phẩm vô danh'
      ELSE item_name
    END,
    item_type = CASE
      WHEN item_id = 'linh_thach' THEN 'currency'
      WHEN item_type IS NULL OR item_type = '' THEN 'material'
      ELSE item_type
    END;
