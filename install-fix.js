const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const packageRoot = __dirname;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupRoot = path.join(projectRoot, `_backup_linh_can_${stamp}`);

function fail(message) {
  console.error(`[ĐẠO TẮC THẤT BẠI] ${message}`);
  process.exit(1);
}

function ensureFile(file) {
  if (!fs.existsSync(file)) {
    fail(`Không tìm thấy file: ${path.relative(projectRoot, file)}`);
  }
}

function backup(relativePath) {
  const source = path.join(projectRoot, relativePath);
  ensureFile(source);
  const target = path.join(backupRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function write(relativePath, content) {
  const target = path.join(projectRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
  console.log(`[ĐẠO TÀNG] Đã ghi: ${relativePath}`);
}

function patchGameService() {
  const relative = 'src/services/gameService.js';
  const file = path.join(projectRoot, relative);
  let content = fs.readFileSync(file, 'utf8');

  const oldText =
    'const spiritualRoot = dataManager.getSpiritualRoot(player.spiritual_root);';
  const newText =
    'const spiritualRoot = dataManager.resolvePlayerSpiritualRoot(player);';

  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
  } else if (!content.includes(newText)) {
    fail(`Không nhận diện được đoạn Linh Căn trong ${relative}`);
  }

  write(relative, content);
}

function patchCultivationRuntime() {
  const relative = 'src/runtime/cultivationArtRuntime.js';
  const file = path.join(projectRoot, relative);
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes("require('../config/dataManager')")) {
    const anchor =
      "const artManager = require('../config/cultivationArtManager');";
    if (!content.includes(anchor)) {
      fail(`Không nhận diện được đầu file ${relative}`);
    }
    content = content.replace(
      anchor,
      `${anchor} const dataManager = require('../config/dataManager');`
    );
  }

  const replacement = `function isAffinityMatched(player, art) {
  const playerRoot = dataManager.resolvePlayerSpiritualRoot(player);
  if (!playerRoot || !art) return false;

  const artRoot =
    dataManager.getSpiritualRoot(art.rootId) ||
    dataManager.getSpiritualRoot(art.element);

  if (artRoot) {
    return artRoot.id === playerRoot.id;
  }

  const normalize = value =>
    String(value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  return normalize(art.rootId) === normalize(playerRoot.id) ||
    normalize(art.element) === normalize(playerRoot.element);
}`;

  const functionPattern =
    /function isAffinityMatched\(player,\s*art\)\s*\{[\s\S]*?\}\s*async function applyToPlayer/;

  if (functionPattern.test(content)) {
    content = content.replace(
      functionPattern,
      `${replacement} async function applyToPlayer`
    );
  } else if (!content.includes('const playerRoot = dataManager.resolvePlayerSpiritualRoot(player);')) {
    fail(`Không nhận diện được hàm đối chiếu Công Pháp trong ${relative}`);
  }

  write(relative, content);
}

function installDataManager() {
  const source = path.join(packageRoot, 'src/config/dataManager.js');
  ensureFile(source);
  write(
    'src/config/dataManager.js',
    fs.readFileSync(source, 'utf8')
  );
}

fs.mkdirSync(backupRoot, { recursive: true });

[
  'src/config/dataManager.js',
  'src/services/gameService.js',
  'src/runtime/cultivationArtRuntime.js'
].forEach(backup);

installDataManager();
patchGameService();
patchCultivationRuntime();

console.log('');
console.log(`[HỘ ĐẠO] Bản sao lưu: ${backupRoot}`);
console.log('[HỘ ĐẠO] Đang kiểm tra cú pháp...');

for (const relative of [
  'src/config/dataManager.js',
  'src/services/gameService.js',
  'src/runtime/cultivationArtRuntime.js'
]) {
  require('child_process').execFileSync(
    process.execPath,
    ['--check', path.join(projectRoot, relative)],
    { stdio: 'inherit' }
  );
}

console.log('');
console.log('[KHAI THIÊN] Vá Linh Căn và Công Pháp hoàn tất.');
console.log('[KHAI THIÊN] Chạy: node tools/kiem-tra-dao-tang.js');
console.log('[KHAI THIÊN] Sau đó chạy: npm start');
