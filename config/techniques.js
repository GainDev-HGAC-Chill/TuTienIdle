// ============================================
// CONFIG - TECHNIQUES
// Công pháp cơ bản theo 3 hệ: Tu Luyện / Luyện Thể / Luyện Hồn
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
      system: 'cultivation',
      type: 'cultivation',
      maxRankMode: 'follow_realm',
      startRank: 1,
      startPhase: 1,
      effects: {
        cultivationSpeedBonus: 0.05,
        auraBonus: 0.05,
        tuViBonus: 0.05,
      },
      description: 'Công pháp tu luyện nhập môn, dẫn linh khí nhập thể, tăng nhẹ tốc độ tu vi.',
    },
    {
      id: 'man_nguu_luyen_the_quyet',
      name: 'Man Ngưu Luyện Thể Quyết',
      grade: 'basic',
      system: 'body',
      type: 'body',
      maxRankMode: 'follow_realm',
      startRank: 1,
      startPhase: 1,
      effects: {
        hpBonus: 0.08,
        defBonus: 0.04,
        bodyExpBonus: 0.05,
      },
      description: 'Công pháp luyện thể nhập môn, rèn da thịt gân cốt, tăng sinh mệnh và phòng ngự.',
    },
    {
      id: 'duong_than_quyet',
      name: 'Dưỡng Thần Quyết',
      grade: 'basic',
      system: 'soul',
      type: 'soul',
      maxRankMode: 'follow_realm',
      startRank: 1,
      startPhase: 1,
      effects: {
        soulPowerBonus: 0.06,
        soulExpBonus: 0.05,
        critBonus: 0.02,
      },
      description: 'Công pháp luyện hồn nhập môn, dưỡng thần thức, tăng hồn lực và một chút bạo kích.',
    },
  ],
};

module.exports = TECHNIQUE_CONFIG;
