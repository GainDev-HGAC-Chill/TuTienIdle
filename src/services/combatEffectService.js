'use strict';

const EFFECT_NAMES = Object.freeze({
  STUN: 'Choáng', SEAL: 'Phong Ấn', BURN: 'Thiêu Đốt', POISON: 'Trúng Độc',
  FREEZE: 'Đóng Băng', BLEED: 'Chảy Máu', WEAKEN: 'Suy Nhược',
  DEFENSE_DOWN: 'Phá Giáp', ATTACK_DOWN: 'Giảm Công', DODGE_UP: 'Thân Pháp'
});

function normalizeId(id) { return String(id || '').trim().toUpperCase(); }
function nameOf(id) { const key=normalizeId(id); return EFFECT_NAMES[key] || key || 'Hiệu ứng'; }
function apply(list, raw, sourceName='') {
  const id=normalizeId(raw?.id || raw?.effectId || raw?.statusEffectId);
  if(!id) return null;
  const chance=Math.max(0, Math.min(100, Number(raw?.chancePercent ?? raw?.chance ?? 100)));
  if(Math.random()*100 >= chance) return null;
  const effect={id,name:nameOf(id),turns:Math.max(1,Number(raw?.durationTurns ?? raw?.durationRounds ?? 1)),sourceName,
    power:Math.max(1,Number(raw?.power ?? raw?.value ?? 0))};
  const old=list.find(x=>x.id===id);
  if(old){old.turns=Math.max(old.turns,effect.turns);old.power=Math.max(old.power,effect.power);return old;}
  list.push(effect); return effect;
}
function blocksTurn(list){return list.some(x=>x.id==='STUN'||x.id==='FREEZE');}
function blocksSkill(list){return list.some(x=>x.id==='SEAL');}
function startTurn(list, actor){
  let damage=0;
  for(const e of list){
    if(['BURN','POISON','BLEED'].includes(e.id)) damage += Math.max(1,Math.floor((actor.maxHp||actor.hp||1)*(e.id==='BURN'?0.025:0.02)+e.power));
  }
  return damage;
}
function modifiers(list){
  const m={attack:1,defense:1,dodge:0};
  for(const e of list){if(e.id==='WEAKEN'||e.id==='ATTACK_DOWN')m.attack*=0.8;if(e.id==='DEFENSE_DOWN')m.defense*=0.8;if(e.id==='DODGE_UP')m.dodge+=0.18;}
  return m;
}
function endTurn(list){for(const e of list)e.turns-=1;return list.filter(e=>e.turns>0);}
module.exports={apply,blocksTurn,blocksSkill,startTurn,modifiers,endTurn,nameOf};
