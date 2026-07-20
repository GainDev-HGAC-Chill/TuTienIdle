# Đạo Tàng Đồng Nhất

Bộ file này chuyển nguồn dữ liệu gameplay từ:

```js
require('../config/gameData')
```

sang:

```text
data/worlds/NhanGioi/NhanGioi.xml
        ↓
src/config/dataManager.js
        ↓
gameService + configRoutes
```

## File cần chép đè

1. `server.js`
2. `src/config/dataManager.js`
3. `src/formulas/cultivationFormula.js`
4. `src/routes/configRoutes.js`
5. `src/services/gameService.js`

## Không xóa

Giữ nguyên:

```text
src/config/xmlLoader.js
data/worlds/NhanGioi/
```

## Cách chạy

```bat
npm start
```

Khi thành công, terminal phải có dòng gần giống:

```text
[DAO_TANG] Nhân Giới: 9 cảnh giới, 1 bản đồ, 2 yêu thú.
[LINH_MACH] Đã kết nối MySQL.
[THIEN_CO] http://localhost:3000
```

Sau đó trên trình duyệt nhấn:

```text
Ctrl + F5
```

## Lưu ý kiến trúc

Bộ này cố ý giữ runtime ID số:

- map đầu tiên = `1`
- yêu thú đầu tiên = `1`
- yêu thú thứ hai = `2`

Nhờ vậy MySQL hiện tại không cần đổi cột `map_id` và `monster_id`.

ID XML vẫn được giữ trong trường `xmlId`, ví dụ:

```text
map_ngoai_mon_son_lam
monster_son_lang
monster_doc_nha
```

Sau khi ổn định hoàn toàn mới nên migration MySQL sang ID chuỗi.
