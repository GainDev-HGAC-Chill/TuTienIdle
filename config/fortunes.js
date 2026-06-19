/**
 * KỲ NGỘ NHÂN GIỚI
 * ------------------------------------------------------------
 * File này chỉ chứa dữ liệu kỳ ngộ.
 * Muốn thêm kỳ ngộ mới: copy 1 object trong FORTUNES rồi đổi id/name/choices/outcomes.
 *
 * Thiết kế hiện tại:
 * - 36 kỳ ngộ Nhân Giới: 20 Phàm Duyên, 10 Linh Duyên, 5 Huyền Duyên, 1 Thiên Mệnh.
 * - Cùng 1 lựa chọn không cố định kết quả.
 * - Mỗi lựa chọn có nhiều outcome, roll theo weight.
 * - Outcome có thể thưởng, phạt, hoặc không có gì.
 * - Chỉ tập trung Nhân Giới: Luyện Khí -> Đại Thừa.
 */

const FORTUNE_RARITY = {
  "mortal": {
    "name": "Phàm Duyên",
    "weight": 7200,
    "color": "#d6d6d6"
  },
  "spirit": {
    "name": "Linh Duyên",
    "weight": 2300,
    "color": "#74f2c6"
  },
  "mystic": {
    "name": "Huyền Duyên",
    "weight": 450,
    "color": "#8ab4ff"
  },
  "heavenly": {
    "name": "Thiên Duyên",
    "weight": 49,
    "color": "#ffd166"
  },
  "destiny": {
    "name": "Thiên Mệnh",
    "weight": 1,
    "color": "#ff73fa"
  }
};

const FORTUNE_REWARD_TYPES = {
  "TU_VI": "tuVi",
  "STONES": "stones",
  "LIFESPAN": "lifespan",
  "HP": "hp",
  "MAX_HP": "maxHp",
  "ATK": "atk",
  "DEF": "def",
  "CRIT": "crit",
  "ITEM": "item",
  "MATERIAL": "material",
  "HERB": "herb",
  "PILL": "pill",
  "TECHNIQUE": "technique",
  "MARTIAL_SKILL": "martialSkill",
  "BUFF": "buff",
  "DEBUFF": "debuff",
  "NOTHING": "nothing"
};

