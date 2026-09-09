const crypto = require('crypto');
const {requireAuth}=require('../_auth');
const {seedProducts}=require('../_db');
function clean(v){return typeof v==='string'?v.trim():''}
module.exports=async(req,res)=>{
 if(!requireAuth(req,res))return;
 try{
   const s=await seedProducts();
   if(req.method==='DELETE'){
     const id=clean(req.body?.id);
     if(!id)return res.status(400).json({error:'Product ID required'});
     await s`DELETE FROM products WHERE id=${id}`;
     return res.status(200).json({ok:true});
   }
   if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
   const b=req.body||{}, id=clean(b.id)||crypto.randomUUID();
   const name=clean(b.name), slug=clean(b.slug)||id;
   if(!name)return res.status(400).json({error:'Product name is required'});
   const mrp=Number(b.mrp); if(!Number.isFinite(mrp)||mrp<0)return res.status(400).json({error:'Valid MRP is required'});
   await s`INSERT INTO products (id,name,slug,category,mrp,image_url,short_description,description,features,specifications,published,updated_at)
     VALUES (${id},${name},${slug},${clean(b.category)},${mrp},${clean(b.image_url)},${clean(b.short_description)},${clean(b.description)},${JSON.stringify(Array.isArray(b.features)?b.features:[])},${JSON.stringify(b.specifications&&typeof b.specifications==='object'?b.specifications:{})},${b.published!==false},NOW())
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,slug=EXCLUDED.slug,category=EXCLUDED.category,mrp=EXCLUDED.mrp,image_url=EXCLUDED.image_url,short_description=EXCLUDED.short_description,description=EXCLUDED.description,features=EXCLUDED.features,specifications=EXCLUDED.specifications,published=EXCLUDED.published,updated_at=NOW()`;
   res.status(200).json({ok:true,id});
 }catch(e){res.status(500).json({error:e.message||'Database error'});}
};
