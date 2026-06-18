# Patch: thêm list Map / Quái vào logic

## File mới

Copy 2 file này vào project:

- `config/maps.js`
- `core/mapService.js`

`config/maps.js` chứa toàn bộ 64 map từ list bạn gửi:
- Nhân Giới → 16 map
- Tiên Giới → 16 map
- Nguyên Giới → 20 map
- Đạo Giới → 8 map
- Chung Cực Giới → 4 map

## Sửa `server.js`

### 1) Thêm require

Ở đầu file:

```js
const mapService = require('./core/mapService');
const MAPS = require('./config/maps');
```

### 2) Bỏ block `const ZONES = {...}` cũ

Xóa đoạn cũ:

```js
const ZONES = {
  rung_thap: ...
  rung_trung: ...
  dong_ma: ...
};
```

### 3) Sửa `ensurePlayerShape(player)`

Thay đoạn:

```js
if (!player.currentZone) player.currentZone = 'rung_thap';
```

bằng:

```js
if (!player.currentZone) player.currentZone = 'ap_suong_mu';
player.currentZone = mapService.normalizeOldZone(player.currentZone);
mapService.ensureValidCurrentMap(player);
```

### 4) Sửa `createNewPlayer(username)`

Thay:

```js
currentZone: 'rung_thap',
```

bằng:

```js
currentZone: 'ap_suong_mu',
```

### 5) Thay toàn bộ `fightMonster(player)`

```js
function fightMonster(player) {
  const zone = mapService.getCombatZone(player);

  const atk = player.combat.atk + (player.permanentBonuses.atk || 0);
  const def = player.combat.def + (player.permanentBonuses.def || 0);

  const damage = Math.max(1, atk - zone.def / 2);
  const killChance = Math.min(0.95, damage / (zone.hp + def));

  if (Math.random() < killChance || damage >= zone.hp) {
    player.stats.totalKills += 1;
    player.cultivation.tuVi += zone.tuViReward;
    player.stats.totalTuVi += zone.tuViReward;

    const currencyId =
      zone.world === 'nhan_gioi' ? 'so_linh_thach' :
      zone.world === 'tien_gioi' ? 'so_tien_thach' :
      zone.world === 'nguyen_gioi' ? 'so_nguyen_thach' :
      zone.world === 'dao_gioi' ? 'so_dao_thach' :
      'so_chung_cuc_thach';

    currencyService.addCurrency(player, currencyId, Math.max(1, Math.floor(zone.tuViReward / 10)));
  }
}
```

### 6) Sửa `sanitizePlayer(player)`

Thêm trước `return`:

```js
const currentMap = mapService.getMapById(player.currentZone) || mapService.getDefaultMapForPlayer(player);
```

Trong object return, thay:

```js
zoneName: ZONES[player.currentZone]?.name || 'Unknown',
```

bằng:

```js
zoneName: currentMap?.name || 'Không rõ',
currentMap,
availableMaps: mapService.getCurrentRealmMaps(player),
```

### 7) Sửa `/api/meta`

Thay:

```js
zones: ZONES,
```

bằng:

```js
maps: mapService.getAllMaps(),
```

### 8) Thay endpoint `/api/player/:username/zone`

Thay toàn bộ endpoint cũ bằng:

```js
app.post('/api/player/:username/zone', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);

  const mapId = mapService.normalizeOldZone(req.body.zone || req.body.mapId);
  const check = mapService.isMapUnlocked(player, mapId);

  if (!check.ok) {
    return res.status(400).json({
      success: false,
      error: check.reason,
      map: check.map,
    });
  }

  player.currentZone = check.map.id;
  sendPlayer(res, players, player, {
    message: `Đã chuyển đến ${check.map.name}`,
    currentMap: check.map,
  });
});
```

### 9) Thêm endpoint lấy map

Đặt gần `/api/meta`:

```js
app.get('/api/maps', (req, res) => {
  const { world, realm } = req.query;

  let maps = mapService.getAllMaps();

  if (world) maps = maps.filter(m => m.world === world);
  if (realm) maps = maps.filter(m => m.realm === realm);

  res.json({
    success: true,
    maps,
  });
});

app.get('/api/player/:username/maps', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);
  processGameTick(player);

  res.json({
    success: true,
    currentMap: mapService.getMapById(player.currentZone),
    availableMaps: mapService.getCurrentRealmMaps(player),
    allMaps: mapService.getAllMaps(),
  });
});
```

## Test nhanh

```bash
curl http://localhost:3000/api/maps
curl http://localhost:3000/api/player/demo/maps

curl -X POST http://localhost:3000/api/player/demo/zone ^
  -H "Content-Type: application/json" ^
  -d "{\"mapId\":\"rung_go_khoc\"}"
```

## Ghi chú

Hiện stat quái được scale tự động theo `world + realm`, chưa cần nhập từng chỉ số từng con.

Công thức tạm trong `mapService.js`:

```js
power = (worldOrder - 1) * 10 + realmOrder
hp = 40 + power * 35
atk = 4 + power * 5
def = 2 + power * 3
tuViReward = 8 + power * 12
```

Sau này nếu muốn mỗi map có chỉ số riêng, chỉ cần thêm field `monsterStats` vào từng map trong `config/maps.js`.
