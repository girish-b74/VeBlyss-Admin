const { clearSession } = require('../_lib/auth');
module.exports = async function handler(req,res){ if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'}); clearSession(res); res.json({ok:true}); };
