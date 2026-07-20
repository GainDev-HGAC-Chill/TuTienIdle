-- THIÊN MỆNH LINH CĂN V2
-- Dùng cho MySQL 8.0+. Có thể chạy sau migration khảo nghiệm V1.
-- Không xóa dữ liệu nhân vật cũ.

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS spiritual_root_level INT NOT NULL DEFAULT 1 AFTER spiritual_root,
  ADD COLUMN IF NOT EXISTS base_spiritual_root VARCHAR(64) NULL AFTER spiritual_root,
  ADD COLUMN IF NOT EXISTS spiritual_root_scores JSON NULL AFTER spiritual_root_level,
  ADD COLUMN IF NOT EXISTS spiritual_root_trait_scores JSON NULL AFTER spiritual_root_scores,
  ADD COLUMN IF NOT EXISTS hidden_spiritual_roots JSON NULL AFTER spiritual_root_trait_scores,
  ADD COLUMN IF NOT EXISTS missing_spiritual_root VARCHAR(64) NULL AFTER hidden_spiritual_roots,
  ADD COLUMN IF NOT EXISTS innate_special_root VARCHAR(64) NULL AFTER missing_spiritual_root,
  ADD COLUMN IF NOT EXISTS is_innate_special_root TINYINT(1) NOT NULL DEFAULT 0 AFTER innate_special_root;

-- Nhân vật cũ dùng Linh Căn đang có làm Thiên Mệnh nền nếu chưa được thiết lập.
UPDATE players
SET base_spiritual_root = spiritual_root
WHERE base_spiritual_root IS NULL OR base_spiritual_root = '';
