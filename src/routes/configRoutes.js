const router = require('express').Router();
const dataManager = require('../config/dataManager');

router.get('/', (_req, res) => {
  res.json({
    success: true,
    world: dataManager.world,
    realms: dataManager.getAllRealms(),
    maps: dataManager.getAllMaps(),
    monsters: dataManager.getAllMonsters(),
    spiritualRoots: dataManager.getAllSpiritualRoots()
  });
});

router.get('/summary', (_req, res) => {
  res.json({
    success: true,
    ...dataManager.getWorldSummary()
  });
});

module.exports = router;
