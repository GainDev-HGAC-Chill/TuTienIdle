require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const { initializeDatabase, closeDatabase } = require('./src/db/mysql');
const dataManager = require('./src/config/dataManager'); const mapEnvironmentManager = require('./src/config/mapEnvironmentManager');
const itemManager = require('./src/config/itemManager');
const monsterDropManager = require('./src/config/monsterDropManager');
const explorationManager = require('./src/config/explorationManager');
const playerRoutes = require('./src/routes/playerRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const configRoutes = require('./src/routes/configRoutes');
const explorationRoutes = require('./src/routes/explorationRoutes');
const cultivationArtRoutes = require('./src/routes/cultivationArtRoutes');
const cultivationArtManager = require('./src/config/cultivationArtManager');
const cultivationArtProgressionManager = require('./src/config/cultivationArtProgressionManager');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/player', playerRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/config', configRoutes);
app.use('/api/exploration', explorationRoutes);
app.use('/api/cultivation-arts', cultivationArtRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Thiên Cơ vận chuyển ổn định.',
    data: {
      ...dataManager.getWorldSummary(),
      exploration: explorationManager.summary()
    }
  });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  const manifestPath = path.join(
    __dirname,
    'data',
    'worlds',
    'NhanGioi',
    'NhanGioi.xml'
  );
  const nhanGioiDirectory = path.dirname(manifestPath);

  const summary = dataManager.load(manifestPath); const environmentSummary = mapEnvironmentManager.load(path.dirname(manifestPath)); console.log(`[THIEN_TUONG] ${environmentSummary.environments} khu vực · ${environmentSummary.hazards} thiên tượng.`);
  const itemSummary = itemManager.load(path.dirname(manifestPath));
  const dropSummary = monsterDropManager.load(path.dirname(manifestPath));
  const explorationSummary = explorationManager.load(nhanGioiDirectory);
  const artSummary = cultivationArtManager.load(nhanGioiDirectory);
  const progressionSummary =
    cultivationArtProgressionManager.load(nhanGioiDirectory);

  console.log(
    `[CONG_PHAP] ${artSummary.total} cuốn · ${artSummary.roots} Linh Căn.`
  );
  console.log(
    `[DAO_TANG] ${summary.world?.name || 'Nhân Giới'}: ` +
    `${summary.realms} cảnh giới, ${summary.maps} bản đồ, ` +
    `${summary.monsters} yêu thú.`
  );
    console.log(`[VẬT PHẨM] ${itemSummary.total} vật phẩm từ ${itemSummary.files} đạo quyển.`);
  console.log(`[CHIẾN LỢI PHẨM] ${dropSummary.tables} bảng rơi, ${dropSummary.monsters} yêu thú đã móc.`);
console.log(
    `[LICH_LUYEN] ${explorationSummary.resources} tài nguyên, ` +
    `${explorationSummary.npcs} NPC, ${explorationSummary.events} kỳ ngộ, ` +
    `${explorationSummary.bosses} boss.`
  );

  await initializeDatabase();

  const server = app.listen(PORT, () => {
    console.log(`[THIEN_CO] http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch(error => {
  console.error('[KHAI_THIEN_THAT_BAI]', error);
  process.exit(1);
});
