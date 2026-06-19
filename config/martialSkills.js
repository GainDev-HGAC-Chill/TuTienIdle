// ============================================
//  CONFIG - MARTIAL SKILLS
//  Vũ kỹ: có thể thăng cấp theo cảnh giới
// ============================================

const phases = require('./progressionPhases');

const MARTIAL_SKILL_CONFIG = {
  id: 'martial_skill',
  name: 'Vũ Kỹ',
  phases,

  upgradeMode: {
    FOLLOW_REALM: 'follow_realm',
    FIXED_MAX_RANK: 'fixed_max_rank',
  },

  list: [
    {
      id: 'co_ban_kiem_quyet',
      name: 'Cơ Bản Kiếm Quyết',
      grade: 'basic',
      system: 'cultivation',
      type: 'attack',
      maxRankMode: 'follow_realm',
      startRank: 1,
      startPhase: 1,
      effects: {
        atkBonus: 0.03,
        damageMultiplier: 1.15,
      },
      description: 'Vũ kỹ tu luyện nhập môn, lấy linh khí ngự kiếm gây sát thương ổn định.',
    },
    {
      id: 'man_nguu_quyen',
      name: 'Man Ngưu Quyền',
      grade: 'basic',
      system: 'body',
      type: 'attack',
      maxRankMode: 'follow_realm',
      startRank: 1,
      startPhase: 1,
      effects: {
        damageMultiplier: 1.1,
        defDamageRatio: 0.2,
      },
      description: 'Vũ kỹ luyện thể nhập môn, lấy khí huyết và thân thể cường công.',
    },
    {
      id: 'kinh_than_thu',
      name: 'Kinh Thần Thứ',
      grade: 'basic',
      system: 'soul',
      type: 'soul_attack',
      maxRankMode: 'follow_realm',
      startRank: 1,
      startPhase: 1,
      effects: {
        damageMultiplier: 1.05,
        critBonus: 0.03,
      },
      description: 'Vũ kỹ luyện hồn nhập môn, ngưng thần thức thành mũi nhọn công kích thức hải.',
    },
  ],
};

module.exports = MARTIAL_SKILL_CONFIG;