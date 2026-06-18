// ============================================
//  CONFIG - REALMS / WORLDS / PLANES
//  Hệ thống cảnh giới Tu Tiên Idle
// ============================================

const REALM_CONFIG = {
    worlds: [
        {
            id: 'nhan_gioi',
            name: 'Nhân Giới',
            order: 1,
            currencyGroup: 'linh_thach',
            realms: [
                { id: 'luyen_khi', name: 'Luyện Khí', stages: 9 },
                { id: 'truc_co', name: 'Trúc Cơ', stages: 9 },
                { id: 'kim_dan', name: 'Kim Đan', stages: 9 },
                { id: 'nguyen_anh', name: 'Nguyên Anh', stages: 9 },
                { id: 'hoa_than', name: 'Hóa Thần', stages: 9 },
                { id: 'luyen_hu', name: 'Luyện Hư', stages: 9 },
                { id: 'hop_the', name: 'Hợp Thể', stages: 9 },
                { id: 'do_kiep', name: 'Độ Kiếp', stages: 9 },
            ],
        },

        {
            id: 'tien_gioi',
            name: 'Tiên Giới',
            order: 2,
            currencyGroup: 'tien_thach',
            realms: [
                { id: 'ban_tien', name: 'Bán Tiên', stages: 9 },
                { id: 'chan_tien', name: 'Chân Tiên', stages: 9 },
                { id: 'cuc_tien', name: 'Cực Tiên', stages: 9 },
                { id: 'at_tien', name: 'Ất Tiên', stages: 9 },
                { id: 'ngoc_tien', name: 'Ngọc Tiên', stages: 9 },
                { id: 'tien_vuong', name: 'Tiên Vương', stages: 9 },
                { id: 'tien_ton', name: 'Tiên Tôn', stages: 9 },
                { id: 'tien_de', name: 'Tiên Đế', stages: 9 },
            ],
        },

        {
            id: 'nguyen_gioi',
            name: 'Nguyên Giới',
            order: 3,
            currencyGroup: 'nguyen_thach',
            realms: [
                { id: 'nhap_thanh', name: 'Nhập Thánh', stages: 9 },
                { id: 'thanh_gia', name: 'Thánh Giả', stages: 9 },
                { id: 'tieu_thanh', name: 'Tiểu Thánh', stages: 9 },
                { id: 'dai_thanh', name: 'Đại Thánh', stages: 9 },
                { id: 'thanh_tuong', name: 'Thánh Tướng', stages: 9 },
                { id: 'thanh_vuong', name: 'Thánh Vương', stages: 9 },
                { id: 'thanh_ton', name: 'Thánh Tôn', stages: 9 },
                { id: 'thanh_hoang', name: 'Thánh Hoàng', stages: 9 },
                { id: 'thanh_de', name: 'Thánh Đế', stages: 9 },
                { id: 'chi_ton', name: 'Chí Tôn', stages: 9 },
            ],
            daoEntry: {
                id: 'nhap_dao',
                name: 'Nhập Đạo',
                description: 'Điều kiện đặc biệt để rời Nguyên Giới và tiến vào Đạo Giới.',
                levels: [
                    {
                        id: 'thuan_theo_thien_dao',
                        name: 'Thuận Theo Thiên Đạo',
                        difficultyMultiplier: 1,
                        selectable: true,
                    },
                    {
                        id: 'nuong_nho_thien_dao',
                        name: 'Nương Nhờ Thiên Đạo',
                        difficultyMultiplier: 10,
                        selectable: true,
                    },
                    {
                        id: 'doi_nghich_thien_dao',
                        name: 'Đối Nghịch Thiên Đạo',
                        difficultyMultiplier: 100,
                        selectable: true,
                    },
                    {
                        id: 'sieu_thoat_thien_dao',
                        name: 'Siêu Thoát Thiên Đạo',
                        difficultyMultiplier: 1000,
                        selectable: true,
                    },
                    {
                        id: 'thong_tri_thien_dao',
                        name: 'Thống Trị Thiên Đạo',
                        difficultyMultiplier: 10000,
                        selectable: false,
                        specialRequirement: 'Cần phương án đặc biệt, không cho chọn trực tiếp.',
                    },
                ],
            },
        },

        {
            id: 'dao_gioi',
            name: 'Đạo Giới',
            order: 4,
            currencyGroup: 'dao_thach',
            realms: [
                { id: 'dao_canh', name: 'Đạo Cảnh', stages: 9 },
                { id: 'dai_dao_canh', name: 'Đại Đạo Cảnh', stages: 9 },
                { id: 'thien_dao_canh', name: 'Thiên Đạo Cảnh', stages: 9 },
                { id: 'than_dao_canh', name: 'Thần Đạo Cảnh', stages: 9 },
            ],
        },

        {
            id: 'chung_cuc_gioi',
            name: 'Chung Cực Giới',
            order: 5,
            currencyGroup: 'chung_cuc_thach',
            realms: [
                {
                    id: 'sieu_than_canh',
                    name: 'Siêu Thần Cảnh',
                    stages: 3000,
                    stageName: 'Siêu Thần Kỳ',
                    note: 'Giới hạn 3000 Siêu Thần Kỳ.',
                },
                {
                    id: 'bat_hu_canh',
                    name: 'Bất Hủ Cảnh',
                    stages: 9,
                    requiredItem: 'bat_hu_than_vat',
                    note: 'Yêu cầu Bất Hủ Thần Vật để đột phá.',
                },
            ],
        },
    ],
};

module.exports = REALM_CONFIG;
