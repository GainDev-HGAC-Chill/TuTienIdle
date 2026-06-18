// ============================================
//  CONFIG - SOUL REALMS
//  Hệ thống Luyện Hồn
// ============================================

const phases = require('./progressionPhases');

const SOUL_REALMS = {
    id: 'soul',
    name: 'Luyện Hồn',
    phases,

    ranks: [
        // Nhân Giới
        { rank: 1, world: 'nhan_gioi', realmId: 'luyen_khi', name: 'Luyện Khí Hồn' },
        { rank: 2, world: 'nhan_gioi', realmId: 'truc_co', name: 'Trúc Cơ Hồn' },
        { rank: 3, world: 'nhan_gioi', realmId: 'kim_dan', name: 'Kim Đan Hồn' },
        { rank: 4, world: 'nhan_gioi', realmId: 'nguyen_anh', name: 'Nguyên Anh Hồn' },
        { rank: 5, world: 'nhan_gioi', realmId: 'hoa_than', name: 'Hóa Thần Hồn' },
        { rank: 6, world: 'nhan_gioi', realmId: 'luyen_hu', name: 'Luyện Hư Hồn' },
        { rank: 7, world: 'nhan_gioi', realmId: 'hop_the', name: 'Hợp Thể Hồn' },
        { rank: 8, world: 'nhan_gioi', realmId: 'do_kiep', name: 'Độ Kiếp Hồn' },

        // Tiên Giới
        { rank: 9, world: 'tien_gioi', realmId: 'ban_tien', name: 'Bán Tiên Hồn' },
        { rank: 10, world: 'tien_gioi', realmId: 'chan_tien', name: 'Chân Tiên Hồn' },
        { rank: 11, world: 'tien_gioi', realmId: 'cuc_tien', name: 'Cực Tiên Hồn' },
        { rank: 12, world: 'tien_gioi', realmId: 'at_tien', name: 'Ất Tiên Hồn' },
        { rank: 13, world: 'tien_gioi', realmId: 'ngoc_tien', name: 'Ngọc Tiên Hồn' },
        { rank: 14, world: 'tien_gioi', realmId: 'tien_vuong', name: 'Tiên Vương Hồn' },
        { rank: 15, world: 'tien_gioi', realmId: 'tien_ton', name: 'Tiên Tôn Hồn' },
        { rank: 16, world: 'tien_gioi', realmId: 'tien_de', name: 'Tiên Đế Hồn' },

        // Nguyên Giới
        { rank: 17, world: 'nguyen_gioi', realmId: 'nhap_thanh', name: 'Nhập Thánh Hồn' },
        { rank: 18, world: 'nguyen_gioi', realmId: 'thanh_gia', name: 'Thánh Giả Hồn' },
        { rank: 19, world: 'nguyen_gioi', realmId: 'tieu_thanh', name: 'Tiểu Thánh Hồn' },
        { rank: 20, world: 'nguyen_gioi', realmId: 'dai_thanh', name: 'Đại Thánh Hồn' },
        { rank: 21, world: 'nguyen_gioi', realmId: 'thanh_tuong', name: 'Thánh Tướng Hồn' },
        { rank: 22, world: 'nguyen_gioi', realmId: 'thanh_vuong', name: 'Thánh Vương Hồn' },
        { rank: 23, world: 'nguyen_gioi', realmId: 'thanh_ton', name: 'Thánh Tôn Hồn' },
        { rank: 24, world: 'nguyen_gioi', realmId: 'thanh_hoang', name: 'Thánh Hoàng Hồn' },
        { rank: 25, world: 'nguyen_gioi', realmId: 'thanh_de', name: 'Thánh Đế Hồn' },
        { rank: 26, world: 'nguyen_gioi', realmId: 'chi_ton', name: 'Chí Tôn Hồn' },

        // Đạo Giới
        { rank: 27, world: 'dao_gioi', realmId: 'dao_canh', name: 'Đạo Hồn' },
        { rank: 28, world: 'dao_gioi', realmId: 'dai_dao_canh', name: 'Đại Đạo Hồn' },
        { rank: 29, world: 'dao_gioi', realmId: 'thien_dao_canh', name: 'Thiên Đạo Hồn' },
        { rank: 30, world: 'dao_gioi', realmId: 'than_dao_canh', name: 'Thần Đạo Hồn' },

        // Chung Cực Giới
        { rank: 31, world: 'chung_cuc_gioi', realmId: 'sieu_than_canh', name: 'Siêu Thần Hồn' },
        { rank: 32, world: 'chung_cuc_gioi', realmId: 'bat_hu_canh', name: 'Bất Hủ Hồn' },
    ],
};

module.exports = SOUL_REALMS;
