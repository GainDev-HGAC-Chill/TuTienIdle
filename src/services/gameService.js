const repo = require('../repositories/playerRepository');
const { transaction } = require('../db/mysql');
const data = require('../config/gameData');

function ensurePlayer(player) {
  if (!player) { const e = new Error('Không tìm thấy đạo hữu.'); e.statusCode = 404; throw e; }
}
function calcPower(p) {
  return Math.floor(p.attack_value * 2 + p.defense_value * 1.5 + p.max_hp * .25 + p.main_realm_index * 500 + p.main_layer * 50);
}
function decorate(p) {
  const required = data.expRequired(p.main_realm_index, p.main_layer);
  return {
    ...p,
    realm_name: data.realmName(p.main_realm_index),
    exp_required: required,
    exp_percent: Math.min(100, Number((p.main_exp / required * 100).toFixed(2))),
    power: calcPower(p),
    can_breakthrough: p.main_exp >= required,
    breakthrough_rate: data.realms[p.main_realm_index]?.breakthroughRate || 0,
    unlocked_maps: data.unlockedMaps(p)
  };
}
async function profile(id) {
  const p = await repo.findById(id); ensurePlayer(p);
  return { player: decorate(p), inventory: await repo.inventory(id), logs: await repo.logs(id) };
}
async function byName(name) {
  const p = await repo.findByName(String(name || '').trim()); ensurePlayer(p); return profile(p.id);
}
async function create(name) { const p = await repo.create(name); return profile(p.id); }

async function setActivity(id, activity) {
  const allowed = ['idle','spirit_cultivation','combat'];
  if (!allowed.includes(activity)) { const e = new Error('Hoạt động không hợp lệ.'); e.statusCode=400; throw e; }
  await tick(id);
  await transaction(async c => {
    const p = await repo.findById(id,c,true); ensurePlayer(p);
    await c.query('UPDATE players SET current_activity=?,last_tick_at=NOW(3) WHERE id=?',[activity,id]);
    await repo.addLog(c,id,'system', activity==='idle'?'Đã thu công, trở về trạng thái tĩnh tọa.':activity==='combat'?'Bước vào Chiến Đạo.':'Trở về động phủ tiến hành Linh Tu.');
  });
  return profile(id);
}

function spawnData(monster) { return [monster.id, monster.hp, monster.hp]; }
async function selectMap(id,mapId) {
  await transaction(async c => {
    const p=await repo.findById(id,c,true); ensurePlayer(p);
    const map=data.getMap(mapId); if(!map) { const e=new Error('Khu vực không tồn tại.');e.statusCode=404;throw e; }
    if(!data.unlockedMaps(p).some(x=>x.id===map.id)) { const e=new Error('Cảnh giới chưa đủ để đặt chân tới khu vực này.');e.statusCode=403;throw e; }
    const m=data.randomMonster(map.id);
    await c.query('UPDATE player_combat_state SET map_id=?,monster_id=?,monster_hp=?,monster_max_hp=? WHERE player_id=?',[map.id,...spawnData(m),id]);
    await repo.addLog(c,id,'combat',`Đã tới ${map.name}, gặp ${m.name}.`);
  });
  return profile(id);
}

async function tick(id) {
  await transaction(async c => {
    const p=await repo.findById(id,c,true); ensurePlayer(p);
    const [timeRows]=await c.query('SELECT LEAST(300,GREATEST(0,TIMESTAMPDIFF(MICROSECOND,last_tick_at,NOW(3))/1000000)) elapsed FROM players WHERE id=?',[id]);
    const elapsed=Number(timeRows[0].elapsed || 0);
    if(elapsed < .2) return;
    if(p.current_activity==='spirit_cultivation') await cultivationTick(c,p,elapsed);
    if(p.current_activity==='combat') await combatTick(c,p,elapsed);
    await c.query('UPDATE players SET last_tick_at=NOW(3) WHERE id=?',[id]);
  });
  return profile(id);
}

async function cultivationTick(c,p,elapsed) {
  const required=data.expRequired(p.main_realm_index,p.main_layer);
  if(p.main_exp>=required) return;
  const gain=Math.max(1,Math.floor(elapsed*Number(p.cultivation_rate)));
  const next=Math.min(required,p.main_exp+gain);
  await c.query('UPDATE player_cultivation SET main_exp=? WHERE player_id=?',[next,p.id]);
}

