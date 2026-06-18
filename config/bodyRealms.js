// ============================================
//  CONFIG - BODY REALMS
//  Hệ thống Luyện Thể
// ============================================

const phases = require('./progressionPhases');

const BODY_REALMS = {
    id: 'body',
    name: 'Luyện Thể',
    phases,

    // rank chạy liên tục theo cảnh giới chính:
    // Nhân Giới: 1 -> 8
    // Tiên Giới: 9 -> 16
    // Nguyên Giới: 17 -> 26
    // Đạo Giới: 27 -> 30
    // Chung Cực Giới: 31 -> 32
    ranks: [
        // Nhân Giới
        { rank: 1, world: 'nhan_gioi', realmId: 'luyen_khi', name: 'Luyện Khí Thể' },
        { rank: 2, world: 'nhan_gioi', realmId: 'truc_co', name: 'Trúc Cơ Thể' },
        { rank: 3, world: 'nhan_gioi', realmId: 'kim_dan', name: 'Kim Đan Thể' },
        { rank: 4, world: 'nhan_gioi', realmId: 'nguyen_anh', name: 'Nguyên Anh Thể' },
        { rank: 5, world: 'nhan_gioi', realmId: 'hoa_than', name: 'Hóa Thần Thể' },
        { rank: 6, world: 'nhan_gioi', realmId: 'luyen_hu', name: 'Luyện Hư Thể' },
        { rank: 7, world: 'nhan_gioi', realmId: 'hop_the', name: 'Hợp Thể Thể' },
        { rank: 8, world: 'nhan_gioi', realmId: 'do_kiep', name: 'Độ Kiếp Thể' },

        // Tiên Giới
        { rank: 9, world: 'tien_gioi', realmId: 'ban_tien', name: 'Bán Tiên Thể' },
        { rank: 10, world: 'tien_gioi', realmId: 'chan_tien', name: 'Chân Tiên Thể' },
        { rank: 11, world: 'tien_gioi', realmId: 'cuc_tien', name: 'Cực Tiên Thể' },
        { rank: 12, world: 'tien_gioi', realmId: 'at_tien', name: 'Ất Tiên Thể' },
        { rank: 13, world: 'tien_gioi', realmId: 'ngoc_tien', name: 'Ngọc Tiên Thể' },
        { rank: 14, world: 'tien_gioi', realmId: 'tien_vuong', name: 'Tiên Vương Thể' },
        { rank: 15, world: 'tien_gioi', realmId: 'tien_ton', name: 'Tiên Tôn Thể' },
        { rank: 16, world: 'tien_gioi', realmId: 'tien_de', name: 'Tiên Đế Thể' },

        // Nguyên Giới
        { rank: 17, world: 'nguyen_gioi', realmId: 'nhap_thanh', name: 'Nhập Thánh Thể' },
        { rank: 18, world: 'nguyen_gioi', realmId: 'thanh_gia', name: 'Thánh Giả Thể' },
        { rank: 19, world: 'nguyen_gioi', realmId: 'tieu_thanh', name: 'Tiểu Thánh Thể' },
        { rank: 20, world: 'nguyen_gioi', realmId: 'dai_thanh', name: 'Đại Thánh Thể' },
        { rank: 21, world: 'nguyen_gioi', realmId: 'thanh_tuong', name: 'Thánh Tướng Thể' },
        { rank: 22, world: 'nguyen_gioi', realmId: 'thanh_vuong', name: 'Thánh Vương Thể' },
        { rank: 23, world: 'nguyen_gioi', realmId: 'thanh_ton', name: 'Thánh Tôn Thể' },
        { rank: 24, world: 'nguyen_gioi', realmId: 'thanh_hoang', name: 'Thánh Hoàng Thể' },
        { rank: 25, world: 'nguyen_gioi', realmId: 'thanh_de', name: 'Thánh Đế Thể' },
        { rank: 26, world: 'nguyen_gioi', realmId: 'chi_ton', name: 'Chí Tôn Thể' },

        // Đạo Giới
        { rank: 27, world: 'dao_gioi', realmId: 'dao_canh', name: 'Đạo Thể' },
        { rank: 28, world: 'dao_gioi', realmId: 'dai_dao_canh', name: 'Đại Đạo Thể' },
        { rank: 29, world: 'dao_gioi', realmId: 'thien_dao_canh', name: 'Thiên Đạo Thể' },
        { rank: 30, world: 'dao_gioi', realmId: 'than_dao_canh', name: 'Thần Đạo Thể' },

        // Chung Cực Giới
        { rank: 31, world: 'chung_cuc_gioi', realmId: 'sieu_than_canh', name: 'Siêu Thần Thể' },
        { rank: 32, world: 'chung_cuc_gioi', realmId: 'bat_hu_canh', name: 'Bất Hủ Thể' },
    ],
};

module.exports = BODY_REALMS;
