import { neon } from '@neondatabase/serverless';

export function db() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (!url) throw new Error('Neon database connection is not configured.');
  return neon(url);
}

export async function ensureSchema(sql) {
  await sql`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    image TEXT NOT NULL DEFAULT '',
    short_description TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    specifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export async function seedProducts(sql) {
  const products = [
    ['amrit-ghee','VeBlyss Amrit Desi Ghee – Gold','Food & Wellness',720,'/assets/amrit-ghee.jpg','Traditional clarified butter from cow’s milk butter.','Rich golden ghee suitable for cooking, baking, frying and finishing.',['Traditional preparation','Rich golden colour','Cooking and finishing'],['MRP: ₹720 inclusive of GST','Available sizes: 500 ml and 1 litre']],
    ['coconut-oil','CocoNara Virgin Coconut Oil','Food & Wellness',550,'/assets/Coco Nara 4.jpeg','100% virgin coconut oil, cold pressed.','Made from selected fresh coconuts for cooking, baking and everyday use.',['100% virgin coconut oil','Cold pressed','Everyday culinary use'],['MRP: ₹550 inclusive of GST']],
    ['pooja-oil','Pancha Jyothi Pooja Oil','Pooja & Rituals',225,'/assets/Deepam oil 1.jpeg','A traditional blend of five oils for lamps and rituals.','Blend of Karanja, Neem, Sesame, Mahua and Coconut oils for diyas, pooja and festivals.',['Five traditional oils','For diyas and lamps','Pooja and festivals'],['MRP: ₹225 inclusive of GST']],
    ['leather-wallet','Men’s Leather Wallet','Leather Accessories',550,'/assets/Mens Wallet - Saddle Tan.png','Classic men’s leather wallet.','A practical leather accessory with a refined, handcrafted appearance.',['Genuine leather','Classic design','Multiple colour options'],['MRP: ₹550 inclusive of GST','Saddle Tan, Midnight Black, Vintage Mahogany, Heritage Olive']],
    ['copper-bottles','Copper Bottles','Copperware',650,'/assets/copper-range.jpg','VeBlyss copper bottle range.','A selection of copper bottle designs including Plane Tower, hammered, curved and coated finishes.',['Multiple designs','Copper construction','Everyday hydration accessory'],['MRP: ₹650 inclusive of GST']],
    ['beer-mug','Wooden Beer Mug','Home & Entertaining',450,'/assets/beer-mug.png','Handcrafted wooden beer mug.','A distinctive wooden serving mug for entertaining and gifting.',['Wooden construction','Serving and entertaining','Gift-friendly design'],['MRP: ₹450 inclusive of GST']]
  ];
  for (const p of products) {
    await sql`INSERT INTO products (id,name,category,price,image,short_description,description,features,specifications,published)
      VALUES (${p[0]},${p[1]},${p[2]},${p[3]},${p[4]},${p[5]},${p[6]},${JSON.stringify(p[7])}::jsonb,${JSON.stringify(p[8])}::jsonb,true)
      ON CONFLICT (id) DO NOTHING`;
  }
}
