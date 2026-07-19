function notFound(req,res){res.status(404).json({success:false,error:`Không tìm thấy ${req.method} ${req.originalUrl}`});}
function errorHandler(error,_req,res,_next){console.error('[SERVER_ERROR]',error);res.status(error.statusCode||500).json({success:false,error:error.message||'Thiên Cơ hỗn loạn.'});}
module.exports={notFound,errorHandler};
