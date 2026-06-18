// ============================================
//  CORE - MARTIAL SKILL SERVICE
//  Logic đọc/nâng Vũ Kỹ
// ============================================

const MARTIAL_SKILL_CONFIG = require('../config/martialSkills');
const BODY_REALMS = require('../config/bodyRealms');
const progression = require('./progressionService');

function getMartialSkill(skillId) {
    return MARTIAL_SKILL_CONFIG.list.find(item => item.id === skillId) || null;
}

function createDefaultMartialSkills() {
    return {
        equipped: ['co_ban_kiem_quyet'],
        learned: {
            co_ban_kiem_quyet: {
                id: 'co_ban_kiem_quyet',
                rank: 1,
                phase: 1,
                exp: 0,
                maxExp: 100,
            },
        },
    };
}

function getLearnedMartialSkill(playerSkills, skillId) {
    if (!playerSkills || !playerSkills.learned) return null;
    return playerSkills.learned[skillId] || null;
}

function getMartialSkillInfo(playerSkills, skillId) {
    const skill = getMartialSkill(skillId);
    const learned = getLearnedMartialSkill(playerSkills, skillId);

    if (!skill || !learned) return null;

    const progressInfo = progression.getDisplayInfo(
        {
            id: MARTIAL_SKILL_CONFIG.id,
            name: MARTIAL_SKILL_CONFIG.name,
            phases: MARTIAL_SKILL_CONFIG.phases,
            ranks: BODY_REALMS.ranks.map(rank => ({
                ...rank,
                name: `${skill.name} - ${rank.name.replace('Thể', '').trim()}`,
            })),
        },
        learned
    );

    return {
        ...progressInfo,
        id: skill.id,
        name: skill.name,
        grade: skill.grade,
        type: skill.type,
        effects: skill.effects,
        description: skill.description,
    };
}

function canUpgradeMartialSkill(playerSkills, skillId, mainCultivation) {
    const learned = getLearnedMartialSkill(playerSkills, skillId);
    if (!learned) {
        return { ok: false, reason: 'Chưa học vũ kỹ này.' };
    }

    return progression.canUpgrade(
        {
            id: MARTIAL_SKILL_CONFIG.id,
            name: MARTIAL_SKILL_CONFIG.name,
            phases: MARTIAL_SKILL_CONFIG.phases,
            ranks: BODY_REALMS.ranks,
        },
        learned,
        mainCultivation
    );
}

function upgradeMartialSkill(playerSkills, skillId, mainCultivation) {
    const learned = getLearnedMartialSkill(playerSkills, skillId);
    if (!learned) {
        return { success: false, reason: 'Chưa học vũ kỹ này.' };
    }

    const result = progression.applyUpgrade(
        {
            id: MARTIAL_SKILL_CONFIG.id,
            name: MARTIAL_SKILL_CONFIG.name,
            phases: MARTIAL_SKILL_CONFIG.phases,
            ranks: BODY_REALMS.ranks,
        },
        learned,
        mainCultivation
    );

    if (!result.success) return result;

    playerSkills.learned[skillId] = {
        ...learned,
        ...result.progress,
    };

    return {
        success: true,
        skill: playerSkills.learned[skillId],
    };
}

module.exports = {
    getMartialSkill,
    createDefaultMartialSkills,
    getLearnedMartialSkill,
    getMartialSkillInfo,
    canUpgradeMartialSkill,
    upgradeMartialSkill,
};
