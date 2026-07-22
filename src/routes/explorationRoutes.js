const router = require('express').Router();
const service = require('../services/explorationService');

const wrap = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/:id/maps', wrap(async (req, res) => {
  res.json({ success: true, ...await service.mapInfo(req.params.id) });
}));

router.post('/:id/encounter', wrap(async (req, res) => {
  res.json({ success: true, ...await service.encounter(req.params.id) });
}));

router.post('/:id/event/choose', wrap(async (req, res) => {
  res.json({
    success: true,
    ...await service.choose(
      req.params.id,
      req.body.token,
      req.body.choiceId
    )
  });
}));

router.get('/world-boss/status', wrap(async (_req, res) => {
  res.json({ success: true, ...await service.worldBossStatus() });
}));

router.post('/:id/world-boss/challenge', wrap(async (req, res) => {
  res.json({ success: true, ...await service.challengeWorldBoss(req.params.id) });
}));

module.exports = router;
