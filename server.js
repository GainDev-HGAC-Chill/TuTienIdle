const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const realmService = require('./core/realmService');
const currencyService = require('./core/currencyService');
const bodyService = require('./core/bodyService');
const soulService = require('./core/soulService');
const skillService = require('./core/skillService');
const spiritRootService = require('./core/spiritRootService');
const pillService = require('./core/pillService');
const alchemyService = require('./core/alchemyService');
const caveService = require('./core/caveService');
const herbGardenService = require('./core/herbGardenService');

const REALM_CONFIG = require('./config/realms');
const PILLS = require('./config/pills');
const HERBS = require('./config/herbs');
const RECIPES = require('./config/pillRecipes');
const SKILL_RULES = require('./config/skillRules');
const ELEMENTS = require('./config/spiritRootElements');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'players.json');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'frontend')));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function loadPlayers() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (err) {
        console.error('Lỗi đọc data:', err);
    }
    return {};
}

function savePlayers(players) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
}

function addInventoryItem(player, id, name, amount, extra = {}) {
    if (!player.inventory) player.inventory = [];
    const quality = extra.quality || null;
    const basePillId = extra.basePillId || null;
    const existing = player.inventory.find(item => (
        item.id === id &&
        (item.quality || null) === quality &&
        (item.basePillId || null) === basePillId
    ));
    if (existing) {
        existing.amount += amount;
        return existing;
    }
    const item = { id, name, amount, ...extra };
    player.inventory.push(item);
    return item;
}

function removeInventoryItem(player, id, amount = 1) {
    if (!player.inventory) player.inventory = [];
    const index = player.inventory.findIndex(item => item.id === id);
    if (index < 0) return false;
    if (player.inventory[index].amount < amount) return false;
    player.inventory[index].amount -= amount;
    if (player.inventory[index].amount <= 0) player.inventory.splice(index, 1);
    return true;
}

function ensurePlayerShape(player) {
    if (!player.cultivation || player.cultivation.realm !== undefined) {
        player.cultivation = realmService.createDefaultCultivation();
    }
    if (!player.bodyCultivation) player.bodyCultivation = bodyService.createDefaultBodyCultivation();
    if (!player.soulCultivation) player.soulCultivation = soulService.createDefaultSoulCultivation();
    if (!player.skills) player.skills = skillService.createDefaultSkillState();
    if (!player.alchemy) player.alchemy = alchemyService.createDefaultAlchemy();
    if (!player.spiritRoot) player.spiritRoot = spiritRootService.createDefaultSpiritRoot();
    if (!player.spiritRoots) player.spiritRoots = [];
    if (!player.combat) {
        player.combat = { hp: 100, maxHp: 100, atk: 10, def: 5, speed: 5, critRate: 0.05, critDmg: 1.5 };
    }
    if (!player.inventory) player.inventory = [];
    if (!player.stats) player.stats = { totalKills: 0, totalTuVi: 0, playTime: 0 };
    if (!player.currentZone) player.currentZone = 'rung_thap';
    if (player.autoFight === undefined) player.autoFight = true;
    if (!player.lastTick) player.lastTick = Date.now();
    if (!player.createdAt) player.createdAt = Date.now();
    if (!player.lastSave) player.lastSave = Date.now();
    if (!player.permanentBonuses) player.permanentBonuses = { atk: 0, def: 0, tuViBonus: 0 };
    currencyService.ensureCurrencies(player);
    caveService.ensureCave(player);
    pillService.ensurePillState(player);
}

function createNewPlayer(username) {
    const player = {
        username,
        createdAt: Date.now(),
        lastSave: Date.now(),
        lastTick: Date.now(),
        cultivation: realmService.createDefaultCultivation(),
        bodyCultivation: bodyService.createDefaultBodyCultivation(),
        soulCultivation: soulService.createDefaultSoulCultivation(),
        skills: skillService.createDefaultSkillState(),
        alchemy: alchemyService.createDefaultAlchemy(),
        spiritRoot: spiritRootService.createDefaultSpiritRoot(),
        spiritRoots: [],
        combat: { hp: 100, maxHp: 100, atk: 10, def: 5, speed: 5, critRate: 0.05, critDmg: 1.5 },
        inventory: [],
        currentZone: 'rung_thap',
        autoFight: true,
        stats: { totalKills: 0, totalTuVi: 0, playTime: 0 },
        permanentBonuses: { atk: 0, def: 0, tuViBonus: 0 },
    };
    caveService.ensureCave(player);
    currencyService.ensureCurrencies(player);
    pillService.ensurePillState(player);
    return player;
}

