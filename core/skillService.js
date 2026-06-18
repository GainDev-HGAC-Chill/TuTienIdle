// ============================================
// CORE - SKILL SERVICE
// Đọc skill, kiểm tra học/trang bị skill
// ============================================

const SKILL_RULES = require('../config/skillRules');
const ELEMENT_SKILL_SETS = require('../config/elementSkillSets');
const BODY_SKILL_SETS = require('../config/bodySkillSets');
const SOUL_SKILL_SETS = require('../config/soulSkillSets');

function flattenElementSkills() {
    const skills = [];
    for (const set of ELEMENT_SKILL_SETS) {
        skills.push({ ...set.cultivation, group: 'element', element: set.element, elementName: set.name });
        skills.push({ ...set.martial, group: 'element', element: set.element, elementName: set.name });
        skills.push({ ...set.divine, group: 'element', element: set.element, elementName: set.name });
    }
    return skills;
}

function flattenBodySkills() {
    const skills = [];
    for (const set of BODY_SKILL_SETS) {
        skills.push({ ...set.cultivation, group: 'body', bodyType: set.id, bodyName: set.name });
        for (const skill of set.martial) {
            skills.push({ ...skill, group: 'body', bodyType: set.id, bodyName: set.name });
        }
    }
    return skills;
}

function flattenSoulSkills() {
    const skills = [];
    for (const set of SOUL_SKILL_SETS) {
        skills.push({ ...set.cultivation, group: 'soul', soulType: set.id, soulName: set.name });
        for (const skill of set.martial) {
            skills.push({ ...skill, group: 'soul', soulType: set.id, soulName: set.name });
        }
    }
    return skills;
}

function getAllSkills() {
    return [
        ...flattenElementSkills(),
        ...flattenBodySkills(),
        ...flattenSoulSkills(),
    ];
}

function getSkill(skillId) {
    return getAllSkills().find(skill => skill.id === skillId) || null;
}

function getSkillsByElement(elementId) {
    return flattenElementSkills().filter(skill => skill.element === elementId);
}

function createDefaultSkillState() {
    return {
        learned: {},
        equippedMartial: [],
        equippedDivine: [],
    };
}

function playerHasSpiritRoot(player, elementId) {
    if (!elementId) return true;

    const roots = player.spiritRoots || player.spiritRoot || [];

    if (Array.isArray(roots)) {
        return roots.some(root => {
            if (typeof root === 'string') return root === elementId;
            return root.element === elementId || root.id === elementId;
        });
    }

    if (typeof roots === 'object') {
        return Boolean(roots[elementId]);
    }

    return false;
}

function canLearnSkill(player, skillId) {
    const skill = getSkill(skillId);
    if (!skill) return { ok: false, reason: 'Skill không tồn tại.' };

    if (skill.requiredSpiritRoot && !playerHasSpiritRoot(player, skill.requiredSpiritRoot)) {
        return {
            ok: false,
            reason: `Cần linh căn hệ ${skill.requiredSpiritRoot} để học ${skill.name}.`,
            requiredSpiritRoot: skill.requiredSpiritRoot,
        };
    }

    return { ok: true, skill };
}

function learnSkill(player, skillId) {
    if (!player.skills) player.skills = createDefaultSkillState();

    const check = canLearnSkill(player, skillId);
    if (!check.ok) {
        return { success: false, reason: check.reason };
    }

    if (!player.skills.learned[skillId]) {
        player.skills.learned[skillId] = {
            id: skillId,
            level: 1,
            exp: 0,
        };
    }

    return {
        success: true,
        skill: check.skill,
        learned: player.skills.learned[skillId],
    };
}

function hasLearnedSkill(player, skillId) {
    return Boolean(player.skills && player.skills.learned && player.skills.learned[skillId]);
}

function equipSkill(player, skillId) {
    if (!player.skills) player.skills = createDefaultSkillState();

    const skill = getSkill(skillId);
    if (!skill) return { success: false, reason: 'Skill không tồn tại.' };

    if (!hasLearnedSkill(player, skillId)) {
        return { success: false, reason: 'Chưa học skill này.' };
    }

    if (skill.type === SKILL_RULES.types.CULTIVATION) {
        return {
            success: true,
            message: 'Công pháp là passive, học xong tự có hiệu lực, không cần trang bị.',
        };
    }

    if (skill.type === SKILL_RULES.types.MARTIAL) {
        const slots = SKILL_RULES.slots.martial;
        if (!player.skills.equippedMartial.includes(skillId)) {
            if (player.skills.equippedMartial.length >= slots) {
                return { success: false, reason: `Vũ kỹ chỉ được trang bị tối đa ${slots} ô.` };
            }
            player.skills.equippedMartial.push(skillId);
        }
        return { success: true, skill };
    }

    if (skill.type === SKILL_RULES.types.DIVINE) {
        const slots = SKILL_RULES.slots.divine;
        if (!player.skills.equippedDivine.includes(skillId)) {
            if (player.skills.equippedDivine.length >= slots) {
                return { success: false, reason: `Thần thông chỉ được trang bị tối đa ${slots} ô.` };
            }
            player.skills.equippedDivine.push(skillId);
        }
        return { success: true, skill };
    }

    return { success: false, reason: 'Loại skill không hợp lệ.' };
}

function unequipSkill(player, skillId) {
    if (!player.skills) player.skills = createDefaultSkillState();

    player.skills.equippedMartial = player.skills.equippedMartial.filter(id => id !== skillId);
    player.skills.equippedDivine = player.skills.equippedDivine.filter(id => id !== skillId);

    return { success: true };
}

module.exports = {
    flattenElementSkills,
    flattenBodySkills,
    flattenSoulSkills,
    getAllSkills,
    getSkill,
    getSkillsByElement,
    createDefaultSkillState,
    playerHasSpiritRoot,
    canLearnSkill,
    learnSkill,
    hasLearnedSkill,
    equipSkill,
    unequipSkill,
};
