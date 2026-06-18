// ============================================
//  CONFIG - SPIRIT ROOT EVOLUTION
//  Tiến hóa linh căn theo thế giới/cảnh giới
// ============================================

const SPIRIT_ROOT_EVOLUTION = {
    levels: [
        {
            id: 'normal',
            name: 'Linh Căn',
            suffix: 'Linh Căn',
            order: 1,
            unlockWorld: 'nhan_gioi',
            itemType: 'awakening',
            note: 'Nhân Giới chỉ có thể ngộ linh căn cơ sở.',
        },
        {
            id: 'mutated',
            name: 'Dị Linh Căn',
            suffix: 'Dị Linh Căn',
            order: 2,
            unlockWorld: 'tien_gioi',
            itemType: 'mutation',
            note: 'Tiên Giới mới có thể thức tỉnh dị linh căn.',
        },
        {
            id: 'eternal',
            name: 'Vĩnh Hằng Linh Căn',
            suffix: 'Vĩnh Hằng Linh Căn',
            order: 3,
            unlockWorld: 'nguyen_gioi',
            itemType: 'eternal',
            note: 'Nguyên Giới mới có thể nâng thành vĩnh hằng linh căn.',
        },
        {
            id: 'dao',
            name: 'Đạo Linh Căn',
            suffix: 'Đạo Linh Căn',
            order: 4,
            unlockWorld: 'dao_gioi',
            itemType: 'dao',
            note: 'Đạo Giới mới có thể ngộ đạo thuộc tính.',
        },
        {
            id: 'immortal',
            name: 'Bất Hủ Linh Căn',
            suffix: 'Bất Hủ Linh Căn',
            order: 5,
            unlockWorld: 'chung_cuc_gioi',
            unlockRealmId: 'bat_hu_canh',
            itemType: 'immortal',
            note: 'Bất Hủ Cảnh mới có thể nâng thành bất hủ thuộc tính.',
        },
    ],

    itemTypes: [
        { id: 'awakening', name: 'Ngộ Linh Căn', world: 'nhan_gioi' },
        { id: 'mutation', name: 'Dị Thuộc Tính', world: 'tien_gioi' },
        { id: 'eternal', name: 'Vĩnh Hằng Thuộc Tính', world: 'nguyen_gioi' },
        { id: 'dao', name: 'Đạo Thuộc Tính', world: 'dao_gioi' },
        { id: 'immortal', name: 'Bất Hủ Thuộc Tính', world: 'chung_cuc_gioi' },
    ],
};

module.exports = SPIRIT_ROOT_EVOLUTION;
