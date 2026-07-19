const path = require('path');
const { loadXml, arrayOf } = require('./xmlLoader');
class DataManager {
  constructor(){ this.reset(); }
  reset(){ this.world=null; this.realms=new Map(); this.maps=new Map(); this.monsters=new Map(); this.items=new Map(); this.pills=new Map(); this.recipes=new Map(); this.herbs=new Map(); this.skills=new Map(); }
  load(manifestPath){
    this.reset();
    const absolute=path.resolve(manifestPath); const base=path.dirname(absolute);
    const manifest=loadXml(absolute).World; this.world={ id:manifest.id, name:manifest.name, version:String(manifest.version), enabled:manifest.enabled !== false };
    for(const ref of arrayOf(manifest.Configs?.Config)){
      const doc=loadXml(path.join(base, ref.path)); this.ingest(ref.type, doc);
    }
    this.validate();
  }
  ingest(type, doc){
    const mappings={
      realms:['Realms','Realm',this.realms], maps:['Maps','Map',this.maps], monsters:['Monsters','Monster',this.monsters],
      items:['Items','Item',this.items], pills:['Pills','Pill',this.pills], recipes:['AlchemyRecipes','Recipe',this.recipes],
      herbs:['Herbs','Herb',this.herbs], cultivationSkills:['Skills','Skill',this.skills], combatSkills:['Skills','Skill',this.skills]
    };
    const m=mappings[type]; if(!m) return;
    const [root,node,target]=m; let rows=[];
    if(type==='maps') for(const region of arrayOf(doc[root]?.Region)) for(const map of arrayOf(region.Map)) rows.push({...map, regionId:region.id, regionName:region.name});
    else rows=arrayOf(doc[root]?.[node]);
    for(const row of rows){ if(!row.id) throw new Error(`${type} có phần tử thiếu id.`); if(target.has(row.id)) throw new Error(`Trùng ID cấu hình: ${row.id}`); target.set(row.id,row); }
  }
  validate(){
    for(const map of this.maps.values()) for(const ref of arrayOf(map.Monsters?.MonsterRef)) if(!this.monsters.has(ref.monsterId)) throw new Error(`Map ${map.id} gọi quái không tồn tại: ${ref.monsterId}`);
    for(const monster of this.monsters.values()) if(monster.Rewards?.dropTableId && monster.Rewards.dropTableId!=='none') { /* mở rộng DropTables ở giai đoạn sau */ }
    for(const recipe of this.recipes.values()){
      if(!this.items.has(recipe.resultItemId) && !this.pills.has(recipe.resultItemId)) throw new Error(`Công thức ${recipe.id} trả vật phẩm không tồn tại: ${recipe.resultItemId}`);
      for(const mat of arrayOf(recipe.Materials?.Material)) if(!this.items.has(mat.itemId) && !this.herbs.has(mat.itemId)) throw new Error(`Công thức ${recipe.id} thiếu nguyên liệu: ${mat.itemId}`);
    }
  }
  getRealm(id){return this.realms.get(id)||null;} getMap(id){return this.maps.get(id)||null;} getMonster(id){return this.monsters.get(id)||null;}
  getAllMaps(){return [...this.maps.values()];} getAllMonsters(){return [...this.monsters.values()];}
  getWorldSummary(){return { world:this.world, realms:this.realms.size, maps:this.maps.size, monsters:this.monsters.size, items:this.items.size, pills:this.pills.size, recipes:this.recipes.size, herbs:this.herbs.size, skills:this.skills.size };}
}
module.exports=new DataManager();
