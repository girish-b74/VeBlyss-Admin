# VeBlyss Admin + Product Management

This package adds a secure server-side admin area to the existing VeBlyss website.

## First run
1. Install Node.js 18+.
2. Copy `.env.example` to `.env`.
3. Set `JWT_SECRET` to a long random secret.
4. Set `ADMIN_EMAIL` (used as the Admin ID) and `ADMIN_PASSWORD` before the first run. The temporary development credentials are `veblyss-admin` / `Veblyss@2026!Admin`; replace them before production.
5. Run `npm install` then `npm start`.
6. Open `/admin`.

The first run creates the admin account and seeds the six current products into SQLite. Passwords are bcrypt-hashed. Admin authentication uses an HTTP-only, SameSite cookie and rate-limited login.

## Important
- Do not commit `.env`, `data/veblyss.db`, or uploaded images to a public repository.
- In production use HTTPS and set NODE_ENV=production.
- This is the backend foundation for product management. Razorpay and SMTP credentials can be added later as server-side environment secrets.
