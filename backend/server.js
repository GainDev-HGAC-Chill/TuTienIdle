const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// ============================================
//  DATA STORAGE (JSON file based)
// ============================================
const DATA_FILE = path.join(__dirname, 'data', 'players.json');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Đọc dữ liệu
function loadPlayers() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Lỗi đọc data:', e);
    }
    return {};
}

// Ghi dữ liệu
function savePlayers(players) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
    } catch (e) {
        console.error('Lỗi ghi data:', e);
    }
}

// ============================================
//  GAME CONFIG
// ============================================
const GAME_CONFIG = {
    // Tốc độ tu luyện (số lần tick/giây)
    TICK_RATE: 1, // 1 lần/giây
    
    // Cảnh giới
    REALMS: [
        { name: 'Luyện Khí', levels: 9, expPerLevel: 100 },
        { name: 'Trúc Cơ', levels: 9, expPerLevel: 500 },
        { name: 'Kim Đan', levels: 9, expPerLevel: 2000 },
        { name: 'Nguyên Anh', levels: 9, expPerLevel: 8000 },
        { name: 'Hóa Thần', levels: 9, expPerLevel: 30000 },
    ],
    
    // Quái vật theo khu vực
    MONSTERS: {
        'rừng_thấp': {
            name: 'Yêu Lang',
            level: 1,
            hp: 50,
            atk: 5,
            def: 2,
            expReward: 10,
            goldReward: 5,
            dropRate: 0.3,
            drops: [
                { id: 'linh_thach', name: 'Linh Thạch', rate: 0.5, amount: [1, 3] },
                { id: 'da_lang', name: 'Răng Nanh', rate: 0.3, amount: [1, 2] },
                { id: 'huyet_thao', name: 'Huyết Thảo', rate: 0.1, amount: [1, 1] },
            ]
        },
        'rừng_trung': {
            name: 'Hắc Hổ',
            level: 5,
            hp: 200,
            atk: 15,
            def: 8,
            expReward: 40,
            goldReward: 20,
            dropRate: 0.4,
            drops: [
                { id: 'linh_thach', name: 'Linh Thạch', rate: 0.6, amount: [2, 5] },
                { id: 'ho_cot', name: 'Hổ Cốt', rate: 0.2, amount: [1, 2] },
                { id: 'truong_sinh_thao', name: 'Trường Sinh Thảo', rate: 0.08, amount: [1, 1] },
            ]
        },
        'động_ma': {
            name: 'Ma Nhân',
            level: 10,
            hp: 500,
            atk: 30,
            def: 15,
            expReward: 100,
            goldReward: 50,
            dropRate: 0.5,
            drops: [
                { id: 'linh_thach', name: 'Linh Thạch', rate: 0.7, amount: [5, 15] },
                { id: 'ma_ngoc', name: 'Ma Ngọc', rate: 0.15, amount: [1, 3] },
                { id: 'kim_dan_phap', name: 'Kim Đan Pháp', rate: 0.05, amount: [1, 1] },
            ]
        }
    },
    
    // Kỳ ngộ (random events)
    FORTUNES: [
        {
            id: 'hat_giống',
            name: '🌱 Hạt Giống Thần Bí',
            desc: 'Ngươi nhặt được một hạt giống phát sáng. Trồng nó sẽ cho linh dược quý!',
            condition: (player) => player.inventory.some(i => i.id === 'hat_giống'),
            effect: (player) => {
                // Thêm buff tăng exp 20% trong 60s
                player.buffs.push({
                    id: 'hat_giống_buff',
                    name: 'Linh Khí Bùng Nổ',
                    expBonus: 0.2,
                    duration: 60,
                    remaining: 60
                });
                return '🌱 Hạt giống nảy mầm! Linh khí quanh ngươi bỗng dưng đậm đặc! (+20% exp trong 60s)';
            }
        },
        {
            id: 'lien_hoa',
            name: '🌸 Liên Hoa Ngàn Năm',
            desc: 'Ngươi bắt gặp một đóa liên hoa trắng muốt trên đầm lầy. Nuốt vào sẽ tăng cảnh giới!',
            condition: (player) => player.cultivation.realm < 2, // Chỉ dùng được dưới Kim Đan
            effect: (player) => {
                player.cultivation.exp += 200;
                return '🌸 Nuốt Liên Hoa, linh lực tuôn trào! Tăng 200 điểm tu vi!';
            }
        },
        {
            id: 'tuyet_son',
            name: '❄️ Bí Tịch Tuyết Sơn',
            desc: 'Trong hang động băng giá, ngươi tìm thấy cuốn bí tịch cổ!',
            condition: (player) => true,
            effect: (player) => {
                // Tăng sức mạnh vĩnh viễn
                player.permanentBonuses.atk += 10;
                return '❄️ Tu luyện 【Tuyết Sơn Thần Quyết】, công kích tăng vĩnh viễn +10!';
            }
        },
        {
            id: 'cuu_huynh_de',
            name: '🤝 Cứu Huynh Đệ',
            desc: 'Ngươi cứu một tu sĩ bị thương. Hắn cảm kích tặng ngươi bảo bối!',
            condition: (player) => true,
            effect: (player) => {
                const goldBonus = 100 + Math.floor(Math.random() * 200);
                player.gold += goldBonus;
                return `🤝 Huynh đệ cảm kích tặng ${goldBonus} linh thạch!`;
            }
        }
    ]
};

