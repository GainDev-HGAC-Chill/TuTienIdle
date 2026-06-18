// ============================================
//  CONFIG - PILL RECIPES
//  Công thức luyện đan
// ============================================

const PILL_RECIPES = [
    {
        "id": "recipe_tu_linh_tan",
        "pillId": "tu_linh_tan",
        "name": "Công thức Tụ Linh Tán",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_khi_linh_thao",
                "amount": 1
            },
            {
                "id": "luyen_khi_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_boi_nguyen_dan",
        "pillId": "boi_nguyen_dan",
        "name": "Công thức Bồi Nguyên Đan",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_khi_linh_thao",
                "amount": 1
            },
            {
                "id": "luyen_khi_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thong_khieu_dan",
        "pillId": "thong_khieu_dan",
        "name": "Công thức Thông Khiếu Đan",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "luyen_khi_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "luyen_khi_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_liet_diem_phan",
        "pillId": "liet_diem_phan",
        "name": "Công thức Liệt Diệm Phấn",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_khi_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "luyen_khi_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_han_bang_cham",
        "pillId": "han_bang_cham",
        "name": "Công thức Hàn Băng Châm",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_khi_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "luyen_khi_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thach_giap_tan",
        "pillId": "thach_giap_tan",
        "name": "Công thức Thạch Giáp Tán",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_khi_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "luyen_khi_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thanh_phong_chu",
        "pillId": "thanh_phong_chu",
        "name": "Công thức Thanh Phong Chú",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_khi_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "luyen_khi_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_nhat_duong_dan",
        "pillId": "nhat_duong_dan",
        "name": "Công thức Nhất Dương Đan",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_khi_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "luyen_khi_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_truong_thu_dan",
        "pillId": "truong_thu_dan",
        "name": "Công thức Trường Thủ Đan",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_khi_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "luyen_khi_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_toc_anh_dan",
        "pillId": "toc_anh_dan",
        "name": "Công thức Tốc Ảnh Đan",
        "world": "nhan_gioi",
        "realm": "luyen_khi",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_khi_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "luyen_khi_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_truc_co_dan",
        "pillId": "truc_co_dan",
        "name": "Công thức Trúc Cơ Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "truc_co_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "truc_co_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_linh_thuy",
        "pillId": "thien_linh_thuy",
        "name": "Công thức Thiên Linh Thủy",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "truc_co_linh_thao",
                "amount": 1
            },
            {
                "id": "truc_co_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_cuu_chuyen_hon_nguyen_dan",
        "pillId": "cuu_chuyen_hon_nguyen_dan",
        "name": "Công thức Cửu Chuyển Hồn Nguyên Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "truc_co_linh_thao",
                "amount": 1
            },
            {
                "id": "truc_co_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_doc_long_chi_dan",
        "pillId": "doc_long_chi_dan",
        "name": "Công thức Độc Long Chi Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "truc_co_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "truc_co_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_loi_chau",
        "pillId": "loi_chau",
        "name": "Công thức Lôi Châu",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "truc_co_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "truc_co_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_huyen_giap_dan",
        "pillId": "huyen_giap_dan",
        "name": "Công thức Huyền Giáp Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "truc_co_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "truc_co_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thuy_kinh_thuat",
        "pillId": "thuy_kinh_thuat",
        "name": "Công thức Thủy Kính Thuật",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "truc_co_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "truc_co_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_luong_nghi_dan",
        "pillId": "luong_nghi_dan",
        "name": "Công thức Lưỡng Nghi Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "truc_co_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "truc_co_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_hoa_van_dan",
        "pillId": "hoa_van_dan",
        "name": "Công thức Hỏa Vân Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "truc_co_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "truc_co_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thuy_nhu_dan",
        "pillId": "thuy_nhu_dan",
        "name": "Công thức Thủy Nhu Đan",
        "world": "nhan_gioi",
        "realm": "truc_co",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "truc_co_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "truc_co_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_kim_dan_dai_hoan",
        "pillId": "kim_dan_dai_hoan",
        "name": "Công thức Kim Đan Đại Hoàn",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "kim_dan_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "kim_dan_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_luc_duong_dan",
        "pillId": "luc_duong_dan",
        "name": "Công thức Lục Dương Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "kim_dan_linh_thao",
                "amount": 1
            },
            {
                "id": "kim_dan_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_that_khieu_linh_dan",
        "pillId": "that_khieu_linh_dan",
        "name": "Công thức Thất Khiếu Linh Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "kim_dan_linh_thao",
                "amount": 1
            },
            {
                "id": "kim_dan_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_hoa_van_phu_dan",
        "pillId": "hoa_van_phu_dan",
        "name": "Công thức Hỏa Vân Phù Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "kim_dan_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "kim_dan_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_kim_cuong_thach",
        "pillId": "kim_cuong_thach",
        "name": "Công thức Kim Cương Thạch",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "kim_dan_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "kim_dan_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_bat_dong_minh_vuong_dan",
        "pillId": "bat_dong_minh_vuong_dan",
        "name": "Công thức Bất Động Minh Vương Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "kim_dan_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "kim_dan_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_phan_hu_dan",
        "pillId": "phan_hu_dan",
        "name": "Công thức Phản Hư Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "kim_dan_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "kim_dan_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_tu_tuong_dan",
        "pillId": "tu_tuong_dan",
        "name": "Công thức Tứ Tượng Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "kim_dan_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "kim_dan_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_loi_am_dan",
        "pillId": "loi_am_dan",
        "name": "Công thức Lôi Âm Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "kim_dan_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "kim_dan_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_huyen_vu_dan",
        "pillId": "huyen_vu_dan",
        "name": "Công thức Huyền Vũ Đan",
        "world": "nhan_gioi",
        "realm": "kim_dan",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "kim_dan_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "kim_dan_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_nguyen_anh_hoa_hinh_dan",
        "pillId": "nguyen_anh_hoa_hinh_dan",
        "name": "Công thức Nguyên Anh Hóa Hình Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "nguyen_anh_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "nguyen_anh_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_cuu_chuyen_dai_hoan_dan",
        "pillId": "cuu_chuyen_dai_hoan_dan",
        "name": "Công thức Cửu Chuyển Đại Hoàn Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "nguyen_anh_linh_thao",
                "amount": 1
            },
            {
                "id": "nguyen_anh_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thai_thuong_linh_dan",
        "pillId": "thai_thuong_linh_dan",
        "name": "Công thức Thái Thượng Linh Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "nguyen_anh_linh_thao",
                "amount": 1
            },
            {
                "id": "nguyen_anh_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_than_phong_chu_dan",
        "pillId": "than_phong_chu_dan",
        "name": "Công thức Thần Phong Chú Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "nguyen_anh_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "nguyen_anh_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_van_doc_tan",
        "pillId": "van_doc_tan",
        "name": "Công thức Vạn Độc Tán",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "nguyen_anh_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "nguyen_anh_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_ngu_hanh_giap",
        "pillId": "ngu_hanh_giap",
        "name": "Công thức Ngũ Hành Giáp",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "nguyen_anh_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "nguyen_anh_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thai_cuc_dan",
        "pillId": "thai_cuc_dan",
        "name": "Công thức Thái Cực Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "nguyen_anh_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "nguyen_anh_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_ngu_hanh_dan_tong_hop",
        "pillId": "ngu_hanh_dan_tong_hop",
        "name": "Công thức Ngũ Hành Đan Tổng Hợp",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "nguyen_anh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "nguyen_anh_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_ba_dao_dan",
        "pillId": "ba_dao_dan",
        "name": "Công thức Bá Đạo Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "nguyen_anh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "nguyen_anh_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_kim_cuong_dan",
        "pillId": "kim_cuong_dan",
        "name": "Công thức Kim Cương Đan",
        "world": "nhan_gioi",
        "realm": "nguyen_anh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "nguyen_anh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "nguyen_anh_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_hoa_than_chi_tu",
        "pillId": "hoa_than_chi_tu",
        "name": "Công thức Hóa Thần Chi Tử",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "hoa_than_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "hoa_than_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_than_niem_tinh_dan",
        "pillId": "than_niem_tinh_dan",
        "name": "Công thức Thần Niệm Tịnh Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hoa_than_linh_thao",
                "amount": 1
            },
            {
                "id": "hoa_than_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_dai_la_kim_tien_dan",
        "pillId": "dai_la_kim_tien_dan",
        "name": "Công thức Đại La Kim Tiên Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hoa_than_linh_thao",
                "amount": 1
            },
            {
                "id": "hoa_than_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_than_niem_chu_sat",
        "pillId": "than_niem_chu_sat",
        "name": "Công thức Thần Niệm Chú Sát",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hoa_than_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "hoa_than_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_hoa_than_phu",
        "pillId": "thien_hoa_than_phu",
        "name": "Công thức Thiên Hỏa Thần Phù",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hoa_than_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "hoa_than_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_than_giap_chi_dan",
        "pillId": "than_giap_chi_dan",
        "name": "Công thức Thần Giáp Chi Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hoa_than_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "hoa_than_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_bat_tu_than_luc",
        "pillId": "bat_tu_than_luc",
        "name": "Công thức Bất Tử Thần Lực",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hoa_than_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "hoa_than_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_than_uy_dan",
        "pillId": "than_uy_dan",
        "name": "Công thức Thần Uy Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hoa_than_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "hoa_than_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_than_ho_dan",
        "pillId": "than_ho_dan",
        "name": "Công thức Thần Hộ Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hoa_than_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "hoa_than_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_toc_niem_dan",
        "pillId": "toc_niem_dan",
        "name": "Công thức Tốc Niệm Đan",
        "world": "nhan_gioi",
        "realm": "hoa_than",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hoa_than_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "hoa_than_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_hu_vo_dai_dan",
        "pillId": "hu_vo_dai_dan",
        "name": "Công thức Hư Vô Đại Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "luyen_hu_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "luyen_hu_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_khong_dong_dan",
        "pillId": "khong_dong_dan",
        "name": "Công thức Không Động Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_hu_linh_thao",
                "amount": 1
            },
            {
                "id": "luyen_hu_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_vo_cuc_dan",
        "pillId": "vo_cuc_dan",
        "name": "Công thức Vô Cực Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_hu_linh_thao",
                "amount": 1
            },
            {
                "id": "luyen_hu_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_hu_vo_chi_kiem",
        "pillId": "hu_vo_chi_kiem",
        "name": "Công thức Hư Vô Chi Kiếm",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_hu_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "luyen_hu_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_can_khon_nhat_tram",
        "pillId": "can_khon_nhat_tram",
        "name": "Công thức Càn Khôn Nhất Trảm",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_hu_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "luyen_hu_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_hu_ao_linh_giap",
        "pillId": "hu_ao_linh_giap",
        "name": "Công thức Hư Ảo Linh Giáp",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_hu_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "luyen_hu_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_pha_hu_dan",
        "pillId": "pha_hu_dan",
        "name": "Công thức Phá Hư Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_hu_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "luyen_hu_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_hu_vo_dan",
        "pillId": "hu_vo_dan",
        "name": "Công thức Hư Vô Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_hu_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "luyen_hu_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_pha_khong_dan",
        "pillId": "pha_khong_dan",
        "name": "Công thức Phá Không Đan",
        "world": "nhan_gioi",
        "realm": "luyen_hu",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "luyen_hu_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "luyen_hu_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_nhan_hop_nhat_dan",
        "pillId": "thien_nhan_hop_nhat_dan",
        "name": "Công thức Thiên Nhân Hợp Nhất Đan",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "hop_the_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "hop_the_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_dao_qua_chi_dan",
        "pillId": "dao_qua_chi_dan",
        "name": "Công thức Đạo Quả Chi Đan",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hop_the_linh_thao",
                "amount": 1
            },
            {
                "id": "hop_the_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_bat_hu_hop_dan",
        "pillId": "bat_hu_hop_dan",
        "name": "Công thức Bất Hủ Hợp Đan",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hop_the_linh_thao",
                "amount": 1
            },
            {
                "id": "hop_the_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_dia_chu",
        "pillId": "thien_dia_chu",
        "name": "Công thức Thiên Địa Chú",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hop_the_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "hop_the_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_bat_hu_chi_tram",
        "pillId": "bat_hu_chi_tram",
        "name": "Công thức Bất Hủ Chi Trảm",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hop_the_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "hop_the_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_hop_the_kim_cuong",
        "pillId": "hop_the_kim_cuong",
        "name": "Công thức Hợp Thể Kim Cương",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hop_the_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "hop_the_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_dai_dia_chi_giap",
        "pillId": "dai_dia_chi_giap",
        "name": "Công thức Đại Địa Chi Giáp",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hop_the_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "hop_the_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_dao_dan",
        "pillId": "thien_dao_dan",
        "name": "Công thức Thiên Đạo Đan",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hop_the_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "hop_the_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thanh_gia_dan",
        "pillId": "thanh_gia_dan",
        "name": "Công thức Thánh Giả Đan",
        "world": "nhan_gioi",
        "realm": "hop_the",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "hop_the_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "hop_the_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_do_kiep_than_dan",
        "pillId": "do_kiep_than_dan",
        "name": "Công thức Độ Kiếp Thần Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "do_kiep_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "do_kiep_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_loi_kiep_do_hoa_dan",
        "pillId": "loi_kiep_do_hoa_dan",
        "name": "Công thức Lôi Kiếp Độ Hóa Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "do_kiep_linh_thao",
                "amount": 1
            },
            {
                "id": "do_kiep_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_truong_sinh_dan",
        "pillId": "truong_sinh_dan",
        "name": "Công thức Trường Sinh Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "do_kiep_linh_thao",
                "amount": 1
            },
            {
                "id": "do_kiep_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_cuu_thien_loi_chu",
        "pillId": "cuu_thien_loi_chu",
        "name": "Công thức Cửu Thiên Lôi Chú",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "do_kiep_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "do_kiep_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_huy_diet_phu_luc",
        "pillId": "huy_diet_phu_luc",
        "name": "Công thức Hủy Diệt Phù Lục",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "do_kiep_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "do_kiep_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_cuong_dan",
        "pillId": "thien_cuong_dan",
        "name": "Công thức Thiên Cương Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "do_kiep_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "do_kiep_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_tu_vong_chi_du",
        "pillId": "tu_vong_chi_du",
        "name": "Công thức Tử Vong Chi Dụ",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "do_kiep_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "do_kiep_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_dia_dan",
        "pillId": "thien_dia_dan",
        "name": "Công thức Thiên Địa Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "do_kiep_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "do_kiep_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_vo_song_dan",
        "pillId": "vo_song_dan",
        "name": "Công thức Vô Song Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "do_kiep_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "do_kiep_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_bat_diet_dan",
        "pillId": "bat_diet_dan",
        "name": "Công thức Bất Diệt Đan",
        "world": "nhan_gioi",
        "realm": "do_kiep",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 1,
        "materials": [
            {
                "id": "do_kiep_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "do_kiep_phu_duoc",
                "amount": 1
            },
            {
                "id": "nhan_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_tien_loc_dan",
        "pillId": "tien_loc_dan",
        "name": "Công thức Tiên Lộc Đan",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "ban_tien_linh_thao",
                "amount": 1
            },
            {
                "id": "ban_tien_phu_duoc",
                "amount": 1
            },
            {
                "id": "tien_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_boi_tien_dan",
        "pillId": "boi_tien_dan",
        "name": "Công thức Bồi Tiên Đan",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "ban_tien_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "ban_tien_phu_duoc",
                "amount": 1
            },
            {
                "id": "tien_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_tien_phong_chu",
        "pillId": "tien_phong_chu",
        "name": "Công thức Tiên Phong Chú",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "ban_tien_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "ban_tien_phu_duoc",
                "amount": 1
            },
            {
                "id": "tien_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_ban_tien_giap",
        "pillId": "ban_tien_giap",
        "name": "Công thức Bán Tiên Giáp",
        "world": "tien_gioi",
        "realm": "ban_tien",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "ban_tien_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "ban_tien_phu_duoc",
                "amount": 1
            },
            {
                "id": "tien_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_chan_tien_qua",
        "pillId": "chan_tien_qua",
        "name": "Công thức Chân Tiên Quả",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "chan_tien_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "chan_tien_phu_duoc",
                "amount": 1
            },
            {
                "id": "tien_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_tien_nguyen_dan",
        "pillId": "tien_nguyen_dan",
        "name": "Công thức Tiên Nguyên Đan",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "chan_tien_linh_thao",
                "amount": 1
            },
            {
                "id": "chan_tien_phu_duoc",
                "amount": 1
            },
            {
                "id": "tien_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_chan_hoa_dan",
        "pillId": "chan_hoa_dan",
        "name": "Công thức Chân Hỏa Đan",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "daoEntryMethod": null,
        "category": "offensive",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "chan_tien_sat_phat_hoa",
                "amount": 1
            },
            {
                "id": "chan_tien_phu_duoc",
                "amount": 1
            },
            {
                "id": "tien_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_chan_tien_the",
        "pillId": "chan_tien_the",
        "name": "Công thức Chân Tiên Thể",
        "world": "tien_gioi",
        "realm": "chan_tien",
        "daoEntryMethod": null,
        "category": "defensive",
        "requiredAlchemyRank": 2,
        "materials": [
            {
                "id": "chan_tien_ho_the_diepla",
                "amount": 1
            },
            {
                "id": "chan_tien_phu_duoc",
                "amount": 1
            },
            {
                "id": "tien_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_dao_linh_dan",
        "pillId": "thien_dao_linh_dan",
        "name": "Công thức Thiên Đạo Linh Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thuan_theo_thien_dao",
        "category": "cultivation",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_linh_thao",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thuan_thien_dan",
        "pillId": "thuan_thien_dan",
        "name": "Công thức Thuận Thiên Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thuan_theo_thien_dao",
        "category": "breakthrough",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "special_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_cong_dan",
        "pillId": "thien_cong_dan",
        "name": "Công thức Thiên Công Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thuan_theo_thien_dao",
        "category": "attribute",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_thu_dan",
        "pillId": "thien_thu_dan",
        "name": "Công thức Thiên Thủ Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thuan_theo_thien_dao",
        "category": "attribute",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_quy_nuong_dan",
        "pillId": "quy_nuong_dan",
        "name": "Công thức Quỷ Nương Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "nuong_nho_thien_dao",
        "category": "cultivation",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_linh_thao",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_nuong_nho_dan",
        "pillId": "nuong_nho_dan",
        "name": "Công thức Nương Nhờ Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "nuong_nho_thien_dao",
        "category": "breakthrough",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "special_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_nuong_phong_dan",
        "pillId": "nuong_phong_dan",
        "name": "Công thức Nương Phong Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "nuong_nho_thien_dao",
        "category": "attribute",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_nuong_giap_dan",
        "pillId": "nuong_giap_dan",
        "name": "Công thức Nương Giáp Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "nuong_nho_thien_dao",
        "category": "attribute",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_nghich_dao_dan",
        "pillId": "nghich_dao_dan",
        "name": "Công thức Nghịch Đạo Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "doi_nghich_thien_dao",
        "category": "cultivation",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_linh_thao",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_phan_thien_dan",
        "pillId": "phan_thien_dan",
        "name": "Công thức Phản Thiên Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "doi_nghich_thien_dao",
        "category": "breakthrough",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "special_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_nghich_thien_dan",
        "pillId": "nghich_thien_dan",
        "name": "Công thức Nghịch Thiên Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "doi_nghich_thien_dao",
        "category": "attribute",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_phan_dao_giap",
        "pillId": "phan_dao_giap",
        "name": "Công thức Phản Đạo Giáp",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "doi_nghich_thien_dao",
        "category": "attribute",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_sieu_pham_dan",
        "pillId": "sieu_pham_dan",
        "name": "Công thức Siêu Phàm Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "sieu_thoat_thien_dao",
        "category": "cultivation",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_linh_thao",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thoat_the_dan",
        "pillId": "thoat_the_dan",
        "name": "Công thức Thoát Thế Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "sieu_thoat_thien_dao",
        "category": "breakthrough",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "special_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_sieu_dao_dan",
        "pillId": "sieu_dao_dan",
        "name": "Công thức Siêu Đạo Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "sieu_thoat_thien_dao",
        "category": "attribute",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_sieu_thoat_giap",
        "pillId": "sieu_thoat_giap",
        "name": "Công thức Siêu Thoát Giáp",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "sieu_thoat_thien_dao",
        "category": "attribute",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thong_thien_dan",
        "pillId": "thong_thien_dan",
        "name": "Công thức Thống Thiên Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thong_tri_thien_dao",
        "category": "cultivation",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_linh_thao",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_chu_dao_dan",
        "pillId": "chu_dao_dan",
        "name": "Công thức Chủ Đạo Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thong_tri_thien_dao",
        "category": "breakthrough",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "special_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_chi_ton_cong_dan",
        "pillId": "chi_ton_cong_dan",
        "name": "Công thức Chí Tôn Công Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thong_tri_thien_dao",
        "category": "attribute",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_vo_dich_thu_dan",
        "pillId": "vo_dich_thu_dan",
        "name": "Công thức Vô Địch Thủ Đan",
        "world": "nguyen_gioi",
        "realm": null,
        "daoEntryMethod": "thong_tri_thien_dao",
        "category": "attribute",
        "requiredAlchemyRank": 3,
        "materials": [
            {
                "id": "special_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "special_phu_duoc",
                "amount": 1
            },
            {
                "id": "nguyen_gioi_linh_tuy",
                "amount": 1
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_so_ngo_dan_lan_dau_cam_nhan_dao",
        "pillId": "so_ngo_dan_lan_dau_cam_nhan_dao",
        "name": "Công thức Sơ Ngộ Đan - Lần đầu cảm nhận đạo",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "dao_canh_linh_thao",
                "amount": 1
            },
            {
                "id": "dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_nhap_dao_dan_chinh_thuc_buoc_vao_con_duong_dao",
        "pillId": "nhap_dao_dan_chinh_thuc_buoc_vao_con_duong_dao",
        "name": "Công thức Nhập Đạo Đan - Chính thức bước vào con đường đạo",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 5,
        "materials": [
            {
                "id": "dao_canh_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_so_cong_dan",
        "pillId": "so_cong_dan",
        "name": "Công thức Sơ Công Đan",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "dao_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_so_thu_dan",
        "pillId": "so_thu_dan",
        "name": "Công thức Sơ Thủ Đan",
        "world": "dao_gioi",
        "realm": "dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "dao_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_dai_dao_dan_hieu_thau_dai_dao",
        "pillId": "dai_dao_dan_hieu_thau_dai_dao",
        "name": "Công thức Đại Đạo Đan - Hiểu thấu đại đạo",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "dai_dao_canh_linh_thao",
                "amount": 1
            },
            {
                "id": "dai_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_hop_dai_dao_dan_hop_nhat_voi_dai_dao",
        "pillId": "hop_dai_dao_dan_hop_nhat_voi_dai_dao",
        "name": "Công thức Hợp Đại Đạo Đan - Hợp nhất với đại đạo",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 5,
        "materials": [
            {
                "id": "dai_dao_canh_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "dai_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_dai_cong_dan",
        "pillId": "dai_cong_dan",
        "name": "Công thức Đại Công Đan",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "dai_dao_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "dai_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_dai_thu_dan",
        "pillId": "dai_thu_dan",
        "name": "Công thức Đại Thủ Đan",
        "world": "dao_gioi",
        "realm": "dai_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "dai_dao_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "dai_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_dao_dan_tham_nhuan_thien_dao",
        "pillId": "thien_dao_dan_tham_nhuan_thien_dao",
        "name": "Công thức Thiên Đạo Đan - Thấm nhuần thiên đạo",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "thien_dao_canh_linh_thao",
                "amount": 1
            },
            {
                "id": "thien_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_chi_thien_dan_dat_den_thien_dao_vien_man",
        "pillId": "chi_thien_dan_dat_den_thien_dao_vien_man",
        "name": "Công thức Chí Thiên Đan - Đạt đến thiên đạo viên mãn",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 5,
        "materials": [
            {
                "id": "thien_dao_canh_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "thien_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_cong_dan_2",
        "pillId": "thien_cong_dan_2",
        "name": "Công thức Thiên Công Đan",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "thien_dao_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "thien_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_thien_thu_dan_2",
        "pillId": "thien_thu_dan_2",
        "name": "Công thức Thiên Thủ Đan",
        "world": "dao_gioi",
        "realm": "thien_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "thien_dao_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "thien_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_than_dao_dan_dao_hoa_thanh_than",
        "pillId": "than_dao_dan_dao_hoa_thanh_than",
        "name": "Công thức Thần Đạo Đan - Đạo hóa thành thần",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "than_dao_canh_linh_thao",
                "amount": 1
            },
            {
                "id": "than_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_hoa_than_dan_buoc_vao_coi_than",
        "pillId": "hoa_than_dan_buoc_vao_coi_than",
        "name": "Công thức Hóa Thần Đan - Bước vào cõi thần",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 5,
        "materials": [
            {
                "id": "than_dao_canh_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "than_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_than_cong_dan",
        "pillId": "than_cong_dan",
        "name": "Công thức Thần Công Đan",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "than_dao_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "than_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_than_thu_dan",
        "pillId": "than_thu_dan",
        "name": "Công thức Thần Thủ Đan",
        "world": "dao_gioi",
        "realm": "than_dao_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 4,
        "materials": [
            {
                "id": "than_dao_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "than_dao_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "dao_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_sieu_than_dan",
        "pillId": "sieu_than_dan",
        "name": "Công thức Siêu Thần Đan",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 5,
        "materials": [
            {
                "id": "sieu_than_canh_linh_thao",
                "amount": 1
            },
            {
                "id": "sieu_than_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "chung_cuc_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_cuc_than_dan",
        "pillId": "cuc_than_dan",
        "name": "Công thức Cực Thần Đan",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 6,
        "materials": [
            {
                "id": "sieu_than_canh_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "sieu_than_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "chung_cuc_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_sieu_cong_dan",
        "pillId": "sieu_cong_dan",
        "name": "Công thức Siêu Công Đan",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 5,
        "materials": [
            {
                "id": "sieu_than_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "sieu_than_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "chung_cuc_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_sieu_thu_dan",
        "pillId": "sieu_thu_dan",
        "name": "Công thức Siêu Thủ Đan",
        "world": "chung_cuc_gioi",
        "realm": "sieu_than_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 5,
        "materials": [
            {
                "id": "sieu_than_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "sieu_than_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "chung_cuc_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_bat_hu_dan",
        "pillId": "bat_hu_dan",
        "name": "Công thức Bất Hủ Đan",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "daoEntryMethod": null,
        "category": "cultivation",
        "requiredAlchemyRank": 5,
        "materials": [
            {
                "id": "bat_hu_canh_linh_thao",
                "amount": 1
            },
            {
                "id": "bat_hu_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "chung_cuc_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_bat_hu_chi_huyet",
        "pillId": "bat_hu_chi_huyet",
        "name": "Công thức Bất Hủ Chi Huyết",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "daoEntryMethod": null,
        "category": "breakthrough",
        "requiredAlchemyRank": 6,
        "materials": [
            {
                "id": "bat_hu_canh_pha_canh_qua",
                "amount": 2
            },
            {
                "id": "bat_hu_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "chung_cuc_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_bat_hu_cong",
        "pillId": "bat_hu_cong",
        "name": "Công thức Bất Hủ Công",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 5,
        "materials": [
            {
                "id": "bat_hu_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "bat_hu_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "chung_cuc_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_bat_hu_thu",
        "pillId": "bat_hu_thu",
        "name": "Công thức Bất Hủ Thủ",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "daoEntryMethod": null,
        "category": "attribute",
        "requiredAlchemyRank": 5,
        "materials": [
            {
                "id": "bat_hu_canh_nguyen_luc_chi",
                "amount": 1
            },
            {
                "id": "bat_hu_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "chung_cuc_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    },
    {
        "id": "recipe_bat_hu_than_dan_vien_thuoc_than_thoai_an_vao_se_khong_bao_gio_bi_tieu_diet_ke_ca_khi_vu_tru_sup_do_chi_1_vien_ton_tai",
        "pillId": "bat_hu_than_dan_vien_thuoc_than_thoai_an_vao_se_khong_bao_gio_bi_tieu_diet_ke_ca_khi_vu_tru_sup_do_chi_1_vien_ton_tai",
        "name": "Công thức Bất Hủ Thần Đan - Viên thuốc thần thoại, ăn vào sẽ không bao giờ bị tiêu diệt, kể cả khi vũ trụ sụp đổ. Chỉ 1 viên tồn tại",
        "world": "chung_cuc_gioi",
        "realm": "bat_hu_canh",
        "daoEntryMethod": null,
        "category": "special",
        "requiredAlchemyRank": 7,
        "materials": [
            {
                "id": "bat_hu_canh_than_thoai_qua",
                "amount": 3
            },
            {
                "id": "bat_hu_canh_phu_duoc",
                "amount": 1
            },
            {
                "id": "chung_cuc_gioi_linh_tuy",
                "amount": 2
            }
        ],
        "resultAmount": 1
    }
];

module.exports = PILL_RECIPES;
