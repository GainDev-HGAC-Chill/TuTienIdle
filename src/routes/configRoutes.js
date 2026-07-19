const express=require('express'); const data=require('../config/dataManager'); const router=express.Router();
router.get('/summary',(_req,res)=>res.json({success:true,data:data.getWorldSummary()}));
router.get('/maps',(_req,res)=>res.json({success:true,data:data.getAllMaps()}));
router.get('/monsters',(_req,res)=>res.json({success:true,data:data.getAllMonsters()}));
module.exports=router;
