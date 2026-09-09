const { db, ensureSchema } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
function cleanList(v){ if(Array.isArray(v)) return v.filter(Boolean).map(String); if(typeof v==='string') return v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean); return []; }
function jsonBody(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>2e6)reject(new Error('Request too large'))});req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}});req.on('error',reject)})}
module.exports=async function handler(req,res){
  if(!['GET','POST'].includes(req.method)) return res.status(405).json({error:'Method not allowed'});
  if(!requireAuth(req,res)) return;
  try{await ensureSchema(); const sql=db();
    if(req.method==='GET'){const rows=await sql`SELECT id,name,category,price,image,short_description,description,features,specifications,published,created_at,updated_at FROM products ORDER BY created_at DESC`;return res.json(rows)}
    const b=await jsonBody(req); if(!b.id||!b.name||!b.category||b.price===undefined) return res.status(400).json({error:'Product ID, name, category and MRP are required'});
    const id=String(b.id).trim().toLowerCase(); const price=Math.round(Number(b.price)); if(!/^[a-z0-9][a-z0-9-]{1,79}$/.test(id)) return res.status(400).json({error:'Product ID must use lowercase letters, numbers and hyphens'}); if(!Number.isFinite(price)||price<0) return res.status(400).json({error:'MRP must be a valid non-negative number'});
    await sql`INSERT INTO products (id,name,category,price,image,short_description,description,features,specifications,published) VALUES (${id},${String(b.name).trim()},${String(b.category).trim()},${price},${b.image||''},${b.short_description||''},${b.description||''},${JSON.stringify(cleanList(b.features))}::jsonb,${JSON.stringify(cleanList(b.specifications))}::jsonb,${b.published!==false})`;
    res.status(201).json({ok:true,id});
  }catch(e){console.error(e);res.status(400).json({error:e.code==='23505'?'Product ID already exists':e.message||'Request failed'})}
};
