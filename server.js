const express=require('express');
const path=require('path');
const fs=require('fs');
const Database=require('better-sqlite3');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const multer=require('multer');

const app=express();
const PORT=process.env.PORT||3000;
const JWT_SECRET=process.env.JWT_SECRET;
if(!JWT_SECRET){console.error('JWT_SECRET is required'); process.exit(1)}
const root=__dirname;
const site=path.join(root,'site');
const dataDir=path.join(root,'data');
const uploadDir=path.join(root,'server','uploads');
fs.mkdirSync(dataDir,{recursive:true}); fs.mkdirSync(uploadDir,{recursive:true});
const db=new Database(path.join(dataDir,'veblyss.db'));
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price INTEGER NOT NULL, image TEXT, short_description TEXT, description TEXT, features TEXT, specifications TEXT, published INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`);

const initial=[
['amrit-ghee','VeBlyss Amrit Desi Ghee – Gold','Food & Wellness',720,'assets/amrit-ghee.jpg','Traditional cow-milk butter clarified into rich golden ghee.','A traditional clarified butter prepared from cow’s milk butter, with a rich golden colour and aroma. Suitable for cooking, baking, frying and finishing.','Traditional preparation|Rich golden colour|Cooking, baking and finishing','Net Volume: 1000 ml|Net Weight: 902 g at 45°C'],
['coconut-oil','CocoNara Virgin Coconut Oil','Food & Wellness',550,'assets/Coco Nara 4.jpeg','100% virgin coconut oil, cold-pressed from selected fresh coconuts.','CocoNara is described as virgin coconut oil made from selected fresh coconuts and cold-pressed for everyday use.','100% virgin coconut oil|Cold-pressed|Cooking, baking and everyday uses','Product: Virgin Coconut Oil'],
['pooja-oil','Pancha Jyothi Pooja Oil','Pooja & Rituals',225,'assets/Deepam oil 1.jpeg','A traditional blend of five oils for diyas and pooja.','A blend of Karanja, Neem, Sesame, Mahua and Coconut oils for diyas, oil lamps, pooja, festivals and temple rituals.','Blend of five traditional oils|For diyas and oil lamps|Pooja and festivals','Ingredients: Karanja, Neem, Sesame, Mahua, Coconut'],
['leather-wallet','Men’s Leather Wallet','Fashion & Accessories',550,'assets/Mens Wallet - Saddle Tan.png','Handcrafted leather wallet in classic Indian styling.','A genuine leather wallet designed for everyday carrying, available in multiple colours.','Genuine leather|Everyday carry|Multiple colour options','Size: 13 × 11 cm|Origin: India'],
['copper-bottles','Copper Bottles','Home & Wellness',650,'assets/copper-range.jpg','A range of handcrafted copper bottle designs.','A selection of copper bottles including plain, hammered, curved and coated designs.','Multiple designs|Copper construction|Everyday use','Plane Tower: 500 ml|Approx. weight: 300 g'],
['beer-mug','Wooden Beer Mug','Home & Entertaining',450,'assets/beer-mug.png','A handcrafted-looking wooden beer serving mug.','A wooden beer mug designed for serving and entertaining, with a distinctive handcrafted appearance.','Wooden construction|Beer serving|Gifting and entertaining','Wooden body|Stainless-steel liner']
];
const count=db.prepare('SELECT COUNT(*) c FROM products').get().c;
if(count===0){const stmt=db.prepare(`INSERT INTO products(id,name,category,price,image,short_description,description,features,specifications,published,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,1,?,?)`); const now=new Date().toISOString(); const tx=db.transaction(()=>initial.forEach(p=>stmt.run(...p,now,now))); tx();}
if(!db.prepare('SELECT 1 FROM admins LIMIT 1').get()){
 const email=process.env.ADMIN_EMAIL; const pass=process.env.ADMIN_PASSWORD;
 if(email&&pass){db.prepare('INSERT INTO admins(email,password_hash,created_at) VALUES(?,?,?)').run(email,bcrypt.hashSync(pass,12),new Date().toISOString()); console.log('Admin created:',email)} else console.warn('No admin created. Set ADMIN_EMAIL and ADMIN_PASSWORD on first run.');
}

app.use(helmet({contentSecurityPolicy:false})); app.use(express.json({limit:'1mb'})); app.use(cookieParser());
const loginLimit=rateLimit({windowMs:15*60*1000,max:10,standardHeaders:true,legacyHeaders:false});
function auth(req,res,next){try{const token=req.cookies.vb_admin; if(!token) return res.status(401).json({error:'Unauthorized'}); const p=jwt.verify(token,JWT_SECRET); req.admin=p; next();}catch(e){return res.status(401).json({error:'Unauthorized'});}}
app.post('/api/admin/login',loginLimit,async(req,res)=>{const {email,password}=req.body||{}; if(!email||!password)return res.status(400).json({error:'Email and password are required'}); const a=db.prepare('SELECT * FROM admins WHERE email=?').get(email.trim().toLowerCase()); if(!a||!await bcrypt.compare(password,a.password_hash))return res.status(401).json({error:'Invalid credentials'}); const token=jwt.sign({id:a.id,email:a.email},JWT_SECRET,{expiresIn:'8h'}); res.cookie('vb_admin',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',maxAge:8*60*60*1000}); res.json({ok:true});});
app.post('/api/admin/logout',(req,res)=>{res.clearCookie('vb_admin');res.json({ok:true})});
app.get('/api/admin/me',auth,(req,res)=>res.json({email:req.admin.email}));
app.get('/api/products',auth,(req,res)=>res.json(db.prepare('SELECT * FROM products ORDER BY created_at DESC').all()));
app.get('/api/products/:id',auth,(req,res)=>{const p=db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id); if(!p)return res.status(404).json({error:'Product not found'}); res.json(p)});
const upload=multer({storage:multer.diskStorage({destination:uploadDir,filename:(req,file,cb)=>{const ext=path.extname(file.originalname).toLowerCase(); cb(null,Date.now()+'-'+Math.random().toString(36).slice(2,9)+ext)}}),limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>cb(null,/^image\/(jpeg|png|webp)$/.test(file.mimetype))});
app.post('/api/products',auth,upload.single('image'),(req,res)=>{try{const b=req.body; if(!b.id||!b.name||!b.category||!b.price)return res.status(400).json({error:'ID, name, category and price are required'}); const now=new Date().toISOString(); const image=req.file?`/admin-uploads/${req.file.filename}`:(b.image||''); db.prepare(`INSERT INTO products(id,name,category,price,image,short_description,description,features,specifications,published,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run(b.id.trim(),b.name,b.category,Math.round(Number(b.price)),image,b.short_description||'',b.description||'',b.features||'',b.specifications||'',b.published==='0'?0:1,now,now); res.json({ok:true})}catch(e){res.status(400).json({error:e.message.includes('UNIQUE')?'Product ID already exists':e.message})}});
app.put('/api/products/:id',auth,upload.single('image'),(req,res)=>{try{const old=db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id); if(!old)return res.status(404).json({error:'Product not found'}); const b=req.body; const image=req.file?`/admin-uploads/${req.file.filename}`:(b.image!==undefined?b.image:old.image); db.prepare(`UPDATE products SET name=?,category=?,price=?,image=?,short_description=?,description=?,features=?,specifications=?,published=?,updated_at=? WHERE id=?`).run(b.name,b.category,Math.round(Number(b.price)),image,b.short_description||'',b.description||'',b.features||'',b.specifications||'',b.published==='0'?0:1,new Date().toISOString(),req.params.id); res.json({ok:true})}catch(e){res.status(400).json({error:e.message})}});
app.delete('/api/products/:id',auth,(req,res)=>{const r=db.prepare('DELETE FROM products WHERE id=?').run(req.params.id); if(!r.changes)return res.status(404).json({error:'Product not found'}); res.json({ok:true})});
app.use('/admin-uploads',express.static(uploadDir));
app.use('/admin',express.static(path.join(root,'admin')));
app.get('/admin/*',(req,res)=>res.sendFile(path.join(root,'admin','index.html')));
app.use(express.static(site));
app.listen(PORT,()=>console.log(`VeBlyss running on http://localhost:${PORT}`));