const FORTUNES = [
  {
    "id": "lao_gia_cau_ca",
    "name": "Lão Giả Câu Cá",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "gặp_người",
    "minRealmOrder": 1,
    "maxRealmOrder": 8,
    "description": "Bên bờ suối, một lão giả áo vải ngồi câu cá, khí tức như phàm nhân mà lại sâu không lường được.",
    "choices": [
      {
        "id": "hanh_le",
        "label": "Tiến lên hành lễ",
        "outcomes": [
          {
            "weight": 45,
            "text": "Lão giả gật đầu, tiện tay chỉ điểm một câu.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.12
              }
            ]
          },
          {
            "weight": 25,
            "text": "Lão giả chỉ mỉm cười, không nói gì thêm.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi quấy rầy thời cơ câu linh ngư, bị lão giả phất tay đẩy lui.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -8
              }
            ]
          },
          {
            "weight": 10,
            "text": "Lão giả tặng ngươi một ít linh thạch vụn.",
            "rewards": [
              {
                "type": "stones",
                "min": 20,
                "max": 80
              }
            ]
          }
        ]
      },
      {
        "id": "ngoi_xem",
        "label": "Lặng lẽ ngồi xem",
        "outcomes": [
          {
            "weight": 40,
            "text": "Đạo tâm lắng xuống như mặt hồ không gợn.",
            "rewards": [
              {
                "type": "buff",
                "id": "tinh_tam",
                "name": "Tĩnh Tâm",
                "stat": "cultivationSpeedBonus",
                "value": 0.08,
                "durationMs": 600000
              }
            ]
          },
          {
            "weight": 35,
            "text": "Ngươi ngồi hồi lâu nhưng chẳng ngộ ra gì.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Tâm thần dao động vì chờ đợi quá lâu.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "tam_than_dao_dong",
                "name": "Tâm Thần Dao Động",
                "percent": 2,
                "durationMs": 480000
              }
            ]
          }
        ]
      },
      {
        "id": "bo_qua",
        "label": "Không dây vào nhân quả",
        "outcomes": [
          {
            "weight": 70,
            "text": "Ngươi tránh được một đoạn nhân quả chưa rõ là lành hay dữ.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 30,
            "text": "Trên đường rời đi, ngươi nhặt được vài viên linh thạch.",
            "rewards": [
              {
                "type": "stones",
                "min": 8,
                "max": 30
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "hop_go_muc_nat",
    "name": "Hộp Gỗ Mục Nát",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "nhặt_được",
    "minRealmOrder": 1,
    "maxRealmOrder": 4,
    "description": "Trong bụi cỏ ven đường có một hộp gỗ cũ, trên mặt khắc mấy đường vân mờ.",
    "choices": [
      {
        "id": "mo_ngay",
        "label": "Mở hộp ngay",
        "outcomes": [
          {
            "weight": 35,
            "text": "Trong hộp có vài món tài nguyên sơ cấp.",
            "rewards": [
              {
                "type": "item",
                "id": "hat_giong_linh_thao",
                "name": "Hạt Giống Linh Thảo",
                "min": 1,
                "max": 3
              },
              {
                "type": "item",
                "id": "linh_thuy_so_cap",
                "name": "Linh Thủy Sơ Cấp",
                "min": 1,
                "max": 2
              }
            ]
          },
          {
            "weight": 25,
            "text": "Hộp trống không.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Một luồng bụi độc thoát ra, khí huyết tổn hao.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -12
              }
            ]
          },
          {
            "weight": 15,
            "text": "Dưới đáy hộp có linh thạch được giấu kín.",
            "rewards": [
              {
                "type": "stones",
                "min": 40,
                "max": 120
              }
            ]
          }
        ]
      },
      {
        "id": "kiem_tra_cam_che",
        "label": "Quan sát cấm chế trước",
        "outcomes": [
          {
            "weight": 45,
            "text": "Ngươi phá được cấm chế yếu, thu hoạch nguyên vẹn.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_nhuong_so_cap",
                "name": "Linh Nhưỡng Sơ Cấp",
                "min": 2,
                "max": 4
              },
              {
                "type": "tuViPercent",
                "value": 0.06
              }
            ]
          },
          {
            "weight": 35,
            "text": "Cấm chế đã mục nát, không còn tác dụng.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Cấm chế phản chấn nhẹ.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -6
              }
            ]
          }
        ]
      },
      {
        "id": "ban_lay_linh_thach",
        "label": "Mang đi bán",
        "outcomes": [
          {
            "weight": 80,
            "text": "Một tán tu mua lại chiếc hộp cũ.",
            "rewards": [
              {
                "type": "stones",
                "min": 15,
                "max": 60
              }
            ]
          },
          {
            "weight": 20,
            "text": "Không ai thèm mua chiếc hộp mục nát này.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "tan_tu_bi_thuong",
    "name": "Tán Tu Bị Thương",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "gặp_người",
    "minRealmOrder": 1,
    "maxRealmOrder": 8,
    "description": "Một tán tu nằm dưới gốc cây, hơi thở yếu ớt, bên cạnh còn vết tích giao chiến.",
    "choices": [
      {
        "id": "cuu_nguoi",
        "label": "Ra tay cứu giúp",
        "outcomes": [
          {
            "weight": 35,
            "text": "Tán tu cảm kích, tặng ngươi túi linh thạch.",
            "rewards": [
              {
                "type": "stones",
                "min": 50,
                "max": 180
              }
            ]
          },
          {
            "weight": 25,
            "text": "Người này chỉ là phàm tu nghèo khó, chắp tay cảm tạ rồi rời đi.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Đối phương bị yêu khí ăn mòn, ngươi cũng bị ảnh hưởng.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -10
              }
            ]
          },
          {
            "weight": 15,
            "text": "Tán tu truyền cho ngươi chút kinh nghiệm sinh tử.",
            "rewards": [
              {
                "type": "def",
                "min": 1,
                "max": 4
              }
            ]
          }
        ]
      },
      {
        "id": "hoi_nguyen_nhan",
        "label": "Hỏi rõ nguyên nhân",
        "outcomes": [
          {
            "weight": 45,
            "text": "Ngươi biết được tung tích một nơi có linh thảo.",
            "rewards": [
              {
                "type": "item",
                "id": "hat_giong_linh_thao",
                "name": "Hạt Giống Linh Thảo",
                "min": 1,
                "max": 3
              }
            ]
          },
          {
            "weight": 35,
            "text": "Tán tu hôn mê, không trả lời được.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Có kẻ bám theo hắn, ngươi bị cuốn vào phiền phức.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "bi_theo_duoi",
                "name": "Bị Theo Dõi",
                "percent": 2,
                "durationMs": 600000
              }
            ]
          }
        ]
      },
      {
        "id": "roi_di",
        "label": "Rời đi",
        "outcomes": [
          {
            "weight": 85,
            "text": "Tu tiên giới hiểm ác, ngươi không muốn dính nhân quả.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 15,
            "text": "Trên đường đi, ngươi nhặt được vật hắn đánh rơi.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_nhuong_so_cap",
                "name": "Linh Nhưỡng Sơ Cấp",
                "min": 1,
                "max": 2
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cho_phien_tu_tien",
    "name": "Chợ Phiên Tu Tiên",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "gặp_người",
    "minRealmOrder": 1,
    "maxRealmOrder": 8,
    "description": "Một phiên chợ nhỏ hiện ra dưới chân núi, tán tu tụ tập mua bán đủ loại vật lạ.",
    "choices": [
      {
        "id": "mua_goi_hang",
        "label": "Mua một gói hàng bí ẩn",
        "outcomes": [
          {
            "weight": 35,
            "text": "Gói hàng có ít linh thảo hữu dụng.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_thao_thuong",
                "name": "Linh Thảo Thường",
                "min": 2,
                "max": 5
              }
            ]
          },
          {
            "weight": 30,
            "text": "Bên trong toàn đồ vô dụng.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi bị nói thách giá.",
            "rewards": [
              {
                "type": "stones",
                "min": -80,
                "max": -20
              }
            ]
          },
          {
            "weight": 15,
            "text": "Gói hàng cất giấu một viên đan dược.",
            "rewards": [
              {
                "type": "item",
                "id": "duong_khi_dan",
                "name": "Dưỡng Khí Đan",
                "min": 1,
                "max": 2
              }
            ]
          }
        ]
      },
      {
        "id": "tra_gia",
        "label": "Trả giá với chủ quầy",
        "outcomes": [
          {
            "weight": 45,
            "text": "Ngươi mua được nguyên liệu rẻ hơn thường lệ.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_nhuong_so_cap",
                "name": "Linh Nhưỡng Sơ Cấp",
                "min": 1,
                "max": 3
              }
            ]
          },
          {
            "weight": 35,
            "text": "Chủ quầy cười nhạt, không bán.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi lỡ lời đắc tội chủ quầy.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "tieu_thuong_ghi_han",
                "name": "Tiểu Thương Ghi Hận",
                "percent": 1,
                "durationMs": 420000
              }
            ]
          }
        ]
      },
      {
        "id": "di_dao",
        "label": "Đi dạo quan sát",
        "outcomes": [
          {
            "weight": 55,
            "text": "Ngươi nghe được vài tin tức hữu dụng.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.04
              }
            ]
          },
          {
            "weight": 45,
            "text": "Chợ phiên náo nhiệt nhưng không có cơ duyên của ngươi.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "thieu_nu_hai_duoc",
    "name": "Thiếu Nữ Hái Dược",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "gặp_người",
    "minRealmOrder": 1,
    "maxRealmOrder": 5,
    "description": "Một thiếu nữ đang hái dược bên sườn núi, giỏ thuốc tỏa mùi linh thảo thanh nhẹ.",
    "choices": [
      {
        "id": "giup_hai_duoc",
        "label": "Giúp nàng hái dược",
        "outcomes": [
          {
            "weight": 40,
            "text": "Nàng chia cho ngươi một phần linh thảo.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_thao_thuong",
                "name": "Linh Thảo Thường",
                "min": 2,
                "max": 4
              }
            ]
          },
          {
            "weight": 30,
            "text": "Hai người tìm cả buổi nhưng không thấy gì quý.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi hái nhầm độc thảo, khí huyết tổn hao.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -7
              }
            ]
          },
          {
            "weight": 10,
            "text": "Ngươi nhận ra một gốc dược hiếm.",
            "rewards": [
              {
                "type": "item",
                "id": "thanh_tam_thao",
                "name": "Thanh Tâm Thảo",
                "min": 1,
                "max": 1
              }
            ]
          }
        ]
      },
      {
        "id": "hoi_duoc_tinh",
        "label": "Hỏi về dược tính",
        "outcomes": [
          {
            "weight": 50,
            "text": "Ngươi hiểu thêm cách phân biệt linh dược.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 15
              }
            ]
          },
          {
            "weight": 30,
            "text": "Nàng chỉ biết chút ít, không giúp được nhiều.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi nhớ nhầm dược tính, tâm thần bất ổn.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "nham_duoc_tinh",
                "name": "Nhầm Dược Tính",
                "percent": 1,
                "durationMs": 300000
              }
            ]
          }
        ]
      },
      {
        "id": "mua_duoc_lieu",
        "label": "Mua lại dược liệu",
        "outcomes": [
          {
            "weight": 60,
            "text": "Ngươi mua được ít dược liệu sạch.",
            "rewards": [
              {
                "type": "stones",
                "min": -60,
                "max": -20
              },
              {
                "type": "item",
                "id": "linh_thao_thuong",
                "name": "Linh Thảo Thường",
                "min": 3,
                "max": 6
              }
            ]
          },
          {
            "weight": 40,
            "text": "Nàng không muốn bán số dược liệu này.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "con_duong_suong_mu",
    "name": "Con Đường Sương Mù",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "thăm_dò",
    "minRealmOrder": 1,
    "maxRealmOrder": 6,
    "description": "Một đoạn đường núi bỗng phủ sương dày, linh thức khó dò xét xa quá ba bước.",
    "choices": [
      {
        "id": "di_thang",
        "label": "Đi thẳng vào sương",
        "outcomes": [
          {
            "weight": 35,
            "text": "Ngươi xuyên qua màn sương, tìm được một lối tắt tu luyện.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.1
              }
            ]
          },
          {
            "weight": 30,
            "text": "Ngươi đi lòng vòng rồi quay lại chỗ cũ.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Sương lạnh khiến chân khí trì trệ.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "han_suong_nhap_the",
                "name": "Hàn Sương Nhập Thể",
                "percent": 2,
                "durationMs": 420000
              }
            ]
          },
          {
            "weight": 10,
            "text": "Cuối sương có linh thạch rơi vãi.",
            "rewards": [
              {
                "type": "stones",
                "min": 60,
                "max": 150
              }
            ]
          }
        ]
      },
      {
        "id": "dung_lai_quan_sat",
        "label": "Dừng lại quan sát",
        "outcomes": [
          {
            "weight": 45,
            "text": "Ngươi nhìn ra quy luật di chuyển của sương.",
            "rewards": [
              {
                "type": "def",
                "min": 1,
                "max": 3
              }
            ]
          },
          {
            "weight": 35,
            "text": "Sương tan dần, không còn gì đặc biệt.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi bỏ lỡ thời cơ vào sâu.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      },
      {
        "id": "quay_dau",
        "label": "Quay đầu tránh hiểm",
        "outcomes": [
          {
            "weight": 80,
            "text": "Cẩn thận không sai, ngươi an toàn rời đi.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ven đường có một túi nhỏ bị bỏ quên.",
            "rewards": [
              {
                "type": "stones",
                "min": 20,
                "max": 70
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "tieng_chuong_nua_dem",
    "name": "Tiếng Chuông Nửa Đêm",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "tâm_ma",
    "minRealmOrder": 2,
    "maxRealmOrder": 8,
    "description": "Đêm khuya trong động phủ vang lên tiếng chuông xa lạ, từng hồi gõ thẳng vào tâm thần.",
    "choices": [
      {
        "id": "lang_nghe",
        "label": "Tĩnh tâm lắng nghe",
        "outcomes": [
          {
            "weight": 35,
            "text": "Tiếng chuông giúp thần thức trong trẻo.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.09
              }
            ]
          },
          {
            "weight": 35,
            "text": "Âm thanh biến mất như chưa từng tồn tại.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Tiếng chuông khiến ngươi mất ngủ, khí tức hỗn loạn.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "mat_ngu",
                "name": "Mất Ngủ",
                "percent": 2,
                "durationMs": 480000
              }
            ]
          },
          {
            "weight": 10,
            "text": "Ngươi ngộ được một tia đạo vận phòng thân.",
            "rewards": [
              {
                "type": "def",
                "min": 2,
                "max": 5
              }
            ]
          }
        ]
      },
      {
        "id": "bit_tai",
        "label": "Bịt tai không nghe",
        "outcomes": [
          {
            "weight": 70,
            "text": "Ngươi tránh khỏi ảnh hưởng chưa rõ.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 30,
            "text": "Âm chuông vẫn xuyên qua tâm thần, khiến ngươi khó chịu.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -5
              }
            ]
          }
        ]
      },
      {
        "id": "lan_theo_am",
        "label": "Lần theo âm thanh",
        "outcomes": [
          {
            "weight": 45,
            "text": "Ngươi tìm được một chuông đá nhỏ.",
            "rewards": [
              {
                "type": "item",
                "id": "chuong_da_vo_danh",
                "name": "Chuông Đá Vô Danh",
                "min": 1,
                "max": 1
              }
            ]
          },
          {
            "weight": 35,
            "text": "Âm thanh dẫn ngươi đi một vòng vô ích.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi lạc vào âm khí lạnh.",
            "rewards": [
              {
                "type": "lifespan",
                "min": -2,
                "max": -1
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "dong_phu_bo_hoang",
    "name": "Động Phủ Bỏ Hoang",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "thăm_dò",
    "minRealmOrder": 2,
    "maxRealmOrder": 8,
    "description": "Một cửa động phủ cũ hé mở bên vách đá, trận văn ngoài cửa đã mờ gần hết.",
    "choices": [
      {
        "id": "vao_tham_do",
        "label": "Vào trong thăm dò",
        "outcomes": [
          {
            "weight": 35,
            "text": "Trong động phủ còn sót lại ít tài nguyên.",
            "rewards": [
              {
                "type": "stones",
                "min": 80,
                "max": 220
              },
              {
                "type": "item",
                "id": "linh_nhuong_so_cap",
                "name": "Linh Nhưỡng Sơ Cấp",
                "min": 1,
                "max": 3
              }
            ]
          },
          {
            "weight": 25,
            "text": "Bên trong trống rỗng.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Cơ quan cũ kích hoạt, ngươi bị thương nhẹ.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -14
              }
            ]
          },
          {
            "weight": 15,
            "text": "Ngươi tìm thấy tâm đắc tu luyện cũ.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 35
              }
            ]
          }
        ]
      },
      {
        "id": "pha_tran",
        "label": "Phá trận ngoài cửa",
        "outcomes": [
          {
            "weight": 45,
            "text": "Trận văn vỡ ra, linh khí tràn vào thân thể.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.14
              }
            ]
          },
          {
            "weight": 30,
            "text": "Trận văn vốn đã vô dụng.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Phá trận thất bại, bị phản chấn.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -10
              }
            ]
          }
        ]
      },
      {
        "id": "ghi_nho_vi_tri",
        "label": "Ghi nhớ vị trí rồi rời đi",
        "outcomes": [
          {
            "weight": 75,
            "text": "Ngươi chưa muốn mạo hiểm.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Trên vách cửa có một dòng chữ giúp ngươi tỉnh ngộ.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.04
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "linh_thu_non",
    "name": "Linh Thú Non Lạc Đường",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "gặp_thú",
    "minRealmOrder": 1,
    "maxRealmOrder": 6,
    "description": "Một con linh thú non run rẩy bên bụi cây, trên lông còn dính sương sớm.",
    "choices": [
      {
        "id": "cho_an",
        "label": "Cho nó ăn linh thảo",
        "outcomes": [
          {
            "weight": 35,
            "text": "Linh thú vui vẻ nhả ra một viên linh thạch sáng.",
            "rewards": [
              {
                "type": "stones",
                "min": 50,
                "max": 150
              }
            ]
          },
          {
            "weight": 30,
            "text": "Nó ăn xong rồi chạy mất.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Nó cắn nhầm tay ngươi.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -6
              }
            ]
          },
          {
            "weight": 15,
            "text": "Khí tức thân thiện khiến đạo tâm thư thái.",
            "rewards": [
              {
                "type": "lifespan",
                "min": 1,
                "max": 2
              }
            ]
          }
        ]
      },
      {
        "id": "di_theo",
        "label": "Đi theo linh thú",
        "outcomes": [
          {
            "weight": 45,
            "text": "Nó dẫn ngươi đến một bụi linh thảo.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_thao_thuong",
                "name": "Linh Thảo Thường",
                "min": 2,
                "max": 5
              }
            ]
          },
          {
            "weight": 35,
            "text": "Nó chạy quá nhanh, ngươi mất dấu.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi bị dẫn vào bụi gai.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -8
              }
            ]
          }
        ]
      },
      {
        "id": "mac_ke",
        "label": "Mặc kệ",
        "outcomes": [
          {
            "weight": 85,
            "text": "Cơ duyên không phải lúc nào cũng nên cưỡng cầu.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 15,
            "text": "Linh thú quay lại để lại một món nhỏ.",
            "rewards": [
              {
                "type": "item",
                "id": "long_linh_thu_non",
                "name": "Lông Linh Thú Non",
                "min": 1,
                "max": 2
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "bia_da_vo_danh",
    "name": "Bia Đá Vô Danh",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "thăm_dò",
    "minRealmOrder": 1,
    "maxRealmOrder": 8,
    "description": "Một tấm bia đá cắm nghiêng dưới đất, chữ khắc bị rêu xanh phủ kín.",
    "choices": [
      {
        "id": "lau_reu_doc_chu",
        "label": "Lau rêu đọc chữ",
        "outcomes": [
          {
            "weight": 40,
            "text": "Chữ cổ ghi lại một đoạn pháp quyết thô sơ.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 25
              }
            ]
          },
          {
            "weight": 30,
            "text": "Chữ đã mòn, không đọc được gì.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Tà niệm còn sót lại khiến ngươi nhức đầu.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -5
              }
            ]
          },
          {
            "weight": 10,
            "text": "Một tia đạo vận nhập thể.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.12
              }
            ]
          }
        ]
      },
      {
        "id": "truyen_linh_luc",
        "label": "Truyền linh lực vào bia",
        "outcomes": [
          {
            "weight": 35,
            "text": "Bia đá đáp lại bằng linh quang.",
            "rewards": [
              {
                "type": "maxHp",
                "min": 2,
                "max": 6
              }
            ]
          },
          {
            "weight": 35,
            "text": "Không có phản ứng.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 30,
            "text": "Linh lực bị bia đá hút mất, khí tức suy yếu.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "linh_luc_hao_hut",
                "name": "Linh Lực Hao Hụt",
                "percent": 2,
                "durationMs": 360000
              }
            ]
          }
        ]
      },
      {
        "id": "dao_len",
        "label": "Đào bia lên",
        "outcomes": [
          {
            "weight": 45,
            "text": "Dưới bia có một túi linh thạch cũ.",
            "rewards": [
              {
                "type": "stones",
                "min": 70,
                "max": 180
              }
            ]
          },
          {
            "weight": 35,
            "text": "Bia quá nặng, ngươi bỏ cuộc.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Động vào địa mạch, bị chấn thương nhẹ.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -9
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "am_anh_tam_ma",
    "name": "Ám Ảnh Tâm Ma",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "tâm_ma",
    "minRealmOrder": 3,
    "maxRealmOrder": 8,
    "description": "Khi nhập định, ngươi thấy một bóng đen giống hệt mình đứng trước mặt.",
    "choices": [
      {
        "id": "doi_mat",
        "label": "Đối mặt với nó",
        "outcomes": [
          {
            "weight": 35,
            "text": "Ngươi phá được một tầng chấp niệm.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.16
              }
            ]
          },
          {
            "weight": 30,
            "text": "Bóng đen tan đi nhưng không để lại gì.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Tâm ma phản kích làm khí huyết rối loạn.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -12
              }
            ]
          },
          {
            "weight": 10,
            "text": "Ý chí được tôi luyện.",
            "rewards": [
              {
                "type": "def",
                "min": 2,
                "max": 5
              }
            ]
          }
        ]
      },
      {
        "id": "ne_tranh",
        "label": "Né tránh không nhìn",
        "outcomes": [
          {
            "weight": 60,
            "text": "Ngươi tạm thời giữ được bình ổn.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 40,
            "text": "Chấp niệm chưa tan, ảnh hưởng tu luyện.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "chap_niem_chua_tan",
                "name": "Chấp Niệm Chưa Tan",
                "percent": 3,
                "durationMs": 600000
              }
            ]
          }
        ]
      },
      {
        "id": "quan_tuong",
        "label": "Quan tưởng bản tâm",
        "outcomes": [
          {
            "weight": 45,
            "text": "Ngươi lấy tĩnh chế động, tâm cảnh tăng lên.",
            "rewards": [
              {
                "type": "buff",
                "id": "ban_tam_sang_ro",
                "name": "Bản Tâm Sáng Rõ",
                "stat": "cultivationSpeedBonus",
                "value": 0.06,
                "durationMs": 600000
              }
            ]
          },
          {
            "weight": 35,
            "text": "Quan tưởng không thành.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Tâm thần hao tổn.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -6
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "nguoi_ban_sach_cu",
    "name": "Người Bán Sách Cũ",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "gặp_người",
    "minRealmOrder": 1,
    "maxRealmOrder": 8,
    "description": "Một người bán sách rong bày mấy quyển cổ tịch ố vàng bên đường.",
    "choices": [
      {
        "id": "mua_sach",
        "label": "Mua một quyển cổ tịch",
        "outcomes": [
          {
            "weight": 35,
            "text": "Trong sách có ghi vài câu tâm đắc hữu dụng.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 30
              }
            ]
          },
          {
            "weight": 30,
            "text": "Sách chỉ toàn chuyện phàm tục.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi mua hớ một quyển sách giả.",
            "rewards": [
              {
                "type": "stones",
                "min": -70,
                "max": -20
              }
            ]
          },
          {
            "weight": 15,
            "text": "Một trang sách kẹp công pháp nhập môn.",
            "rewards": [
              {
                "type": "technique",
                "id": "tinh_khi_quyet_so_khuyet",
                "name": "Tĩnh Khí Quyết Sơ Khuyết"
              }
            ]
          }
        ]
      },
      {
        "id": "doc_thu",
        "label": "Đọc thử tại chỗ",
        "outcomes": [
          {
            "weight": 45,
            "text": "Một đoạn chữ khiến ngươi có chút lĩnh ngộ.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.07
              }
            ]
          },
          {
            "weight": 40,
            "text": "Chữ nghĩa rời rạc, khó hiểu.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 15,
            "text": "Đọc lâu làm đầu óc choáng váng.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -4
              }
            ]
          }
        ]
      },
      {
        "id": "hoi_nguon_goc",
        "label": "Hỏi nguồn gốc sách",
        "outcomes": [
          {
            "weight": 50,
            "text": "Người bán sách kể một truyền thuyết thú vị.",
            "rewards": [
              {
                "type": "item",
                "id": "manh_ban_do_cu",
                "name": "Mảnh Bản Đồ Cũ",
                "min": 1,
                "max": 1
              }
            ]
          },
          {
            "weight": 50,
            "text": "Hắn chỉ cười mà không đáp.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "vat_sang_duoi_gieng",
    "name": "Vật Sáng Dưới Giếng",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "nhặt_được",
    "minRealmOrder": 1,
    "maxRealmOrder": 7,
    "description": "Một giếng cạn trong thôn bỏ hoang lóe lên ánh sáng nhàn nhạt.",
    "choices": [
      {
        "id": "xuong_gieng",
        "label": "Leo xuống giếng",
        "outcomes": [
          {
            "weight": 35,
            "text": "Dưới đáy giếng có linh thạch lẫn bùn.",
            "rewards": [
              {
                "type": "stones",
                "min": 60,
                "max": 180
              }
            ]
          },
          {
            "weight": 25,
            "text": "Ánh sáng chỉ là đá thường phản chiếu.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Khí lạnh dưới giếng làm ngươi tổn hao sinh lực.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -10
              }
            ]
          },
          {
            "weight": 15,
            "text": "Ngươi nhặt được một viên ngọc cũ.",
            "rewards": [
              {
                "type": "item",
                "id": "ngoc_vo_danh",
                "name": "Ngọc Vô Danh",
                "min": 1,
                "max": 1
              }
            ]
          }
        ]
      },
      {
        "id": "dung_day_keo",
        "label": "Dùng dây kéo lên",
        "outcomes": [
          {
            "weight": 45,
            "text": "Ngươi kéo được một túi nhỏ.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_thuy_so_cap",
                "name": "Linh Thủy Sơ Cấp",
                "min": 1,
                "max": 3
              }
            ]
          },
          {
            "weight": 35,
            "text": "Dây đứt giữa chừng.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Vật dưới giếng vỡ nát khi kéo lên.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      },
      {
        "id": "nem_da_thu",
        "label": "Ném đá thử trước",
        "outcomes": [
          {
            "weight": 50,
            "text": "Tiếng vang giúp ngươi tránh được hố sâu nguy hiểm.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 30,
            "text": "Một luồng khí trắng bay lên, khiến ngươi tỉnh táo.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.05
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi kinh động thứ gì đó dưới giếng.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "am_khi_quan_than",
                "name": "Âm Khí Quấn Thân",
                "percent": 2,
                "durationMs": 360000
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cay_co_qua_la",
    "name": "Cây Có Quả Lạ",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "nhặt_được",
    "minRealmOrder": 1,
    "maxRealmOrder": 6,
    "description": "Một cây nhỏ bên đường kết ba quả lạ, hương thơm thoang thoảng nhưng màu sắc khó đoán.",
    "choices": [
      {
        "id": "an_mot_qua",
        "label": "Ăn thử một quả",
        "outcomes": [
          {
            "weight": 35,
            "text": "Quả lạ hóa thành linh khí ấm áp.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.11
              }
            ]
          },
          {
            "weight": 25,
            "text": "Vị rất chát, không có linh hiệu.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Quả có độc nhẹ, sinh lực hao tổn.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -9
              }
            ]
          },
          {
            "weight": 15,
            "text": "Dược lực bồi bổ thân thể.",
            "rewards": [
              {
                "type": "maxHp",
                "min": 2,
                "max": 6
              }
            ]
          }
        ]
      },
      {
        "id": "hai_mang_ve",
        "label": "Hái mang về",
        "outcomes": [
          {
            "weight": 55,
            "text": "Ngươi hái được vài quả lạ.",
            "rewards": [
              {
                "type": "item",
                "id": "qua_la_vo_danh",
                "name": "Quả Lạ Vô Danh",
                "min": 1,
                "max": 3
              }
            ]
          },
          {
            "weight": 30,
            "text": "Quả vừa rời cành đã héo.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 15,
            "text": "Cây tiết ra nhựa độc.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -6
              }
            ]
          }
        ]
      },
      {
        "id": "gieo_hat",
        "label": "Lấy hạt gieo thử",
        "outcomes": [
          {
            "weight": 45,
            "text": "Ngươi thu được hạt giống có linh tính.",
            "rewards": [
              {
                "type": "item",
                "id": "hat_giong_la",
                "name": "Hạt Giống Lạ",
                "min": 1,
                "max": 2
              }
            ]
          },
          {
            "weight": 55,
            "text": "Hạt khô mục, không thể gieo trồng.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "lam_tac_chan_duong",
    "name": "Lâm Tặc Chặn Đường",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "gặp_người",
    "minRealmOrder": 1,
    "maxRealmOrder": 5,
    "description": "Một nhóm lâm tặc tu vi thấp chặn đường, ánh mắt tham lam nhìn túi trữ vật của ngươi.",
    "choices": [
      {
        "id": "day_lui",
        "label": "Đẩy lui chúng",
        "outcomes": [
          {
            "weight": 40,
            "text": "Ngươi đánh tan đám lâm tặc, thu chút chiến lợi phẩm.",
            "rewards": [
              {
                "type": "stones",
                "min": 80,
                "max": 200
              }
            ]
          },
          {
            "weight": 30,
            "text": "Chúng thấy khí tức của ngươi liền bỏ chạy.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Trong lúc hỗn loạn ngươi bị thương nhẹ.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -8
              }
            ]
          },
          {
            "weight": 10,
            "text": "Chiến đấu giúp ngươi tôi luyện công kích.",
            "rewards": [
              {
                "type": "atk",
                "min": 1,
                "max": 4
              }
            ]
          }
        ]
      },
      {
        "id": "dua_it_linh_thach",
        "label": "Đưa ít linh thạch để đi qua",
        "outcomes": [
          {
            "weight": 65,
            "text": "Ngươi mất chút linh thạch nhưng tránh phiền phức.",
            "rewards": [
              {
                "type": "stones",
                "min": -50,
                "max": -10
              }
            ]
          },
          {
            "weight": 35,
            "text": "Chúng chê ít và vẫn làm khó ngươi.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -5
              }
            ]
          }
        ]
      },
      {
        "id": "doi_thoai",
        "label": "Dùng lời khuyên giải",
        "outcomes": [
          {
            "weight": 35,
            "text": "Một tên trong nhóm tỉnh ngộ, âm thầm tặng ngươi vật cũ.",
            "rewards": [
              {
                "type": "item",
                "id": "manh_ban_do_cu",
                "name": "Mảnh Bản Đồ Cũ",
                "min": 1,
                "max": 1
              }
            ]
          },
          {
            "weight": 45,
            "text": "Chúng cười nhạo rồi bỏ đi.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Lời nói không hợp, ngươi bị vây đánh.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -10
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "mua_xuan_linh_khi",
    "name": "Mưa Xuân Linh Khí",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "thiên_tượng",
    "minRealmOrder": 1,
    "maxRealmOrder": 8,
    "description": "Một cơn mưa xuân rơi xuống, từng hạt mưa mang theo linh khí rất nhạt.",
    "choices": [
      {
        "id": "tam_mua",
        "label": "Đứng trong mưa vận công",
        "outcomes": [
          {
            "weight": 45,
            "text": "Linh khí thấm vào kinh mạch.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.1
              }
            ]
          },
          {
            "weight": 30,
            "text": "Mưa chỉ mát lạnh, không có hiệu quả rõ.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 15,
            "text": "Hàn khí nhập thể.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -5
              }
            ]
          },
          {
            "weight": 10,
            "text": "Thân thể được gột rửa nhẹ.",
            "rewards": [
              {
                "type": "lifespan",
                "min": 1,
                "max": 2
              }
            ]
          }
        ]
      },
      {
        "id": "hung_nuoc_mua",
        "label": "Hứng nước mưa linh khí",
        "outcomes": [
          {
            "weight": 60,
            "text": "Ngươi thu được ít linh thủy.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_thuy_so_cap",
                "name": "Linh Thủy Sơ Cấp",
                "min": 1,
                "max": 4
              }
            ]
          },
          {
            "weight": 40,
            "text": "Nước mưa rơi vào bình liền mất linh tính.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      },
      {
        "id": "tim_cho_tru",
        "label": "Tìm chỗ trú",
        "outcomes": [
          {
            "weight": 85,
            "text": "Ngươi giữ thân thể khô ráo, không gặp biến cố.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 15,
            "text": "Chỗ trú mưa có linh thạch ai đó bỏ quên.",
            "rewards": [
              {
                "type": "stones",
                "min": 30,
                "max": 90
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "tang_da_nong_am",
    "name": "Tảng Đá Nóng Ấm",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "thăm_dò",
    "minRealmOrder": 1,
    "maxRealmOrder": 7,
    "description": "Một tảng đá ven đường tỏa hơi ấm, xung quanh cây cỏ sinh trưởng xanh tốt khác thường.",
    "choices": [
      {
        "id": "ngoi_thien",
        "label": "Ngồi thiền trên đá",
        "outcomes": [
          {
            "weight": 40,
            "text": "Hơi ấm giúp khí huyết lưu thông.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.09
              }
            ]
          },
          {
            "weight": 30,
            "text": "Tảng đá chỉ ấm bình thường.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Nhiệt khí quá mạnh làm ngươi khó chịu.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -6
              }
            ]
          },
          {
            "weight": 10,
            "text": "Thân thể được rèn luyện chút ít.",
            "rewards": [
              {
                "type": "maxHp",
                "min": 3,
                "max": 7
              }
            ]
          }
        ]
      },
      {
        "id": "dap_vo",
        "label": "Đập vỡ xem bên trong",
        "outcomes": [
          {
            "weight": 35,
            "text": "Bên trong có linh thạch nhỏ.",
            "rewards": [
              {
                "type": "stones",
                "min": 70,
                "max": 160
              }
            ]
          },
          {
            "weight": 35,
            "text": "Đá vỡ vụn không có gì.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 30,
            "text": "Mảnh đá bắn ra làm ngươi bị thương.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -8
              }
            ]
          }
        ]
      },
      {
        "id": "lay_reu_quanh_da",
        "label": "Lấy rêu quanh đá",
        "outcomes": [
          {
            "weight": 55,
            "text": "Rêu hấp thu linh khí, có thể làm nguyên liệu.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_reu_am_thach",
                "name": "Linh Rêu Ấm Thạch",
                "min": 1,
                "max": 3
              }
            ]
          },
          {
            "weight": 45,
            "text": "Rêu thường không có giá trị.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "thu_truyen_vo_danh",
    "name": "Thư Truyền Vô Danh",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "nhặt_được",
    "minRealmOrder": 1,
    "maxRealmOrder": 8,
    "description": "Một phong thư không đề tên rơi trước cửa động phủ, nét chữ bên ngoài đã nhòe.",
    "choices": [
      {
        "id": "mo_doc",
        "label": "Mở ra đọc",
        "outcomes": [
          {
            "weight": 35,
            "text": "Trong thư có lời khuyên tu luyện giản dị mà hữu dụng.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.08
              }
            ]
          },
          {
            "weight": 30,
            "text": "Thư chỉ là lời nhắn phàm tục.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Một đoạn chữ khiến tâm thần rối loạn.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "chu_van_nhieu_loan",
                "name": "Chữ Văn Nhiễu Loạn",
                "percent": 2,
                "durationMs": 360000
              }
            ]
          },
          {
            "weight": 15,
            "text": "Trong phong thư kẹp linh thạch.",
            "rewards": [
              {
                "type": "stones",
                "min": 50,
                "max": 130
              }
            ]
          }
        ]
      },
      {
        "id": "tim_chu_nhan",
        "label": "Tìm chủ nhân phong thư",
        "outcomes": [
          {
            "weight": 40,
            "text": "Ngươi trả lại thư và được cảm tạ.",
            "rewards": [
              {
                "type": "item",
                "id": "duong_khi_dan",
                "name": "Dưỡng Khí Đan",
                "min": 1,
                "max": 1
              }
            ]
          },
          {
            "weight": 40,
            "text": "Không tìm được ai nhận thư.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi tốn nhiều thời gian vô ích.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "ton_thoi_gian",
                "name": "Tốn Thời Gian",
                "percent": 1,
                "durationMs": 300000
              }
            ]
          }
        ]
      },
      {
        "id": "dot_bo",
        "label": "Đốt bỏ để đoạn nhân quả",
        "outcomes": [
          {
            "weight": 75,
            "text": "Tro tàn bay đi, không có gì xảy ra.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Lửa cháy lên một hàng chữ cuối.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 20
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "be_ca_linh_quang",
    "name": "Bè Cá Linh Quang",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "thiên_tượng",
    "minRealmOrder": 1,
    "maxRealmOrder": 5,
    "description": "Dưới khe nước có một đàn cá nhỏ phát sáng bơi qua, mỗi con mang một tia linh khí.",
    "choices": [
      {
        "id": "bat_ca",
        "label": "Bắt vài con cá",
        "outcomes": [
          {
            "weight": 35,
            "text": "Ngươi bắt được cá linh quang.",
            "rewards": [
              {
                "type": "item",
                "id": "ca_linh_quang",
                "name": "Cá Linh Quang",
                "min": 1,
                "max": 3
              }
            ]
          },
          {
            "weight": 30,
            "text": "Cá quá nhanh, ngươi không bắt được.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Trượt chân xuống nước, sinh lực hao tổn.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -6
              }
            ]
          },
          {
            "weight": 15,
            "text": "Một con cá hóa thành linh khí nhập thể.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.09
              }
            ]
          }
        ]
      },
      {
        "id": "tha_moi",
        "label": "Thả mồi dẫn cá",
        "outcomes": [
          {
            "weight": 45,
            "text": "Cá tụ lại, để lộ một viên linh thạch dưới đáy.",
            "rewards": [
              {
                "type": "stones",
                "min": 60,
                "max": 150
              }
            ]
          },
          {
            "weight": 35,
            "text": "Mồi bị nước cuốn đi.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Một con thủy xà nhỏ xuất hiện làm ngươi hoảng sợ.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "kinh_hai_thuy_xa",
                "name": "Kinh Hãi Thủy Xà",
                "percent": 1,
                "durationMs": 240000
              }
            ]
          }
        ]
      },
      {
        "id": "ngam_nhin",
        "label": "Chỉ đứng ngắm nhìn",
        "outcomes": [
          {
            "weight": 60,
            "text": "Cảnh tượng đẹp khiến tâm cảnh thư thái.",
            "rewards": [
              {
                "type": "buff",
                "id": "tam_canh_thu_thai",
                "name": "Tâm Cảnh Thư Thái",
                "stat": "cultivationSpeedBonus",
                "value": 0.04,
                "durationMs": 420000
              }
            ]
          },
          {
            "weight": 40,
            "text": "Đàn cá bơi qua rồi biến mất.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "vien_da_duoi_goi",
    "name": "Viên Đá Dưới Gối",
    "world": "Nhân Giới",
    "rarity": "mortal",
    "type": "nhặt_được",
    "minRealmOrder": 1,
    "maxRealmOrder": 8,
    "description": "Sau một đêm nhập định, dưới gối của ngươi bỗng xuất hiện một viên đá trơn nhẵn.",
    "choices": [
      {
        "id": "cam_nhan",
        "label": "Cầm lên cảm nhận",
        "outcomes": [
          {
            "weight": 35,
            "text": "Viên đá phát ra hơi ấm giúp ngươi tăng tu vi.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.07
              }
            ]
          },
          {
            "weight": 30,
            "text": "Nó chỉ là viên đá thường.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Một tia khí lạ làm ngươi đau đầu.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -4
              }
            ]
          },
          {
            "weight": 15,
            "text": "Viên đá rạn ra, lộ linh thạch bên trong.",
            "rewards": [
              {
                "type": "stones",
                "min": 40,
                "max": 120
              }
            ]
          }
        ]
      },
      {
        "id": "cat_giu",
        "label": "Cất vào túi đồ",
        "outcomes": [
          {
            "weight": 55,
            "text": "Ngươi giữ lại viên đá lạ.",
            "rewards": [
              {
                "type": "item",
                "id": "da_tron_vo_danh",
                "name": "Đá Trơn Vô Danh",
                "min": 1,
                "max": 1
              }
            ]
          },
          {
            "weight": 45,
            "text": "Viên đá tan thành bụi khi chạm vào túi.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      },
      {
        "id": "nem_di",
        "label": "Ném ra xa",
        "outcomes": [
          {
            "weight": 80,
            "text": "Viên đá lăn mất trong bụi cỏ.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Chỗ viên đá rơi xuống lóe lên vài linh quang.",
            "rewards": [
              {
                "type": "stones",
                "min": 20,
                "max": 80
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "linh_tuyen_an",
    "name": "Linh Tuyền Ẩn Trong Đá",
    "world": "Nhân Giới",
    "rarity": "spirit",
    "type": "thăm_dò",
    "minRealmOrder": 1,
    "maxRealmOrder": 8,
    "description": "Một khe đá tỏa linh khí nhàn nhạt, bên trong tựa hồ có linh tuyền chưa khô cạn.",
    "choices": [
      {
        "id": "hap_thu_linh_khi",
        "label": "Ngồi xuống hấp thu linh khí",
        "outcomes": [
          {
            "weight": 50,
            "text": "Linh khí nhập thể, tu vi tăng mạnh.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.25
              }
            ]
          },
          {
            "weight": 25,
            "text": "Linh khí loãng hơn tưởng tượng.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.05
              }
            ]
          },
          {
            "weight": 15,
            "text": "Linh khí hỗn tạp khiến kinh mạch hơi tắc nghẽn.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "kinh_mach_tac_nghen",
                "name": "Kinh Mạch Tắc Nghẽn",
                "percent": 3,
                "durationMs": 720000
              }
            ]
          },
          {
            "weight": 10,
            "text": "Ngươi luyện hóa được một tia linh nguyên tinh thuần.",
            "rewards": [
              {
                "type": "maxHp",
                "min": 3,
                "max": 8
              },
              {
                "type": "atk",
                "min": 1,
                "max": 3
              }
            ]
          }
        ]
      },
      {
        "id": "lay_linh_thuy",
        "label": "Lấy linh thủy mang về",
        "outcomes": [
          {
            "weight": 60,
            "text": "Ngươi lấy được một ít linh thủy.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_thuy_so_cap",
                "name": "Linh Thủy Sơ Cấp",
                "min": 2,
                "max": 6
              }
            ]
          },
          {
            "weight": 25,
            "text": "Linh tuyền vừa chạm vào đã tan thành sương.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 15,
            "text": "Một tia hàn khí nhập thể.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -10
              }
            ]
          }
        ]
      },
      {
        "id": "phong_an_lai",
        "label": "Phong ấn lại chờ ngày sau",
        "outcomes": [
          {
            "weight": 55,
            "text": "Ngươi kết được thiện duyên với địa mạch.",
            "rewards": [
              {
                "type": "lifespan",
                "min": 1,
                "max": 3
              }
            ]
          },
          {
            "weight": 45,
            "text": "Không có gì xảy ra.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "co_mieu_hoang_phe",
    "name": "Cổ Miếu Hoang Phế",
    "world": "Nhân Giới",
    "rarity": "spirit",
    "type": "thăm_dò",
    "minRealmOrder": 2,
    "maxRealmOrder": 8,
    "description": "Giữa rừng sâu xuất hiện một cổ miếu không tên, hương tàn còn vương trên án đá.",
    "choices": [
      {
        "id": "dang_huong",
        "label": "Dâng hương cúi bái",
        "outcomes": [
          {
            "weight": 35,
            "text": "Một tia linh quang nhập vào mi tâm.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.18
              }
            ]
          },
          {
            "weight": 30,
            "text": "Tượng đá im lặng, cổ miếu vẫn hoang lạnh.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Hương khói hóa thành âm phong, thọ nguyên hao tổn nhẹ.",
            "rewards": [
              {
                "type": "lifespan",
                "min": -3,
                "max": -1
              }
            ]
          },
          {
            "weight": 15,
            "text": "Ngươi nghe được một câu cổ quyết mơ hồ.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 30
              }
            ]
          }
        ]
      },
      {
        "id": "luc_soat",
        "label": "Lục soát hậu điện",
        "outcomes": [
          {
            "weight": 40,
            "text": "Hậu điện còn sót lại linh thạch cũ.",
            "rewards": [
              {
                "type": "stones",
                "min": 120,
                "max": 320
              }
            ]
          },
          {
            "weight": 30,
            "text": "Chỉ có bụi phủ và mạng nhện.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Chạm nhầm âm phù, sinh lực tổn hao.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -12
              }
            ]
          },
          {
            "weight": 10,
            "text": "Tìm được một lư hương nhỏ.",
            "rewards": [
              {
                "type": "item",
                "id": "lu_huong_cu",
                "name": "Lư Hương Cũ",
                "min": 1,
                "max": 1
              }
            ]
          }
        ]
      },
      {
        "id": "roi_khoi",
        "label": "Rời khỏi cổ miếu",
        "outcomes": [
          {
            "weight": 70,
            "text": "Ngươi không muốn mạo phạm nơi vô danh.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 30,
            "text": "Trước cửa miếu có một gốc thanh tâm thảo.",
            "rewards": [
              {
                "type": "item",
                "id": "thanh_tam_thao",
                "name": "Thanh Tâm Thảo",
                "min": 1,
                "max": 2
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "kiem_khach_cui_muc",
    "name": "Kiếm Khách Củi Mục",
    "world": "Nhân Giới",
    "rarity": "spirit",
    "type": "gặp_người",
    "minRealmOrder": 2,
    "maxRealmOrder": 8,
    "description": "Một kiếm khách cụt tay ngồi chẻ củi, mỗi nhát bổ đều ẩn chứa nhịp vận kỳ lạ.",
    "choices": [
      {
        "id": "xin_chi_diem",
        "label": "Xin chỉ điểm",
        "outcomes": [
          {
            "weight": 35,
            "text": "Hắn chỉ một nhát bổ, ngươi lĩnh ngộ chút chiến ý.",
            "rewards": [
              {
                "type": "atk",
                "min": 3,
                "max": 8
              }
            ]
          },
          {
            "weight": 30,
            "text": "Hắn lắc đầu, không muốn nói chuyện.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Khí thế của hắn áp bách khiến ngươi khó thở.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -8
              }
            ]
          },
          {
            "weight": 15,
            "text": "Ngươi ngộ được một thức kiếm thô sơ.",
            "rewards": [
              {
                "type": "martialSkill",
                "id": "bo_cui_kiem_thuc",
                "name": "Bổ Củi Kiếm Thức"
              }
            ]
          }
        ]
      },
      {
        "id": "bo_cui_giup",
        "label": "Bổ củi giúp hắn",
        "outcomes": [
          {
            "weight": 45,
            "text": "Trong lao động, ngươi hiểu thêm cách vận lực.",
            "rewards": [
              {
                "type": "maxHp",
                "min": 5,
                "max": 12
              }
            ]
          },
          {
            "weight": 35,
            "text": "Ngươi chỉ mệt một trận.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Bổ sai nhịp, chân khí nghịch chuyển nhẹ.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "van_luc_sai_nhip",
                "name": "Vận Lực Sai Nhịp",
                "percent": 3,
                "durationMs": 480000
              }
            ]
          }
        ]
      },
      {
        "id": "thach_dau",
        "label": "Thử giao thủ",
        "outcomes": [
          {
            "weight": 35,
            "text": "Ngươi bại nhưng học được kinh nghiệm thực chiến.",
            "rewards": [
              {
                "type": "def",
                "min": 3,
                "max": 7
              },
              {
                "type": "atk",
                "min": 1,
                "max": 4
              }
            ]
          },
          {
            "weight": 25,
            "text": "Hắn không nhận lời.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 40,
            "text": "Ngươi bị một cành củi đánh lui.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -15
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "hoa_sen_bach_ngoc",
    "name": "Hoa Sen Bạch Ngọc",
    "world": "Nhân Giới",
    "rarity": "spirit",
    "type": "nhặt_được",
    "minRealmOrder": 2,
    "maxRealmOrder": 8,
    "description": "Giữa ao cạn mọc một đóa sen trắng như ngọc, cánh hoa không dính bùn trần.",
    "choices": [
      {
        "id": "hai_hoa",
        "label": "Hái hoa sen",
        "outcomes": [
          {
            "weight": 35,
            "text": "Hoa sen hóa thành dược lực tinh thuần.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.22
              }
            ]
          },
          {
            "weight": 25,
            "text": "Hoa vừa chạm tay đã tan.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Ao cạn phun âm khí lạnh.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -12
              }
            ]
          },
          {
            "weight": 15,
            "text": "Ngươi thu được Bạch Ngọc Liên.",
            "rewards": [
              {
                "type": "item",
                "id": "bach_ngoc_lien",
                "name": "Bạch Ngọc Liên",
                "min": 1,
                "max": 1
              }
            ]
          }
        ]
      },
      {
        "id": "ngoi_quan_tuong",
        "label": "Ngồi quan tưởng bên ao",
        "outcomes": [
          {
            "weight": 45,
            "text": "Tâm cảnh trong như mặt nước.",
            "rewards": [
              {
                "type": "buff",
                "id": "bach_lien_tinh_tam",
                "name": "Bạch Liên Tĩnh Tâm",
                "stat": "cultivationSpeedBonus",
                "value": 0.1,
                "durationMs": 720000
              }
            ]
          },
          {
            "weight": 35,
            "text": "Gió thổi qua, không có gì xảy ra.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Hương sen quá nồng làm thần thức mơ hồ.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "huong_sen_me_than",
                "name": "Hương Sen Mê Thần",
                "percent": 2,
                "durationMs": 480000
              }
            ]
          }
        ]
      },
      {
        "id": "lay_hat_sen",
        "label": "Lấy hạt sen",
        "outcomes": [
          {
            "weight": 55,
            "text": "Ngươi lấy được vài hạt sen linh tính.",
            "rewards": [
              {
                "type": "item",
                "id": "hat_bach_lien",
                "name": "Hạt Bạch Liên",
                "min": 1,
                "max": 3
              }
            ]
          },
          {
            "weight": 45,
            "text": "Đài sen rỗng không.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "thuong_nhan_bi_an",
    "name": "Thương Nhân Bí Ẩn",
    "world": "Nhân Giới",
    "rarity": "spirit",
    "type": "gặp_người",
    "minRealmOrder": 1,
    "maxRealmOrder": 8,
    "description": "Một thương nhân áo đen bày quầy trong rừng, hàng hóa đều phủ vải xám.",
    "choices": [
      {
        "id": "mua_vat_phu_vai",
        "label": "Mua vật phủ vải",
        "outcomes": [
          {
            "weight": 35,
            "text": "Ngươi mua được món hàng có lời.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_nhuong_trung_cap",
                "name": "Linh Nhưỡng Trung Cấp",
                "min": 1,
                "max": 2
              }
            ]
          },
          {
            "weight": 30,
            "text": "Bên dưới là vật vô dụng.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi bị lừa mất linh thạch.",
            "rewards": [
              {
                "type": "stones",
                "min": -200,
                "max": -80
              }
            ]
          },
          {
            "weight": 15,
            "text": "Món hàng là một viên đan tốt.",
            "rewards": [
              {
                "type": "item",
                "id": "ngung_khi_dan",
                "name": "Ngưng Khí Đan",
                "min": 1,
                "max": 1
              }
            ]
          }
        ]
      },
      {
        "id": "doi_vat",
        "label": "Đổi vật lấy vật",
        "outcomes": [
          {
            "weight": 45,
            "text": "Ngươi đổi được thứ cần cho dược viên.",
            "rewards": [
              {
                "type": "item",
                "id": "linh_thuy_trung_cap",
                "name": "Linh Thủy Trung Cấp",
                "min": 1,
                "max": 2
              }
            ]
          },
          {
            "weight": 35,
            "text": "Thương nhân không hứng thú.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi đổi nhầm đồ kém giá trị.",
            "rewards": [
              {
                "type": "stones",
                "min": -120,
                "max": -40
              }
            ]
          }
        ]
      },
      {
        "id": "hoi_lai_lich",
        "label": "Hỏi lai lịch hắn",
        "outcomes": [
          {
            "weight": 40,
            "text": "Hắn cười và tặng ngươi một câu nhắc nhở.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.1
              }
            ]
          },
          {
            "weight": 40,
            "text": "Hắn biến mất không dấu vết.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ánh mắt hắn khiến ngươi lạnh sống lưng.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "han_y_vo_hinh",
                "name": "Hàn Ý Vô Hình",
                "percent": 2,
                "durationMs": 420000
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "thach_that_duoi_thac",
    "name": "Thạch Thất Dưới Thác",
    "world": "Nhân Giới",
    "rarity": "spirit",
    "type": "thăm_dò",
    "minRealmOrder": 3,
    "maxRealmOrder": 8,
    "description": "Sau màn nước của thác lớn có một thạch thất nhỏ, vách đá phủ đầy vết khắc.",
    "choices": [
      {
        "id": "vao_thach_that",
        "label": "Vào thạch thất",
        "outcomes": [
          {
            "weight": 40,
            "text": "Vết khắc giúp ngươi tăng mạnh tu vi.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.24
              }
            ]
          },
          {
            "weight": 25,
            "text": "Vết khắc đã bị nước mài mòn.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Áp lực thác nước làm ngươi bị thương.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -14
              }
            ]
          },
          {
            "weight": 10,
            "text": "Ngươi tìm được một pháp quyết cũ.",
            "rewards": [
              {
                "type": "technique",
                "id": "thuy_tuc_quyet_tan_bien",
                "name": "Thủy Tức Quyết Tàn Biên"
              }
            ]
          }
        ]
      },
      {
        "id": "luyen_the_duoi_thac",
        "label": "Đứng dưới thác luyện thể",
        "outcomes": [
          {
            "weight": 45,
            "text": "Thân thể chịu áp lực, khí huyết tăng lên.",
            "rewards": [
              {
                "type": "maxHp",
                "min": 8,
                "max": 18
              }
            ]
          },
          {
            "weight": 30,
            "text": "Ngươi chỉ bị nước đập mệt mỏi.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Không chịu nổi áp lực, sinh lực tổn hao.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -16
              }
            ]
          }
        ]
      },
      {
        "id": "chep_vet_khac",
        "label": "Chép lại vết khắc",
        "outcomes": [
          {
            "weight": 55,
            "text": "Ngươi ghi lại một phần tâm đắc.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 50
              }
            ]
          },
          {
            "weight": 45,
            "text": "Nước bắn làm chữ nhòe hết.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "dan_su_lac_lo",
    "name": "Đan Sư Lạc Lối",
    "world": "Nhân Giới",
    "rarity": "spirit",
    "type": "gặp_người",
    "minRealmOrder": 2,
    "maxRealmOrder": 8,
    "description": "Một đan sư trẻ lạc trong rừng, tay ôm lò đan nhỏ và sắc mặt đầy lo lắng.",
    "choices": [
      {
        "id": "chi_duong",
        "label": "Chỉ đường cho hắn",
        "outcomes": [
          {
            "weight": 35,
            "text": "Đan sư cảm kích, tặng ngươi đan dược.",
            "rewards": [
              {
                "type": "item",
                "id": "ngung_khi_dan",
                "name": "Ngưng Khí Đan",
                "min": 1,
                "max": 2
              }
            ]
          },
          {
            "weight": 30,
            "text": "Hắn chỉ cảm tạ suông rồi đi.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Hắn chỉ sai đường, làm ngươi cũng mất thời gian.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "lac_duong_cung_dan_su",
                "name": "Lạc Đường Cùng Đan Sư",
                "percent": 2,
                "durationMs": 360000
              }
            ]
          },
          {
            "weight": 15,
            "text": "Hắn dạy ngươi chút hỏa hầu luyện đan.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 45
              }
            ]
          }
        ]
      },
      {
        "id": "xem_lo_dan",
        "label": "Xem lò đan của hắn",
        "outcomes": [
          {
            "weight": 45,
            "text": "Mùi đan hương giúp linh lực lưu chuyển.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.12
              }
            ]
          },
          {
            "weight": 35,
            "text": "Lò đan chỉ đang nguội lạnh.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Một tia khói đan làm ngươi ho sặc.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -7
              }
            ]
          }
        ]
      },
      {
        "id": "mua_dan",
        "label": "Mua đan dược thử vận",
        "outcomes": [
          {
            "weight": 50,
            "text": "Ngươi mua được đan dược thật.",
            "rewards": [
              {
                "type": "stones",
                "min": -180,
                "max": -80
              },
              {
                "type": "item",
                "id": "duong_khi_dan",
                "name": "Dưỡng Khí Đan",
                "min": 2,
                "max": 4
              }
            ]
          },
          {
            "weight": 30,
            "text": "Đan dược phẩm chất quá thấp.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Đan dược có tạp chất.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -6
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "am_phu_truc_co",
    "name": "Âm Phù Trúc Cổ",
    "world": "Nhân Giới",
    "rarity": "spirit",
    "type": "nhặt_được",
    "minRealmOrder": 3,
    "maxRealmOrder": 8,
    "description": "Trong rừng trúc cổ vang tiếng lá va nhau như phù văn thì thầm.",
    "choices": [
      {
        "id": "khac_che_phu_van",
        "label": "Khắc chép phù văn",
        "outcomes": [
          {
            "weight": 35,
            "text": "Ngươi chép được một đoạn âm phù.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 55
              }
            ]
          },
          {
            "weight": 30,
            "text": "Phù văn biến mất khi nhìn kỹ.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Âm thanh nhiễu loạn tâm thần.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "am_phu_nhieu_than",
                "name": "Âm Phù Nhiễu Thần",
                "percent": 3,
                "durationMs": 480000
              }
            ]
          },
          {
            "weight": 10,
            "text": "Một đoạn phù văn hóa thành phòng ngự.",
            "rewards": [
              {
                "type": "def",
                "min": 4,
                "max": 9
              }
            ]
          }
        ]
      },
      {
        "id": "chat_mot_dot_truc",
        "label": "Chặt một đốt trúc",
        "outcomes": [
          {
            "weight": 45,
            "text": "Đốt trúc có thể làm nguyên liệu.",
            "rewards": [
              {
                "type": "item",
                "id": "am_phu_truc",
                "name": "Âm Phù Trúc",
                "min": 1,
                "max": 2
              }
            ]
          },
          {
            "weight": 30,
            "text": "Trúc vỡ thành bụi.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Rừng trúc phản chấn, sinh lực giảm.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -10
              }
            ]
          }
        ]
      },
      {
        "id": "nghe_tieng_truc",
        "label": "Nghe tiếng trúc trong gió",
        "outcomes": [
          {
            "weight": 50,
            "text": "Gió trúc giúp tâm cảnh ổn định.",
            "rewards": [
              {
                "type": "buff",
                "id": "truc_am_dinh_than",
                "name": "Trúc Âm Định Thần",
                "stat": "cultivationSpeedBonus",
                "value": 0.07,
                "durationMs": 600000
              }
            ]
          },
          {
            "weight": 50,
            "text": "Chỉ là tiếng gió bình thường.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "nguoi_mo_ruou_linh",
    "name": "Người Mời Rượu Linh",
    "world": "Nhân Giới",
    "rarity": "spirit",
    "type": "gặp_người",
    "minRealmOrder": 2,
    "maxRealmOrder": 8,
    "description": "Một đạo sĩ say ngồi bên đá lớn, cười lớn mời ngươi uống một chén rượu linh.",
    "choices": [
      {
        "id": "uong_mot_chen",
        "label": "Uống một chén",
        "outcomes": [
          {
            "weight": 35,
            "text": "Rượu linh hóa thành linh lực nóng bỏng.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.2
              }
            ]
          },
          {
            "weight": 25,
            "text": "Rượu quá nhạt, chỉ ấm bụng.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Rượu quá mạnh làm chân khí hỗn loạn.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "tuy_linh_loan_khi",
                "name": "Túy Linh Loạn Khí",
                "percent": 4,
                "durationMs": 600000
              }
            ]
          },
          {
            "weight": 15,
            "text": "Rượu rèn khí huyết rất tốt.",
            "rewards": [
              {
                "type": "maxHp",
                "min": 8,
                "max": 16
              }
            ]
          }
        ]
      },
      {
        "id": "tu_choi",
        "label": "Từ chối khéo",
        "outcomes": [
          {
            "weight": 70,
            "text": "Đạo sĩ cười ha hả, không ép buộc.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 30,
            "text": "Hắn thưởng thức sự cẩn thận của ngươi.",
            "rewards": [
              {
                "type": "lifespan",
                "min": 1,
                "max": 3
              }
            ]
          }
        ]
      },
      {
        "id": "moi_lai",
        "label": "Mời lại hắn một chén trà",
        "outcomes": [
          {
            "weight": 45,
            "text": "Hắn vui vẻ chỉ điểm ngươi một câu.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.13
              }
            ]
          },
          {
            "weight": 35,
            "text": "Hắn chê trà nhạt rồi ngủ mất.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Hơi rượu phả vào mặt làm ngươi choáng.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -5
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "son_dong_ngoc_gian",
    "name": "Sơn Động Ngọc Giản",
    "world": "Nhân Giới",
    "rarity": "spirit",
    "type": "thăm_dò",
    "minRealmOrder": 4,
    "maxRealmOrder": 8,
    "description": "Trong sơn động có một ngọc giản nứt đặt trên bệ đá phủ bụi.",
    "choices": [
      {
        "id": "doc_ngoc_gian",
        "label": "Dùng thần thức đọc ngọc giản",
        "outcomes": [
          {
            "weight": 35,
            "text": "Ngọc giản truyền ra một phần tâm pháp.",
            "rewards": [
              {
                "type": "technique",
                "id": "thanh_tam_quyet_tan_thien",
                "name": "Thanh Tâm Quyết Tàn Thiên"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Nội dung đã mất quá nửa.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 35
              }
            ]
          },
          {
            "weight": 25,
            "text": "Thần thức bị phản chấn.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -12
              }
            ]
          },
          {
            "weight": 15,
            "text": "Ngươi lĩnh ngộ được một lượng tu vi lớn.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.22
              }
            ]
          }
        ]
      },
      {
        "id": "cat_ngoc_gian",
        "label": "Cất ngọc giản mang về",
        "outcomes": [
          {
            "weight": 55,
            "text": "Ngươi thu được ngọc giản nứt.",
            "rewards": [
              {
                "type": "item",
                "id": "ngoc_gian_nut",
                "name": "Ngọc Giản Nứt",
                "min": 1,
                "max": 1
              }
            ]
          },
          {
            "weight": 30,
            "text": "Ngọc giản vỡ vụn khi chạm tay.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 15,
            "text": "Một đạo cấm chế nhỏ kích hoạt.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -7
              }
            ]
          }
        ]
      },
      {
        "id": "kiem_tra_be_da",
        "label": "Kiểm tra bệ đá",
        "outcomes": [
          {
            "weight": 50,
            "text": "Dưới bệ đá giấu linh thạch.",
            "rewards": [
              {
                "type": "stones",
                "min": 160,
                "max": 420
              }
            ]
          },
          {
            "weight": 50,
            "text": "Bệ đá rỗng không.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "mo_co_vo_danh",
    "name": "Mộ Cổ Vô Danh",
    "world": "Nhân Giới",
    "rarity": "mystic",
    "type": "thăm_dò",
    "minRealmOrder": 4,
    "maxRealmOrder": 8,
    "description": "Một cổ mộ nứt ra sau trận mưa lớn, bên trong tỏa khí tức cổ xưa.",
    "choices": [
      {
        "id": "vao_mo",
        "label": "Vào cổ mộ",
        "outcomes": [
          {
            "weight": 30,
            "text": "Ngươi tìm được di vật tu sĩ cổ.",
            "rewards": [
              {
                "type": "item",
                "id": "di_vat_tu_si_co",
                "name": "Di Vật Tu Sĩ Cổ",
                "min": 1,
                "max": 1
              },
              {
                "type": "stones",
                "min": 300,
                "max": 800
              }
            ]
          },
          {
            "weight": 25,
            "text": "Cổ mộ trống rỗng ngoài bụi đất.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 30,
            "text": "Âm khí trong mộ ăn mòn thọ nguyên.",
            "rewards": [
              {
                "type": "lifespan",
                "min": -8,
                "max": -3
              }
            ]
          },
          {
            "weight": 15,
            "text": "Một đạo tàn niệm truyền pháp quyết.",
            "rewards": [
              {
                "type": "technique",
                "id": "co_tuc_tam_kinh_tan_quyen",
                "name": "Cổ Tức Tâm Kinh Tàn Quyển"
              }
            ]
          }
        ]
      },
      {
        "id": "te_bai",
        "label": "Tế bái trước mộ",
        "outcomes": [
          {
            "weight": 40,
            "text": "Tàn niệm hài lòng, ban chút cơ duyên.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.35
              }
            ]
          },
          {
            "weight": 30,
            "text": "Gió lạnh thổi qua, không có gì.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Bái sai lễ, âm khí phản phệ.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -18
              }
            ]
          },
          {
            "weight": 10,
            "text": "Ngươi được tăng một chút thọ nguyên.",
            "rewards": [
              {
                "type": "lifespan",
                "min": 3,
                "max": 8
              }
            ]
          }
        ]
      },
      {
        "id": "lap_dat_lai",
        "label": "Lấp đất rời đi",
        "outcomes": [
          {
            "weight": 60,
            "text": "Ngươi không động vào nhân quả người chết.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 40,
            "text": "Đất mộ tỏa linh quang cảm tạ.",
            "rewards": [
              {
                "type": "def",
                "min": 5,
                "max": 12
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "thien_lôi_nhat_tuyen",
    "name": "Thiên Lôi Nhất Tuyến",
    "world": "Nhân Giới",
    "rarity": "mystic",
    "type": "thiên_tượng",
    "minRealmOrder": 5,
    "maxRealmOrder": 8,
    "description": "Một tia lôi quang nhỏ đánh xuống cách ngươi không xa, đất đá cháy thành màu xanh tím.",
    "choices": [
      {
        "id": "dan_loi_luyen_the",
        "label": "Dẫn lôi luyện thể",
        "outcomes": [
          {
            "weight": 30,
            "text": "Lôi khí rèn thể, khí huyết tăng mạnh.",
            "rewards": [
              {
                "type": "maxHp",
                "min": 15,
                "max": 35
              },
              {
                "type": "atk",
                "min": 4,
                "max": 10
              }
            ]
          },
          {
            "weight": 20,
            "text": "Lôi khí quá yếu, không có hiệu quả.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 35,
            "text": "Lôi khí phản phệ làm ngươi trọng thương.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -25
              }
            ]
          },
          {
            "weight": 15,
            "text": "Ngươi ngộ được lôi ý công kích.",
            "rewards": [
              {
                "type": "martialSkill",
                "id": "nhat_tuyen_loi_chi",
                "name": "Nhất Tuyến Lôi Chỉ"
              }
            ]
          }
        ]
      },
      {
        "id": "nhat_loi_thach",
        "label": "Nhặt lôi thạch",
        "outcomes": [
          {
            "weight": 45,
            "text": "Ngươi nhặt được lôi thạch còn nóng.",
            "rewards": [
              {
                "type": "item",
                "id": "loi_thach_nho",
                "name": "Lôi Thạch Nhỏ",
                "min": 1,
                "max": 2
              }
            ]
          },
          {
            "weight": 30,
            "text": "Lôi thạch đã hóa tro.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Dư lôi giật vào tay.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -14
              }
            ]
          }
        ]
      },
      {
        "id": "tranh_xa",
        "label": "Tránh xa thiên uy",
        "outcomes": [
          {
            "weight": 75,
            "text": "Ngươi giữ được an toàn.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Xa xa cảm nhận lôi ý, tâm thần chấn động.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.12
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "ao_anh_tien_lo",
    "name": "Ảo Ảnh Tiên Lộ",
    "world": "Nhân Giới",
    "rarity": "mystic",
    "type": "tâm_ma",
    "minRealmOrder": 5,
    "maxRealmOrder": 8,
    "description": "Trước mắt ngươi hiện ra một con đường sáng lên tận mây, hai bên có tiếng gọi mơ hồ.",
    "choices": [
      {
        "id": "buoc_len",
        "label": "Bước lên tiên lộ",
        "outcomes": [
          {
            "weight": 30,
            "text": "Ngươi vượt qua ảo cảnh, tu vi tăng vọt.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.42
              }
            ]
          },
          {
            "weight": 25,
            "text": "Đường sáng tan biến dưới chân.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 30,
            "text": "Ảo cảnh nghiền ép tâm thần.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "tien_lo_me_tam",
                "name": "Tiên Lộ Mê Tâm",
                "percent": 5,
                "durationMs": 900000
              }
            ]
          },
          {
            "weight": 15,
            "text": "Ngươi giữ được một tia tiên vận phòng thân.",
            "rewards": [
              {
                "type": "def",
                "min": 8,
                "max": 18
              }
            ]
          }
        ]
      },
      {
        "id": "ngoi_xuong_pha_ao",
        "label": "Ngồi xuống phá ảo",
        "outcomes": [
          {
            "weight": 40,
            "text": "Bản tâm kiên định, tâm cảnh tăng mạnh.",
            "rewards": [
              {
                "type": "buff",
                "id": "dao_tam_kien_dinh",
                "name": "Đạo Tâm Kiên Định",
                "stat": "cultivationSpeedBonus",
                "value": 0.15,
                "durationMs": 900000
              }
            ]
          },
          {
            "weight": 35,
            "text": "Ảo cảnh tự tan, không lưu lại gì.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Phá ảo thất bại, sinh lực hao tổn.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -16
              }
            ]
          }
        ]
      },
      {
        "id": "goi_lon",
        "label": "Lớn tiếng quát phá",
        "outcomes": [
          {
            "weight": 35,
            "text": "Tiếng quát phá tan mê chướng.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.18
              }
            ]
          },
          {
            "weight": 40,
            "text": "Không có ai đáp lại.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Tiếng vọng phản chấn vào thần hồn.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -12
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "linh_ho_hoa_nguyet",
    "name": "Linh Hồ Hóa Nguyệt",
    "world": "Nhân Giới",
    "rarity": "mystic",
    "type": "gặp_thú",
    "minRealmOrder": 4,
    "maxRealmOrder": 8,
    "description": "Một con linh hồ bạc ngồi dưới trăng, đuôi phản chiếu nguyệt hoa như sương trắng.",
    "choices": [
      {
        "id": "ket_thien_duyen",
        "label": "Kết thiện duyên với linh hồ",
        "outcomes": [
          {
            "weight": 35,
            "text": "Linh hồ để lại một sợi nguyệt mao.",
            "rewards": [
              {
                "type": "item",
                "id": "nguyet_ho_mao",
                "name": "Nguyệt Hồ Mao",
                "min": 1,
                "max": 1
              }
            ]
          },
          {
            "weight": 25,
            "text": "Linh hồ nhìn ngươi rồi biến mất.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Nguyệt hoa mê hoặc làm ngươi hao tổn tâm thần.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "nguyet_hoa_me_than",
                "name": "Nguyệt Hoa Mê Thần",
                "percent": 4,
                "durationMs": 720000
              }
            ]
          },
          {
            "weight": 15,
            "text": "Nguyệt quang nhập thể, tăng thọ nguyên.",
            "rewards": [
              {
                "type": "lifespan",
                "min": 5,
                "max": 12
              }
            ]
          }
        ]
      },
      {
        "id": "di_theo_ho",
        "label": "Đi theo linh hồ",
        "outcomes": [
          {
            "weight": 35,
            "text": "Nó dẫn ngươi tới một bụi linh dược quý.",
            "rewards": [
              {
                "type": "item",
                "id": "nguyet_quang_thao",
                "name": "Nguyệt Quang Thảo",
                "min": 1,
                "max": 2
              }
            ]
          },
          {
            "weight": 35,
            "text": "Nó biến mất trong màn sương.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 30,
            "text": "Ngươi lạc đường dưới ánh trăng.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "lac_trong_nguyet_suong",
                "name": "Lạc Trong Nguyệt Sương",
                "percent": 3,
                "durationMs": 600000
              }
            ]
          }
        ]
      },
      {
        "id": "quan_tuong_duoi_trang",
        "label": "Quan tưởng dưới trăng",
        "outcomes": [
          {
            "weight": 45,
            "text": "Nguyệt hoa giúp tu vi tinh tiến.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.28
              }
            ]
          },
          {
            "weight": 35,
            "text": "Mây che trăng, cơ duyên tan biến.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Âm hàn nhập thể.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -10
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "van_tu_co_quyen",
    "name": "Vân Tự Cổ Quyển",
    "world": "Nhân Giới",
    "rarity": "mystic",
    "type": "nhặt_được",
    "minRealmOrder": 5,
    "maxRealmOrder": 8,
    "description": "Một quyển sách mây trắng hiện trên không trung, chữ viết tụ tán không ngừng.",
    "choices": [
      {
        "id": "doc_ngay",
        "label": "Đọc ngay khi chữ còn hiện",
        "outcomes": [
          {
            "weight": 30,
            "text": "Ngươi lĩnh ngộ được một phần cổ quyết.",
            "rewards": [
              {
                "type": "technique",
                "id": "van_tu_co_quyet",
                "name": "Vân Tự Cổ Quyết"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Chữ mây tản mất trước khi đọc xong.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 60
              }
            ]
          },
          {
            "weight": 30,
            "text": "Chữ cổ quá nặng, phản chấn thần thức.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -18
              }
            ]
          },
          {
            "weight": 15,
            "text": "Một dòng chữ hóa thành tu vi tinh thuần.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.38
              }
            ]
          }
        ]
      },
      {
        "id": "chep_lai",
        "label": "Chép lại từng chữ",
        "outcomes": [
          {
            "weight": 45,
            "text": "Ngươi chép được tàn trang.",
            "rewards": [
              {
                "type": "item",
                "id": "van_tu_tan_trang",
                "name": "Vân Tự Tàn Trang",
                "min": 1,
                "max": 1
              }
            ]
          },
          {
            "weight": 30,
            "text": "Mực vừa chạm giấy đã bay mất.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 25,
            "text": "Cố chép quá lâu làm tâm thần mệt mỏi.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "than_thuc_met_moi",
                "name": "Thần Thức Mệt Mỏi",
                "percent": 3,
                "durationMs": 720000
              }
            ]
          }
        ]
      },
      {
        "id": "dung_linh_luc_giu_lai",
        "label": "Dùng linh lực giữ sách mây",
        "outcomes": [
          {
            "weight": 35,
            "text": "Ngươi giữ được một đoạn chữ quý.",
            "rewards": [
              {
                "type": "techniqueExp",
                "amount": 100
              }
            ]
          },
          {
            "weight": 35,
            "text": "Linh lực xuyên qua mây, không hiệu quả.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 30,
            "text": "Sách mây hút ngược linh lực.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "bi_hut_linh_luc",
                "name": "Bị Hút Linh Lực",
                "percent": 4,
                "durationMs": 600000
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "huyen_hoang_nhat_khi",
    "name": "Huyền Hoàng Nhất Khí",
    "world": "Nhân Giới",
    "rarity": "destiny",
    "type": "thiên_mệnh",
    "minRealmOrder": 6,
    "maxRealmOrder": 8,
    "description": "Trong khoảnh khắc nhập định, trời đất như dừng lại. Một tia Huyền Hoàng khí xuất hiện trước mi tâm ngươi.",
    "choices": [
      {
        "id": "hap_thu",
        "label": "Cưỡng ép hấp thu",
        "outcomes": [
          {
            "weight": 25,
            "text": "Ngươi luyện hóa được một phần Huyền Hoàng khí, căn cơ đại tiến.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.8
              },
              {
                "type": "maxHp",
                "min": 25,
                "max": 60
              },
              {
                "type": "atk",
                "min": 8,
                "max": 20
              }
            ]
          },
          {
            "weight": 20,
            "text": "Huyền Hoàng khí không nhận chủ, lặng lẽ tan đi.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 35,
            "text": "Khí tức quá nặng, kinh mạch chấn động dữ dội.",
            "rewards": [
              {
                "type": "hpPercent",
                "value": -35
              },
              {
                "type": "temporaryPenalty",
                "id": "huyen_hoang_phan_chan",
                "name": "Huyền Hoàng Phản Chấn",
                "percent": 8,
                "durationMs": 1200000
              }
            ]
          },
          {
            "weight": 20,
            "text": "Ngươi giữ được một tia bản nguyên trong đan điền.",
            "rewards": [
              {
                "type": "lifespan",
                "min": 10,
                "max": 25
              },
              {
                "type": "def",
                "min": 10,
                "max": 25
              }
            ]
          }
        ]
      },
      {
        "id": "thuan_the_dan_nhap",
        "label": "Thuận thế dẫn nhập chậm rãi",
        "outcomes": [
          {
            "weight": 35,
            "text": "Một tia khí dung nhập căn cơ, ổn định mà lâu dài.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.45
              },
              {
                "type": "lifespan",
                "min": 8,
                "max": 18
              }
            ]
          },
          {
            "weight": 30,
            "text": "Khí tức chỉ xoay quanh rồi biến mất.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 20,
            "text": "Dẫn khí thất bại, tâm thần hao tổn.",
            "rewards": [
              {
                "type": "temporaryPenalty",
                "id": "dan_khi_that_bai",
                "name": "Dẫn Khí Thất Bại",
                "percent": 5,
                "durationMs": 900000
              }
            ]
          },
          {
            "weight": 15,
            "text": "Ngươi ngộ ra Huyền Hoàng Tức.",
            "rewards": [
              {
                "type": "technique",
                "id": "huyen_hoang_tuc",
                "name": "Huyền Hoàng Tức"
              }
            ]
          }
        ]
      },
      {
        "id": "khong_tham",
        "label": "Không tham, chắp tay tiễn cơ duyên",
        "outcomes": [
          {
            "weight": 40,
            "text": "Thiên địa ghi nhận đạo tâm của ngươi.",
            "rewards": [
              {
                "type": "buff",
                "id": "thien_dia_ghi_nhan",
                "name": "Thiên Địa Ghi Nhận",
                "stat": "cultivationSpeedBonus",
                "value": 0.2,
                "durationMs": 1800000
              }
            ]
          },
          {
            "weight": 35,
            "text": "Cơ duyên đi qua, không để lại dấu vết.",
            "rewards": [
              {
                "type": "nothing"
              }
            ]
          },
          {
            "weight": 15,
            "text": "Một tia khí còn sót lại nhập thể.",
            "rewards": [
              {
                "type": "tuViPercent",
                "value": 0.25
              }
            ]
          },
          {
            "weight": 10,
            "text": "Ngươi được tăng thọ nguyên nhờ tránh đại nhân quả.",
            "rewards": [
              {
                "type": "lifespan",
                "min": 15,
                "max": 30
              }
            ]
          }
        ]
      }
    ]
  }
];

module.exports = {
  FORTUNE_RARITY,
  FORTUNE_REWARD_TYPES,
  FORTUNES,
};