function getRealmNeed(cultivation) {
    const info = realmService.getCurrentRealmInfo(cultivation);
    if (!info) return 100;
    const world = REALM_CONFIG.worlds.find(w => w.id === info.worldId);
    const worldMul = world ? world.order : 1;
    const realmMul = (info.realmIndex || 0) + 1;
    const stageMul = info.stage || 1;
    const typeMul = info.progressType === 'minor' ? 20 : 1;
    if (info.progressType === 'rank_limit' || info.progressType === 'unique_realm') return Infinity;
    return Math.floor(100 * Math.pow(2.2, worldMul - 1) * realmMul * stageMul * typeMul);
}

function advanceCultivationOnce(player) {
    const next = realmService.getNextRealmInfo(player.cultivation);
    if (!next || next.type === 'max' || next.type === 'dao_entry') return false;

    if (next.type === 'stage' || next.type === 'minor_stage') {
        player.cultivation.stage = next.stage;
    } else if (next.type === 'realm') {
        player.cultivation.realmIndex = next.realmIndex;
        player.cultivation.stage = next.stage;
    } else if (next.type === 'world') {
        player.cultivation.world = next.worldId;
        player.cultivation.realmIndex = 0;
        player.cultivation.stage = 1;
    }

    player.cultivation.tuVi = 0;
    player.cultivation.maxTuVi = getRealmNeed(player.cultivation);
    player.combat.maxHp += 10;
    player.combat.hp = player.combat.maxHp;
    player.combat.atk += 2;
    player.combat.def += 1;
    return true;
}

function updateCultivation(player) {
    player.cultivation.maxTuVi = getRealmNeed(player.cultivation);
    while (player.cultivation.tuVi >= player.cultivation.maxTuVi) {
        if (!advanceCultivationOnce(player)) break;
    }
}

const ZONES = {
    rung_thap: { name: 'Rừng Thấp', monster: 'Yêu Lang', hp: 50, atk: 5, def: 2, tuViReward: 10 },
    rung_trung: { name: 'Rừng Trung', monster: 'Hắc Hổ', hp: 200, atk: 15, def: 8, tuViReward: 40 },
    dong_ma: { name: 'Động Ma', monster: 'Ma Nhân', hp: 500, atk: 30, def: 15, tuViReward: 100 },
};

function fightMonster(player) {
    const zone = ZONES[player.currentZone] || ZONES.rung_thap;
    const atk = player.combat.atk + (player.permanentBonuses.atk || 0);
    const def = player.combat.def + (player.permanentBonuses.def || 0);
    const damage = Math.max(1, atk - zone.def / 2);
    const killChance = Math.min(0.95, damage / (zone.hp + def));

    if (Math.random() < killChance || damage >= zone.hp) {
        player.stats.totalKills += 1;
        player.cultivation.tuVi += zone.tuViReward;
        player.stats.totalTuVi += zone.tuViReward;
        currencyService.addCurrency(player, 'so_linh_thach', Math.max(1, Math.floor(zone.tuViReward / 10)));
    }
}

function getTuViGainPerSecond(player) {
    const pillEffects = pillService.getActivePillEffects(player);
    const caveAura = Math.floor((player.cave?.resources?.aura || 0) / 1000);
    const base = 1 + caveAura;
    const bonusPercent = (player.permanentBonuses.tuViBonus || 0) + (pillEffects.cultivationSpeedPercent || 0) + (pillEffects.tuViBonusPercent || 0);
    return base * (1 + bonusPercent / 100);
}

function processGameTick(player) {
    ensurePlayerShape(player);
    caveService.processCave(player);
    pillService.clearExpiredPillBuffs(player);

    const now = Date.now();
    const deltaSecondsRaw = Math.floor((now - player.lastTick) / 1000);
    if (deltaSecondsRaw <= 0) return;

    const ticks = Math.min(deltaSecondsRaw, 60 * 60); // test: tối đa 1 giờ offline cho vòng tu luyện chính
    player.lastTick = now;

    const tuViGain = getTuViGainPerSecond(player) * ticks;
    player.cultivation.tuVi += tuViGain;
    player.stats.totalTuVi += tuViGain;
    player.stats.playTime += ticks;

    if (player.autoFight) {
        const fightTicks = Math.min(ticks, 120);
        for (let i = 0; i < fightTicks; i++) fightMonster(player);
    }

    updateCultivation(player);
}

function getPlayerOrCreate(players, username) {
    if (!players[username]) players[username] = createNewPlayer(username);
    ensurePlayerShape(players[username]);
    return players[username];
}

