// ============================================
// CONFIG - SOUL SKILL SETS
// Luyện hồn: mỗi hệ gồm 1 luyện công + 3 vũ kỹ
// ============================================

const SOUL_SKILL_SETS = [
    {
        id: 'than_thuc',
        name: 'Thần Thức',
        desc: 'Cảm ứng và khống chế bằng thần thức.',
        cultivation: {
            id: 'thai_hu_than_giac_kinh',
            name: 'Thái Hư Thần Giác Kinh',
            type: 'cultivation',
            equipType: 'passive',
            desc: 'Giúp thần thức phân tán ra hàng dặm, quét sạch mọi nguy cơ tiềm tàng.',
            tags: ['perception', 'control', 'spirit_sense'],
        },
        martial: [
            {
                id: 'nhat_niem_thoi_dong',
                name: 'Nhất Niệm Thôi Động',
                type: 'martial',
                equipType: 'active',
                desc: 'Dùng ý niệm đẩy bay vật nặng mà không cần chạm tay.',
                tags: ['telekinesis', 'knockback', 'control'],
            },
            {
                id: 'huyen_anh_thien_trong',
                name: 'Huyễn Ảnh Thiên Trọng',
                type: 'martial',
                equipType: 'active',
                desc: 'Gây ảo giác cho địch, khiến chúng thấy bản thân phải chống lại trăm ngàn kẻ địch.',
                tags: ['illusion', 'confuse', 'control'],
            },
            {
                id: 'tam_hon_thuat',
                name: 'Tầm Hồn Thuật',
                type: 'martial',
                equipType: 'active',
                desc: 'Luyện đến cảnh giới cao, có thể cảm nhận vị trí của bất kỳ ai trong bán kính lớn.',
                tags: ['tracking', 'perception', 'reveal'],
            },
        ],
    },
    {
        id: 'ma_dong',
        name: 'Ma Đồng',
        desc: 'Công kích trực diện bằng nhãn thuật và tinh thần lực.',
        cultivation: {
            id: 'cuu_u_ma_dong_chan_kinh',
            name: 'Cửu U Ma Đồng Chân Kinh',
            type: 'cultivation',
            equipType: 'passive',
            desc: 'Luyện đôi mắt và thần hồn thành công cụ sát thương trực tiếp.',
            tags: ['eye_art', 'soul_attack', 'mental_power'],
        },
        martial: [
            {
                id: 'ma_nhan_khiep_phach',
                name: 'Ma Nhãn Khiếp Phách',
                type: 'martial',
                equipType: 'active',
                desc: 'Nhìn thẳng vào đối phương, làm chúng đông cứng vì sợ hãi, không thể di chuyển trong 3 giây.',
                tags: ['fear', 'stun', 'eye_art'],
            },
            {
                id: 'than_hon_thu',
                name: 'Thần Hồn Thứ',
                type: 'martial',
                equipType: 'active',
                desc: 'Ngưng thần thành một mũi kim vô hình, đâm thẳng vào thức hải địch, gây đau đớn đến ngất xỉu.',
                tags: ['soul_damage', 'spirit_pierce', 'disable'],
            },
            {
                id: 'toi_nguyen_thuat',
                name: 'Tồi Nguyên Thuật',
                type: 'martial',
                equipType: 'active',
                desc: 'Trực tiếp cướp phá nguyên thần của địch, khiến chúng mất ký ức và trí nhớ trong thời gian ngắn.',
                tags: ['debuff', 'memory_loss', 'soul_damage'],
            },
        ],
    },
];

module.exports = SOUL_SKILL_SETS;
