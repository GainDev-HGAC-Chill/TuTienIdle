const router=require('express').Router();
const game=require('../services/gameService');
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
router.post('/',wrap(async(req,res)=>res.status(201).json({success:true,...await game.create(req.body.name)})));
router.get('/by-name/:name',wrap(async(req,res)=>res.json({success:true,...await game.byName(req.params.name)})));
router.get('/:id',wrap(async(req,res)=>res.json({success:true,...await game.tick(req.params.id)})));
module.exports=router;
