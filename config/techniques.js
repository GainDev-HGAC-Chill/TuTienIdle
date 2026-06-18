// ============================================
//  CONFIG - TECHNIQUES
//  Công pháp: có thể thăng cấp theo cảnh giới
// ============================================

const phases = require('./progressionPhases');

const TECHNIQUE_CONFIG = {
    id: 'technique',
    name: 'Công Pháp',
    phases,

    upgradeMode: {
        FOLLOW_REALM: 'follow_realm',
        FIXED_MAX_RANK: 'fixed_max_rank',
    },

    list: [
        {
            id: 'tho_nap_quyet',
            name: 'Thổ Nạp Quyết',
            grade: 'basic',
            type: 'cultivation',
            maxRankMode: 'follow_realm',
            startRank: 1,
            startPhase: 1,
            effects: {
                // Chưa chốt chỉ số, để trống để sau này bạn điền.
                auraBonus: 0,
                tuViBonus: 0,
            },
            description: 'Công pháp nhập môn, dùng làm mặc định khi tạo nhân vật.',
        },
    ],
};

module.exports = TECHNIQUE_CONFIG;
