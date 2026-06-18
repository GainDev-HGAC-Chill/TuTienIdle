// ============================================
//  CONFIG - PILL RULES
//  Quy tắc dùng đan dược
// ============================================

const PILL_RULES = {
    categories: {
        cultivation: { name: 'Đan Tu Luyện', durationSeconds: 30 * 60, stackable: false },
        attribute: { name: 'Đan Thuộc Tính', durationSeconds: 30 * 60, stackable: false },
        defensive: { name: 'Đan Phòng Thủ', durationSeconds: 60, stackable: false },
        offensive: { name: 'Đan Sát Thương', durationSeconds: 0, instant: true },
        breakthrough: { name: 'Đan Đột Phá', durationSeconds: 0, instant: true, useLock: true },
        special: { name: 'Đan Đặc Biệt', durationSeconds: 0, instant: true },
    },

    breakthrough: {
        // Một lần đột phá chỉ được dùng 1 viên đan đột phá.
        // Thành công: clear lock do đã sang cảnh giới mới.
        // Thất bại: clear lock để lần sau được dùng lại.
        onePillPerAttempt: true,
    },
};

module.exports = PILL_RULES;
