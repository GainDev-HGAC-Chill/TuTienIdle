# Dao Action Log Detail Fix

Copy đè các file sau vào repo:

- `server.js`
- `core/serverActionLog.js`
- `frontend/script.js`
- `frontend/actionLogClient.js`

Sau đó chạy:

```bat
node --check server.js
node --check frontend\script.js
node --check frontend\actionLogClient.js
npm start
```

Vào web nhấn `Ctrl + F5`.

## Nội dung sửa

- Bỏ log spam `Thọ nguyên vừa thay đổi.`
- Ẩn log thọ nguyên spam cũ khi đọc log.
- Không hook `savePlayers()` để diff toàn bộ save nữa.
- Ghi log chi tiết trực tiếp theo hành động:
  - Gieo trồng dược liệu
  - Thu hoạch dược liệu
  - Luyện đan
  - Dùng đan
  - Trang bị/tháo công pháp
  - Trang bị/tháo vũ kỹ
  - Đổi mạch tu luyện
  - Chọn/từ chối kỳ ngộ, kèm lựa chọn, phần thưởng, phản phệ
- Không ghi combat.
