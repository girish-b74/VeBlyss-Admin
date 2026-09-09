# VeBlyss Admin — Vercel + Neon Clean Build

This is a Vercel-native static frontend + `/api` serverless functions project. It does not use Express, SQLite, a start script, or custom rewrites.

## Temporary test login
Admin ID: `veblyss-admin`
Temporary password: `Veblyss@2026!Admin`

For production, set these Vercel environment variables:
- `ADMIN_ID`
- `ADMIN_PASSWORD_HASH` (scrypt format)
- `SESSION_SECRET`
- `DATABASE_URL` (or the Neon variable already supplied by Vercel)

The bundled temporary password is intended only for this isolated test deployment. Replace it before production.

## Deploy
Put the contents of this folder directly in the GitHub repository root connected to `ve-blyss-admin.vercel.app`. No `vercel.json` is required.

## Neon
The API supports `DATABASE_URL`, `POSTGRES_URL`, `NEON_DATABASE_URL`, or `POSTGRES_URL_NON_POOLING`.
The first successful product API call creates the `products` table and seeds the six current VeBlyss products.
