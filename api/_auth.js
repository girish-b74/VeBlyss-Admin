const crypto = require('crypto');

const ADMIN_ID = process.env.ADMIN_ID || 'veblyss-admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 'scrypt$VeBlyssTempSalt2026$4f573fbcc4d199384337b75aa82798a0c3c1c0441c0a04d2d05e3b7675980dbef697e2ffdfb2fdfebea8a6bf4cb10361631ac9a21d1447d90a23ba32803f9cfb';
const SESSION_SECRET = process.env.SESSION_SECRET || 'CHANGE_ME_IN_VERCEL';

function dbUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;
}

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  raw.split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > -1) out[p.slice(0,i).trim()] = decodeURIComponent(p.slice(i+1).trim());
  });
  return out;
}
function sign(value) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
}
function makeSession() {
  const payload = `${ADMIN_ID}.${Date.now()}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}
function validSession(req) {
  const token = parseCookies(req).vb_admin;
  if (!token) return false;
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return false;
  const payload = Buffer.from(b64, 'base64url').toString();
  const expected = sign(payload);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const parts = payload.split('.');
  return parts[0] === ADMIN_ID && Number.isFinite(Number(parts[1])) && Date.now()-Number(parts[1]) < 8*60*60*1000;
}
function verifyPassword(password) {
  const parts = ADMIN_PASSWORD_HASH.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const derived = crypto.scryptSync(password, parts[1], 64);
  return crypto.timingSafeEqual(derived, Buffer.from(parts[2], 'hex'));
}
function requireAuth(req,res) {
  if (!validSession(req)) {
    res.status(401).json({error:'Unauthorized'});
    return false;
  }
  return true;
}
module.exports = {crypto, ADMIN_ID, dbUrl, makeSession, validSession, verifyPassword, requireAuth};
