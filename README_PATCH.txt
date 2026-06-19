Gói vá TuTienIdle - equip/map/combat

Chép đè các file vào đúng thư mục:
- server.js
- core/mapService.js
- core/combatService.js
- core/techniqueService.js
- core/martialSkillService.js
- config/techniques.js
- config/martialSkills.js
- frontend/script.js

Khuyến nghị test sạch:
Windows CMD:
  del data\players.json
  node server.js

Nội dung đã vá:
1. Map chỉ mở theo cảnh giới hiện tại.
2. Đổi map reset quái đúng map, không còn quái Không rõ do state cũ.
3. Công pháp 3 hệ mặc định trang bị: Tu Luyện / Luyện Thể / Luyện Hồn.
4. Vũ kỹ học nhiều nhưng combat chỉ dùng 1 vũ kỹ active.
5. UI có nút Trang bị / Tháo ra cho vũ kỹ.
6. Combat log hiện đúng tên vũ kỹ đang dùng.
7. Túi đồ vẫn tách tiền tệ và vật phẩm.
