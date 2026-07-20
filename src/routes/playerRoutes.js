const router = require('express').Router();
const game = require('../services/gameService');
const assessment = require('../services/spiritualRootAssessmentService');

const wrap = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/assessment', (_req, res) => {
  res.json({
    success: true,
    assessment: assessment.beginAssessment()
  });
});

router.post('/', wrap(async (req, res) => {
  const destiny = assessment.evaluateAssessment(
    req.body.assessmentToken,
    req.body.answers
  );

  res.status(201).json({
    success: true,
    ...await game.create(req.body.name, destiny)
  });
}));

router.get('/by-name/:name', wrap(async (req, res) => {
  res.json({
    success: true,
    ...await game.byName(req.params.name)
  });
}));

router.get('/:id', wrap(async (req, res) => {
  res.json({
    success: true,
    ...await game.tick(req.params.id)
  });
}));

module.exports = router;
