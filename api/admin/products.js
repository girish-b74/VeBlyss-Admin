const {requireAuth}=require('../_auth');
const {seedProducts}=require('../_db');
module.exports=async(req,res)=>{
 if(!requireAuth(req,res))return;
 try{
   const s=await seedProducts();
   const products=await s`SELECT * FROM products ORDER BY created_at DESC`;
   res.status(200).json({products});
 }catch(e){res.status(500).json({error:e.message||'Database error'});}
};
