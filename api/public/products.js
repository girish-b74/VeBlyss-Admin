const {seedProducts}=require('../_db');
module.exports=async(req,res)=>{
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 try{const s=await seedProducts();const products=await s`SELECT * FROM products WHERE published=true ORDER BY created_at DESC`;res.status(200).json({products});}
 catch(e){res.status(500).json({error:e.message||'Database error'});}
};
