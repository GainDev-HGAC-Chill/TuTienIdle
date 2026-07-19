const router=require('express').Router();
const game=require('../services/gameService');
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
router.post('/:id/tick',wrap(async(req,res)=>res.json({success:true,...await game.tick(req.params.id)})));
router.post('/:id/activity',wrap(async(req,res)=>res.json({success:true,...await game.setActivity(req.params.id,req.body.activity)})));
router.post('/:id/select-map',wrap(async(req,res)=>res.json({success:true,...await game.selectMap(req.params.id,req.body.mapId)})));
router.post('/:id/breakthrough',wrap(async(req,res)=>res.json({success:true,...await game.breakthrough(req.params.id)})));
router.post('/:id/use-item',wrap(async(req,res)=>res.json({success:true,...await game.useItem(req.params.id,req.body.itemId)})));
module.exports=router;
