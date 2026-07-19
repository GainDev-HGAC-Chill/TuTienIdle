const router=require('express').Router();
const data=require('../config/gameData');
router.get('/',(_req,res)=>res.json({success:true,realms:data.realms,maps:data.maps,monsters:data.monsters}));
module.exports=router;
