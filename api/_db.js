const { neon } = require('@neondatabase/serverless');
const { dbUrl } = require('./_auth');
let sql;
function getSql(){
  const url = dbUrl();
  if(!url) throw new Error('Neon database connection variable is missing. Expected DATABASE_URL or POSTGRES_URL.');
  if(!sql) sql = neon(url);
  return sql;
}
async function ensureSchema(){
  const s=getSql();
  await s`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT '',
    mrp NUMERIC(12,2) NOT NULL DEFAULT 0,
    image_url TEXT DEFAULT '',
    short_description TEXT DEFAULT '',
    description TEXT DEFAULT '',
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await s`CREATE INDEX IF NOT EXISTS products_published_idx ON products(published)`;
  return s;
}
const seed=[
['amrit-ghee','VeBlyss Amrit Desi Ghee – Gold','Food & Wellness',720,'assets/amrit-ghee.jpg'],
['coconut-oil','CocoNara Virgin Coconut Oil','Food & Wellness',550,'assets/Coco Nara 4.jpeg'],
['pooja-oil','Pancha Jyothi Pooja Oil','Pooja & Rituals',225,'assets/Deepam oil 1.jpeg'],
['leather-wallet','Men’s Leather Wallet','Leather Accessories',550,'assets/Mens Wallet - Saddle Tan.png'],
['copper-bottles','Copper Bottles','Home & Lifestyle',650,'assets/copper-range.jpg'],
['beer-mug','Wooden Beer Mug','Home & Lifestyle',450,'assets/beer-mug.png']
];
async function seedProducts(){
  const s=await ensureSchema();
  for(const [id,name,category,mrp,image_url] of seed){
    await s`INSERT INTO products (id,name,slug,category,mrp,image_url,published)
      VALUES (${id},${name},${id},${category},${mrp},${image_url},true)
      ON CONFLICT (id) DO NOTHING`;
  }
  return s;
}
module.exports={getSql,ensureSchema,seedProducts};