function sanitizePlayer(player) {
    ensurePlayerShape(player);
    const realmInfo = realmService.getCurrentRealmInfo(player.cultivation);
    const bodyInfo = bodyService.getBodyInfo(player.bodyCultivation);
    const soulInfo = soulService.getSoulInfo(player.soulCultivation);
    const spiritRootDisplay = spiritRootService.getSpiritRootDisplay(player.spiritRoot);
    const pillEffects = pillService.getActivePillEffects(player);

    const cultivationCompat = {
        ...player.cultivation,
        realmName: realmInfo?.displayName || 'Không rõ',
        level: player.cultivation.stage || 1,
        exp: player.cultivation.tuVi || 0,
        maxExp: player.cultivation.maxTuVi || getRealmNeed(player.cultivation),
        info: realmInfo,
    };

    return {
        username: player.username,
        cultivation: cultivationCompat,
        bodyCultivation: { ...player.bodyCultivation, info: bodyInfo },
        soulCultivation: { ...player.soulCultivation, info: soulInfo },
        spiritRoot: player.spiritRoot,
        spiritRootDisplay,
        spiritRoots: player.spiritRoots,
        skills: player.skills,
        alchemy: player.alchemy,
        cave: {
            ...player.cave,
            auraPerSecond: caveService.getAuraPerSecond(player.cave),
            maxAura: caveService.getMaxAura(player.cave),
            alchemyBonus: caveService.getAlchemyRoomBonus(player.cave),
        },
        herbPlots: herbGardenService.getPlots(player),
        activePillBuffs: player.activePillBuffs,
        breakthroughPillLock: player.breakthroughPillLock,
        pillEffects,
        combat: {
            hp: Math.round(player.combat.hp),
            maxHp: player.combat.maxHp,
            atk: Math.round(player.combat.atk + (player.permanentBonuses.atk || 0) + (pillEffects.atkPercent || 0)),
            def: Math.round(player.combat.def + (player.permanentBonuses.def || 0) + (pillEffects.defPercent || 0)),
            speed: Math.round(player.combat.speed + (pillEffects.speedPercent || 0)),
            critRate: player.combat.critRate,
            critDmg: player.combat.critDmg,
        },
        currencies: player.currencies,
        gold: Math.round(player.currencies?.so_linh_thach || 0),
        inventory: player.inventory,
        currentZone: player.currentZone,
        zoneName: ZONES[player.currentZone]?.name || 'Unknown',
        autoFight: player.autoFight,
        stats: player.stats,
        permanentBonuses: player.permanentBonuses,
    };
}

function sendPlayer(res, players, player, extra = {}) {
    player.lastSave = Date.now();
    savePlayers(players);
    res.json({ success: true, player: sanitizePlayer(player), ...extra });
}

app.get('/api/meta', (req, res) => {
    res.json({
        success: true,
        counts: {
            worlds: REALM_CONFIG.worlds.length,
            elements: ELEMENTS.elements.length,
            skills: skillService.getAllSkills().length,
            pills: PILLS.length,
            herbs: HERBS.length,
            recipes: RECIPES.length,
        },
        zones: ZONES,
        skillRules: SKILL_RULES,
    });
});

app.get('/api/player/:username', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    processGameTick(player);
    sendPlayer(res, players, player);
});

app.post('/api/player/:username', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    if (req.body.currentZone) player.currentZone = req.body.currentZone;
    if (req.body.autoFight !== undefined) player.autoFight = !!req.body.autoFight;
    processGameTick(player);
    sendPlayer(res, players, player);
});

app.post('/api/player/:username/zone', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const zone = req.body.zone;
    const normalized = zone === 'rừng_thấp' ? 'rung_thap' : zone === 'rừng_trung' ? 'rung_trung' : zone === 'động_ma' ? 'dong_ma' : zone;
    if (!ZONES[normalized]) return res.status(400).json({ success: false, error: 'Invalid zone' });
    player.currentZone = normalized;
    sendPlayer(res, players, player, { message: `Đã chuyển đến ${ZONES[normalized].name}` });
});

app.get('/api/skills', (req, res) => {
    res.json({ success: true, skills: skillService.getAllSkills(), rules: SKILL_RULES });
});

app.post('/api/player/:username/skill/learn', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const result = skillService.learnSkill(player, req.body.skillId);
    if (!result.success) return res.status(400).json(result);
    sendPlayer(res, players, player, { result });
});

app.post('/api/player/:username/skill/equip', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const result = skillService.equipSkill(player, req.body.skillId);
    if (!result.success) return res.status(400).json(result);
    sendPlayer(res, players, player, { result });
});

app.post('/api/player/:username/skill/unequip', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const result = skillService.unequipSkill(player, req.body.skillId);
    sendPlayer(res, players, player, { result });
});

app.get('/api/pills', (req, res) => {
    const { world, realm, category } = req.query;
    let pills = PILLS;
    if (world) pills = pills.filter(p => p.world === world);
    if (realm) pills = pills.filter(p => p.realm === realm);
    if (category) pills = pills.filter(p => p.category === category);
    res.json({ success: true, pills });
});

