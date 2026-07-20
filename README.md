# Linh Căn · Đạo Thể Chân Giải

## 1. Chép đè/tạo mới các file

```text
data/worlds/NhanGioi/NhanGioi.xml
data/worlds/NhanGioi/TuyenDao/LinhCan.xml

src/config/dataManager.js
src/routes/configRoutes.js
src/repositories/playerRepository.js
src/services/gameService.js

frontend/index.html
frontend/style.css
frontend/script.js

database/schema.sql
database/migrations/20260720_linh_can_chi_so.sql
```

## 2. Database đang có dữ liệu

Không chạy lại toàn bộ `schema.sql`.

Chỉ chạy:

```text
database/migrations/20260720_linh_can_chi_so.sql
```

## 3. Database mới hoàn toàn

Chạy:

```text
database/schema.sql
```

## 4. Package XML

Nếu chưa cài:

```bat
npm install fast-xml-parser
```

## 5. Chạy game

```bat
npm start
```

Sau đó nhấn `Ctrl + F5` trên trình duyệt.

## Cơ chế

- Nhân vật mới ngẫu nhiên nhận một Linh Căn theo `weight` trong XML.
- Nhân vật cũ giữ `Ngũ Hành Tạp Linh Căn`.
- Phá đại cảnh giới chỉ cộng:
  - Sinh Lực
  - Nội Lực
  - Công Kích
  - Phòng Thủ
- Linh Căn nhân hệ số tăng trưởng bốn chỉ số này.
- Các thiên phú như bạo kích, né tránh, xuyên giáp, hồi phục được cấp lúc tạo nhân vật.
- Giao diện Chiến Đạo hiển thị HP/MP bản thân, HP yêu thú và toàn bộ chỉ số cá nhân.

## Chú ý về NhanGioi.xml

Manifest đi kèm đúng theo cấu trúc thư mục trong ảnh. `dataManager.js` sẽ cảnh báo và bỏ qua file chưa tồn tại, vì vậy bạn có thể hoàn thiện từng đạo tàng dần mà server vẫn chạy.
