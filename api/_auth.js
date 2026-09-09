import crypto from 'crypto';

const USER = process.env.ADMIN_USERNAME || 'veblyss-admin';
const HASH = process.env.ADMIN_PASSWORD_HASH || 'scrypt$16384$8$1$5iV-5r9tgoI55BFzr2SSiQ==$82MVP6jDx-cTsYK3gKJ1iUByDqE-Tl3CmsaT_3uBNlAoC_deKdPxQ9GWV03VFvZ78aht8NLkahqgYpDj5u8vXw==';
const SECRET = process.env.SESSION_SECRET || 'TEMP-VEBLYSS-TEST-SESSION-SECRET-CHANGE-BEFORE-PRODUCTION';
const COOKIE = 'vb_admin_session';

function parseHash(h){
  const parts=h.split('$');
  if(parts.length===6 && parts[0]==='scrypt') return {n:+parts[1],r:+parts[2],p:+parts[3],salt:Buffer.from(parts[4],'base64url'),key:Buffer.from(parts[5],'base64url')};
  throw new Error('Invalid password hash');
}
function verifyPassword(password){
  const x=parseHash(HASH); const key=crypto.scryptSync(password,x.salt,64,{N:x.n,r:x.r,p:x.p,maxmem:128*1024*1024});
  return crypto.timingSafeEqual(key,x.key);
}
function sign(value){return crypto.createHmac('sha256',SECRET).update(value).digest('base64url');}
export function setSession(res, username){
  const payload=Buffer.from(JSON.stringify({u:username,exp:Date.now()+8*60*60*1000})).toString('base64url');
  const token=payload+'.'+sign(payload);
  res.setHeader('Set-Cookie',`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`);
}
export function clearSession(res){res.setHeader('Set-Cookie',`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`)}
export function currentUser(req){
  const header=req.headers.cookie||''; const m=header.match(new RegExp(`${COOKIE}=([^;]+)`)); if(!m) return null;
  const [payload,sig]=m[1].split('.'); if(!payload||!sig) return null; const a=Buffer.from(sig); const b=Buffer.from(sign(payload)); if(a.length!==b.length||!crypto.timingSafeEqual(a,b)) return null;
  try {const p=JSON.parse(Buffer.from(payload,'base64url').toString()); return p.exp>Date.now()&&p.u===USER?p.u:null;} catch{return null;}
}
export function requireAuth(req,res){const u=currentUser(req);if(!u){res.statusCode=401;res.json({error:'Unauthorized'});return null;}return u;}
export function login(req,res,username,password){if(username!==USER||!verifyPassword(password)){res.statusCode=401;res.json({error:'Invalid admin ID or password'});return false;}setSession(res,username);res.json({ok:true,username});return true;}
