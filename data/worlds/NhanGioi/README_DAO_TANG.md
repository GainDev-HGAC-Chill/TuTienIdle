# Đạo Tạng Bổ Sung · Nhân Giới

Gói này chứa 16 XML còn thiếu theo đúng các đường dẫn cảnh báo của server.

## Cách áp dụng

Chép toàn bộ các thư mục trong gói vào:

data/worlds/NhanGioi/

Giữ nguyên các XML hiện có. Khi Windows hỏi gộp thư mục, chọn Yes. Gói này không ghi đè các XML cũ vì tên file đều là file mới.

## Lưu ý quan trọng

Mỗi file đã có:
- XML declaration UTF-8.
- Một phần tử gốc rõ nghĩa.
- Ít nhất một bản ghi mẫu.
- Thuộc tính `id` duy nhất.
- Thuộc tính `enabled` để có thể tắt dữ liệu mà không cần xóa.
- Mô tả ngắn để về sau tự bổ sung.

Các file mới chỉ là cấu trúc Đạo Tạng. Backend hiện tại cần bổ sung parser/ingest tương ứng trước khi toàn bộ dữ liệu trong các file này tham gia gameplay.

## Quy tắc thêm dữ liệu

1. Không trùng `id`.
2. ID nên dùng chữ thường, không dấu, phân cách bằng dấu gạch dưới.
3. Số thập phân dùng dấu chấm.
4. Tỷ lệ dùng khoảng 0.00 đến 1.00.
5. Liên kết chéo phải dùng đúng ID tồn tại ở file đích.
6. Không đổi tên thẻ gốc nếu chưa sửa `dataManager.js`.
