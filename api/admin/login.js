import { login } from '../_auth.js';
export default async function handler(req,res){ if(req.method!=='POST'){res.statusCode=405;return res.json({error:'Method not allowed'});} try{let body=req.body;if(typeof body==='string')body=JSON.parse(body); login(req,res,body?.username||'',body?.password||'');}catch(e){res.statusCode=500;res.json({error:e.message});}}
