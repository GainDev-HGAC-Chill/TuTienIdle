// ============================================
// CORE - MAP SERVICE
// Quản lý map/quái theo giới/cảnh giới.
// Mỗi cảnh giới có 2 map: map 1 mở tầng 1, map 2 mở tầng 5.
// ============================================
let MAP_CONFIG = [];
try { MAP_CONFIG = require('../config/maps'); } catch (err) { console.warn('[mapService] Không đọc được config/maps.js:', err.message); }
const REALM_CONFIG = require('../config/realms');
const FALLBACK_MAPS = [
  { id:'ap_suong_mu', name:'Ấp Sương Mù', world:'nhan_gioi', worldName:'Nhân Giới', realmIndex:0, realmName:'Luyện Khí', monsters:['Lang Mồ Côi','Cú Rít','Hồn Ma Đèn'], boss:{name:'Vương Lão Bà Sương'}, rewards:['Sương Châu','Linh thạch cấp 1'] },
  { id:'rung_go_khoc', name:'Rừng Gỗ Khóc', world:'nhan_gioi', worldName:'Nhân Giới', realmIndex:0, realmName:'Luyện Khí', monsters:['Khỉ Nhăn','Chim Than','Nhện Ve'], boss:{name:'Mộc Thần Khóc'}, rewards:['Gỗ Khóc','Linh thạch cấp 1'] },
];
function slug(input){return String(input||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');}
function getWorldInfo(worldId){return REALM_CONFIG.worlds?.find(w=>w.id===worldId)||null;}
function getWorldName(worldId){const w=getWorldInfo(worldId);return w?.name||w?.displayName||worldId||'-';}
function getRealmName(worldId,realmIndex){const w=getWorldInfo(worldId);const r=w?.realms?.[Number(realmIndex||0)];return r?.name||r?.displayName||r?.id||'-';}
function worldOrder(worldId){return getWorldInfo(worldId)?.order||1;}
function isMapLike(obj){return obj&&typeof obj==='object'&&!Array.isArray(obj)&&(obj.name||obj.mapName||obj.title)&&(obj.monsters||obj.monster||obj.monsterList||obj.mobs||obj.boss||obj.rewards||obj.reward);}
function flattenMaps(input,ctx={},out=[]){
  if(!input)return out;
  if(Array.isArray(input)){for(const item of input)flattenMaps(item,ctx,out);return out;}
  if(typeof input!=='object')return out;
  const nextCtx={...ctx,world:input.world||input.worldId||ctx.world,worldName:input.worldName||input.displayName||ctx.worldName,realm:input.realm||input.realmId||ctx.realm,realmName:input.realmName||input.realmTitle||input.displayName||ctx.realmName,realmIndex:input.realmIndex??input.realmOrder??ctx.realmIndex};
  if(isMapLike(input)){out.push(normalizeMap(input,nextCtx,out.length));return out;}
  for(const key of ['maps','zones','areas','children','items','realms','worlds']) if(input[key]) flattenMaps(input[key],nextCtx,out);
  for(const [key,value] of Object.entries(input)){if(['maps','zones','areas','children','items','realms','worlds'].includes(key))continue;if(value&&typeof value==='object')flattenMaps({id:value.id||key,...value},nextCtx,out);}
  return out;
}
function normalizeMonster(monster,index,mapId){if(typeof monster==='string')return{id:`${mapId}_mob_${index+1}`,name:monster,description:''};return{id:monster.id||`${mapId}_mob_${index+1}`,name:monster.name||monster.title||`Quái ${index+1}`,description:monster.description||monster.desc||''};}
function normalizeBoss(boss){if(!boss)return null;if(typeof boss==='string')return{id:slug(boss),name:boss,skills:[]};return{id:boss.id||slug(boss.name||boss.title||'boss'),name:boss.name||boss.title||'Boss',skills:boss.skills||boss.skill||[]};}
function normalizeMap(raw,ctx,index){
  const world=raw.world||raw.worldId||ctx.world||'nhan_gioi';
  const realmIndex=Number(raw.realmIndex??raw.realmOrder??ctx.realmIndex??0);
  const name=raw.name||raw.mapName||raw.title||`Map ${index+1}`;
  const id=raw.id||raw.mapId||slug(`${world}_${realmIndex}_${name}`);
  const monsterList=raw.monsters||raw.monsterList||raw.mobs||raw.monster||[];
  const map={id,name,world,worldName:raw.worldName||ctx.worldName||getWorldName(world),realm:raw.realm||raw.realmId||ctx.realm||null,realmIndex,realmName:raw.realmName||ctx.realmName||getRealmName(world,realmIndex),description:raw.description||raw.desc||'',rewards:raw.rewards||raw.reward||[],boss:normalizeBoss(raw.boss),required:raw.required||null};
  map.monsters=Array.isArray(monsterList)?monsterList.map((m,i)=>normalizeMonster(m,i,id)):[normalizeMonster(monsterList,0,id)];
  return map;
}
function addRequirements(maps){const countByRealm={};return maps.map(map=>{const key=`${map.world}_${map.realmIndex}`;const index=countByRealm[key]||0;countByRealm[key]=index+1;const req=map.required||{world:map.world,realmIndex:map.realmIndex,stage:index===0?1:5};return{...map,required:{world:req.world||map.world,realmIndex:Number(req.realmIndex??map.realmIndex??0),stage:Number(req.stage||1)}};});}
function getAllMaps(){const maps=flattenMaps(MAP_CONFIG);return addRequirements(maps.length?maps:FALLBACK_MAPS.map((m,i)=>normalizeMap(m,{},i)));}
function getMapById(mapId){return getAllMaps().find(m=>m.id===mapId)||null;}
function getDefaultMapId(){return getAllMaps()[0]?.id||'ap_suong_mu';}
function isMapUnlocked(player,map){if(!map)return false;const cult=player.cultivation||{};const req=map.required||{};const playerWorld=cult.world||'nhan_gioi';const playerRealm=Number(cult.realmIndex||0);const playerStage=Number(cult.stage||1);const reqWorld=req.world||map.world;const reqRealm=Number(req.realmIndex??map.realmIndex??0);const reqStage=Number(req.stage||1);if(playerWorld!==reqWorld)return false;if(playerRealm!==reqRealm)return false;return playerStage>=reqStage;}
function getUnlockedMaps(player){return getAllMaps().filter(m=>isMapUnlocked(player,m));}
function ensureCurrentMap(player){const unlocked=getUnlockedMaps(player);if(!unlocked.length){player.currentZone=null;return null;}const current=getMapById(player.currentZone);if(!current||!isMapUnlocked(player,current)){player.currentZone=unlocked[0].id;return unlocked[0];}return current;}
function getRandomMonster(map){const list=map?.monsters||[];return list.length?list[Math.floor(Math.random()*list.length)]:{id:'unknown',name:'Không rõ'};}
function getScale(map){const w=Math.max(1,worldOrder(map.world)||1);const r=Number(map.realmIndex||0)+1;const gate=Number(map.required?.stage||1);return Math.max(1,Math.floor(Math.pow(2.2,w-1)*r*(gate>=5?1.35:1)));}
function buildMonsterStats(player,map,monster){const scale=getScale(map);return{id:monster.id,name:monster.name,hp:Math.floor(40*scale),atk:Math.floor(5*scale),def:Math.floor(2*scale),tuViReward:Math.floor(10*scale),stoneReward:Math.max(1,Math.floor(scale))};}
function fightMonster(player){const map=ensureCurrentMap(player);if(!map)return{killed:false,map:null,monster:{name:'Không rõ'}};const monster=getRandomMonster(map);const mob=buildMonsterStats(player,map,monster);const atk=(player.combat?.atk||1)+(player.permanentBonuses?.atk||0);const def=(player.combat?.def||0)+(player.permanentBonuses?.def||0);const damage=Math.max(1,atk-mob.def/2);const killChance=Math.min(0.95,damage/(mob.hp+def));const killed=Math.random()<killChance||damage>=mob.hp;if(killed){player.stats.totalKills+=1;player.cultivation.tuVi+=mob.tuViReward;player.stats.totalTuVi+=mob.tuViReward;}return{killed,map,monster:mob};}
function mapSummary(map){if(!map)return null;return{id:map.id,name:map.name,world:map.world,worldName:map.worldName,realmIndex:map.realmIndex,realmName:map.realmName,required:map.required,description:map.description,monster:map.monsters?.[0]?.name||'Không rõ',monsters:map.monsters||[],boss:map.boss,rewards:map.rewards};}
function getZonesForMeta(){const obj={};for(const map of getAllMaps())obj[map.id]=mapSummary(map);return obj;}
function getPlayerMapState(player){const currentMap=ensureCurrentMap(player);return{currentMap:mapSummary(currentMap),unlockedMaps:getUnlockedMaps(player).map(mapSummary)};}
module.exports={getAllMaps,getMapById,getDefaultMapId,getUnlockedMaps,ensureCurrentMap,fightMonster,getZonesForMeta,getPlayerMapState};
