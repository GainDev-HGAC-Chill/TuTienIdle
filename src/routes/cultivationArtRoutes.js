const router=require('express').Router();const service=require('../services/cultivationArtService');const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
router.get('/catalog',wrap(async(req,res)=>res.json({success:true,...await service.catalog({category:req.query.category,rootId:req.query.rootId})})));
router.get('/player/:id',wrap(async(req,res)=>res.json({success:true,...await service.profile(req.params.id)})));
router.post('/player/:id/learn',wrap(async(req,res)=>res.json({success:true,...await service.learn(req.params.id,req.body.artId,req.body.grade)})));
router.post('/player/:id/equip',wrap(async(req,res)=>res.json({success:true,...await service.equip(req.params.id,req.body.artId)})));
router.post('/player/:id/unequip',wrap(async(req,res)=>res.json({success:true,...await service.unequip(req.params.id,req.body.category)})));
router.post('/player/:id/cultivate',wrap(async(req,res)=>res.json({success:true,...await service.cultivate(req.params.id,req.body.artId,req.body.mode||'one')})));
router.post('/player/:id/breakthrough',wrap(async(req,res)=>res.json({success:true,...await service.breakthrough(req.params.id,req.body.artId)})));
module.exports=router;
