const express = require('express');
const service = require('../services/playerService');
const router = express.Router();

router.post('/', async (req, res, next) => {
  try { res.status(201).json({ success: true, player: await service.create(req.body.name) }); }
  catch (error) { next(error); }
});

router.get('/by-name/:name', async (req, res, next) => {
  try {
    const player = await service.getProfileByName(req.params.name);
    if (!player) return res.status(404).json({ success: false, error: 'Không tìm thấy đạo hữu.' });
    res.json({ success: true, player });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const player = await service.getProfile(Number(req.params.id));
    if (!player) return res.status(404).json({ success: false, error: 'Không tìm thấy đạo hữu.' });
    res.json({ success: true, player });
  } catch (error) { next(error); }
});

module.exports = router;
