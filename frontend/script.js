// ============================================
//  CLIENT - Tu Tien Idle
// ============================================
const API_BASE = 'http://localhost:3000/api';

let currentUser = null;
let playerData = null;
let updateInterval = null;
let logMessages = [];

// ============================================
//  DOM Elements
// ============================================
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

const playerNameEl = document.getElementById('player-name');
const realmEl = document.getElementById('realm');
const levelEl = document.getElementById('level');
const expBar = document.getElementById('exp-bar');
const expText = document.getElementById('exp-text');
const hpBar = document.getElementById('hp-bar');
const hpText = document.getElementById('hp-text');
const atkEl = document.getElementById('atk');
const defEl = document.getElementById('def');
const goldEl = document.getElementById('gold');
const zoneNameEl = document.getElementById('zone-name');
const zoneMonsterEl = document.getElementById('zone-monster');
const toggleFightBtn = document.getElementById('toggle-fight');
const zonePrevBtn = document.getElementById('zone-prev');
const zoneNextBtn = document.getElementById('zone-next');
const logContainer = document.getElementById('log-container');
const inventoryContainer = document.getElementById('inventory-container');
const buffsContainer = document.getElementById('buffs-container');
const fortuneContainer = document.getElementById('fortune-container');

// ============================================
//  ZONE LIST
// ============================================
const ZONES = [
    { id: 'rừng_thấp', name: 'Rừng Thấp', monster: 'Yêu Lang' },
    { id: 'rừng_trung', name: 'Rừng Trung', monster: 'Hắc Hổ' },
    { id: 'động_ma', name: 'Động Ma', monster: 'Ma Nhân' },
];

// ============================================
//  LOGIN
// ============================================
loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Vui lòng nhập đạo hiệu!');
        return;
    }
    await login(username);
});

usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

async function login(username) {
    try {
        const response = await fetch(`${API_BASE}/player/${username}`);
        const data = await response.json();
        
        if (data.success) {
            currentUser = username;
            playerData = data.player;
            showGame();
            startGameLoop();
            addLog('🌟 Chào mừng trở lại, Đạo hữu!', 'fortune');
        } else {
            alert('Lỗi: ' + data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Không thể kết nối đến server!');
    }
}

logoutBtn.addEventListener('click', () => {
    clearInterval(updateInterval);
    currentUser = null;
    playerData = null;
    loginScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    usernameInput.value = '';
    logMessages = [];
});

function showGame() {
    loginScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    playerNameEl.textContent = `🌿 ${currentUser}`;
}

// ============================================
//  GAME LOOP
// ============================================
function startGameLoop() {
    // Fetch data mỗi 2 giây
    updateInterval = setInterval(fetchPlayerData, 2000);
    fetchPlayerData(); // fetch ngay lập tức
}

async function fetchPlayerData() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/player/${currentUser}`);
        const data = await response.json();
        
        if (data.success) {
            const oldZone = playerData?.currentZone;
            playerData = data.player;
            updateUI();
            
            // Check change zone
            if (oldZone && oldZone !== playerData.currentZone) {
                addLog(`🗺️ Đã đến ${playerData.zoneName}`, 'combat');
            }
            
            // Check fortune mới
            if (playerData.lastFortune) {
                const fortune = playerData.lastFortune;
                addLog(`💎 ${fortune.name}: ${fortune.message}`, 'fortune');
                // Clear để không hiển thị lại
                playerData.lastFortune = null;
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// ============================================
//  UPDATE UI
// ============================================
function updateUI() {
    if (!playerData) return;
    
    // Cảnh giới
    realmEl.textContent = playerData.cultivation.realmName || 'Luyện Khí';
    levelEl.textContent = playerData.cultivation.level || 1;
    
    // EXP
    const expPercent = playerData.cultivation.maxExp > 0 
        ? (playerData.cultivation.exp / playerData.cultivation.maxExp * 100) 
        : 0;
    expBar.style.width = Math.min(100, expPercent) + '%';
    expText.textContent = `${Math.round(playerData.cultivation.exp)} / ${Math.round(playerData.cultivation.maxExp)}`;
    
    // HP
    const hpPercent = playerData.combat.maxHp > 0 
        ? (playerData.combat.hp / playerData.combat.maxHp * 100) 
        : 0;
    hpBar.style.width = Math.min(100, hpPercent) + '%';
    hpText.textContent = `${Math.round(playerData.combat.hp)} / ${Math.round(playerData.combat.maxHp)}`;
    
    // Stats
    atkEl.textContent = Math.round(playerData.combat.atk || 10);
    defEl.textContent = Math.round(playerData.combat.def || 5);
    goldEl.textContent = Math.round(playerData.gold || 0);
    
    // Zone
    const zone = ZONES.find(z => z.id === playerData.currentZone) || ZONES[0];
    zoneNameEl.textContent = zone.name;
    zoneMonsterEl.textContent = `⚔️ ${zone.monster}`;
    
    // Auto fight button
    toggleFightBtn.textContent = playerData.autoFight ? '⏸ Tạm Dừng' : '▶ Tiếp Tục';
    toggleFightBtn.style.borderColor = playerData.autoFight ? 'rgba(100,200,100,0.3)' : 'rgba(200,100,100,0.3)';
    
    // Inventory
    updateInventory();
    
    // Buffs
    updateBuffs();
    
    // Fortune
    updateFortune();
}

function updateInventory() {
    inventoryContainer.innerHTML = '';
    
    if (!playerData.inventory || playerData.inventory.length === 0) {
        inventoryContainer.innerHTML = '<div class="empty-inventory">Túi đồ trống</div>';
        return;
    }
    
    playerData.inventory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.innerHTML = `${item.name} <span class="amount">x${item.amount}</span>`;
        div.title = `Click để sử dụng ${item.name}`;
        
        // Cho phép click sử dụng (trừ linh thạch)
        if (item.id !== 'linh_thach') {
            div.style.cursor = 'pointer';
            div.addEventListener('click', () => useItem(item.id));
        }
        
        inventoryContainer.appendChild(div);
    });
}

function updateBuffs() {
    buffsContainer.innerHTML = '';
    
    if (!playerData.buffs || playerData.buffs.length === 0) {
        buffsContainer.innerHTML = '<div class="empty-buffs">Không có buff</div>';
        return;
    }
    
    playerData.buffs.forEach(buff => {
        const div = document.createElement('div');
        div.className = 'buff-item';
        const name = buff.name || 'Buff';
        div.innerHTML = `${name} <span class="timer">⏱${buff.remaining || 0}s</span>`;
        buffsContainer.appendChild(div);
    });
}

function updateFortune() {
    fortuneContainer.innerHTML = '';
    
    if (!playerData.fortunesEncountered || playerData.fortunesEncountered.length === 0) {
        fortuneContainer.innerHTML = '<div class="empty-fortune">Chưa có kỳ ngộ</div>';
        return;
    }
    
    // Chỉ hiển thị 3 kỳ ngộ gần nhất
    const fortunes = playerData.fortunesEncountered.slice(-3);
    fortunes.forEach(fortuneId => {
        const div = document.createElement('div');
        div.className = 'fortune-item';
        // Lấy tên từ config (đơn giản hóa)
        const names = {
            'hat_giống': '🌱 Hạt Giống Thần Bí',
            'lien_hoa': '🌸 Liên Hoa Ngàn Năm',
            'tuyet_son': '❄️ Bí Tịch Tuyết Sơn',
            'cuu_huynh_de': '🤝 Cứu Huynh Đệ'
        };
        div.textContent = names[fortuneId] || fortuneId;
        fortuneContainer.appendChild(div);
    });
}

// ============================================
//  LOG SYSTEM
// ============================================
function addLog(message, type = 'normal') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] ${message}`;
    logContainer.appendChild(entry);
    
    // Giới hạn log
    while (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.firstChild);
    }
    
    logContainer.scrollTop = logContainer.scrollHeight;
}

