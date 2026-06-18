// ============================================
//  CONFIG - SPIRIT ROOT ELEMENTS
//  Hệ thuộc tính linh căn + tương sinh tương khắc
// ============================================

const SPIRIT_ROOT_ELEMENTS = {
    groups: [
        {
            id: 'ngu_hanh',
            name: 'Ngũ Hành',
            tier: 1,
            elements: ['kim', 'moc', 'thuy', 'hoa', 'tho'],
        },
        {
            id: 'quang_am',
            name: 'Quang - Ám',
            tier: 2,
            elements: ['quang', 'am'],
        },
        {
            id: 'bien_di_tu_nhien',
            name: 'Dị Thuộc Tính Tự Nhiên',
            tier: 2,
            elements: ['loi', 'phong', 'bang', 'doc'],
        },
        {
            id: 'thuong_vi',
            name: 'Thượng Vị Thuộc Tính',
            tier: 3,
            elements: ['long', 'phat', 'ma'],
        },
        {
            id: 'chi_cao',
            name: 'Chí Cao Thuộc Tính',
            tier: 4,
            elements: ['thoi_gian', 'khong_gian'],
        },
        {
            id: 'toi_thuong',
            name: 'Tối Thượng Thuộc Tính',
            tier: 5,
            elements: ['tu_vong', 'sinh_menh'],
        },
    ],

    elements: [
        // Ngũ hành
        { id: 'kim', name: 'Kim', group: 'ngu_hanh', rarityWeight: 140, tags: ['metal', 'sharp', 'break'] },
        { id: 'moc', name: 'Mộc', group: 'ngu_hanh', rarityWeight: 140, tags: ['wood', 'life', 'growth'] },
        { id: 'thuy', name: 'Thủy', group: 'ngu_hanh', rarityWeight: 140, tags: ['water', 'soft', 'flow'] },
        { id: 'hoa', name: 'Hỏa', group: 'ngu_hanh', rarityWeight: 140, tags: ['fire', 'burn', 'burst'] },
        { id: 'tho', name: 'Thổ', group: 'ngu_hanh', rarityWeight: 140, tags: ['earth', 'defense', 'suppress'] },

        // Quang - Ám
        { id: 'quang', name: 'Quang', group: 'quang_am', rarityWeight: 45, tags: ['light', 'heal', 'purify'] },
        { id: 'am', name: 'Ám', group: 'quang_am', rarityWeight: 45, tags: ['dark', 'hide', 'devour'] },

        // Lôi - Phong - Băng - Độc
        { id: 'loi', name: 'Lôi', group: 'bien_di_tu_nhien', rarityWeight: 25, tags: ['thunder', 'paralyze', 'armor_break'] },
        { id: 'phong', name: 'Phong', group: 'bien_di_tu_nhien', rarityWeight: 25, tags: ['wind', 'speed', 'evasion'] },
        { id: 'bang', name: 'Băng', group: 'bien_di_tu_nhien', rarityWeight: 25, tags: ['ice', 'freeze', 'slow'] },
        { id: 'doc', name: 'Độc', group: 'bien_di_tu_nhien', rarityWeight: 25, tags: ['poison', 'dot', 'mind_disrupt'] },

        // Long - Phật - Ma
        { id: 'long', name: 'Long', group: 'thuong_vi', rarityWeight: 10, tags: ['dragon', 'dominate', 'bloodline'] },
        { id: 'phat', name: 'Phật', group: 'thuong_vi', rarityWeight: 10, tags: ['buddha', 'purify', 'willpower'] },
        { id: 'ma', name: 'Ma', group: 'thuong_vi', rarityWeight: 10, tags: ['demon', 'blood', 'devour'] },

        // Thời gian - Không gian
        { id: 'thoi_gian', name: 'Thời Gian', group: 'chi_cao', rarityWeight: 2, tags: ['time', 'haste', 'slow', 'rebirth'] },
        { id: 'khong_gian', name: 'Không Gian', group: 'chi_cao', rarityWeight: 2, tags: ['space', 'teleport', 'pierce'] },

        // Tử Vong - Sinh Mệnh
        { id: 'tu_vong', name: 'Tử Vong', group: 'toi_thuong', rarityWeight: 1, tags: ['death', 'soul', 'decay'] },
        { id: 'sinh_menh', name: 'Sinh Mệnh', group: 'toi_thuong', rarityWeight: 1, tags: ['life', 'heal', 'revive'] },
    ],

    // Tương sinh: dùng cho bonus tu luyện/công pháp cùng nhánh.
    generates: [
        { from: 'kim', to: 'thuy', bonus: 0.20, note: 'Kim sinh Thủy.' },
        { from: 'thuy', to: 'moc', bonus: 0.20, note: 'Thủy sinh Mộc.' },
        { from: 'moc', to: 'hoa', bonus: 0.20, note: 'Mộc sinh Hỏa.' },
        { from: 'hoa', to: 'tho', bonus: 0.20, note: 'Hỏa sinh Thổ.' },
        { from: 'tho', to: 'kim', bonus: 0.20, note: 'Thổ sinh Kim.' },

        { from: 'quang', to: 'sinh_menh', bonus: 0.15, note: 'Quang trợ Sinh Mệnh.' },
        { from: 'am', to: 'tu_vong', bonus: 0.15, note: 'Ám trợ Tử Vong.' },
        { from: 'long', to: 'kim', bonus: 0.10, note: 'Long khí trợ Kim.' },
        { from: 'long', to: 'hoa', bonus: 0.10, note: 'Long khí trợ Hỏa.' },
        { from: 'phat', to: 'quang', bonus: 0.15, note: 'Phật pháp trợ Quang.' },
        { from: 'ma', to: 'am', bonus: 0.15, note: 'Ma khí trợ Ám.' },
    ],

    // Tương khắc: dùng cho damage bonus/debuff khắc hệ.
    counters: [
        { from: 'kim', to: 'moc', bonus: 0.30, penalty: 0.20, note: 'Kim khắc Mộc.' },
        { from: 'moc', to: 'tho', bonus: 0.30, penalty: 0.20, note: 'Mộc khắc Thổ.' },
        { from: 'tho', to: 'thuy', bonus: 0.30, penalty: 0.20, note: 'Thổ khắc Thủy.' },
        { from: 'thuy', to: 'hoa', bonus: 0.30, penalty: 0.20, note: 'Thủy khắc Hỏa.' },
        { from: 'hoa', to: 'kim', bonus: 0.30, penalty: 0.20, note: 'Hỏa khắc Kim.' },

        { from: 'quang', to: 'am', bonus: 0.50, penalty: 0.25, note: 'Quang và Ám đối lập.' },
        { from: 'am', to: 'quang', bonus: 0.50, penalty: 0.25, note: 'Ám và Quang đối lập.' },

        { from: 'loi', to: 'phong', bonus: 0.25, penalty: 0.15, note: 'Lôi phá Phong.' },
        { from: 'phong', to: 'doc', bonus: 0.25, penalty: 0.15, note: 'Phong tán Độc.' },
        { from: 'bang', to: 'hoa', bonus: 0.25, penalty: 0.15, note: 'Băng áp Hỏa.' },
        { from: 'doc', to: 'sinh_menh', bonus: 0.35, penalty: 0.20, note: 'Độc tổn Sinh Mệnh.' },
        { from: 'tho', to: 'loi', bonus: 0.20, penalty: 0.10, note: 'Thổ dẫn và hóa giải Lôi.' },
        { from: 'loi', to: 'bang', bonus: 0.20, penalty: 0.10, note: 'Lôi phá Băng.' },

        { from: 'long', to: 'ngu_hanh', bonus: 0.20, penalty: 0.10, targetType: 'group', note: 'Long áp chế Ngũ Hành.' },
        { from: 'phat', to: 'ma', bonus: 0.40, penalty: 0.20, note: 'Phật khắc Ma.' },
        { from: 'phat', to: 'doc', bonus: 0.30, penalty: 0.15, note: 'Phật quang thanh độc.' },
        { from: 'phat', to: 'tu_vong', bonus: 0.35, penalty: 0.20, note: 'Phật pháp độ tử khí.' },
        { from: 'ma', to: 'phat', bonus: 0.25, penalty: 0.15, note: 'Ma cưỡng phá Phật tâm, nhưng bất ổn.' },
        { from: 'ma', to: 'sinh_menh', bonus: 0.30, penalty: 0.15, note: 'Ma khí ăn mòn sinh cơ.' },

        { from: 'khong_gian', to: 'phong', bonus: 0.25, penalty: 0.10, note: 'Không Gian trấn Phong.' },
        { from: 'thoi_gian', to: 'khong_gian', bonus: 0.25, penalty: 0.10, note: 'Thời Gian khóa Không Gian.' },

        { from: 'sinh_menh', to: 'tu_vong', bonus: 0.50, penalty: 0.25, note: 'Sinh Mệnh đối kháng Tử Vong.' },
        { from: 'tu_vong', to: 'sinh_menh', bonus: 0.50, penalty: 0.25, note: 'Tử Vong đối kháng Sinh Mệnh.' },
    ],
};

module.exports = SPIRIT_ROOT_ELEMENTS;
