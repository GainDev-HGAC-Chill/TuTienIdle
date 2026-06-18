# Patch: Đột phá chủ động + Chi phí động phủ

## 1) Thêm file mới
Copy file:

- `core/breakthroughService.js`

## 2) Thay toàn bộ file
Thay toàn bộ nội dung file:

- `core/caveService.js`

## 3) Sửa `server.js`

### 3.1. Thêm require
Ở đầu `server.js`, thêm:

```js
const breakthroughService = require('./core/breakthroughService');
```

### 3.2. Sửa `updateCultivation(player)`
Thay hàm `updateCultivation(player)` hiện tại bằng:

```js
function updateCultivation(player) {
  player.cultivation.maxTuVi = getRealmNeed(player.cultivation);

  // Không tự động lên cảnh giới nữa.
  // Khi đủ tu vi thì giữ ở maxTuVi và chờ người chơi bấm Đột phá.
  if (player.cultivation.tuVi >= player.cultivation.maxTuVi) {
    player.cultivation.tuVi = player.cultivation.maxTuVi;
    player.cultivation.readyToBreakthrough = true;
  } else {
    player.cultivation.readyToBreakthrough = false;
  }
}
```

### 3.3. Thêm endpoint đột phá
Đặt gần endpoint `/api/player/:username/breakthrough/result` hoặc trước phần cave:

```js
app.post('/api/player/:username/breakthrough', (req, res) => {
  const players = loadPlayers();
  const player = getPlayerOrCreate(players, req.params.username);

  processGameTick(player);

  const result = breakthroughService.attemptBreakthrough(player, getRealmNeed);
  if (!result.success) {
    savePlayers(players);
    return res.status(400).json({ success: false, error: result.reason, result, player: sanitizePlayer(player) });
  }

  sendPlayer(res, players, player, { result, message: result.message });
});
```

### 3.4. Sửa `sanitizePlayer(player)`
Trong object `cultivationCompat`, thêm:

```js
readyToBreakthrough: !!player.cultivation.readyToBreakthrough,
breakthrough: breakthroughService.getBreakthroughPreview(player, getRealmNeed),
```

Ví dụ:

```js
const cultivationCompat = {
  ...player.cultivation,
  realmName: realmInfo?.displayName || 'Không rõ',
  level: player.cultivation.stage || 1,
  exp: player.cultivation.tuVi || 0,
  maxExp: player.cultivation.maxTuVi || getRealmNeed(player.cultivation),
  readyToBreakthrough: !!player.cultivation.readyToBreakthrough,
  breakthrough: breakthroughService.getBreakthroughPreview(player, getRealmNeed),
  info: realmInfo,
};
```

## 4) Cách test nhanh

### Set đủ tu vi
```bash
curl -X POST http://localhost:3000/api/dev/demo/set-cultivation ^
  -H "Content-Type: application/json" ^
  -d "{\"tuVi\":1000000}"
```

### Đột phá
```bash
curl -X POST http://localhost:3000/api/player/demo/breakthrough
```

### Test nâng động phủ
```bash
curl -X POST http://localhost:3000/api/player/demo/cave/upgrade ^
  -H "Content-Type: application/json" ^
  -d "{\"buildingId\":\"spirit_array\"}"
```