// ============================================
//  GAME ACTIONS
// ============================================
// Toggle auto fight
toggleFightBtn.addEventListener('click', async () => {
    if (!currentUser || !playerData) return;
    
    try {
        const response = await fetch(`${API_BASE}/player/${currentUser}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                autoFight: !playerData.autoFight
            })
        });
        const data = await response.json();
        if (data.success) {
            playerData = data.player;
            updateUI();
            addLog(playerData.autoFight ? '▶ Tiếp tục tu luyện' : '⏸ Tạm dừng tu luyện', 'combat');
        }
    } catch (error) {
        console.error('Toggle fight error:', error);
    }
});

// Change zone
async function changeZone(direction) {
    if (!currentUser || !playerData) return;
    
    const currentIndex = ZONES.findIndex(z => z.id === playerData.currentZone);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= ZONES.length) newIndex = ZONES.length - 1;
    
    if (newIndex === currentIndex) {
        addLog('🚫 Đây là ranh giới cuối cùng!', 'normal');
        return;
    }
    
    const newZone = ZONES[newIndex];
    
    try {
        const response = await fetch(`${API_BASE}/player/${currentUser}/zone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zone: newZone.id })
        });
        const data = await response.json();
        if (data.success) {
            playerData = data.player;
            updateUI();
            addLog(`🗺️ Di chuyển đến ${newZone.name}`, 'combat');
        }
    } catch (error) {
        console.error('Zone change error:', error);
    }
}

zonePrevBtn.addEventListener('click', () => changeZone(-1));
zoneNextBtn.addEventListener('click', () => changeZone(1));

// Use item
async function useItem(itemId) {
    if (!currentUser || !playerData) return;
    
    try {
        const response = await fetch(`${API_BASE}/player/${currentUser}/use`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId })
        });
        const data = await response.json();
        if (data.success) {
            playerData = data.player;
            updateUI();
            addLog(`💊 ${data.message}`, 'item');
        } else {
            addLog(`❌ ${data.error || 'Không thể sử dụng vật phẩm'}`, 'normal');
        }
    } catch (error) {
        console.error('Use item error:', error);
    }
}

// ============================================
//  KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    if (!playerData) return;
    
    switch(e.key) {
        case ' ':
            e.preventDefault();
            toggleFightBtn.click();
            break;
        case 'ArrowLeft':
            zonePrevBtn.click();
            break;
        case 'ArrowRight':
            zoneNextBtn.click();
            break;
    }
});

// ============================================
//  AUTO SAVE (mỗi 30 giây)
// ============================================
setInterval(async () => {
    if (!currentUser || !playerData) return;
    
    try {
        await fetch(`${API_BASE}/player/${currentUser}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentZone: playerData.currentZone,
                autoFight: playerData.autoFight
            })
        });
        console.log('💾 Auto save success');
    } catch (error) {
        console.error('Auto save error:', error);
    }
}, 30000);

console.log('🧘 Tu Tiên Idle loaded!');
console.log('📖 Shortcuts: Space = Pause, ← → = Change Zone');