// ============================================
//  PLAYER MANAGER
// ============================================
function createNewPlayer(username) {
    return {
        username: username,
        createdAt: Date.now(),
        lastSave: Date.now(),
        lastTick: Date.now(),
        
        // Cảnh giới
        cultivation: {
            realm: 0, // index trong REALMS
            level: 1,
            exp: 0,
            maxExp: 100,
        },
        
        // Chiến đấu
        combat: {
            hp: 100,
            maxHp: 100,
            atk: 10,
            def: 5,
            critRate: 0.05,
            critDmg: 1.5,
        },
        
        // Tài nguyên
        gold: 0,
        inventory: [], // [{id, name, amount}]
        
        // Khu vực hiện tại
        currentZone: 'rừng_thấp',
        autoFight: true,
        
        // Buffs
        buffs: [],
        
        // Kỳ ngộ đã gặp
        fortunesEncountered: [],
        
        // Thống kê
        stats: {
            totalKills: 0,
            totalExp: 0,
            totalGold: 0,
            playTime: 0, // seconds
        },
        
        // Phần thưởng vĩnh viễn
        permanentBonuses: {
            atk: 0,
            def: 0,
            expBonus: 0,
            goldBonus: 0,
        }
    };
}

// Tính max EXP cho level hiện tại
function getMaxExp(realmIndex, level) {
    const config = GAME_CONFIG.REALMS[realmIndex];
    if (!config) return Infinity;
    return config.expPerLevel * level;
}

// Cập nhật thông tin cảnh giới
function updateCultivation(player) {
    const config = GAME_CONFIG.REALMS[player.cultivation.realm];
    if (!config) return;
    
    const maxExp = getMaxExp(player.cultivation.realm, player.cultivation.level);
    player.cultivation.maxExp = maxExp;
    
    // Check đột phá level
    while (player.cultivation.exp >= maxExp) {
        player.cultivation.exp -= maxExp;
        player.cultivation.level++;
        
        // Tăng stats khi lên level
        player.combat.maxHp += 10;
        player.combat.hp = player.combat.maxHp;
        player.combat.atk += 3;
        player.combat.def += 1;
        
        // Kiểm tra đột phá đại cảnh giới
        if (player.cultivation.level > config.levels) {
            if (player.cultivation.realm < GAME_CONFIG.REALMS.length - 1) {
                player.cultivation.realm++;
                player.cultivation.level = 1;
                player.cultivation.exp = 0;
                // Đột phá thưởng lớn
                player.combat.maxHp += 50;
                player.combat.hp = player.combat.maxHp;
                player.combat.atk += 15;
                player.combat.def += 5;
            } else {
                // Đã đạt cảnh giới tối cao
                player.cultivation.level = config.levels;
                player.cultivation.exp = 0;
                break;
            }
        }
        
        const newMaxExp = getMaxExp(player.cultivation.realm, player.cultivation.level);
        player.cultivation.maxExp = newMaxExp;
    }
}