app.get('/api/recipes', (req, res) => {
    const { world, realm } = req.query;
    let recipes = RECIPES;
    if (world) recipes = recipes.filter(r => r.world === world);
    if (realm) recipes = recipes.filter(r => r.realm === realm);
    res.json({ success: true, recipes });
});

app.post('/api/player/:username/alchemy/craft', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const result = alchemyService.craftPill(player, req.body.recipeId);
    if (!result.success) return res.status(400).json(result);
    sendPlayer(res, players, player, { result });
});

app.post('/api/player/:username/pill/use', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const result = pillService.usePill(player, req.body.itemId || req.body.pillId);
    if (!result.success) return res.status(400).json(result);
    sendPlayer(res, players, player, { result });
});

// Giữ endpoint cũ /use để UI click item vẫn không chết.
app.post('/api/player/:username/use', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const itemId = req.body.itemId;
    const item = player.inventory.find(i => i.id === itemId);
    if (!item) return res.status(400).json({ success: false, error: 'Item not found' });

    if (item.basePillId || pillService.getPill(item.id)) {
        const result = pillService.usePill(player, item.id);
        if (!result.success) return res.status(400).json({ success: false, error: result.reason });
        return sendPlayer(res, players, player, { message: result.message, result });
    }

    return res.status(400).json({ success: false, error: 'Item này chưa có logic sử dụng.' });
});

app.post('/api/player/:username/breakthrough/result', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const result = pillService.onBreakthroughResult(player, !!req.body.success);
    sendPlayer(res, players, player, { result });
});

app.get('/api/player/:username/cave', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    caveService.processCave(player);
    sendPlayer(res, players, player);
});

app.post('/api/player/:username/cave/upgrade', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const result = caveService.upgradeBuilding(player, req.body.buildingId);
    if (!result.success) return res.status(400).json(result);
    sendPlayer(res, players, player, { result });
});

app.get('/api/herbs', (req, res) => {
    const { world, realm } = req.query;
    let herbs = HERBS;
    if (world) herbs = herbs.filter(h => h.world === world);
    if (realm) herbs = herbs.filter(h => h.realm === realm || h.realm === null);
    res.json({ success: true, herbs });
});

app.post('/api/player/:username/herb/plant', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const result = herbGardenService.plantHerb(player, Number(req.body.plotIndex || 0), req.body.herbId);
    if (!result.success) return res.status(400).json(result);
    sendPlayer(res, players, player, { result });
});

app.post('/api/player/:username/herb/harvest', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const result = herbGardenService.harvestHerb(player, Number(req.body.plotIndex || 0));
    if (!result.success) return res.status(400).json(result);
    sendPlayer(res, players, player, { result });
});

app.post('/api/dev/:username/grant', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    const element = req.body.element || 'kim';
    if (!player.spiritRoots.includes(element)) player.spiritRoots.push(element);
    player.spiritRoot = { element, evolution: 'normal', awakenedAt: Date.now(), history: ['dev_grant'] };

    for (const herb of HERBS.slice(0, Number(req.body.herbCount || 20))) {
        addInventoryItem(player, herb.id, herb.name, Number(req.body.herbAmount || 50));
    }

    const sampleRecipes = RECIPES.slice(0, 8);
    for (const recipe of sampleRecipes) {
        const pill = PILLS.find(p => p.id === recipe.pillId);
        if (pill) addInventoryItem(player, pill.id, pill.name, 3);
    }

    sendPlayer(res, players, player, { message: 'Đã cấp dữ liệu test.', sampleRecipes });
});

app.post('/api/dev/:username/set-cultivation', (req, res) => {
    const players = loadPlayers();
    const player = getPlayerOrCreate(players, req.params.username);
    player.cultivation.world = req.body.world || player.cultivation.world;
    player.cultivation.realmIndex = Number(req.body.realmIndex ?? player.cultivation.realmIndex);
    player.cultivation.stage = Number(req.body.stage ?? player.cultivation.stage);
    player.cultivation.tuVi = Number(req.body.tuVi ?? player.cultivation.tuVi);
    player.cultivation.maxTuVi = getRealmNeed(player.cultivation);
    sendPlayer(res, players, player);
});

app.listen(PORT, () => {
    console.log(`Tu Tien Idle test server: http://localhost:${PORT}`);
    console.log(`Data file: ${DATA_FILE}`);
    console.log(`Meta: http://localhost:${PORT}/api/meta`);
});

const players = loadPlayers();
if (!players.demo) {
    players.demo = createNewPlayer('demo');
    savePlayers(players);
}
