-- ĐỢT 2 - CÔNG PHÁP CHÂN GIẢI
-- Nâng player_equipped_arts từ 1 ô mỗi loại thành 3 ô mỗi loại.
-- Dữ liệu cũ được giữ nguyên ở slot_index = 1.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS player_equipped_arts_v2 (
  player_id BIGINT UNSIGNED NOT NULL,
  category ENUM('tam_phap','chien_phap','luyen_the','than_thong') NOT NULL,
  slot_index TINYINT UNSIGNED NOT NULL DEFAULT 1,
  art_id VARCHAR(100) NOT NULL,
  equipped_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(player_id, category, slot_index),
  UNIQUE KEY uq_player_equipped_art(player_id, art_id),
  KEY idx_equipped_art(art_id),
  CONSTRAINT fk_equipped_art_v2_player
    FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE,
  CONSTRAINT chk_equipped_art_slot CHECK(slot_index BETWEEN 1 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO player_equipped_arts_v2(
  player_id, category, slot_index, art_id, equipped_at
)
SELECT player_id, category, 1, art_id, equipped_at
FROM player_equipped_arts;

DROP TABLE player_equipped_arts;
RENAME TABLE player_equipped_arts_v2 TO player_equipped_arts;

COMMIT;
