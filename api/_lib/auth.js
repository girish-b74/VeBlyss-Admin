const crypto = require('crypto');
const { timingSafeEqual } = crypto;

const TEMP_USERNAME = 'veblyss-admin';
const TEMP_PASSWORD = 'Veblyss@2026!Admin';
const TEMP_HASH = 'scrypt$16384$8$1$74yQIPnqrPNYoSHLIV2g3g==$R7y08cHBUe+3cnPR04kxSNhBU3XDqm7kzRotrJq+q2iafZKirtBj1LS9I9lAtx9pe4Cd1HB5nDlJIaq59a0cCg==';

function hashPassword(password, encoded) {
  const parts = encoded.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const N = Number(parts[1]), r = Number(parts[2]), p = Number(parts[3]);
  const salt = Buffer.from(parts[4], 'base64');
  const expected = Buffer.from(parts[5], 'base64');
  const actual = crypto.scryptSync(password, salt, expected.length, { N, r, p, maxmem: 32 * 1024 * 1024 });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function configuredHash() {
  return process.env.ADMIN_PASSWORD_HASH || TEMP_HASH;
}
function configuredUsername() {
  return process.env.ADMIN_USERNAME || TEMP_USERNAME;
}
function configuredSecret() {
  return process.env.SESSION_SECRET || 'veblyss-test-session-secret-change-before-production-2026';
}
function b64url(buf) { return Buffer.from(buf).toString('base64url'); }
function sign(value) { return b64url(crypto.createHmac('sha256', configuredSecret()).update(value).digest()); }
function makeToken(username) {
  const payload = { u: username, exp: Date.now() + 8 * 60 * 60 * 1000, n: crypto.randomBytes(16).toString('hex') };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  return body + '.' + sign(body);
}
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.u !== configuredUsername() || payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}
function parseCookies(req) {
  const h = req.headers.cookie || '';
  return Object.fromEntries(h.split(';').filter(Boolean).map(x => {
    const i = x.indexOf('='); return [x.slice(0,i).trim(), decodeURIComponent(x.slice(i+1).trim())];
  }));
}
function setSession(res, username) {
  const token = makeToken(username);
  res.setHeader('Set-Cookie', `vb_admin=${encodeURIComponent(token)}; Path=/; Max-Age=28800; HttpOnly; Secure; SameSite=Strict`);
}
function clearSession(res) { res.setHeader('Set-Cookie','vb_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict'); }
function requireAuth(req, res) {
  const user = verifyToken(parseCookies(req).vb_admin);
  if (!user) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  return user;
}
function validCredentials(username, password) {
  return username === configuredUsername() && hashPassword(password, configuredHash());
}
module.exports = { validCredentials, setSession, clearSession, requireAuth, configuredUsername, TEMP_USERNAME, TEMP_PASSWORD };
