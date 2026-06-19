# Patch 3 vấn đề mới

Chạy:

```bash
node tools/apply-system-todo-patch.js
node server.js
```

Sau đó Ctrl + F5.

## Đã thêm

1. Map đã mở trong Combat:
- Chia theo Nhân Giới / Tiên Giới / ...
- Nhấp vào tên giới để thu nhỏ/phóng to.

2. Tu luyện 3 loại:
- Mặc định chỉ chọn 1: Tu Luyện / Luyện Thể / Luyện Hồn.
- Khi cả 3 đạt Bán Tiên: được chọn 2 loại cùng lúc.
- Khi cả 3 đạt Nhập Thánh: được chọn 3 loại cùng lúc.

3. Trồng dược liệu:
- Mỗi lần trồng tiêu tốn linh thạch.
- Chi phí tính theo giới + thời gian sinh trưởng.
- Không đủ linh thạch thì không trồng được.

Patch này cũng sửa lỗi `\nfunction renderMapButtons` trong `frontend/script.js`.
