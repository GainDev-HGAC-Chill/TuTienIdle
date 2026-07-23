const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const WORLD = path.join(ROOT, 'data', 'worlds', 'NhanGioi');
const errors = [];
const warnings = [];
const declared = new Set();
function read(file) { try { return fs.readFileSync(file, 'utf8'); } catch (e) { errors.push(`[KHÔNG ĐỌC ĐƯỢC] ${path.relative(ROOT,file)}: ${e.message}`); return ''; } }
function attrs(text) { const out={}; for (const m of text.matchAll(/([\w:-]+)="([^"]*)"/g)) out[m[1]]=m[2]; return out; }
function tags(xml, name) { return [...xml.matchAll(new RegExp(`<${name}\\b([^>]*)\\/?>(?:[\\s\\S]*?<\\/${name}>)?`, 'g'))].map(m=>attrs(m[1])); }
function firstRoot(xml) { const m=xml.match(/<([A-Za-z_][\w:.-]*)\b[^>]*>/); return m?.[1] || ''; }
console.log('========== KIỂM ĐẠO TOÀN HỆ ==========');
const manifestFile=path.join(WORLD,'NhanGioi.xml'); const manifest=read(manifestFile);
if(firstRoot(manifest)!=='World') errors.push('[ĐẠO TÀNG] NhanGioi.xml không có root World.');
for(const mod of tags(manifest,'Module')){
  if(!mod.path) continue;
  const modulePath=path.join(WORLD,mod.path);
  if(!fs.existsSync(modulePath)){(mod.required==='true'?errors:warnings).push(`[MODULE THIẾU] ${mod.path}`);continue;}
  declared.add(path.resolve(modulePath)); const moduleXml=read(modulePath);
  if(firstRoot(moduleXml)!=='Module'){errors.push(`[MODULE HỎNG] ${mod.path}`);continue;}
  for(const ref of tags(moduleXml,'File')){
    const file=path.join(path.dirname(modulePath),ref.path||''); declared.add(path.resolve(file));
    if(!fs.existsSync(file)){(ref.required==='true'?errors:warnings).push(`[ĐẠO QUYỂN THIẾU] ${mod.id}/${ref.path}`);continue;}
    const xml=read(file); if(!firstRoot(xml)) errors.push(`[XML RỖNG] ${path.relative(ROOT,file)}`);
    console.log(`[ĐẠO TÀNG] ${mod.id} · ${ref.type || 'chưa định loại'} · ${ref.path}`);
  }
}
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.isDirectory())walk(full);else if(e.name.endsWith('.xml')&&!declared.has(path.resolve(full))&&path.resolve(full)!==path.resolve(manifestFile))warnings.push(`[NGOÀI MODULE] ${path.relative(ROOT,full)}`)}}
walk(WORLD);
const ruleFiles=['HeThong/QuyTac/GameRules.xml','HeThong/QuyTac/OfflineRules.xml','HeThong/QuyTac/DeathRules.xml','HeThong/QuyTac/InventoryRules.xml'];
const ruleIds=new Set();
for(const rel of ruleFiles){const xml=read(path.join(WORLD,rel));for(const rule of tags(xml,'Rule')){ruleIds.add(rule.id);if(!rule.description)warnings.push(`[LUẬT THIẾU CHÚ GIẢI] ${rel}:${rule.id}`);if(rule.min!==undefined&&Number(rule.value)<Number(rule.min))errors.push(`[LUẬT DƯỚI MIN] ${rule.id}`);if(rule.max!==undefined&&Number(rule.value)>Number(rule.max))errors.push(`[LUẬT VƯỢT MAX] ${rule.id}`)}}
for(const id of ['base_spiritual_qi_rate','global_drop_rate','boss_drop_rate','maximum_drop_rolls','offline_maximum_seconds','offline_cultivation_efficiency','respawn_hp_percent','respawn_mp_percent','initial_slot_count','maximum_slot_count','default_stack_limit'])if(!ruleIds.has(id))errors.push(`[THIẾU LUẬT RUNTIME] ${id}`);
console.log(`\nXML khai báo: ${declared.size}`);console.log(`Lỗi nghiêm trọng: ${errors.length}`);console.log(`Cảnh báo: ${warnings.length}`);warnings.forEach(x=>console.warn(x));errors.forEach(x=>console.error(x));if(errors.length){console.error('\n[ĐẠO TẮC THẤT BẠI] Đạo Tàng chưa đủ điều kiện khai mở.');process.exit(1)}console.log('\n[ĐẠO TẮC VIÊN MÃN] Đạo Tàng đủ điều kiện khai mở.');
