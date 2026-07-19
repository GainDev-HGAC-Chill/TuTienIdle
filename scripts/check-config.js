require('dotenv').config(); const dm=require('../src/config/dataManager');
try{dm.load(process.env.WORLD_CONFIG||'data/worlds/NhanGioi/NhanGioi.xml'); console.log('[DAO_TANG_HOP_LE]',dm.getWorldSummary());}
catch(e){console.error('[DAO_TANG_LOI]',e.message); process.exit(1);}
