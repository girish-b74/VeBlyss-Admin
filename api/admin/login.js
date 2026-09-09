const {ADMIN_ID, verifyPassword, makeSession} = require('../_auth');
module.exports = async (req,res)=>{
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{
    const {username,password}=req.body||{};
    if(username!==ADMIN_ID || typeof password!=='string' || !verifyPassword(password))
      return res.status(401).json({error:'Invalid admin ID or password'});
    const token=makeSession();
    res.setHeader('Set-Cookie',`vb_admin=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);
    return res.status(200).json({ok:true});
  }catch(e){return res.status(500).json({error:e.message||'Login failed'});}
};
