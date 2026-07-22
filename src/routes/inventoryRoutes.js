const router = require('express').Router();
const game = require('../services/gameService');
const wrap = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/:id/use-slot', wrap(async (req, res) => {
  res.json({
    success: true,
    ...await game.useInventorySlot(req.params.id, req.body.inventoryId)
  });
}));

module.exports = router;