// ============================================
//  GAME LOGIC - TICK
// ============================================
function processGameTick(player) {
    if (!player.autoFight) return;
    
    const now = Date.now();
    const deltaTime = (now - player.lastTick) / 1000; // seconds
    
    // Giới hạn tick để tránh exploit
    if (deltaTime > 60) {
        player.lastTick = now;
        return;
    }
    
    // Số lần tick (mỗi giây 1 lần)
    const ticks = Math.floor(deltaTime);
    if (ticks < 1) return;
    
    player.lastTick = now;
    
    for (let i = 0; i < ticks && i < 10; i++) {
        // 1. Tự động đánh quái
        fightMonster(player);
        
        // 2. Tăng trải nghiệm cơ bản (ngồi tu luyện)
        const baseExp = 0.5; // mỗi giây
        const expBonus = 1 + player.permanentBonuses.expBonus + getBuffBonus(player, 'expBonus');
        player.cultivation.exp += baseExp * expBonus;
        player.stats.totalExp += baseExp * expBonus;
        
        // 3. Tự động hồi phục (nếu không đánh nhau)
        if (player.combat.hp < player.combat.maxHp) {
            player.combat.hp = Math.min(player.combat.hp + 0.5, player.combat.maxHp);
        }
        
        // 4. Cập nhật buff
        updateBuffs(player);
        
        // 5. Kiểm tra kỳ ngộ (random)
        checkFortune(player);
        
        // 6. Cập nhật cảnh giới
        updateCultivation(player);
        
        // 7. Cộng dồn thời gian chơi
        player.stats.playTime += 1;
    }
}

// Hàm đánh quái
function fightMonster(player) {
    const zone = GAME_CONFIG.MONSTERS[player.currentZone];
    if (!zone) return;
    
    // Tính sức mạnh
    const atk = player.combat.atk + player.permanentBonuses.atk;
    const def = player.combat.def + player.permanentBonuses.def;
    
    // Tấn công quái
    let damage = Math.max(1, atk - zone.def / 2);
    
    // Crit
    if (Math.random() < player.combat.critRate) {
        damage *= player.combat.critDmg;
    }
    
    // Giảm HP quái (trong bộ nhớ, không lưu state)
    // Mỗi tick giết 1 con (đơn giản hóa)
    const killChance = damage / (zone.hp + def);
    
    if (Math.random() < killChance || damage > zone.hp) {
        // Giết được quái
        const expGain = zone.expReward * (1 + player.permanentBonuses.expBonus);
        const goldGain = zone.goldReward * (1 + player.permanentBonuses.goldBonus);
        
        player.cultivation.exp += expGain;
        player.gold += goldGain;
        player.stats.totalKills += 1;
        player.stats.totalGold += goldGain;
        
        // Rơi đồ
        if (Math.random() < zone.dropRate) {
            const drop = zone.drops[Math.floor(Math.random() * zone.drops.length)];
            if (Math.random() < drop.rate) {
                const amount = drop.amount[0] + Math.floor(Math.random() * (drop.amount[1] - drop.amount[0] + 1));
                addToInventory(player, drop.id, drop.name, amount);
            }
        }
    }
}

// Hàm quản lý inventory
function addToInventory(player, id, name, amount) {
    const existing = player.inventory.find(item => item.id === id);
    if (existing) {
        existing.amount += amount;
    } else {
        player.inventory.push({ id, name, amount });
    }
}

// Hàm quản lý buffs
function updateBuffs(player) {
    player.buffs = player.buffs.filter(buff => {
        buff.remaining -= 1;
        return buff.remaining > 0;
    });
}

function getBuffBonus(player, stat) {
    let total = 0;
    player.buffs.forEach(buff => {
        if (buff[stat]) total += buff[stat];
    });
    return total;
}

// Hàm kiểm tra kỳ ngộ
function checkFortune(player) {
    // 5% mỗi tick (1s) gặp kỳ ngộ
    if (Math.random() < 0.05) {
        // Lọc các kỳ ngộ chưa gặp
        const available = GAME_CONFIG.FORTUNES.filter(f => 
            !player.fortunesEncountered.includes(f.id) && f.condition(player)
        );
        
        if (available.length > 0) {
            const fortune = available[Math.floor(Math.random() * available.length)];
            const message = fortune.effect(player);
            player.fortunesEncountered.push(fortune.id);
            
            // Lưu lại để hiển thị cho client
            player.lastFortune = {
                name: fortune.name,
                message: message,
                time: Date.now()
            };
        }
    }
}

// ============================================
//  API ENDPOINTS
// ============================================

// Lấy state người chơi
app.get('/api/player/:username', (req, res) => {
    const players = loadPlayers();
    const username = req.params.username;
    
    if (!players[username]) {
        // Tạo mới
        players[username] = createNewPlayer(username);
        savePlayers(players);
    }
    
    const player = players[username];
    
    // Process ticks khi fetch
    processGameTick(player);
    savePlayers(players);
    
    // Trả về data (ẩn một số thông tin nhạy cảm)
    res.json({
        success: true,
        player: sanitizePlayer(player)
    });
});

