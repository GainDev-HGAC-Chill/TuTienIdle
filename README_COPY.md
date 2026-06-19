# Bản full copy: Thọ Nguyên + Dược Viên + Kỳ Ngộ

Copy đè 2 file:

1. `server.js` -> thư mục gốc project.
2. `frontend/script.js` -> thư mục `frontend`.

Sau đó chạy:

```bash
node --check server.js
npm start
```

Tính năng đã có:

- Thọ nguyên: tuổi hiện tại, tuổi thọ tối đa, còn bao nhiêu năm.
- Đan thọ nguyên: Thọ Nguyên Đan, Huyền Thọ Đan.
- Dược viên: ô trồng cây, cần hạt giống + linh thủy + linh nhưỡng + linh thạch.
- Cấp thấp đánh quái rơi nguyên liệu dược viên.
- Cấp cao nhận nguyên liệu tốt qua kỳ ngộ.
- Kỳ ngộ xuất hiện khi đánh quái, popup khóa mọi thao tác.
- Từ chối kỳ ngộ: phạt 5% tổng thuộc tính trong 60 phút.
- Đang có kỳ ngộ/tương tác thì các hành động khác bị chặn bằng HTTP 423.

Nếu muốn test nhanh kỳ ngộ, tăng `chance` trong hàm `trySpawnEncounter()` của `server.js`.
