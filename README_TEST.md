# Tu Tien Idle - Server Test

## Chạy server

```bash
npm install
node server.js
```

Mở:

```text
http://localhost:3000
http://localhost:3000/api/meta
http://localhost:3000/api/player/demo
```

## Cấp dữ liệu test

```bash
curl -X POST http://localhost:3000/api/dev/demo/grant \
  -H "Content-Type: application/json" \
  -d "{\"element\":\"kim\",\"herbAmount\":50}"
```

## Test học skill

```bash
curl -X POST http://localhost:3000/api/player/demo/skill/learn \
  -H "Content-Type: application/json" \
  -d "{\"skillId\":\"thien_tinh_bat_huu_kinh\"}"
```

## Test luyện đan

```bash
curl -X POST http://localhost:3000/api/player/demo/alchemy/craft \
  -H "Content-Type: application/json" \
  -d "{\"recipeId\":\"recipe_tu_linh_tan\"}"
```

## Test dùng đan

Lấy item trong `/api/player/demo`, sau đó dùng `item.id`:

```bash
curl -X POST http://localhost:3000/api/player/demo/pill/use \
  -H "Content-Type: application/json" \
  -d "{\"itemId\":\"tu_linh_tan_tot\"}"
```

## Test động phủ / dược viên

```bash
curl -X POST http://localhost:3000/api/player/demo/herb/plant \
  -H "Content-Type: application/json" \
  -d "{\"plotIndex\":0,\"herbId\":\"luyen_khi_linh_thao\"}"
```

```bash
curl -X POST http://localhost:3000/api/player/demo/herb/harvest \
  -H "Content-Type: application/json" \
  -d "{\"plotIndex\":0}"
```
