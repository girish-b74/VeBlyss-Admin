import { clearSession } from '../_auth.js';
export default async function handler(req,res){if(req.method!=='POST'){res.statusCode=405;return res.json({error:'Method not allowed'});}clearSession(res);res.json({ok:true});}
