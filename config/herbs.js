// ============================================
// CONFIG - HERBS
// Linh dược / nguyên liệu luyện đan + dược viên
// ============================================

const HERBS = [
    {
        "id": "luyen_khi_linh_thao",
        "name": "Luyện Khí Linh Thảo",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "type": "cultivation",
        "tier": 1,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Luyện Khí.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "nhan_gioi_linh_tuy",
        "name": "Nhân Giới Linh Tủy",
        "world": "nhan_gioi",
        "realm": null,
        "type": "catalyst",
        "tier": 1,
        "description": "Chất dẫn luyện đan cấp Nhân Giới.",
        "growSeconds": 240,
        "yield": [
            1,
            2
        ]
    },
    {
        "id": "luyen_khi_phu_duoc",
        "name": "Huyết Nguyên Luyện Khí Phụ Dược",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "type": "support",
        "tier": 1,
        "description": "Phụ dược ổn định dược lực cho đan dược Luyện Khí.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "luyen_khi_pha_canh_qua",
        "name": "Luyện Khí Phá Cảnh Quả",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "type": "breakthrough",
        "tier": 1,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Luyện Khí.",
        "growSeconds": 840,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "luyen_khi_sat_phat_hoa",
        "name": "Luyện Khí Sát Phạt Hoa",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "type": "offensive",
        "tier": 1,
        "description": "Chủ dược Sát Phạt Hoa dùng cho đan offensive tại Luyện Khí.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "luyen_khi_ho_the_diepla",
        "name": "Luyện Khí Hộ Thể Diệp",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "type": "defensive",
        "tier": 1,
        "description": "Chủ dược Hộ Thể Diệp dùng cho đan defensive tại Luyện Khí.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "luyen_khi_nguyen_luc_chi",
        "name": "Luyện Khí Nguyên Lực Chi",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "type": "attribute",
        "tier": 1,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Luyện Khí.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "truc_co_pha_canh_qua",
        "name": "Trúc Cơ Phá Cảnh Quả",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "type": "breakthrough",
        "tier": 1,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Trúc Cơ.",
        "growSeconds": 840,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "truc_co_phu_duoc",
        "name": "Huyết Nguyên Trúc Cơ Phụ Dược",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "type": "support",
        "tier": 1,
        "description": "Phụ dược ổn định dược lực cho đan dược Trúc Cơ.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "truc_co_linh_thao",
        "name": "Trúc Cơ Linh Thảo",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "type": "cultivation",
        "tier": 1,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Trúc Cơ.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "truc_co_sat_phat_hoa",
        "name": "Trúc Cơ Sát Phạt Hoa",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "type": "offensive",
        "tier": 1,
        "description": "Chủ dược Sát Phạt Hoa dùng cho đan offensive tại Trúc Cơ.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "truc_co_ho_the_diepla",
        "name": "Trúc Cơ Hộ Thể Diệp",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "type": "defensive",
        "tier": 1,
        "description": "Chủ dược Hộ Thể Diệp dùng cho đan defensive tại Trúc Cơ.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "truc_co_nguyen_luc_chi",
        "name": "Trúc Cơ Nguyên Lực Chi",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "type": "attribute",
        "tier": 1,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Trúc Cơ.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "kim_dan_pha_canh_qua",
        "name": "Kim Đan Phá Cảnh Quả",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "type": "breakthrough",
        "tier": 1,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Kim Đan.",
        "growSeconds": 840,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "kim_dan_phu_duoc",
        "name": "Huyết Nguyên Kim Đan Phụ Dược",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "type": "support",
        "tier": 1,
        "description": "Phụ dược ổn định dược lực cho đan dược Kim Đan.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "kim_dan_linh_thao",
        "name": "Kim Đan Linh Thảo",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "type": "cultivation",
        "tier": 1,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Kim Đan.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "kim_dan_sat_phat_hoa",
        "name": "Kim Đan Sát Phạt Hoa",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "type": "offensive",
        "tier": 1,
        "description": "Chủ dược Sát Phạt Hoa dùng cho đan offensive tại Kim Đan.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "kim_dan_ho_the_diepla",
        "name": "Kim Đan Hộ Thể Diệp",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "type": "defensive",
        "tier": 1,
        "description": "Chủ dược Hộ Thể Diệp dùng cho đan defensive tại Kim Đan.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "kim_dan_nguyen_luc_chi",
        "name": "Kim Đan Nguyên Lực Chi",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "type": "attribute",
        "tier": 1,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Kim Đan.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "nguyen_anh_pha_canh_qua",
        "name": "Nguyên Anh Phá Cảnh Quả",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "type": "breakthrough",
        "tier": 1,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Nguyên Anh.",
        "growSeconds": 840,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "nguyen_anh_phu_duoc",
        "name": "Huyết Nguyên Nguyên Anh Phụ Dược",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "type": "support",
        "tier": 1,
        "description": "Phụ dược ổn định dược lực cho đan dược Nguyên Anh.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "nguyen_anh_linh_thao",
        "name": "Nguyên Anh Linh Thảo",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "type": "cultivation",
        "tier": 1,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Nguyên Anh.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "nguyen_anh_sat_phat_hoa",
        "name": "Nguyên Anh Sát Phạt Hoa",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "type": "offensive",
        "tier": 1,
        "description": "Chủ dược Sát Phạt Hoa dùng cho đan offensive tại Nguyên Anh.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "nguyen_anh_ho_the_diepla",
        "name": "Nguyên Anh Hộ Thể Diệp",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "type": "defensive",
        "tier": 1,
        "description": "Chủ dược Hộ Thể Diệp dùng cho đan defensive tại Nguyên Anh.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "nguyen_anh_nguyen_luc_chi",
        "name": "Nguyên Anh Nguyên Lực Chi",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "type": "attribute",
        "tier": 1,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Nguyên Anh.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hoa_than_pha_canh_qua",
        "name": "Hóa Thần Phá Cảnh Quả",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "type": "breakthrough",
        "tier": 1,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Hóa Thần.",
        "growSeconds": 840,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hoa_than_phu_duoc",
        "name": "Huyết Nguyên Hóa Thần Phụ Dược",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "type": "support",
        "tier": 1,
        "description": "Phụ dược ổn định dược lực cho đan dược Hóa Thần.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hoa_than_linh_thao",
        "name": "Hóa Thần Linh Thảo",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "type": "cultivation",
        "tier": 1,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Hóa Thần.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hoa_than_sat_phat_hoa",
        "name": "Hóa Thần Sát Phạt Hoa",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "type": "offensive",
        "tier": 1,
        "description": "Chủ dược Sát Phạt Hoa dùng cho đan offensive tại Hóa Thần.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hoa_than_ho_the_diepla",
        "name": "Hóa Thần Hộ Thể Diệp",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "type": "defensive",
        "tier": 1,
        "description": "Chủ dược Hộ Thể Diệp dùng cho đan defensive tại Hóa Thần.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hoa_than_nguyen_luc_chi",
        "name": "Hóa Thần Nguyên Lực Chi",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "type": "attribute",
        "tier": 1,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Hóa Thần.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "luyen_hu_pha_canh_qua",
        "name": "Luyện Hư Phá Cảnh Quả",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "type": "breakthrough",
        "tier": 1,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Luyện Hư.",
        "growSeconds": 840,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "luyen_hu_phu_duoc",
        "name": "Huyết Nguyên Luyện Hư Phụ Dược",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "type": "support",
        "tier": 1,
        "description": "Phụ dược ổn định dược lực cho đan dược Luyện Hư.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "luyen_hu_linh_thao",
        "name": "Luyện Hư Linh Thảo",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "type": "cultivation",
        "tier": 1,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Luyện Hư.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "luyen_hu_sat_phat_hoa",
        "name": "Luyện Hư Sát Phạt Hoa",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "type": "offensive",
        "tier": 1,
        "description": "Chủ dược Sát Phạt Hoa dùng cho đan offensive tại Luyện Hư.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "luyen_hu_ho_the_diepla",
        "name": "Luyện Hư Hộ Thể Diệp",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "type": "defensive",
        "tier": 1,
        "description": "Chủ dược Hộ Thể Diệp dùng cho đan defensive tại Luyện Hư.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "luyen_hu_nguyen_luc_chi",
        "name": "Luyện Hư Nguyên Lực Chi",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "type": "attribute",
        "tier": 1,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Luyện Hư.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hop_the_pha_canh_qua",
        "name": "Hợp Thể Phá Cảnh Quả",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "type": "breakthrough",
        "tier": 1,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Hợp Thể.",
        "growSeconds": 840,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hop_the_phu_duoc",
        "name": "Huyết Nguyên Hợp Thể Phụ Dược",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "type": "support",
        "tier": 1,
        "description": "Phụ dược ổn định dược lực cho đan dược Hợp Thể.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hop_the_linh_thao",
        "name": "Hợp Thể Linh Thảo",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "type": "cultivation",
        "tier": 1,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Hợp Thể.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hop_the_sat_phat_hoa",
        "name": "Hợp Thể Sát Phạt Hoa",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "type": "offensive",
        "tier": 1,
        "description": "Chủ dược Sát Phạt Hoa dùng cho đan offensive tại Hợp Thể.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hop_the_ho_the_diepla",
        "name": "Hợp Thể Hộ Thể Diệp",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "type": "defensive",
        "tier": 1,
        "description": "Chủ dược Hộ Thể Diệp dùng cho đan defensive tại Hợp Thể.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "hop_the_nguyen_luc_chi",
        "name": "Hợp Thể Nguyên Lực Chi",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "type": "attribute",
        "tier": 1,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Hợp Thể.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "do_kiep_pha_canh_qua",
        "name": "Độ Kiếp Phá Cảnh Quả",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "type": "breakthrough",
        "tier": 1,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Độ Kiếp.",
        "growSeconds": 840,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "do_kiep_phu_duoc",
        "name": "Huyết Nguyên Độ Kiếp Phụ Dược",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "type": "support",
        "tier": 1,
        "description": "Phụ dược ổn định dược lực cho đan dược Độ Kiếp.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "do_kiep_linh_thao",
        "name": "Độ Kiếp Linh Thảo",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "type": "cultivation",
        "tier": 1,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Độ Kiếp.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "do_kiep_sat_phat_hoa",
        "name": "Độ Kiếp Sát Phạt Hoa",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "type": "offensive",
        "tier": 1,
        "description": "Chủ dược Sát Phạt Hoa dùng cho đan offensive tại Độ Kiếp.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "do_kiep_ho_the_diepla",
        "name": "Độ Kiếp Hộ Thể Diệp",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "type": "defensive",
        "tier": 1,
        "description": "Chủ dược Hộ Thể Diệp dùng cho đan defensive tại Độ Kiếp.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "do_kiep_nguyen_luc_chi",
        "name": "Độ Kiếp Nguyên Lực Chi",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "type": "attribute",
        "tier": 1,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Độ Kiếp.",
        "growSeconds": 420,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "ban_tien_linh_thao",
        "name": "Bán Tiên Linh Thảo",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "type": "cultivation",
        "tier": 2,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Bán Tiên.",
        "growSeconds": 540,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "tien_gioi_linh_tuy",
        "name": "Tiên Giới Linh Tủy",
        "world": "tien_gioi",
        "realm": null,
        "type": "catalyst",
        "tier": 2,
        "description": "Chất dẫn luyện đan cấp Tiên Giới.",
        "growSeconds": 360,
        "yield": [
            1,
            2
        ]
    },
    {
        "id": "ban_tien_phu_duoc",
        "name": "Kim Hà Bán Tiên Phụ Dược",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "type": "support",
        "tier": 2,
        "description": "Phụ dược ổn định dược lực cho đan dược Bán Tiên.",
        "growSeconds": 540,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "ban_tien_pha_canh_qua",
        "name": "Bán Tiên Phá Cảnh Quả",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "type": "breakthrough",
        "tier": 2,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Bán Tiên.",
        "growSeconds": 1080,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "ban_tien_sat_phat_hoa",
        "name": "Bán Tiên Sát Phạt Hoa",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "type": "offensive",
        "tier": 2,
        "description": "Chủ dược Sát Phạt Hoa dùng cho đan offensive tại Bán Tiên.",
        "growSeconds": 540,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "ban_tien_ho_the_diepla",
        "name": "Bán Tiên Hộ Thể Diệp",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "type": "defensive",
        "tier": 2,
        "description": "Chủ dược Hộ Thể Diệp dùng cho đan defensive tại Bán Tiên.",
        "growSeconds": 540,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "chan_tien_pha_canh_qua",
        "name": "Chân Tiên Phá Cảnh Quả",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "type": "breakthrough",
        "tier": 2,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Chân Tiên.",
        "growSeconds": 1080,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "chan_tien_phu_duoc",
        "name": "Kim Hà Chân Tiên Phụ Dược",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "type": "support",
        "tier": 2,
        "description": "Phụ dược ổn định dược lực cho đan dược Chân Tiên.",
        "growSeconds": 540,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "chan_tien_linh_thao",
        "name": "Chân Tiên Linh Thảo",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "type": "cultivation",
        "tier": 2,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Chân Tiên.",
        "growSeconds": 540,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "chan_tien_sat_phat_hoa",
        "name": "Chân Tiên Sát Phạt Hoa",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "type": "offensive",
        "tier": 2,
        "description": "Chủ dược Sát Phạt Hoa dùng cho đan offensive tại Chân Tiên.",
        "growSeconds": 540,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "chan_tien_ho_the_diepla",
        "name": "Chân Tiên Hộ Thể Diệp",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "type": "defensive",
        "tier": 2,
        "description": "Chủ dược Hộ Thể Diệp dùng cho đan defensive tại Chân Tiên.",
        "growSeconds": 540,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "special_linh_thao",
        "name": "thuan theo thien dao Linh Thảo",
        "world": "nguyen_gioi",
        "realm": "special",
        "type": "cultivation",
        "tier": 3,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại thuan theo thien dao.",
        "growSeconds": 660,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "nguyen_gioi_linh_tuy",
        "name": "Nguyên Giới Linh Tủy",
        "world": "nguyen_gioi",
        "realm": null,
        "type": "catalyst",
        "tier": 3,
        "description": "Chất dẫn luyện đan cấp Nguyên Giới.",
        "growSeconds": 540,
        "yield": [
            1,
            2
        ]
    },
    {
        "id": "special_phu_duoc",
        "name": "Nguyên Sơ thuan theo thien dao Phụ Dược",
        "world": "nguyen_gioi",
        "realm": "special",
        "type": "support",
        "tier": 3,
        "description": "Phụ dược ổn định dược lực cho đan dược thuan theo thien dao.",
        "growSeconds": 660,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "special_pha_canh_qua",
        "name": "thuan theo thien dao Phá Cảnh Quả",
        "world": "nguyen_gioi",
        "realm": "special",
        "type": "breakthrough",
        "tier": 3,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại thuan theo thien dao.",
        "growSeconds": 1320,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "special_nguyen_luc_chi",
        "name": "thuan theo thien dao Nguyên Lực Chi",
        "world": "nguyen_gioi",
        "realm": "special",
        "type": "attribute",
        "tier": 3,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại thuan theo thien dao.",
        "growSeconds": 660,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "dao_canh_linh_thao",
        "name": "Đạo Cảnh Linh Thảo",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "type": "cultivation",
        "tier": 4,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "dao_gioi_linh_tuy",
        "name": "Đạo Giới Linh Tủy",
        "world": "dao_gioi",
        "realm": null,
        "type": "catalyst",
        "tier": 4,
        "description": "Chất dẫn luyện đan cấp Đạo Giới.",
        "growSeconds": 720,
        "yield": [
            1,
            2
        ]
    },
    {
        "id": "dao_canh_phu_duoc",
        "name": "Hỗn Nguyên Đạo Cảnh Phụ Dược",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "type": "support",
        "tier": 4,
        "description": "Phụ dược ổn định dược lực cho đan dược Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "dao_canh_pha_canh_qua",
        "name": "Đạo Cảnh Phá Cảnh Quả",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "type": "breakthrough",
        "tier": 4,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Đạo Cảnh.",
        "growSeconds": 1560,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "dao_canh_nguyen_luc_chi",
        "name": "Đạo Cảnh Nguyên Lực Chi",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "type": "attribute",
        "tier": 4,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "dai_dao_canh_linh_thao",
        "name": "Đại Đạo Cảnh Linh Thảo",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "type": "cultivation",
        "tier": 4,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Đại Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "dai_dao_canh_phu_duoc",
        "name": "Hỗn Nguyên Đại Đạo Cảnh Phụ Dược",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "type": "support",
        "tier": 4,
        "description": "Phụ dược ổn định dược lực cho đan dược Đại Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "dai_dao_canh_pha_canh_qua",
        "name": "Đại Đạo Cảnh Phá Cảnh Quả",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "type": "breakthrough",
        "tier": 4,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Đại Đạo Cảnh.",
        "growSeconds": 1560,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "dai_dao_canh_nguyen_luc_chi",
        "name": "Đại Đạo Cảnh Nguyên Lực Chi",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "type": "attribute",
        "tier": 4,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Đại Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "thien_dao_canh_linh_thao",
        "name": "Thiên Đạo Cảnh Linh Thảo",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "type": "cultivation",
        "tier": 4,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Thiên Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "thien_dao_canh_phu_duoc",
        "name": "Hỗn Nguyên Thiên Đạo Cảnh Phụ Dược",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "type": "support",
        "tier": 4,
        "description": "Phụ dược ổn định dược lực cho đan dược Thiên Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "thien_dao_canh_pha_canh_qua",
        "name": "Thiên Đạo Cảnh Phá Cảnh Quả",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "type": "breakthrough",
        "tier": 4,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Thiên Đạo Cảnh.",
        "growSeconds": 1560,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "thien_dao_canh_nguyen_luc_chi",
        "name": "Thiên Đạo Cảnh Nguyên Lực Chi",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "type": "attribute",
        "tier": 4,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Thiên Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "than_dao_canh_linh_thao",
        "name": "Thần Đạo Cảnh Linh Thảo",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "type": "cultivation",
        "tier": 4,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Thần Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "than_dao_canh_phu_duoc",
        "name": "Hỗn Nguyên Thần Đạo Cảnh Phụ Dược",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "type": "support",
        "tier": 4,
        "description": "Phụ dược ổn định dược lực cho đan dược Thần Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "than_dao_canh_pha_canh_qua",
        "name": "Thần Đạo Cảnh Phá Cảnh Quả",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "type": "breakthrough",
        "tier": 4,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Thần Đạo Cảnh.",
        "growSeconds": 1560,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "than_dao_canh_nguyen_luc_chi",
        "name": "Thần Đạo Cảnh Nguyên Lực Chi",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "type": "attribute",
        "tier": 4,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Thần Đạo Cảnh.",
        "growSeconds": 780,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "sieu_than_canh_linh_thao",
        "name": "Siêu Thần Cảnh Linh Thảo",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "type": "cultivation",
        "tier": 5,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Siêu Thần Cảnh.",
        "growSeconds": 900,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "chung_cuc_gioi_linh_tuy",
        "name": "Chung Cực Giới Linh Tủy",
        "world": "chung_cuc_gioi",
        "realm": null,
        "type": "catalyst",
        "tier": 5,
        "description": "Chất dẫn luyện đan cấp Chung Cực Giới.",
        "growSeconds": 900,
        "yield": [
            1,
            2
        ]
    },
    {
        "id": "sieu_than_canh_phu_duoc",
        "name": "Bất Hủ Siêu Thần Cảnh Phụ Dược",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "type": "support",
        "tier": 5,
        "description": "Phụ dược ổn định dược lực cho đan dược Siêu Thần Cảnh.",
        "growSeconds": 900,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "sieu_than_canh_pha_canh_qua",
        "name": "Siêu Thần Cảnh Phá Cảnh Quả",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "type": "breakthrough",
        "tier": 5,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Siêu Thần Cảnh.",
        "growSeconds": 1800,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "sieu_than_canh_nguyen_luc_chi",
        "name": "Siêu Thần Cảnh Nguyên Lực Chi",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "type": "attribute",
        "tier": 5,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Siêu Thần Cảnh.",
        "growSeconds": 900,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "bat_hu_canh_linh_thao",
        "name": "Bất Hủ Cảnh Linh Thảo",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "type": "cultivation",
        "tier": 5,
        "description": "Chủ dược Linh Thảo dùng cho đan cultivation tại Bất Hủ Cảnh.",
        "growSeconds": 900,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "bat_hu_canh_phu_duoc",
        "name": "Bất Hủ Bất Hủ Cảnh Phụ Dược",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "type": "support",
        "tier": 5,
        "description": "Phụ dược ổn định dược lực cho đan dược Bất Hủ Cảnh.",
        "growSeconds": 900,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "bat_hu_canh_pha_canh_qua",
        "name": "Bất Hủ Cảnh Phá Cảnh Quả",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "type": "breakthrough",
        "tier": 5,
        "description": "Chủ dược Phá Cảnh Quả dùng cho đan breakthrough tại Bất Hủ Cảnh.",
        "growSeconds": 1800,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "bat_hu_canh_nguyen_luc_chi",
        "name": "Bất Hủ Cảnh Nguyên Lực Chi",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "type": "attribute",
        "tier": 5,
        "description": "Chủ dược Nguyên Lực Chi dùng cho đan attribute tại Bất Hủ Cảnh.",
        "growSeconds": 900,
        "yield": [
            1,
            3
        ]
    },
    {
        "id": "bat_hu_canh_than_thoai_qua",
        "name": "Bất Hủ Cảnh Thần Thoại Quả",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "type": "special",
        "tier": 5,
        "description": "Chủ dược Thần Thoại Quả dùng cho đan special tại Bất Hủ Cảnh.",
        "growSeconds": 900,
        "yield": [
            1,
            3
        ]
    }
];

module.exports = HERBS;
