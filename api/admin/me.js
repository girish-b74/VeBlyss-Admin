import { currentUser } from '../_auth.js';
export default async function handler(req,res){const u=currentUser(req);if(!u){res.statusCode=401;return res.json({error:'Unauthorized'});}res.json({username:u});}
