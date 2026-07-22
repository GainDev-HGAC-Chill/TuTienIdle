# PHỤC NGUYÊN CHIẾN LỢI PHẨM · MAP MONSTER

## Đạo tắc sau khi vá

```text
Maps.xml
  → MonsterRef
Monsters.xml
  → lootTableId
DropTables.xml
  → Drop itemId
monsterDropManager.js
  → inventoryService
```

Không còn bắt buộc `MonsterDrops.xml`.

## Cách dùng

Giải nén vào thư mục project:

```text
C:\Users\gaingain\TuTienIdle
```

Chạy:

```bat
node install-drop-fix.js
npm start
```

Installer tự thực hiện:

```bat
node tools\tao-drop-tables.js
node tools\kiem-tra-drop-tables.js
```

## Nguyên tắc sinh bảng rơi

- Giữ nguyên DropTable đã có dữ liệu.
- Chỉ tạo bảng còn thiếu hoặc đang rỗng.
- Chỉ sử dụng itemId thực sự tồn tại trong `VatPham`.
- Ưu tiên nguyên liệu có tên phù hợp với quái.
- Quái thường: 1 loại vật phẩm.
- Quái biến dị/tinh anh: 2 loại.
- Boss: 3 loại.
- Không đưa Tiên Ngọc hoặc vật phẩm mở rộng túi vào bảng rơi tự động.

Sau khi sinh, có thể tự chỉnh trực tiếp:

```text
data/worlds/NhanGioi/ChienDau/DropTables.xml
```

## Kiểm tra lại thủ công

```bat
node tools\kiem-tra-drop-tables.js
```

Kết quả đúng:

```text
[CHIẾN LỢI PHẨM VIÊN MÃN]
Tất cả quái đều liên kết được DropTable và itemId hợp lệ.
```
