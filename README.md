# Nhân Giới Đạo Đồ — Tu Tiên Idle

Bản FE/BE thống nhất, dùng Node.js + Express + MySQL. Frontend không tự cộng tài nguyên; mọi tu luyện, chiến đấu, phần thưởng và đột phá đều do backend xử lý theo transaction.

## Chức năng đã hoàn thiện

- Tạo và đăng nhập nhân vật theo đạo hiệu.
- Hồ sơ cảnh giới, chiến lực, sinh lực và Linh Thạch.
- Linh Tu theo thời gian, giới hạn tiến trình và đột phá tầng/đại cảnh giới.
- Combat có quái đánh trả, HP hai phía, thắng/thua, phần thưởng, Luyện Thể/Luyện Hồn và vật phẩm rơi.
- Chọn map theo điều kiện cảnh giới.
- Túi Càn Khôn và sử dụng Hồi Khí Đan.
- Nhật ký tổng quan/tu luyện/combat/vật phẩm.
- Chế độ giao diện sáng/tối.
- MySQL tự tạo database và bảng khi khởi động.

## Cài đặt

1. Cài Node.js và MySQL.
2. Copy `.env.example` thành `.env` rồi sửa tài khoản MySQL.
3. Chạy:

```bash
npm install
npm start
```

4. Mở `http://localhost:3000`.

## Lưu ý khi thay repo cũ

Xóa các file patch frontend cũ (`v2UiPatch.js`, `realmAlchemyClientPatch.js`, `cultivationPathPatch.js`, `actionLogClient.js`) để tránh chạy chồng. Không push `.env` và `node_modules` lên GitHub.
