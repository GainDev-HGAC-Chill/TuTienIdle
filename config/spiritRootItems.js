// ============================================
//  CONFIG - SPIRIT ROOT ITEMS
//  Item ngộ/nâng cấp linh căn
// ============================================

const SPIRIT_ROOT_ITEMS = {
    items: [
        {
            id: 'ngo_linh_can_dan',
            name: 'Ngộ Linh Căn Đan',
            type: 'awakening',
            targetEvolution: 'normal',
            requiredWorld: 'nhan_gioi',
            randomElement: true,
            description: 'Dùng để ngộ ra một loại linh căn cơ sở tại Nhân Giới.',
        },
        {
            id: 'di_thuoc_tinh_ngoc',
            name: 'Dị Thuộc Tính Ngọc',
            type: 'mutation',
            targetEvolution: 'mutated',
            requiredWorld: 'tien_gioi',
            randomElement: false,
            description: 'Dùng để nâng linh căn hiện có thành Dị Linh Căn tại Tiên Giới.',
        },
        {
            id: 'vinh_hang_can_nguyen',
            name: 'Vĩnh Hằng Căn Nguyên',
            type: 'eternal',
            targetEvolution: 'eternal',
            requiredWorld: 'nguyen_gioi',
            randomElement: false,
            description: 'Dùng để nâng Dị Linh Căn thành Vĩnh Hằng Linh Căn tại Nguyên Giới.',
        },
        {
            id: 'dao_van_linh_chau',
            name: 'Đạo Văn Linh Châu',
            type: 'dao',
            targetEvolution: 'dao',
            requiredWorld: 'dao_gioi',
            randomElement: false,
            description: 'Dùng để nâng Vĩnh Hằng Linh Căn thành Đạo Linh Căn tại Đạo Giới.',
        },
        {
            id: 'bat_hu_linh_nguyen',
            name: 'Bất Hủ Linh Nguyên',
            type: 'immortal',
            targetEvolution: 'immortal',
            requiredWorld: 'chung_cuc_gioi',
            requiredRealmId: 'bat_hu_canh',
            randomElement: false,
            description: 'Dùng để nâng Đạo Linh Căn thành Bất Hủ Linh Căn tại Bất Hủ Cảnh.',
        },
    ],
};

module.exports = SPIRIT_ROOT_ITEMS;
