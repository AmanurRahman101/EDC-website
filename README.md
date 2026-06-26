<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
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
>>>>>>> 2b4c19988bf757b77acbd7324522581fd434d52a
