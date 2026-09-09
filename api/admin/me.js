const { requireAuth } = require('../_lib/auth');
module.exports = async function handler(req,res){ if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'}); const u=requireAuth(req,res); if(!u)return; res.json({username:u.u}); };
