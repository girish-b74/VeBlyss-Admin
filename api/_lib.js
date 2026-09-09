const { neon } = require("@neondatabase/serverless");
const crypto = require("crypto");
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const ADMIN_USER = process.env.ADMIN_USER || "veblyss-admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Veblyss@2026!Admin";
function hash(v){return crypto.createHash("sha256").update(v).digest("hex")}
function sign(payload){const secret=process.env.SESSION_SECRET||"change-me";return Buffer.from(JSON.stringify(payload)).toString("base64url")+"."+hash(JSON.stringify(payload)+"."+secret)}
function verify(token){try{const [a,b]=token.split(".");const p=JSON.parse(Buffer.from(a,"base64url").toString());return b===hash(JSON.stringify(p)+"."+(process.env.SESSION_SECRET||"change-me"))&&p.exp>Date.now()}catch{return null}}
function cookie(name,value,maxAge){return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV==="production"?"; Secure":""}`}
async function init(){
 if(!sql) throw new Error("DATABASE_URL is not configured in Vercel.");
 await sql`CREATE TABLE IF NOT EXISTS products (id text primary key, name text not null, category text, image text, short_description text, description text, mrp numeric(12,2), published boolean default true, features jsonb default '[]'::jsonb, specifications jsonb default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now())`;
 const r=await sql`SELECT count(*)::int AS n FROM products`;
 if(r[0].n===0){
  const ps=[
   ["amrit-ghee","VeBlyss Amrit Desi Ghee – Gold","Food & Wellness","₹720"],
   ["coconara-virgin-coconut-oil","CocoNara Virgin Coconut Oil","Food & Wellness","₹550"],
   ["pancha-jyothi-pooja-oil","Pancha Jyothi Pooja Oil","Pooja & Rituals","₹225"],
   ["mens-leather-wallet","Men's Leather Wallet","Leather Accessories","₹550"],
   ["copper-bottle","Copper Bottle","Home & Lifestyle","₹650"],
   ["wooden-beer-mug","Wooden Beer Mug","Home & Lifestyle","₹450"]
  ];
  for(const p of ps) await sql`INSERT INTO products(id,name,category,mrp,published) VALUES(${p[0]},${p[1]},${p[2]},${Number(p[3].replace("₹",""))},true) ON CONFLICT DO NOTHING`;
 }
}
function body(req){return new Promise((resolve,reject)=>{let d="";req.on("data",c=>d+=c);req.on("end",()=>{try{resolve(d?JSON.parse(d):{})}catch(e){reject(e)}});})}
module.exports={sql,init,ADMIN_USER,ADMIN_PASSWORD,sign,verify,cookie,body,hash};