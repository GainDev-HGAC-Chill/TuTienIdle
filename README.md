# Tu Tiên Idle — Nhân Giới Đạo Tạng

Bộ nền móng hoàn chỉnh gồm Frontend, Backend Node.js, MySQL schema một lần chạy và cấu hình XML chia theo từng đạo tạng.

## Khởi tạo

1. Cài Node.js 20+ và MySQL 8+.
2. Chạy `database/00_nhan_gioi_full_schema.sql` trong MySQL.
3. Sao chép `.env.example` thành `.env`, sửa thông tin MySQL.
4. Chạy `npm install`.
5. Chạy `npm run check-config`.
6. Chạy `npm start`.
7. Mở `http://localhost:3000`.

## Nguyên tắc dữ liệu

- MySQL: trạng thái động của đạo hữu.
- XML: cảnh giới, bản đồ, yêu thú, vật phẩm, đan dược, công pháp và luật vận hành.
- Database chỉ lưu ID XML, không lưu tên/chỉ số tĩnh.

## Lưu ý

File SQL có lệnh DROP TABLE để dựng mới sạch hoàn toàn. Không chạy lên database đang có dữ liệu cần giữ nếu chưa sao lưu.
