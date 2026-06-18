// ============================================
// CONFIG - BODY SKILL SETS
// Luyện thể: mỗi hệ gồm 1 luyện công + 3 vũ kỹ
// ============================================

const BODY_SKILL_SETS = [
    {
        id: 'dai_luc',
        name: 'Đại Lực',
        desc: 'Sức mạnh thuần túy, lấy lực phá pháp.',
        cultivation: {
            id: 'bat_cuc_hon_nguyen_kinh',
            name: 'Bát Cực Hỗn Nguyên Kinh',
            type: 'cultivation',
            equipType: 'passive',
            desc: 'Chú trọng rèn xương tủy và gân cốt, lấy sức mạnh thô bạo áp đảo vạn pháp.',
            tags: ['strength', 'body', 'physical_power'],
        },
        martial: [
            {
                id: 'dong_son_quyen',
                name: 'Động Sơn Quyền',
                type: 'martial',
                equipType: 'active',
                desc: 'Một quyền đánh ra có thể làm rung chuyển một ngọn núi nhỏ.',
                tags: ['heavy_hit', 'stun', 'physical'],
            },
            {
                id: 'bat_son_cu_dinh',
                name: 'Bạt Sơn Cử Đỉnh',
                type: 'martial',
                equipType: 'active',
                desc: 'Nắm chặt chân địch và quật mạnh xuống đất, tạo thành hố sâu.',
                tags: ['grab', 'slam', 'control'],
            },
            {
                id: 'thiet_son_khao',
                name: 'Thiết Sơn Kháo',
                type: 'martial',
                equipType: 'active',
                desc: 'Dùng vai va chạm, sức mạnh đẩy bay đối thủ dù chúng có phòng thủ cách mấy.',
                tags: ['knockback', 'charge', 'physical'],
            },
        ],
    },
    {
        id: 'bat_hu',
        name: 'Bất Hủ',
        desc: 'Phòng thủ và bền bỉ, càng đánh càng khó bị hạ gục.',
        cultivation: {
            id: 'van_kiep_bat_diet_the_kinh',
            name: 'Vạn Kiếp Bất Diệt Thể Kinh',
            type: 'cultivation',
            equipType: 'passive',
            desc: 'Rèn luyện da thịt thành đồng thau, máu thành thủy ngân, chịu đựng tối đa.',
            tags: ['defense', 'endurance', 'body'],
        },
        martial: [
            {
                id: 'kim_chung_trao',
                name: 'Kim Chung Tráo',
                type: 'martial',
                equipType: 'active',
                desc: 'Tạo ra lớp sáng hình chuông che chở toàn thân, vô hình nhưng cứng như thép.',
                tags: ['shield', 'defense', 'barrier'],
            },
            {
                id: 'tram_thiet_dao',
                name: 'Trảm Thiết Đao',
                type: 'martial',
                equipType: 'active',
                desc: 'Dùng thân thể làm đao, lao về phía địch để chém, bản thân không bị thương.',
                tags: ['charge', 'slash', 'body_weapon'],
            },
            {
                id: 'van_niem_quy_son',
                name: 'Vạn Niệm Quy Sơn',
                type: 'martial',
                equipType: 'active',
                desc: 'Đứng yên một chỗ, mọi đòn tấn công đều bị hấp thụ và phản đòn trở lại.',
                tags: ['counter', 'absorb', 'reflect'],
            },
        ],
    },
];

module.exports = BODY_SKILL_SETS;
