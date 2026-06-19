# Fix map thu nhỏ + luyện thể/hồn tự luyện

Chạy:

```bash
node tools/apply-fix-collapse-subcultivation.js
node server.js
```

Sau đó Ctrl + F5.

## Sửa

1. Map đã thu nhỏ không tự bật ra khi combat refresh.
- Trạng thái đóng/mở từng giới được giữ trong `mapWorldOpenState`.

2. Luyện Thể / Luyện Hồn có tự chạy.
- Khi chọn Luyện Thể, tu vi/s chuyển sang EXP luyện thể.
- Khi chọn Luyện Hồn, tu vi/s chuyển sang EXP luyện hồn.
- Phụ Tu trên Tổng Quan hiện thêm EXP để thấy đang tăng.
