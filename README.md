# MACHINED_EDC — Full E-commerce Platform

A blazing-fast, full-stack e-commerce site for precision-machined EDC tools (knives, lights, tools).

Built with:

- Next.js 16 (App Router) + TypeScript + Tailwind
- Prisma + SQLite (easy switch to Postgres)
- Auth.js v5 (credentials + roles)
- Server Components + Server Actions for speed

## Features

- Customer storefront with filter/sort/search/pagination
- Product detail pages with specs
- DB-backed cart (logged-in + guest with cookie merge)
- Placeholder checkout (creates PAID orders)
- Customer portal: profile, orders, wishlist
- Admin dashboard: catalog management, orders, stats
- Payments are placeholders (easy to swap real provider)

## Getting Started

### 1. Install & Run

```bash
npm install
npm run dev
```

Visit http://localhost:3000

### 2. Database

```bash
npm run db:push     # apply schema
npm run db:seed     # seed products + admin
```

### 3. Seeded Accounts

- Admin: `admin@machinededc.com` / `admin123`
- Customer: `user@example.com` / `customer123`

Login at `/login`

### Environment

`.env` is gitignored. The seed creates a `dev.db`.

Required vars (already generated on scaffold):

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

## Switching to Postgres (production)

1. Update `prisma/schema.prisma` datasource provider to `postgresql`
2. Set `DATABASE_URL` to your Postgres connection string
3. `npm run db:push` (or `prisma migrate dev`)
4. Re-seed if needed

## Project Structure

```
app/
  (storefront)
  /products/[slug]
  /cart
  /login /register
  /account/*          (customer portal)
  /admin/*            (guarded)
lib/
  db.ts, auth.ts, payment.ts
prisma/
  schema.prisma, seed.ts
public/products/      (product images)
```

## Admin

Visit `/admin` after logging in as the seeded admin.

You can:
- Create/edit/delete products + upload images + manage specs
- Manage categories
- View and update order statuses

## Notes

- All mutations use Server Actions.
- Cart supports guests via signed httpOnly cookie + merges on checkout.
- This is intentionally a complete but clean foundation — add real payments, emails, etc. as needed.
