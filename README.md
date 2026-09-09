# VeBlyss Admin — Vercel + Neon Test v1

This build is specifically for the `ve-blyss-admin.vercel.app` test project.

## Temporary login
- Admin ID: `veblyss-admin`
- Temporary password: `Veblyss@2026!Admin`

The temporary password is represented by a server-side scrypt hash in the code for this test build. Before production, set `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and a strong `SESSION_SECRET` in Vercel Environment Variables.

## Neon
The API accepts the connection variable created by the Vercel/Neon integration: `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, or `POSTGRES_URL_NON_POOLING`.

Do not commit database credentials to GitHub.

## Deploy
Upload this project to the `ve-blyss-admin` GitHub repository connected to Vercel. Vercel should detect the `/api` serverless functions automatically.

Open:
`https://ve-blyss-admin.vercel.app/admin`

On the first successful API request, the products table is created and the six existing VeBlyss products are seeded.

## Product management
Admin can add, edit, publish/hide and delete products. New product images can currently be entered as URLs. Persistent image upload/storage should be added with Vercel Blob or another object store before production.

## Public product API
`GET /api/public/products` returns published products for future connection to the main website. CORS is enabled for this endpoint.

## Not activated yet
- Razorpay
- SMTP transactional email

Those will be added later without exposing secrets in the browser.
