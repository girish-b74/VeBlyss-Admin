const { neon } = require('@neondatabase/serverless');

function getConnectionString() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;
}

function db() {
  const url = getConnectionString();
  if (!url) throw new Error('Neon database connection is not configured. Check the Vercel environment variables created by the Neon integration.');
  return neon(url);
}

const seedProducts = [
  ['amrit-ghee','VeBlyss Amrit Desi Ghee – Gold','Food & Wellness',720,'/assets/amrit-ghee.jpg','Traditional cow-milk butter clarified into rich golden ghee.','A traditional clarified butter prepared from cow’s milk butter, with a rich golden colour and aroma. Suitable for cooking, baking, frying and finishing.',['Traditional preparation','Rich golden colour','Cooking, baking and finishing'],['Net Volume: 1000 ml','Net Weight: 902 g at 45°C']],
  ['coconut-oil','CocoNara Virgin Coconut Oil','Food & Wellness',550,'/assets/Coco%20Nara%204.jpeg','100% virgin coconut oil, cold-pressed from selected fresh coconuts.','CocoNara is described as virgin coconut oil made from selected fresh coconuts and cold-pressed for everyday use.',['100% virgin coconut oil','Cold-pressed','Cooking, baking and everyday uses'],['Product: Virgin Coconut Oil']],
  ['pooja-oil','Pancha Jyothi Pooja Oil','Pooja & Rituals',225,'/assets/Deepam%20oil%201.jpeg','A traditional blend of five oils for diyas and pooja.','A blend of Karanja, Neem, Sesame, Mahua and Coconut oils for diyas, oil lamps, pooja, festivals and temple rituals.',['Blend of five traditional oils','For diyas and oil lamps','Pooja and festivals'],['Ingredients: Karanja, Neem, Sesame, Mahua, Coconut']],
  ['leather-wallet','Men’s Leather Wallet','Fashion & Accessories',550,'/assets/Mens%20Wallet%20-%20Saddle%20Tan.png','Handcrafted leather wallet in classic Indian styling.','A genuine leather wallet designed for everyday carrying, available in multiple colours.',['Genuine leather','Everyday carry','Multiple colour options'],['Size: 13 × 11 cm','Origin: India']],
  ['copper-bottles','Copper Bottles','Home & Wellness',650,'/assets/copper-range.jpg','A range of handcrafted copper bottle designs.','A selection of copper bottles including plain, hammered, curved and coated designs.',['Multiple designs','Copper construction','Everyday use'],['Plane Tower: 500 ml','Approx. weight: 300 g']],
  ['beer-mug','Wooden Beer Mug','Home & Entertaining',450,'/assets/beer-mug.png','A handcrafted-looking wooden beer serving mug.','A wooden beer mug designed for serving and entertaining, with a distinctive handcrafted appearance.',['Wooden construction','Beer serving','Gifting and entertaining'],['Wooden body','Stainless-steel liner']]
];

let schemaPromise;
async function ensureSchema() {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    const sql = db();
    await sql`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0),
      image TEXT,
      short_description TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      features JSONB NOT NULL DEFAULT '[]'::jsonb,
      specifications JSONB NOT NULL DEFAULT '[]'::jsonb,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    const rows = await sql`SELECT COUNT(*)::int AS count FROM products`;
    if (rows[0].count === 0) {
      for (const p of seedProducts) {
        await sql`INSERT INTO products (id,name,category,price,image,short_description,description,features,specifications)
          VALUES (${p[0]},${p[1]},${p[2]},${p[3]},${p[4]},${p[5]},${p[6]},${JSON.stringify(p[7])}::jsonb,${JSON.stringify(p[8])}::jsonb)`;
      }
    }
  })();
  return schemaPromise;
}

module.exports = { db, ensureSchema };
