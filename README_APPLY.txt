BẢN PATCH: Tái cấu trúc 3 đường tu luyện

Mục tiêu:
1. Bỏ tab Tu Luyện khỏi thanh menu.
2. Linh Tu chuyển về Động Phủ.
3. Luyện Thể chuyển sang Combat, tăng nhờ đánh quái/huyết khí.
4. Luyện Hồn chuyển sang Đa Dụng, làm nền tài nguyên cho luyện đan, luyện khí, luyện phù, khôi lỗi, trận pháp, cấm chế, ngự thú.

Cách gắn file:

1. Copy 2 file sau vào thư mục frontend:
   - cultivationPathPatch.js
   - cultivationPathPatch.css

2. Mở frontend/index.html.

3. Thêm dòng CSS này dưới dòng style.css:
   <link rel="stylesheet" href="cultivationPathPatch.css">

4. Thêm dòng JS này ở cuối body, sau realmAlchemyClientPatch.js:
   <script src="cultivationPathPatch.js"></script>

Ví dụ đoạn cuối index.html nên là:

<script src="script.js"></script>
<script src="v2UiPatch.js"></script>
<script src="actionLogClient.js"></script>
<script src="realmAlchemyClientPatch.js"></script>
<script src="cultivationPathPatch.js"></script>

Lưu ý:
- Bản này ưu tiên sửa UI/luồng hiển thị trước, không phá sâu logic server.
- Logic server hiện vẫn còn field bodyCultivation/soulCultivation/cultivation nên patch tận dụng dữ liệu cũ.
- Bước tiếp theo mới nên chỉnh core progression/combat để combat thật sự cộng Huyết Khí/Luyện Thể và Đa Dụng thật sự tiêu hao Hồn lực.
