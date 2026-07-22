# THIÊN TƯỢNG BẢN ĐỒ · TOÀN NHÂN GIỚI

## Có sẵn cho 8 bản đồ

1. Ngoại Môn Sơn Lâm
   - Sơn Lam Độc Trùng
   - Linh Lộ Thấm Thể

2. Bách Thảo Cốc
   - Độc Phấn Phiêu Tán
   - Dược Hương Dưỡng Thần

3. Huyền Thiết Sơn
   - Kim Thạch Băng Lạc
   - Địa Mạch Tôi Luyện

4. Vạn Độc Đàm
   - Vạn Độc Xâm Thể
   - Độc Tinh Ngưng Tụ

5. Kiếm Trủng
   - Kiếm Ý Xung Hồn
   - Tàn Kiếm Cộng Minh

6. Huyết Ma Vực
   - Huyết Sát Thực Tâm
   - Huyết Luyện Thân Thể

7. Thái Hư Khe
   - Hư Không Loạn Lưu
   - Không Gian Tinh Hoa

8. Cửu Tiêu Lôi Vực
   - Lôi Kiếp Giáng Lâm
   - Lôi Tinh Ngưng Tụ

## Cách áp dụng

Giải nén vào thư mục gốc project:

```text
C:\Users\gaingain\TuTienIdle
```

Chạy:

```bat
node install-thien-tuong.js
node tools\kiem-tra-thien-tuong.js
npm start
```

## MySQL

Runtime tự tạo bảng:

```text
player_map_hazard_cooldowns
```

Nếu tài khoản MySQL không có quyền CREATE, chạy thủ công:

```text
database/migrations/20260722_map_environments.sql
```

## Cách chỉnh tỷ lệ

```xml
<Hazard chancePerMinute="3.2" cooldownSeconds="240">
```

- `chancePerMinute`: tỷ lệ trong một phút thám hiểm.
- `cooldownSeconds`: thời gian tối thiểu trước khi thiên tượng đó có thể xảy ra lại.
- Tỷ lệ được chuẩn hóa theo `elapsed`, không phụ thuộc trình duyệt gọi tick nhanh hay chậm.

## Nhật ký

Thiên Tượng ghi vào category:

```text
environment
```

Frontend hiện gom nhật ký không nhận diện category này vẫn có thể hiển thị như log thường.


## Trường hợp đã chạy installer cũ và gặp lỗi log bootstrap

Không cần xóa các file đã chép. Chạy lại installer bản FIX:

```bat
node install-thien-tuong.js
node tools\kiem-tra-thien-tuong.js
npm start
```

Installer có kiểm tra trùng nội dung, nên không thêm require/load/runtime hai lần.
