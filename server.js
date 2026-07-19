require('dotenv').config();
const path = require('path');
const express = require('express');
const { initializeDatabase, closeDatabase } = require('./src/db/mysql');
const dataManager = require('./src/config/dataManager');
const playerRoutes = require('./src/routes/playerRoutes');
const configRoutes = require('./src/routes/configRoutes');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/api/player', playerRoutes);
app.use('/api/config', configRoutes);
app.get('/api/health', (_req, res) => res.json({ success: true, world: dataManager.getWorldSummary() }));

app.use((error, _req, res, _next) => {
  console.error('[SERVER_ERROR]', error);
  res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Lỗi nội tại máy chủ.' });
});

async function bootstrap() {
  dataManager.load(process.env.WORLD_CONFIG || 'data/worlds/NhanGioi/NhanGioi.xml');
  await initializeDatabase();
  const server = app.listen(PORT, () => {
    console.log(`[THIEN_CO] Tu Tiên Idle vận hành tại http://localhost:${PORT}`);
    console.log(`[DAO_TANG] ${JSON.stringify(dataManager.getWorldSummary())}`);
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
