import { requireAuth } from '../_auth.js';
import { db, ensureSchema, seedProducts } from '../_db.js';
export default async function handler(req,res){
  if(!requireAuth(req,res))return;
  try{const sql=db();await ensureSchema(sql);await seedProducts(sql);
    if(req.method==='GET'){const rows=await sql`SELECT id,name,category,price::float AS price,image,short_description,description,features,specifications,published FROM products ORDER BY created_at DESC`;return res.json(rows);}
    if(req.method==='POST'){let b=req.body;if(typeof b==='string')b=JSON.parse(b);const id=String(b.id||'').trim();if(!id||!b.name)throw new Error('Product ID and Product Name are required.');await sql`INSERT INTO products (id,name,category,price,image,short_description,description,features,specifications,published) VALUES (${id},${String(b.name)},${String(b.category||'')},${Number(b.price||0)},${String(b.image||'')},${String(b.short_description||'')},${String(b.description||'')},${JSON.stringify(String(b.features||'').split('\n').map(x=>x.trim()).filter(Boolean))}::jsonb,${JSON.stringify(String(b.specifications||'').split('\n').map(x=>x.trim()).filter(Boolean))}::jsonb,${!!b.published})`;return res.json({ok:true});}
    res.statusCode=405;res.json({error:'Method not allowed'});
  }catch(e){res.statusCode=500;res.json({error:e.message});}
}
