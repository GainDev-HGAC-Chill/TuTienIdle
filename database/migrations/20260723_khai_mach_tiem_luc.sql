-- ĐỢT 1 - KHAI MẠCH TIỀM LỰC
-- Chạy một lần trên database tutien_idle sau khi sao lưu.

START TRANSACTION;

ALTER TABLE player_attributes
  MODIFY COLUMN max_mp BIGINT NOT NULL DEFAULT 50,
  MODIFY COLUMN mp_regen DECIMAL(12,4) NOT NULL DEFAULT 2.0000;

UPDATE player_attributes
SET max_mp = GREATEST(50, max_mp),
    mp_regen = GREATEST(2.0000, mp_regen);

UPDATE players AS p
JOIN player_attributes AS a ON a.player_id = p.id
SET p.current_hp = LEAST(GREATEST(1, p.current_hp), a.max_hp),
    p.current_mp = CASE
      WHEN p.current_mp <= 0 THEN a.max_mp
      ELSE LEAST(p.current_mp, a.max_mp)
    END;

COMMIT;
