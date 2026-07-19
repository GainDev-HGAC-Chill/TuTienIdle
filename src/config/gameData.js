const realms = [
  { id: 0, name: 'Luyện Khí', layers: 9, baseExp: 120, breakthroughRate: 0.92 },
  { id: 1, name: 'Trúc Cơ', layers: 9, baseExp: 420, breakthroughRate: 0.78 },
  { id: 2, name: 'Kim Đan', layers: 9, baseExp: 1400, breakthroughRate: 0.64 },
  { id: 3, name: 'Nguyên Anh', layers: 9, baseExp: 4600, breakthroughRate: 0.52 },
  { id: 4, name: 'Hóa Thần', layers: 9, baseExp: 15000, breakthroughRate: 0.42 },
  { id: 5, name: 'Luyện Hư', layers: 9, baseExp: 48000, breakthroughRate: 0.34 },
  { id: 6, name: 'Hợp Thể', layers: 9, baseExp: 150000, breakthroughRate: 0.27 },
  { id: 7, name: 'Đại Thừa', layers: 9, baseExp: 460000, breakthroughRate: 0.21 },
  { id: 8, name: 'Độ Kiếp', layers: 9, baseExp: 1400000, breakthroughRate: 0.15 }
];

const maps = [
  { id: 1, name: 'Ngoại Môn Sơn Lâm', realmRequired: 0, layerRequired: 1, monsterIds: [1,2] },
  { id: 2, name: 'Hắc Phong Cốc', realmRequired: 0, layerRequired: 4, monsterIds: [3,4] },
  { id: 3, name: 'Trúc Cơ Bí Cảnh', realmRequired: 1, layerRequired: 1, monsterIds: [5,6] },
  { id: 4, name: 'Kim Đan Cổ Mộ', realmRequired: 2, layerRequired: 1, monsterIds: [7,8] }
];

const monsters = [
  { id:1, name:'Sơn Lang', mapId:1, hp:55, attack:5, defense:1, stones:3, bodyExp:8, soulExp:1 },
  { id:2, name:'Thiết Giáp Trư', mapId:1, hp:80, attack:7, defense:2, stones:5, bodyExp:11, soulExp:1 },
  { id:3, name:'Hắc Phong Tặc', mapId:2, hp:145, attack:12, defense:4, stones:9, bodyExp:18, soulExp:3 },
  { id:4, name:'Độc Nha Xà', mapId:2, hp:120, attack:15, defense:3, stones:10, bodyExp:20, soulExp:4 },
  { id:5, name:'Thạch Khôi Lỗi', mapId:3, hp:360, attack:28, defense:10, stones:22, bodyExp:45, soulExp:8 },
  { id:6, name:'Bí Cảnh Hộ Vệ', mapId:3, hp:430, attack:32, defense:12, stones:28, bodyExp:52, soulExp:10 },
  { id:7, name:'Âm Thi Khôi', mapId:4, hp:900, attack:65, defense:28, stones:65, bodyExp:110, soulExp:22 },
  { id:8, name:'Cổ Mộ Yêu Tướng', mapId:4, hp:1250, attack:82, defense:34, stones:90, bodyExp:145, soulExp:30 }
];

function expRequired(realmIndex, layer) {
  const realm = realms[realmIndex] || realms[0];
  return Math.floor(realm.baseExp * Math.pow(1.35, Math.max(0, layer - 1)));
}
function realmName(index) { return realms[index]?.name || 'Vô Danh'; }
function getMap(id) { return maps.find(x => x.id === Number(id)); }
function getMonster(id) { return monsters.find(x => x.id === Number(id)); }
function randomMonster(mapId) {
  const list = monsters.filter(x => x.mapId === Number(mapId));
  return list[Math.floor(Math.random() * list.length)];
}
function unlockedMaps(cultivation) {
  return maps.filter(map => cultivation.main_realm_index > map.realmRequired ||
    (cultivation.main_realm_index === map.realmRequired && cultivation.main_layer >= map.layerRequired));
}
module.exports = { realms, maps, monsters, expRequired, realmName, getMap, getMonster, randomMonster, unlockedMaps };
