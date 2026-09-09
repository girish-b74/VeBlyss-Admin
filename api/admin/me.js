const {requireAuth}=require('../_auth');
module.exports=async(req,res)=>{if(!requireAuth(req,res))return;res.status(200).json({ok:true});};
