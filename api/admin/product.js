const { db, ensureSchema } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
function cleanList(v){ if(Array.isArray(v)) return v.filter(Boolean).map(String); if(typeof v==='string') return v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean); return []; }
function body(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>2e6)reject(Error('Request too large'))});req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}});req.on('error',reject)})}
module.exports=async function handler(req,res){
  if(!['GET','PUT','DELETE'].includes(req.method)) return res.status(405).json({error:'Method not allowed'}); if(!requireAuth(req,res))return;
  try{await ensureSchema();const sql=db();const id=String(req.query.id||''); if(!id)return res.status(400).json({error:'Missing product ID'});
    if(req.method==='GET'){const r=await sql`SELECT * FROM products WHERE id=${id}`;if(!r.length)return res.status(404).json({error:'Product not found'});return res.json(r[0]);}
    if(req.method==='DELETE'){const r=await sql`DELETE FROM products WHERE id=${id}`;if(!r.count)return res.status(404).json({error:'Product not found'});return res.json({ok:true});}
    const b=await body(req);const price=Math.round(Number(b.price));if(!b.name||!b.category||!Number.isFinite(price)||price<0)return res.status(400).json({error:'Name, category and valid MRP are required'});
    const r=await sql`UPDATE products SET name=${String(b.name).trim()},category=${String(b.category).trim()},price=${price},image=${b.image||''},short_description=${b.short_description||''},description=${b.description||''},features=${JSON.stringify(cleanList(b.features))}::jsonb,specifications=${JSON.stringify(cleanList(b.specifications))}::jsonb,published=${b.published!==false},updated_at=NOW() WHERE id=${id}`;if(!r.count)return res.status(404).json({error:'Product not found'});res.json({ok:true});
  }catch(e){console.error(e);res.status(400).json({error:e.message||'Request failed'})}
};
