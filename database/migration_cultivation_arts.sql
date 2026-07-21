CREATE TABLE IF NOT EXISTS player_cultivation_arts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  player_id BIGINT UNSIGNED NOT NULL,
  art_id VARCHAR(100) NOT NULL,
  category ENUM('tam_phap','chien_phap','luyen_the','than_thong') NOT NULL,
  grade ENUM('pham','hoang','huyen','dia','thien') NOT NULL DEFAULT 'pham',
  art_level INT UNSIGNED NOT NULL DEFAULT 1,
  art_exp BIGINT UNSIGNED NOT NULL DEFAULT 0,
  learned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(id), UNIQUE KEY uq_player_art(player_id,art_id), KEY idx_player_category(player_id,category),
  CONSTRAINT fk_player_art_player FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS player_equipped_arts (
  player_id BIGINT UNSIGNED NOT NULL,
  category ENUM('tam_phap','chien_phap','luyen_the','than_thong') NOT NULL,
  art_id VARCHAR(100) NOT NULL,
  equipped_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(player_id,category), KEY idx_equipped_art(art_id),
  CONSTRAINT fk_equipped_art_player FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
