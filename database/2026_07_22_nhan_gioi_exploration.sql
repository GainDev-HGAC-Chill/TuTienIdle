-- GIAI ĐOẠN 2 · LỊCH LUYỆN NHÂN GIỚI
-- Chạy đúng 1 lần trong database tutien_idle.

CREATE TABLE IF NOT EXISTS player_pending_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  player_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(64) NOT NULL,
  event_id VARCHAR(80) NOT NULL,
  map_id INT NOT NULL,
  choice_id VARCHAR(80) NULL,
  outcome_type VARCHAR(40) NULL,
  outcome_payload JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  resolved_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_player_pending_event_token (token),
  KEY ix_player_pending_event_player (player_id, resolved_at),
  CONSTRAINT fk_pending_event_player
    FOREIGN KEY (player_id) REFERENCES players(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS world_boss_state (
  boss_id VARCHAR(80) NOT NULL,
  alive TINYINT(1) NOT NULL DEFAULT 1,
  spawned_at DATETIME(3) NULL,
  defeated_at DATETIME(3) NULL,
  next_spawn_at DATETIME(3) NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (boss_id),
  KEY ix_world_boss_respawn (alive, next_spawn_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
