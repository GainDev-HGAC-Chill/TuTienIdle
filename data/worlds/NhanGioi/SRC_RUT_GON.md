# Rà soát thư mục src

## Có thể xóa sau khi sửa tham chiếu

### src/config/gameData.js
Dữ liệu cảnh giới, bản đồ và quái đang hard-code, trùng nhiệm vụ với XML + dataManager.js.
Cần sửa configRoutes.js dùng dataManager trước, rồi mới xóa.

### src/services/playerService.js
Đây là tàn dư của API cũ. File gọi repo.listInventory(), repo.createPlayer() và repo.addLog() theo chữ ký cũ, trong khi playerRepository.js hiện xuất inventory(), create() và addLog(connection,...).
Nên sửa playerRoutes.js dùng trực tiếp gameService.create(), gameService.byName() và gameService.profile(), sau đó xóa playerService.js.

## Nên giữ

- config/dataManager.js: trung tâm nạp và tra cứu Đạo Tạng.
- config/xmlLoader.js: parser XML dùng chung.
- db/mysql.js: pool, transaction và khởi tạo database.
- db/migrationRunner.js nếu đang tồn tại cục bộ: mysql.js đang require file này.
- formulas/cultivationFormula.js: công thức thuần, dễ kiểm thử.
- middleware/errorHandler.js: chuẩn hóa lỗi HTTP.
- repositories/playerRepository.js: toàn bộ truy vấn MySQL.
- routes/configRoutes.js, gameRoutes.js, playerRoutes.js: nên giữ tách theo miền.
- services/gameService.js: luật gameplay.

## Cấu trúc src gọn đề xuất

src/
├── config/
│   ├── dataManager.js
│   └── xmlLoader.js
├── db/
│   ├── mysql.js
│   └── migrationRunner.js
├── formulas/
│   └── cultivationFormula.js
├── middleware/
│   └── errorHandler.js
├── repositories/
│   └── playerRepository.js
├── routes/
│   ├── configRoutes.js
│   ├── gameRoutes.js
│   └── playerRoutes.js
└── services/
    └── gameService.js

Sau chỉnh sửa sẽ giảm được:
- src/config/gameData.js
- src/services/playerService.js
