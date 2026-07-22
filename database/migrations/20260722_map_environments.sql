-- THIÊN TƯỢNG BẢN ĐỒ · NHÂN GIỚI
CREATE TABLE IF NOT EXISTS player_map_hazard_cooldowns (
  player_id BIGINT UNSIGNED NOT NULL,
  hazard_id VARCHAR(96) NOT NULL,
  next_available_at DATETIME(3) NOT NULL,
  triggered_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
  last_triggered_at DATETIME(3) NULL,
  PRIMARY KEY (player_id, hazard_id),
  INDEX idx_hazard_next_available (next_available_at),
  CONSTRAINT fk_hazard_cooldown_player
    FOREIGN KEY (player_id) REFERENCES players(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