async function combatTick(c,p,elapsed) {
  let monster=data.getMonster(p.monster_id);
  if(!monster) { monster=data.randomMonster(p.map_id); await c.query('UPDATE player_combat_state SET monster_id=?,monster_hp=?,monster_max_hp=? WHERE player_id=?',[...spawnData(monster),p.id]); }
  let monsterHp=p.monster_hp>0?p.monster_hp:monster.hp;
  let hp=p.current_hp;
  const rounds=Math.min(30,Math.max(1,Math.floor(elapsed)));
  let wins=0,stones=0,body=0,soul=0;
  for(let i=0;i<rounds;i++) {
    const crit=Math.random()<Number(p.crit_rate);
    monsterHp-=Math.max(1,Math.floor(p.attack_value*(crit?1.8:1)-monster.defense));
    if(monsterHp<=0) {
      wins++; stones+=monster.stones; body+=monster.bodyExp; soul+=monster.soulExp;
      if(Math.random()<.12) await repo.addItem(c,p.id,{id:'hoi_khi_dan',name:'Hồi Khí Đan',type:'pill',quantity:1,metadata:{effect:'Khôi phục 25 sinh lực'}});
      monster=data.randomMonster(p.map_id); monsterHp=monster.hp;
      continue;
    }
    hp-=Math.max(1,monster.attack-p.defense_value);
    if(hp<=0) {
      const lost=Math.floor(p.spirit_stones*.01);
      hp=p.max_hp;
      await c.query('UPDATE players SET current_activity="idle",spirit_stones=GREATEST(0,spirit_stones-?) WHERE id=?',[lost,p.id]);
      await c.query('UPDATE player_combat_state SET losses=losses+1 WHERE player_id=?',[p.id]);
      await repo.addLog(c,p.id,'combat',`Thân tử đạo tiêu, tổn thất ${lost} Linh Thạch và đã tự rời chiến đấu.`);
      break;
    }
  }
  if(wins>0) {
    await c.query('UPDATE players SET spirit_stones=spirit_stones+? WHERE id=?',[stones,p.id]);
    await c.query('UPDATE player_cultivation SET body_exp=body_exp+?,soul_exp=soul_exp+? WHERE player_id=?',[body,soul,p.id]);
    await c.query('UPDATE player_combat_state SET wins=wins+? WHERE player_id=?',[wins,p.id]);
    await repo.addItem(c,p.id,{id:'linh_thach',name:'Linh Thạch',type:'currency',quantity:stones});
    await repo.addLog(c,p.id,'combat',`Chém hạ ${wins} yêu thú, nhận ${stones} Linh Thạch, ${body} Luyện Thể và ${soul} Luyện Hồn.`);
  }
  await c.query('UPDATE players SET current_hp=? WHERE id=?',[Math.max(1,hp),p.id]);
  await c.query('UPDATE player_combat_state SET monster_id=?,monster_hp=?,monster_max_hp=? WHERE player_id=?',[monster.id,Math.max(1,monsterHp),monster.hp,p.id]);
}

async function breakthrough(id) {
  await tick(id);
  return transaction(async c => {
    const p=await repo.findById(id,c,true); ensurePlayer(p);
    const required=data.expRequired(p.main_realm_index,p.main_layer);
    if(p.main_exp<required) { const e=new Error('Tu vi chưa viên mãn.');e.statusCode=400;throw e; }
    const realm=data.realms[p.main_realm_index];
    if(p.main_layer<realm.layers) {
      const layer=p.main_layer+1;
      await c.query('UPDATE player_cultivation SET main_layer=?,main_exp=0 WHERE player_id=?',[layer,id]);
      await repo.addLog(c,id,'cultivation',`Phá cảnh thành công, đạt ${realm.name} tầng ${layer}.`);
    } else {
      if(p.main_realm_index>=data.realms.length-1) { const e=new Error('Đã đứng tại đỉnh Nhân Giới.');e.statusCode=400;throw e; }
      const success=Math.random()<realm.breakthroughRate;
      if(success) {
        const next=p.main_realm_index+1;
        await c.query('UPDATE player_cultivation SET main_realm_index=?,main_layer=1,main_exp=0 WHERE player_id=?',[next,id]);
        await c.query('UPDATE player_attributes SET max_hp=max_hp+80,max_mp=max_mp+30,attack_value=attack_value+18,defense_value=defense_value+8,cultivation_rate=cultivation_rate+0.8 WHERE player_id=?',[id]);
        await c.query('UPDATE players p JOIN player_attributes a ON a.player_id=p.id SET p.current_hp=a.max_hp,p.current_mp=a.max_mp WHERE p.id=?',[id]);
        await repo.addLog(c,id,'cultivation',`Thiên kiếp tan biến, chính thức bước vào ${data.realmName(next)}.`);
      } else {
        await c.query('UPDATE player_cultivation SET main_exp=FLOOR(main_exp*0.8) WHERE player_id=?',[id]);
        await repo.addLog(c,id,'cultivation','Đột phá thất bại, căn cơ chấn động và tổn thất 20% tu vi hiện tại.');
      }
    }
    return profile(id);
  });
}

async function useItem(id,itemId) {
  return transaction(async c => {
    const p=await repo.findById(id,c,true); ensurePlayer(p);
    const [rows]=await c.query('SELECT * FROM player_inventory WHERE player_id=? AND item_id=? AND quantity>0 FOR UPDATE',[id,itemId]);
    if(!rows[0]) { const e=new Error('Vật phẩm không tồn tại.');e.statusCode=404;throw e; }
    if(itemId==='hoi_khi_dan') {
      await c.query('UPDATE players SET current_hp=LEAST(?,current_hp+25) WHERE id=?',[p.max_hp,id]);
    } else { const e=new Error('Vật phẩm này chưa thể sử dụng.');e.statusCode=400;throw e; }
    await c.query('UPDATE player_inventory SET quantity=quantity-1 WHERE id=?',[rows[0].id]);
    await repo.addLog(c,id,'item',`Đã sử dụng ${rows[0].item_name}.`);
    return profile(id);
  });
}
module.exports={ profile,byName,create,setActivity,selectMap,tick,breakthrough,useItem };
