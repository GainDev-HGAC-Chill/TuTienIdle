ALTER TABLE players
  MODIFY spiritual_root VARCHAR(64)
  NOT NULL DEFAULT 'ngu_hanh_tap_linh_can';

ALTER TABLE player_attributes
  ADD COLUMN accuracy BIGINT NOT NULL DEFAULT 100 AFTER defense_value,
  ADD COLUMN dodge_rate DECIMAL(7,4) NOT NULL DEFAULT 0.0000 AFTER accuracy,
  ADD COLUMN crit_damage DECIMAL(7,4) NOT NULL DEFAULT 1.5000 AFTER crit_rate,
  ADD COLUMN speed_value BIGINT NOT NULL DEFAULT 10 AFTER crit_damage,
  ADD COLUMN armor_penetration BIGINT NOT NULL DEFAULT 0 AFTER speed_value,
  ADD COLUMN crit_resistance DECIMAL(7,4)
    NOT NULL DEFAULT 0.0000 AFTER armor_penetration,
  ADD COLUMN life_steal DECIMAL(7,4)
    NOT NULL DEFAULT 0.0000 AFTER crit_resistance,
  ADD COLUMN hp_regen DECIMAL(12,4)
    NOT NULL DEFAULT 0.0000 AFTER life_steal,
  ADD COLUMN mp_regen DECIMAL(12,4)
    NOT NULL DEFAULT 0.0000 AFTER hp_regen;

-- Nhân vật cũ được giữ Tạp Linh Căn để tránh thay đổi dữ liệu ngoài ý muốn.
UPDATE players
SET spiritual_root = 'ngu_hanh_tap_linh_can'
WHERE spiritual_root IS NULL
   OR spiritual_root = '';
