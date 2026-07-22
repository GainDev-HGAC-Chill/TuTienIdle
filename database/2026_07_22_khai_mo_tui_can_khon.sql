-- KHAI MỞ TÚI CÀN KHÔN
-- Sao lưu database trước khi chạy.
-- Migration giữ dữ liệu vật phẩm cũ và chuyển chúng sang hệ slot.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS player_bags (
  player_id BIGINT UNSIGNED NOT NULL,
  unlocked_slots INT UNSIGNED NOT NULL DEFAULT 30,
  maximum_slots INT UNSIGNED NOT NULL DEFAULT 200,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (player_id),
  CONSTRAINT fk_player_bags_player
    FOREIGN KEY (player_id) REFERENCES players(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO player_bags(player_id, unlocked_slots, maximum_slots)
SELECT id, 30, 200 FROM players
ON DUPLICATE KEY UPDATE player_id = VALUES(player_id);

-- Linh Thạch là tiền tệ trong players.spirit_stones, không chiếm ô.
DELETE FROM player_inventory WHERE item_id = 'linh_thach';

-- Thêm slot_index nếu chưa có (MySQL 8+).
ALTER TABLE player_inventory
  ADD COLUMN IF NOT EXISTS slot_index INT UNSIGNED NULL AFTER player_id;

-- Gán ô tuần tự cho dữ liệu cũ.
SET @current_player := 0;
SET @slot_no := 0;

UPDATE player_inventory pi
JOIN (
  SELECT id,
         player_id,
         (@slot_no := IF(@current_player = player_id, @slot_no + 1, 1)) AS new_slot,
         (@current_player := player_id) AS marker
  FROM player_inventory
  CROSS JOIN (SELECT @current_player := 0, @slot_no := 0) vars
  ORDER BY player_id, id
) numbered ON numbered.id = pi.id
SET pi.slot_index = numbered.new_slot
WHERE pi.slot_index IS NULL OR pi.slot_index = 0;

ALTER TABLE player_inventory
  MODIFY slot_index INT UNSIGNED NOT NULL;

-- Tên và loại trong DB không còn là nguồn dữ liệu chính.
ALTER TABLE player_inventory
  MODIFY item_name VARCHAR(128) NULL,
  MODIFY item_type VARCHAR(32) NULL;

-- Xóa unique cũ nếu tồn tại bằng thủ tục tạm.
DROP PROCEDURE IF EXISTS drop_index_if_exists;
DELIMITER $$
CREATE PROCEDURE drop_index_if_exists(
  IN table_name_in VARCHAR(64),
  IN index_name_in VARCHAR(64)
)
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = table_name_in
      AND index_name = index_name_in
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', table_name_in, '` DROP INDEX `', index_name_in, '`');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL drop_index_if_exists('player_inventory', 'uq_inventory_item');
CALL drop_index_if_exists('player_inventory', 'uq_inventory_slot');
DROP PROCEDURE drop_index_if_exists;

ALTER TABLE player_inventory
  ADD UNIQUE KEY uq_inventory_slot(player_id, slot_index),
  ADD KEY ix_inventory_item(player_id, item_id);

COMMIT;
