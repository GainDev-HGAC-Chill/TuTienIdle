const { transaction } = require('../db/mysql');
const repo = require('../repositories/cultivationArtRepository');
const playerRepo = require('../repositories/playerRepository');
const artManager = require('../config/cultivationArtManager');
const progression = require('../config/cultivationArtProgressionManager');

function bad(message, statusCode=400){const e=new Error(message);e.statusCode=statusCode;return e;}
function normalize(row){return {...row,art_level:Number(row.art_level),art_exp:Number(row.art_exp),proficiency:Number(row.proficiency)};}
function applyStoredExp(row, gainedExp){ let current=normalize(row), remaining=Math.max(0,Number(gainedExp)); while(current.art_level<progression.maxLevelPerGrade){const need=progression.requiredExp(current.category,current.grade,current.art_level);const missing=need-current.art_exp;if(remaining<missing){current.art_exp+=remaining;remaining=0;break;}remaining-=missing;current.art_exp=0;current.art_level+=1;} return {row:current,unused:remaining}; }
async function cultivate(playerId,artId,mode='one') { return transaction(async connection=>{const player=await playerRepo.findById(playerId,connection,true);if(!player)throw bad('Không tìm thấy đạo hữu.',404);const row=await repo.getOwnedArt(playerId,artId,connection,true);if(!row)throw bad('Đạo hữu chưa lĩnh ngộ công pháp này.');if(row.category==='than_thong')throw bad('Thần Thông chỉ tăng qua thi triển thực chiến.');if(Number(row.art_level)>=progression.maxLevelPerGrade)throw bad('Công pháp đã đạt cấp 100, cần đột phá phẩm.');const category=progression.getCategory(row.category);const resources=await repo.getResources(playerId,connection,true);const available=Number(resources[category.resource]||0);let spend=0,target=normalize(row);do{const need=progression.requiredExp(target.category,target.grade,target.art_level)-target.art_exp;if(available-spend<need)break;spend+=need;target=applyStoredExp(target,need).row;if(mode!=='max')break;}while(target.art_level<progression.maxLevelPerGrade);if(spend<=0)throw bad(`Không đủ ${category.resource}.`);if(!await repo.spendResource(playerId,category.resource,spend,connection))throw bad('Tài nguyên đã thay đổi, xin thử lại.');await repo.updateProgress(playerId,artId,target,connection);return {art:target,spent:spend,resource:category.resource};}); }
async function breakthrough(playerId,artId){return transaction(async connection=>{const player=await playerRepo.findById(playerId,connection,true);if(!player)throw bad('Không tìm thấy đạo hữu.',404);const row=await repo.getOwnedArt(playerId,artId,connection,true);if(!row)throw bad('Đạo hữu chưa lĩnh ngộ công pháp này.');if(Number(row.art_level)<progression.maxLevelPerGrade)throw bad('Công pháp chưa đạt cấp 100.');const grade=progression.getGrade(row.grade);if(!grade?.next)throw bad('Công pháp đã đạt Thiên phẩm viên mãn.');if(Number(player.main_realm_index||0)<grade.realmIndexRequired)throw bad('Cảnh giới chưa đủ để tiến giai Công Pháp.');const resources=await repo.getResources(playerId,connection,true);if(Number(player.spirit_stones||0)<grade.breakthroughStones)throw bad('Không đủ Linh Thạch.');if(Number(resources.cultivation_essence||0)<grade.breakthroughEssence)throw bad('Không đủ Tinh Hoa Công Pháp.');await connection.query('UPDATE players SET spirit_stones=spirit_stones-? WHERE id=?',[grade.breakthroughStones,playerId]);if(!await repo.spendResource(playerId,'cultivation_essence',grade.breakthroughEssence,connection))throw bad('Tinh Hoa Công Pháp đã thay đổi.');const next={...normalize(row),grade:grade.next,art_level:1,art_exp:0,proficiency:0};await repo.updateProgress(playerId,artId,next,connection);return {art:next,stonesSpent:grade.breakthroughStones,essenceSpent:grade.breakthroughEssence};});}
async function grantSpiritQi(connection,playerId,elapsed){const gain=Math.max(0,Math.floor(Number(elapsed)*progression.income.spiritQiPerSecond));if(gain)await repo.addResources(playerId,{spirit_qi:gain},connection);return gain;}
async function grantCombatResources(connection,playerId,wins,bodyExp=0){const battle=Math.max(0,Math.floor(Number(wins)*progression.income.battleIntentPerKill));const blood=Math.max(0,Math.floor(Number(wins)*progression.income.bloodQiPerKill+Number(bodyExp)*progression.income.bloodQiBodyExpRate));if(battle||blood)await repo.addResources(playerId,{battle_intent:battle,blood_qi:blood},connection);return {battleIntent:battle,bloodQi:blood};}
async function prepareDivineArt(connection,playerId){
  const equipped=await repo.getEquipped(playerId,connection);
  const slots=equipped.filter(x=>x.category==='than_thong').sort((a,b)=>Number(a.slot_index||1)-Number(b.slot_index||1));
  const contexts=[];
  for(const slot of slots){
    const owned=await repo.getOwnedArt(playerId,slot.art_id,connection);
    const art=artManager.get(slot.art_id);
    if(owned&&art)contexts.push({art,owned:normalize(owned),cooldown:0,slotIndex:Number(slot.slot_index||1)});
  }
  return contexts;
}
async function tryUseDivineArt(connection,player,contexts,baseDamage,currentMp,options={}){
  if(!Array.isArray(contexts)||!contexts.length||options.sealed)return {used:false,damage:baseDamage,mp:currentMp,effects:[]};
  for(const context of contexts){if(context.cooldown>0)context.cooldown-=1;}
  const ready=contexts.filter(c=>c.cooldown<=0).map(context=>({context,grade:artManager.getGrade(context.art.id,context.owned.grade)}))
    .filter(x=>x.grade&&currentMp>=Math.max(0,Number(x.grade.manaCost||0)));
  if(!ready.length||Math.random()>=progression.divineArt.activationChance)return {used:false,damage:baseDamage,mp:currentMp,effects:[]};
  const selected=ready[Math.floor(Math.random()*ready.length)]; const {context,grade}=selected;
  const mana=Math.max(0,Number(grade.manaCost||0)); const ratio=progression.levelRatio(context.owned.art_level);
  const affinity=context.art.rootId&&String(context.art.rootId)===String(player.spiritual_root_xml_id||player.spiritual_root_id)?1+Number(context.art.matchingBonusPercent||0)/100:1;
  const extra=Math.max(0,Math.floor(((Number(player.attack_value||0)*Number(grade.damage?.attackScale||0))+Number(grade.damage?.flatDamage||0))*ratio*affinity));
  await repo.addProficiency(player.id,context.art.id,progression.divineArt.proficiencyPerUse,connection);
  context.owned.proficiency+=progression.divineArt.proficiencyPerUse;
  while(context.owned.art_level<progression.maxLevelPerGrade){const need=progression.requiredExp('than_thong',context.owned.grade,context.owned.art_level);if(context.owned.proficiency<need)break;context.owned.proficiency-=need;context.owned.art_level+=1;await repo.updateProgress(player.id,context.art.id,context.owned,connection);}
  context.cooldown=Math.max(0,Number(grade.cooldownTurns||0));
  return {used:true,damage:baseDamage+extra,extraDamage:extra,mp:currentMp-mana,name:context.art.name,manaCost:mana,effects:Array.isArray(grade.effects)?grade.effects:[]};
}
module.exports={cultivate,breakthrough,grantSpiritQi,grantCombatResources,prepareDivineArt,tryUseDivineArt};
