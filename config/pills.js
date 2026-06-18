// ============================================
//  CONFIG - PILLS
//  Danh sách đan dược theo giới / cảnh giới
//  Generated từ master data user cung cấp.
// ============================================

const PILLS = [
    {
        "id": "tu_linh_tan",
        "name": "Tụ Linh Tán",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ tu luyện - Tầng 1-3",
        "description": "Thuốc bột màu xanh nhạt, ngưng tụ linh khí xung quanh, tăng tốc độ hấp thu 30%.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 1,
        "stageMax": 3
    },
    {
        "id": "boi_nguyen_dan",
        "name": "Bồi Nguyên Đan",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ tu luyện - Tầng 4-6",
        "description": "Thuốc viên màu trắng sữa, bồi bổ nguyên khí gốc, tăng 50% hiệu suất luyện công.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "cultivationSpeedPercent": 50
        },
        "stageMin": 4,
        "stageMax": 6
    },
    {
        "id": "thong_khieu_dan",
        "name": "Thông Khiếu Đan",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "Đột phá - Tầng 7-9",
        "description": "Màu vàng kim, mở thông kỳ kinh bát mạch, giảm 40% khó khăn khi đột phá lên tầng tiếp theo.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "breakthroughDifficultyReducePercent": 40
        },
        "stageMin": 7,
        "stageMax": 9,
        "breakthroughLock": true
    },
    {
        "id": "liet_diem_phan",
        "name": "Liệt Diệm Phấn",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương Hỏa",
        "description": "Tung ra tạo thành vụ nổ lửa, gây sát thương diện rộng cấp thấp.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "hoa"
        }
    },
    {
        "id": "han_bang_cham",
        "name": "Hàn Băng Châm",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương Băng",
        "description": "Ngưng tụ thành kim băng, bắn ra xuyên thấu da thịt.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "bang"
        }
    },
    {
        "id": "thach_giap_tan",
        "name": "Thạch Giáp Tán",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ vật lý",
        "description": "Bôi lên da tạo lớp vảy đá, giảm 20% sát thương nhận vào.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "damageReducePercent": 20
        }
    },
    {
        "id": "thanh_phong_chu",
        "name": "Thanh Phong Chú",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ thuật",
        "description": "Tạo màn chắn gió, kháng 15% đòn tấn công nguyên lực.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "nhat_duong_dan",
        "name": "Nhất Dương Đan",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+3% Công",
        "description": "Tăng cường sức mạnh kỹ năng tấn công.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 3
        }
    },
    {
        "id": "truong_thu_dan",
        "name": "Trường Thủ Đan",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+3% Thủ",
        "description": "Củng cố thể chất, tăng khả năng chịu đòn.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 3
        }
    },
    {
        "id": "toc_anh_dan",
        "name": "Tốc Ảnh Đan",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+2% Tốc độ",
        "description": "Tăng nhanh thân pháp.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "speedPercent": 2
        }
    },
    {
        "id": "truc_co_dan",
        "name": "Trúc Cơ Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "Đột phá từ Luyện Khí lên Trúc Cơ",
        "description": "Củng cố nền móng, mở rộng đan điền gấp 3 lần.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "thien_linh_thuy",
        "name": "Thiên Linh Thủy",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ tu luyện - Tầng 1-5",
        "description": "Giọt lỏng màu ngọc bích, tắm mình giúp thanh lọc tạp chất, tăng 60% tốc độ tu luyện.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "speedPercent": 60,
            "cultivationSpeedPercent": 60
        },
        "stageMin": 1,
        "stageMax": 5
    },
    {
        "id": "cuu_chuyen_hon_nguyen_dan",
        "name": "Cửu Chuyển Hồn Nguyên Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 6-9",
        "description": "Viên thuốc đỏ sẫm 9 vân, hồi phục nhanh nguyên khí trong chiến đấu kéo dài.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 6,
        "stageMax": 9
    },
    {
        "id": "doc_long_chi_dan",
        "name": "Độc Long Chi Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương Độc",
        "description": "Ném ra tạo khói độc ăn mòn, gây sát thương theo thời gian.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "doc"
        }
    },
    {
        "id": "loi_chau",
        "name": "Lôi Châu",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương Lôi",
        "description": "Viên bi tím chứa sấm sét, ném vào địch phát nổ như sét đánh.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "loi"
        }
    },
    {
        "id": "huyen_giap_dan",
        "name": "Huyền Giáp Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ toàn diện",
        "description": "Uống vào tạo áo giáp nguyên khí, giảm 25% tổng sát thương trong 30 phút.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "thuy_kinh_thuat",
        "name": "Thủy Kính Thuật",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phản đòn",
        "description": "Tạo gương nước phản xạ 10% sát thương trở lại kẻ tấn công.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "damageReducePercent": 10
        }
    },
    {
        "id": "luong_nghi_dan",
        "name": "Lưỡng Nghi Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+5% Công +5% Thủ",
        "description": "Cân bằng âm dương, tăng toàn diện.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 5,
            "defPercent": 5
        }
    },
    {
        "id": "hoa_van_dan",
        "name": "Hỏa Vân Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+8% Công",
        "description": "Tăng sức mạnh kỹ năng hỏa hệ.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 8,
            "element": "hoa"
        }
    },
    {
        "id": "thuy_nhu_dan",
        "name": "Thủy Nhu Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+8% Thủ",
        "description": "Tăng sức bền, kháng thủy hệ.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 8
        }
    },
    {
        "id": "kim_dan_dai_hoan",
        "name": "Kim Đan Đại Hoàn",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "Đột phá từ Trúc Cơ lên Kim Đan",
        "description": "Viên thuốc vàng ròng, ngưng tụ toàn bộ linh lực thành một viên kim đan trong đan điền.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "luc_duong_dan",
        "name": "Lục Dương Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 1-5",
        "description": "Màu xanh dương đậm, gia tăng linh lực trữ lượng gấp 5 lần.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 1,
        "stageMax": 5
    },
    {
        "id": "that_khieu_linh_dan",
        "name": "Thất Khiếu Linh Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 6-9",
        "description": "Mở rộng 7 khiếu trong đan điền, tăng tốc độ vận hành chân nguyên.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 6,
        "stageMax": 9
    },
    {
        "id": "hoa_van_phu_dan",
        "name": "Hỏa Vân Phù Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương Hỏa diện rộng",
        "description": "Viên thuốc đỏ khi vỡ ra tạo thành mưa lửa thiêu đốt toàn bộ kẻ địch trong phạm vi 100m.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "hoa"
        }
    },
    {
        "id": "kim_cuong_thach",
        "name": "Kim Cương Thạch",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương vật lý tuyệt đối",
        "description": "Biến đá thành kiếm sắc, xuyên phá mọi phòng ngự thường.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "bat_dong_minh_vuong_dan",
        "name": "Bất Động Minh Vương Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ tuyệt đối",
        "description": "Uống vào thân thể đá hoá, miễn nhiễm mọi sát thương trong 5 giây.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "phan_hu_dan",
        "name": "Phản Hư Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Tránh né",
        "description": "Hóa thân thành hư ảo, né tránh một đòn chí mạng duy nhất.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "tu_tuong_dan",
        "name": "Tứ Tượng Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+10% Công +5% Thủ +5% Tốc độ",
        "description": "Dựa theo bốn tượng Thanh Long, Bạch Hổ, Chu Tước, Huyền Vũ.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 10,
            "defPercent": 5,
            "speedPercent": 5
        }
    },
    {
        "id": "loi_am_dan",
        "name": "Lôi Âm Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+12% Tốc độ",
        "description": "Tăng thân pháp cực nhanh, khó bị bắt kịp.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "speedPercent": 12
        }
    },
    {
        "id": "huyen_vu_dan",
        "name": "Huyền Vũ Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+15% Thủ",
        "description": "Chuyên phòng thủ, giảm sát thương nhận vào.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 15
        }
    },
    {
        "id": "nguyen_anh_hoa_hinh_dan",
        "name": "Nguyên Anh Hóa Hình Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "Đột phá từ Kim Đan lên Nguyên Anh",
        "description": "Viên thuốc đen bóng, hóa Kim Đan thành Nguyên Anh nhỏ trong đan điền.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "cuu_chuyen_dai_hoan_dan",
        "name": "Cửu Chuyển Đại Hoàn Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 1-5",
        "description": "9 chuyển biến, mỗi chuyển gia tăng thần thức và nguyên thần.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 1,
        "stageMax": 5
    },
    {
        "id": "thai_thuong_linh_dan",
        "name": "Thái Thượng Linh Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 6-9",
        "description": "Thuốc cấp Tiên, tăng gấp đôi tốc độ tu luyện nguyên anh.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 6,
        "stageMax": 9
    },
    {
        "id": "than_phong_chu_dan",
        "name": "Thần Phong Chú Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương Phong",
        "description": "Triệu hồi bão phong xé nát kẻ địch trong khu vực.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "phong"
        }
    },
    {
        "id": "van_doc_tan",
        "name": "Vạn Độc Tán",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương Độc đặc biệt",
        "description": "Độc ăn mòn nguyên thần, gây sát thương tinh thần.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "doc"
        }
    },
    {
        "id": "ngu_hanh_giap",
        "name": "Ngũ Hành Giáp",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ theo vòng tròn",
        "description": "Tạo lớp giáp 5 màu, kháng mọi thuộc tính ngũ hành.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "thai_cuc_dan",
        "name": "Thái Cực Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Chuyển hóa",
        "description": "Hấp thụ 20% sát thương địch và chuyển thành nguyên khí hồi phục.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "damageReducePercent": 20
        }
    },
    {
        "id": "ngu_hanh_dan_tong_hop",
        "name": "Ngũ Hành Đan Tổng Hợp",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+12% Công +12% Thủ +8% Tốc",
        "description": "Viên thuốc 5 màu, cân bằng mọi thuộc tính.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 12,
            "defPercent": 12,
            "speedPercent": 8
        }
    },
    {
        "id": "ba_dao_dan",
        "name": "Bá Đạo Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+20% Công",
        "description": "Giảm phòng thủ bản thân 10% nhưng tăng công kích cực mạnh.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 20
        }
    },
    {
        "id": "kim_cuong_dan",
        "name": "Kim Cương Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+20% Thủ",
        "description": "Chuyên về phòng thủ, khó bị thương.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 20
        }
    },
    {
        "id": "hoa_than_chi_tu",
        "name": "Hóa Thần Chi Tử",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "Đột phá từ Nguyên Anh lên Hóa Thần",
        "description": "Giọt máu màu tím, giúp nguyên anh thoát xác ra ngoài cơ thể, hóa thành thần thức.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "than_niem_tinh_dan",
        "name": "Thần Niệm Tịnh Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 1-5",
        "description": "Thanh lọc thần thức, gia tăng phạm vi cảm ứng.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 1,
        "stageMax": 5
    },
    {
        "id": "dai_la_kim_tien_dan",
        "name": "Đại La Kim Tiên Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 6-9",
        "description": "Cấp Tiên thượng đẳng, thúc đẩy hóa thần, rút ngắn 70% thời gian tu luyện.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 6,
        "stageMax": 9
    },
    {
        "id": "than_niem_chu_sat",
        "name": "Thần Niệm Chú Sát",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương tinh thần",
        "description": "Đốt cháy thần niệm đối phương, gây đau đớn và hôn mê.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "than_hon"
        }
    },
    {
        "id": "thien_hoa_than_phu",
        "name": "Thiên Hỏa Thần Phù",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương Hỏa thần",
        "description": "Mở lửa trời từ cửu tiêu, thiêu rụi kẻ địch kể cả có thần thức.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "hoa"
        }
    },
    {
        "id": "than_giap_chi_dan",
        "name": "Thần Giáp Chi Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ thần thức",
        "description": "Tạo màn chắn quanh nguyên thần, miễn nhiễm 50% sát thương tinh thần.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "damageReducePercent": 50,
            "element": "than_hon"
        }
    },
    {
        "id": "bat_tu_than_luc",
        "name": "Bất Tử Thần Lực",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Tái sinh",
        "description": "Khi bị đánh bay linh hồn, có 30% cơ hội tái tụ lại trong vòng 3 giây.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "than_uy_dan",
        "name": "Thần Uy Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+18% Công",
        "description": "Khiến mọi đòn tấn công có thêm uy áp thần niệm.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 18
        }
    },
    {
        "id": "than_ho_dan",
        "name": "Thần Hộ Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+18% Thủ",
        "description": "Thần niệm hóa thành khiên chắn, bảo vệ toàn diện.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 18
        }
    },
    {
        "id": "toc_niem_dan",
        "name": "Tốc Niệm Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+15% Tốc độ +10% Công",
        "description": "Tăng tốc độ ra chiêu.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "speedPercent": 15,
            "atkPercent": 10
        }
    },
    {
        "id": "hu_vo_dai_dan",
        "name": "Hư Vô Đại Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "Đột phá từ Hóa Thần lên Luyện Hư",
        "description": "Viên thuốc đen tuyền, hóa thần vào cõi hư vô để luyện thân thành hư ảo.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "khong_dong_dan",
        "name": "Không Động Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 1-5",
        "description": "Luyện hư không thành thực, gia tăng linh lực trong cơ thể gấp 10.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 1,
        "stageMax": 5
    },
    {
        "id": "vo_cuc_dan",
        "name": "Vô Cực Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 6-9",
        "description": "Tiếp cận Vô Cực cảnh, tăng tốc độ luyện hư gấp 3.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 6,
        "stageMax": 9
    },
    {
        "id": "hu_vo_chi_kiem",
        "name": "Hư Vô Chi Kiếm",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương không gian",
        "description": "Một nhát chém từ hư vô, không thể thấy nên không thể né.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "khong_gian"
        }
    },
    {
        "id": "can_khon_nhat_tram",
        "name": "Càn Khôn Nhất Trảm",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương chí mạng",
        "description": "Tập trung toàn bộ hư lực vào một đòn, chém vỡ không gian.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "khong_gian"
        }
    },
    {
        "id": "hu_ao_linh_giap",
        "name": "Hư Ảo Linh Giáp",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ tránh né",
        "description": "Hóa thân thành hư ảo, bất kỳ đòn tấn công nào cũng xuyên qua.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "pha_hu_dan",
        "name": "Phá Hư Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phá giải phong ấn",
        "description": "Giải trừ mọi hiệu ứng khống chế dựa trên hư vô.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "element": "phong"
        }
    },
    {
        "id": "hu_vo_dan",
        "name": "Hư Vô Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+15% Công +15% Thủ",
        "description": "Cân bằng hư và thực.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 15,
            "defPercent": 15
        }
    },
    {
        "id": "pha_khong_dan",
        "name": "Phá Không Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+25% Công",
        "description": "Tấn công xé rách không gian, gây sát thương chuẩn tuyệt đối.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 25,
            "element": "khong_gian"
        }
    },
    {
        "id": "thien_nhan_hop_nhat_dan",
        "name": "Thiên Nhân Hợp Nhất Đan",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "Đột phá từ Luyện Hư lên Hợp Thể",
        "description": "Hợp nhất linh hồn với trời đất, cơ thể và đạo hạnh trở thành một.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "dao_qua_chi_dan",
        "name": "Đạo Quả Chi Đan",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 1-5",
        "description": "Chín muồi đạo quả, tăng tốc độ hợp thể.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 1,
        "stageMax": 5
    },
    {
        "id": "bat_hu_hop_dan",
        "name": "Bất Hủ Hợp Đan",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 6-9",
        "description": "Tăng tỉ lệ hợp thể thành công lên 70%.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {},
        "stageMin": 6,
        "stageMax": 9
    },
    {
        "id": "thien_dia_chu",
        "name": "Thiên Địa Chú",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương diện rộng toàn bộ",
        "description": "Triệu hồi sức mạnh thiên địa tấn công toàn bộ kẻ địch trong phạm vi 1000m.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "bat_hu_chi_tram",
        "name": "Bất Hủ Chi Trảm",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương hồn",
        "description": "Chém thẳng vào linh hồn, bất kể phòng thủ thế nào.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "hop_the_kim_cuong",
        "name": "Hợp Thể Kim Cương",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ tuyệt đối",
        "description": "Cơ thể hợp nhất với đất trời, miễn nhiễm 90% sát thương trong 10 giây.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "damageReducePercent": 90
        }
    },
    {
        "id": "dai_dia_chi_giap",
        "name": "Đại Địa Chi Giáp",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ nguyên tố",
        "description": "Hấp thụ mọi sát thương nguyên tố, chỉ chịu sát thương vật lý thô sơ.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "thien_dao_dan",
        "name": "Thiên Đạo Đan",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+20% Công +20% Thủ +10% Tốc",
        "description": "Tiếp cận thiên đạo.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 20,
            "defPercent": 20,
            "speedPercent": 10
        }
    },
    {
        "id": "thanh_gia_dan",
        "name": "Thánh Giả Đan",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+30% Thủ",
        "description": "Chuyên phòng thủ, sát thương gần như vô hiệu.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 30
        }
    },
    {
        "id": "do_kiep_than_dan",
        "name": "Độ Kiếp Thần Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "Đột phá lên Bán Tiên",
        "description": "Thuốc đen sẫm có hoa văn lôi điện, chống đỡ sét kiếp khi vượt lên Tiên Giới.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "loi"
        },
        "breakthroughLock": true
    },
    {
        "id": "loi_kiep_do_hoa_dan",
        "name": "Lôi Kiếp Độ Hóa Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Mỗi tầng",
        "description": "Hấp thụ lôi đình, giảm 50% sát thương từ lôi kiếp.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "damageReducePercent": 50,
            "element": "loi"
        },
        "stageMin": 1,
        "stageMax": 9
    },
    {
        "id": "truong_sinh_dan",
        "name": "Trường Sinh Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Hỗ trợ - Tầng 7-9",
        "description": "Kéo dài thọ nguyên, chịu đựng nhiều đòn lôi kiếp hơn.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "element": "loi"
        },
        "stageMin": 7,
        "stageMax": 9
    },
    {
        "id": "cuu_thien_loi_chu",
        "name": "Cửu Thiên Lôi Chú",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương Lôi thánh",
        "description": "Triệu hồi sét trời đánh xuống, sát thương x10 kẻ địch cảnh giới thấp.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "loi"
        }
    },
    {
        "id": "huy_diet_phu_luc",
        "name": "Hủy Diệt Phù Lục",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương hủy diệt",
        "description": "Hủy diệt một vùng không gian nhỏ, bất kỳ thứ gì trong đó đều bị xóa sổ.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "khong_gian"
        }
    },
    {
        "id": "thien_cuong_dan",
        "name": "Thiên Cương Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ lôi kiếp",
        "description": "Tạo khiên chắn bảo vệ khỏi sét trời.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "element": "loi"
        }
    },
    {
        "id": "tu_vong_chi_du",
        "name": "Tử Vong Chi Dụ",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Cứu mạng",
        "description": "Khi chết, thuốc sẽ phát động tái sinh tại chỗ với 50% sinh lực.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "thien_dia_dan",
        "name": "Thiên Địa Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+25% Công +25% Thủ +15% Tốc",
        "description": "Cảnh giới độ kiếp.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 25,
            "defPercent": 25,
            "speedPercent": 15
        }
    },
    {
        "id": "vo_song_dan",
        "name": "Vô Song Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+35% Công",
        "description": "Chỉ tấn công, không cần phòng thủ, đánh nhanh thắng nhanh.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 35
        }
    },
    {
        "id": "bat_diet_dan",
        "name": "Bất Diệt Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "+35% Thủ",
        "description": "Hầu như bất tử trong một trận chiến.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 35
        }
    },
    {
        "id": "tien_loc_dan",
        "name": "Tiên Lộc Đan",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Tu luyện",
        "description": "Uống vào cảm nhận tiên khí, tăng 40% tốc độ tu luyện.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "speedPercent": 40,
            "cultivationSpeedPercent": 40
        }
    },
    {
        "id": "boi_tien_dan",
        "name": "Bồi Tiên Đan",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "Đột phá",
        "description": "Củng cố tiên thể, chuẩn bị lên Chân Tiên.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "tien_phong_chu",
        "name": "Tiên Phong Chú",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương Phong",
        "description": "Triệu hồi tiên phong cắt nát thần hồn.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "phong"
        }
    },
    {
        "id": "ban_tien_giap",
        "name": "Bán Tiên Giáp",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ",
        "description": "Tạo lớp tiên quang bảo vệ thân thể.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "chan_tien_qua",
        "name": "Chân Tiên Quả",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "Đột phá",
        "description": "Hấp thu tiên đạo chính thống.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "tien_nguyen_dan",
        "name": "Tiên Nguyên Đan",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "Tu luyện",
        "description": "Tăng 60% tốc độ hấp thu tiên khí.",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "speedPercent": 60,
            "cultivationSpeedPercent": 60
        }
    },
    {
        "id": "chan_hoa_dan",
        "name": "Chân Hỏa Đan",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "daoEntryMethod": null,
        "category": "offensive",
        "meta": "Sát thương Hỏa",
        "description": "Tiên hỏa thiêu đốt mọi thứ.",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {
            "element": "hoa"
        }
    },
    {
        "id": "chan_tien_the",
        "name": "Chân Tiên Thể",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "daoEntryMethod": null,
        "category": "defensive",
        "meta": "Phòng thủ",
        "description": "Tiên thể cứng cáp, bất khả xâm phạm.",
        "durationSeconds": 60,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "thien_dao_linh_dan",
        "name": "Thiên Đạo Linh Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thuan_theo_thien_dao",
        "category": "cultivation",
        "meta": "tu luyện",
        "description": "Mượn thiên đạo, tu luyện thuận buồm xuôi gió",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "thuan_thien_dan",
        "name": "Thuận Thiên Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thuan_theo_thien_dao",
        "category": "breakthrough",
        "meta": "đột phá",
        "description": "Hợp cùng thiên đạo, đột phá nhẹ nhàng",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "thien_cong_dan",
        "name": "Thiên Công Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thuan_theo_thien_dao",
        "category": "attribute",
        "meta": "công",
        "description": "+20% Công - vì thuận theo đạo",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 20
        }
    },
    {
        "id": "thien_thu_dan",
        "name": "Thiên Thủ Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thuan_theo_thien_dao",
        "category": "attribute",
        "meta": "thủ",
        "description": "+20% Thủ - được đạo bảo vệ",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 20
        }
    },
    {
        "id": "quy_nuong_dan",
        "name": "Quỷ Nương Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "nuong_nho_thien_dao",
        "category": "cultivation",
        "meta": "tu luyện",
        "description": "Mượn đạo, nhưng bị đạo khống chế",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "nuong_nho_dan",
        "name": "Nương Nhờ Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "nuong_nho_thien_dao",
        "category": "breakthrough",
        "meta": "đột phá",
        "description": "Vay mượn lực đạo để đột phá",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "nuong_phong_dan",
        "name": "Nương Phong Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "nuong_nho_thien_dao",
        "category": "attribute",
        "meta": "công",
        "description": "+35% Công nhưng giảm 10% Thủ",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 35,
            "defPercent": 10
        }
    },
    {
        "id": "nuong_giap_dan",
        "name": "Nương Giáp Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "nuong_nho_thien_dao",
        "category": "attribute",
        "meta": "thủ",
        "description": "+35% Thủ nhưng giảm 10% Công",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 35,
            "atkPercent": 10
        }
    },
    {
        "id": "nghich_dao_dan",
        "name": "Nghịch Đạo Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "doi_nghich_thien_dao",
        "category": "cultivation",
        "meta": "tu luyện",
        "description": "Tu ngược lại trời đất, mỗi ngày một mạnh hơn",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "phan_thien_dan",
        "name": "Phản Thiên Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "doi_nghich_thien_dao",
        "category": "breakthrough",
        "meta": "đột phá",
        "description": "Chống lại thiên đạo để đột phá, khó gấp 100 lần",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "nghich_thien_dan",
        "name": "Nghịch Thiên Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "doi_nghich_thien_dao",
        "category": "attribute",
        "meta": "công",
        "description": "+50% Công - Đánh trời không cần sợ",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 50
        }
    },
    {
        "id": "phan_dao_giap",
        "name": "Phản Đạo Giáp",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "doi_nghich_thien_dao",
        "category": "attribute",
        "meta": "thủ",
        "description": "+50% Thủ - Đạo muốn giết nhưng không chết",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 50
        }
    },
    {
        "id": "sieu_pham_dan",
        "name": "Siêu Phàm Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "sieu_thoat_thien_dao",
        "category": "cultivation",
        "meta": "tu luyện",
        "description": "Không còn bị chi phối bởi đạo",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "thoat_the_dan",
        "name": "Thoát Thế Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "sieu_thoat_thien_dao",
        "category": "breakthrough",
        "meta": "đột phá",
        "description": "Bước ra ngoài thiên đạo, tự tạo đạo của mình",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "sieu_dao_dan",
        "name": "Siêu Đạo Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "sieu_thoat_thien_dao",
        "category": "attribute",
        "meta": "công",
        "description": "+70% Công - Công kích vượt khỏi quy luật",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 70
        }
    },
    {
        "id": "sieu_thoat_giap",
        "name": "Siêu Thoát Giáp",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "sieu_thoat_thien_dao",
        "category": "attribute",
        "meta": "thủ",
        "description": "+70% Thủ - Không gì có thể chạm tới bạn",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 70
        }
    },
    {
        "id": "thong_thien_dan",
        "name": "Thống Thiên Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thong_tri_thien_dao",
        "category": "cultivation",
        "meta": "tu luyện",
        "description": "Hấp thụ toàn bộ thiên đạo vào người",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "chu_dao_dan",
        "name": "Chủ Đạo Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thong_tri_thien_dao",
        "category": "breakthrough",
        "meta": "đột phá",
        "description": "Trở thành chủ nhân của thiên đạo",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "chi_ton_cong_dan",
        "name": "Chí Tôn Công Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thong_tri_thien_dao",
        "category": "attribute",
        "meta": "công",
        "description": "+100% Công - Một đòn hủy cả vũ trụ",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 100
        }
    },
    {
        "id": "vo_dich_thu_dan",
        "name": "Vô Địch Thủ Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thong_tri_thien_dao",
        "category": "attribute",
        "meta": "thủ",
        "description": "+100% Thủ - Không ai có thể làm tổn thương",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 100
        }
    },
    {
        "id": "so_ngo_dan_lan_dau_cam_nhan_dao",
        "name": "Sơ Ngộ Đan - Lần đầu cảm nhận đạo",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "tu luyện",
        "description": "",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "nhap_dao_dan_chinh_thuc_buoc_vao_con_duong_dao",
        "name": "Nhập Đạo Đan - Chính thức bước vào con đường đạo",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "đột phá",
        "description": "",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "so_cong_dan",
        "name": "Sơ Công Đan",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "công",
        "description": "+5% Công",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 5
        }
    },
    {
        "id": "so_thu_dan",
        "name": "Sơ Thủ Đan",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "thủ",
        "description": "+5% Thủ",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 5
        }
    },
    {
        "id": "dai_dao_dan_hieu_thau_dai_dao",
        "name": "Đại Đạo Đan - Hiểu thấu đại đạo",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "tu luyện",
        "description": "",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "hop_dai_dao_dan_hop_nhat_voi_dai_dao",
        "name": "Hợp Đại Đạo Đan - Hợp nhất với đại đạo",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "đột phá",
        "description": "",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "dai_cong_dan",
        "name": "Đại Công Đan",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "công",
        "description": "+15% Công",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 15
        }
    },
    {
        "id": "dai_thu_dan",
        "name": "Đại Thủ Đan",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "thủ",
        "description": "+15% Thủ",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 15
        }
    },
    {
        "id": "thien_dao_dan_tham_nhuan_thien_dao",
        "name": "Thiên Đạo Đan - Thấm nhuần thiên đạo",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "tu luyện",
        "description": "",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "chi_thien_dan_dat_den_thien_dao_vien_man",
        "name": "Chí Thiên Đan - Đạt đến thiên đạo viên mãn",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "đột phá",
        "description": "",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "thien_cong_dan_2",
        "name": "Thiên Công Đan",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "công",
        "description": "+25% Công",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 25
        }
    },
    {
        "id": "thien_thu_dan_2",
        "name": "Thiên Thủ Đan",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "thủ",
        "description": "+25% Thủ",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 25
        }
    },
    {
        "id": "than_dao_dan_dao_hoa_thanh_than",
        "name": "Thần Đạo Đan - Đạo hóa thành thần",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "tu luyện",
        "description": "",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "hoa_than_dan_buoc_vao_coi_than",
        "name": "Hóa Thần Đan - Bước vào cõi thần",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "đột phá",
        "description": "",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "than_cong_dan",
        "name": "Thần Công Đan",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "công",
        "description": "+40% Công",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 40
        }
    },
    {
        "id": "than_thu_dan",
        "name": "Thần Thủ Đan",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "thủ",
        "description": "+40% Thủ",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 40
        }
    },
    {
        "id": "sieu_than_dan",
        "name": "Siêu Thần Đan",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "tu luyện",
        "description": "Chỉ 3000 người mới có thể đạt tới, viên thuốc duy nhất",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "cuc_than_dan",
        "name": "Cực Thần Đan",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "đột phá",
        "description": "Mỗi tầng tăng 1 cấp độ siêu thần",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "sieu_cong_dan",
        "name": "Siêu Công Đan",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "công",
        "description": "+80% Công - Vượt mọi giới hạn",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 80
        }
    },
    {
        "id": "sieu_thu_dan",
        "name": "Siêu Thủ Đan",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "thủ",
        "description": "+80% Thủ - Bất khả chiến bại",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 80
        }
    },
    {
        "id": "bat_hu_dan",
        "name": "Bất Hủ Đan",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "meta": "tu luyện",
        "description": "Không còn bị giết bởi bất kỳ thế lực nào, thuốc duy nhất 1 viên",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {}
    },
    {
        "id": "bat_hu_chi_huyet",
        "name": "Bất Hủ Chi Huyết",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "meta": "đột phá",
        "description": "Khi ăn, trở thành bất hủ vĩnh viễn",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {},
        "breakthroughLock": true
    },
    {
        "id": "bat_hu_cong",
        "name": "Bất Hủ Công",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "công",
        "description": "+100% Công - Công tuyệt đối",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "atkPercent": 100
        }
    },
    {
        "id": "bat_hu_thu",
        "name": "Bất Hủ Thủ",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "meta": "thủ",
        "description": "+100% Thủ - Phòng thủ tuyệt đối",
        "durationSeconds": 1800,
        "instant": false,
        "consumeOnUse": true,
        "effects": {
            "defPercent": 100
        }
    },
    {
        "id": "bat_hu_than_dan_vien_thuoc_than_thoai_an_vao_se_khong_bao_gio_bi_tieu_diet_ke_ca_khi_vu_tru_sup_do_chi_1_vien_ton_tai",
        "name": "Bất Hủ Thần Đan - Viên thuốc thần thoại, ăn vào sẽ không bao giờ bị tiêu diệt, kể cả khi vũ trụ sụp đổ. Chỉ 1 viên tồn tại",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "daoEntryMethod": null,
        "category": "special",
        "meta": "đặc biệt",
        "description": "",
        "durationSeconds": 0,
        "instant": true,
        "consumeOnUse": true,
        "effects": {}
    }
];

module.exports = PILLS;
