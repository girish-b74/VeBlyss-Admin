const { validCredentials, setSession } = require('../_lib/auth');
const attempts = globalThis.__vbLoginAttempts || (globalThis.__vbLoginAttempts = new Map());
module.exports = async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const ip=(req.headers['x-forwarded-for']||'unknown').split(',')[0].trim();
  const now=Date.now(); const a=attempts.get(ip)||{start:now,count:0};
  if(now-a.start>15*60*1000){a.start=now;a.count=0;}
  if(a.count>=10) return res.status(429).json({error:'Too many login attempts. Please try again later.'});
  a.count++; attempts.set(ip,a);
  const {username,password}=req.body||{};
  if(!username||!password) return res.status(400).json({error:'Admin ID and password are required'});
  if(!validCredentials(String(username).trim(),String(password))) return res.status(401).json({error:'Invalid credentials'});
  attempts.delete(ip); setSession(res,String(username).trim()); return res.status(200).json({ok:true});
};
