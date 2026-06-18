// ============================================
//  CONFIG - CURRENCIES
//  Tiền tệ theo từng thế giới
// ============================================

const CURRENCY_CONFIG = {
    grades: [
        { id: 'so', name: 'Sơ Cấp', order: 1 },
        { id: 'trung', name: 'Trung Cấp', order: 2 },
        { id: 'thuong', name: 'Thượng Cấp', order: 3 },
    ],

    groups: [
        {
            id: 'linh_thach',
            world: 'nhan_gioi',
            name: 'Linh Thạch',
            currencies: [
                { id: 'so_linh_thach', name: 'Sơ Cấp Linh Thạch', grade: 'so' },
                { id: 'trung_linh_thach', name: 'Trung Cấp Linh Thạch', grade: 'trung' },
                { id: 'thuong_linh_thach', name: 'Thượng Cấp Linh Thạch', grade: 'thuong' },
            ],
        },
        {
            id: 'tien_thach',
            world: 'tien_gioi',
            name: 'Tiên Thạch',
            currencies: [
                { id: 'so_tien_thach', name: 'Sơ Cấp Tiên Thạch', grade: 'so' },
                { id: 'trung_tien_thach', name: 'Trung Cấp Tiên Thạch', grade: 'trung' },
                { id: 'thuong_tien_thach', name: 'Thượng Cấp Tiên Thạch', grade: 'thuong' },
            ],
        },
        {
            id: 'nguyen_thach',
            world: 'nguyen_gioi',
            name: 'Nguyên Thạch',
            currencies: [
                { id: 'so_nguyen_thach', name: 'Sơ Cấp Nguyên Thạch', grade: 'so' },
                { id: 'trung_nguyen_thach', name: 'Trung Cấp Nguyên Thạch', grade: 'trung' },
                { id: 'thuong_nguyen_thach', name: 'Thượng Cấp Nguyên Thạch', grade: 'thuong' },
            ],
        },
        {
            id: 'dao_thach',
            world: 'dao_gioi',
            name: 'Đạo Thạch',
            currencies: [
                { id: 'so_dao_thach', name: 'Sơ Cấp Đạo Thạch', grade: 'so' },
                { id: 'trung_dao_thach', name: 'Trung Cấp Đạo Thạch', grade: 'trung' },
                { id: 'thuong_dao_thach', name: 'Thượng Cấp Đạo Thạch', grade: 'thuong' },
            ],
        },
        {
            id: 'chung_cuc_thach',
            world: 'chung_cuc_gioi',
            name: 'Chung Cực Thạch',
            currencies: [
                { id: 'so_chung_cuc_thach', name: 'Sơ Cấp Chung Cực Thạch', grade: 'so' },
                { id: 'trung_chung_cuc_thach', name: 'Trung Cấp Chung Cực Thạch', grade: 'trung' },
                { id: 'thuong_chung_cuc_thach', name: 'Thượng Cấp Chung Cực Thạch', grade: 'thuong' },
            ],
        },
    ],
};

module.exports = CURRENCY_CONFIG;