// Lưu state (có thể dùng khi người chơi offline)
app.post('/api/player/:username', (req, res) => {
    const players = loadPlayers();
    const username = req.params.username;
    const clientData = req.body;
    
    if (!players[username]) {
        return res.status(404).json({ success: false, error: 'Player not found' });
    }
    
    // Merge dữ liệu từ client (chỉ cho phép update một số field)
    const player = players[username];
    
    if (clientData.currentZone) player.currentZone = clientData.currentZone;
    if (clientData.autoFight !== undefined) player.autoFight = clientData.autoFight;
    
    // Process tick
    processGameTick(player);
    
    savePlayers(players);
    
    res.json({
        success: true,
        player: sanitizePlayer(player)
    });
});

// Đổi khu vực
app.post('/api/player/:username/zone', (req, res) => {
    const players = loadPlayers();
    const username = req.params.username;
    const { zone } = req.body;
    
    if (!players[username]) {
        return res.status(404).json({ success: false, error: 'Player not found' });
    }
    
    if (!GAME_CONFIG.MONSTERS[zone]) {
        return res.status(400).json({ success: false, error: 'Invalid zone' });
    }
    
    const player = players[username];
    player.currentZone = zone;
    
    savePlayers(players);
    
    res.json({
        success: true,
        message: `Đã chuyển đến ${GAME_CONFIG.MONSTERS[zone].name}`,
        player: sanitizePlayer(player)
    });
});

// Sử dụng vật phẩm
app.post('/api/player/:username/use', (req, res) => {
    const players = loadPlayers();
    const username = req.params.username;
    const { itemId, amount = 1 } = req.body;
    
    if (!players[username]) {
        return res.status(404).json({ success: false, error: 'Player not found' });
    }
    
    const player = players[username];
    const itemIndex = player.inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) {
        return res.status(400).json({ success: false, error: 'Item not found' });
    }
    
    const item = player.inventory[itemIndex];
    
    // Xử lý sử dụng item
    let message = '';
    switch (item.id) {
        case 'huyet_thao':
            player.combat.hp = Math.min(player.combat.hp + 20, player.combat.maxHp);
            message = 'Dùng Huyết Thảo, hồi phục 20 HP!';
            break;
        case 'truong_sinh_thao':
            player.combat.hp = Math.min(player.combat.hp + 50, player.combat.maxHp);
            message = 'Dùng Trường Sinh Thảo, hồi phục 50 HP!';
            break;
        case 'kim_dan_phap':
            player.cultivation.exp += 100;
            message = 'Dùng Kim Đan Pháp, tăng 100 điểm tu vi!';
            break;
        default:
            return res.status(400).json({ success: false, error: 'Cannot use this item' });
    }
    
    // Giảm số lượng
    item.amount -= amount;
    if (item.amount <= 0) {
        player.inventory.splice(itemIndex, 1);
    }
    
    savePlayers(players);
    
    res.json({
        success: true,
        message: message,
        player: sanitizePlayer(player)
    });
});

// Sanitize player data (loại bỏ dữ liệu nhạy cảm)
function sanitizePlayer(player) {
    return {
        username: player.username,
        cultivation: player.cultivation,
        combat: {
            hp: Math.round(player.combat.hp),
            maxHp: player.combat.maxHp,
            atk: player.combat.atk + player.permanentBonuses.atk,
            def: player.combat.def + player.permanentBonuses.def,
            critRate: player.combat.critRate,
            critDmg: player.combat.critDmg,
        },
        gold: Math.round(player.gold),
        inventory: player.inventory,
        currentZone: player.currentZone,
        autoFight: player.autoFight,
        buffs: player.buffs,
        stats: player.stats,
        lastFortune: player.lastFortune || null,
        permanentBonuses: player.permanentBonuses,
        // Thêm tên zone
        zoneName: GAME_CONFIG.MONSTERS[player.currentZone]?.name || 'Unknown',
    };
}

// ============================================
//  START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 Tu Tien Idle Server chạy tại http://localhost:${PORT}`);
    console.log(`📁 Data file: ${DATA_FILE}`);
});

// Tạo player mẫu nếu chưa có
const players = loadPlayers();
if (!players['demo']) {
    players['demo'] = createNewPlayer('demo');
    savePlayers(players);
    console.log('✅ Đã tạo player demo');
}