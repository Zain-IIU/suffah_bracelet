# Suffah — bracelet shop

Online store for Suffah bracelets, in the "Blush Atelier" design.

- **Shop**: home page, shop by category, bracelet pages with photo gallery, bag, checkout.
- **Checkout without online payment**: the customer enters name, phone, address and city. The order is saved and you confirm it by phone or WhatsApp. Payment is cash on delivery.
- **Admin** (`/admin`): see and manage orders, add or edit bracelets (photos, price, sale price, label, stock, show or hide), and change delivery fees, the announcement bar, contact details and categories.

Built with Next.js, Tailwind CSS and Supabase (database, photo storage, admin login).

---

## 1. Set up Supabase (about 10 minutes)

1. Create a free account at [supabase.com](https://supabase.com) and click **New project**. Pick the region closest to your customers. Save the database password somewhere safe.
2. When the project is ready, open **SQL Editor → New query**. Paste the whole contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. This creates the tables, the security rules, the order function and the photo storage.
3. *(Optional)* Run [`supabase/sample-products.sql`](supabase/sample-products.sql) the same way to add 6 sample bracelets for testing.
4. **Create your admin login.**
   - Go to **Authentication → Users → Add user → Create new user**. Enter your email and a strong password, and tick **Auto confirm user**.
   - Back in the **SQL Editor**, run the query below with your email:
     ```sql
     insert into public.admins (user_id)
     select id from auth.users where email = 'you@example.com';
     ```
   - Repeat for anyone else who should have admin access.
5. **Stop strangers from creating accounts.** In **Authentication → Sign In / Providers**, turn off **Allow new users to sign up**. Customers don't need accounts.
6. **Copy your keys.** Go to **Project Settings → API**. You need:
   - the **Project URL**
   - the **anon public** key (or the **publishable** key)

   Never use the `service_role` / secret key in this app.

## 2. Run it on your computer

You need [Node.js](https://nodejs.org) 20.9 or newer. On Windows you can just double-click
**setup.cmd** once, then **start.cmd**. The Supabase URL and public key are already set in
`src/lib/supabase/env.ts`; environment variables override them.

```bash
cd suffah
npm install
npm run dev
```

- Shop: <http://localhost:3000>
- Admin: <http://localhost:3000/admin>. Sign in with the admin user you created.

Before you deploy, place a test order and check that it appears in the admin.

## 3. Put it online (GitHub Actions → Vercel)

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
it installs, type-checks and builds the site, and if all of that passes it deploys to Vercel.
Pull requests get the same checks without deploying.

One-time setup:
1. Create a free account at [vercel.com](https://vercel.com) (sign in with GitHub).
2. Create a token at **vercel.com/account/tokens** (name it `github-actions`).
3. In GitHub, open the repository → **Settings → Secrets and variables → Actions → New repository secret**.
   Name: `VERCEL_TOKEN`, value: the token.
4. Push to `main`, or open **Actions → Check and deploy → Run workflow**. The first run creates a Vercel project
   called **suffah**. The live address appears in the run summary.
5. *(Optional)* In Vercel → project **suffah** → **Settings → Domains**, add your own domain.
   Set `NEXT_PUBLIC_SITE_URL` under **Environment Variables** if you use a custom domain.

**Plans for a live store.** Vercel's free Hobby plan is for non-commercial use only, so a selling store needs **Vercel Pro**. Supabase pauses free projects after a week without activity, so upgrade to **Supabase Pro** when you launch.

### Optional: email alert for each new order

Create a free account at [resend.com](https://resend.com), verify your domain, and set `RESEND_API_KEY`, `ORDER_ALERT_EMAIL` (where alerts go, comma-separate for several) and `RESEND_FROM` (e.g. `Suffah Orders <orders@suffah.pk>`). Without these, orders still appear in the admin, which refreshes every 30 seconds.

---

## Using the admin

| I want to… | Go to |
|---|---|
| See new orders | **Dashboard** or **Orders → New** |
| Confirm an order | Open it → **Confirm on WhatsApp** (the message is pre-filled with the order) or **Call**, then set the status to **Confirmed** |
| Track an order | Change the status: Confirmed → Shipped → Delivered (or Cancelled) and add private notes |
| Add a bracelet | **Bracelets → Add bracelet**. Add the name, price, photos (the first one is the cover), category and label |
| Run a sale | Edit the bracelet → enter a **Sale price** lower than the price. Clear it to end the sale |
| Mark something sold out | Untick **In stock** |
| Hide a bracelet | Click **Visible/Hidden** in the list, or untick **Show in shop** |
| Change the homepage picture | Tick **Feature on homepage** on one bracelet |
| Change delivery fee or free-delivery amount, top banner, WhatsApp number, Instagram | **Settings** |
| Add or remove categories | **Settings → Categories** |

Changes show up in the shop immediately.

## How orders stay safe

- Customers can't read anyone's orders. Only signed-in admins can, which the database security rules enforce.
- Prices are always recalculated in the database (`place_order` function), so nobody can change a price from their browser.
- Fake-order protection includes a hidden bot trap, phone and address checks, and a limit of 5 orders per phone number per hour.

## Project structure

```
supabase/schema.sql            database tables, security rules, order function, photo storage
supabase/sample-products.sql   optional demo bracelets
src/app/(shop)/                shop pages: home, shop, product/[slug], bag, checkout, order-placed
src/app/actions/place-order.ts saves an order (validation + optional email alert)
src/app/admin/login/           admin sign-in
src/app/admin/(panel)/         dashboard, orders, bracelets, settings + all admin actions
src/components/                shop and admin components
src/lib/                       Supabase clients, data loading, cart, helpers
src/middleware.ts              keeps admins signed in; protects /admin
```

## Troubleshooting

- **"Missing Supabase settings"**: `.env.local` (or the Vercel environment variables) is missing the URL or key. Restart `npm run dev` after editing it.
- **"This account doesn't have admin access"**: run the `insert into public.admins …` query from step 1.4 with that email.
- **Photo upload fails**: make sure `schema.sql` ran fully (it creates the `product-images` bucket) and that you're signed in as an admin. Photos must be JPG, PNG, WebP, GIF or AVIF and under 5 MB.
- **Shop shows no bracelets**: add some in the admin, or run `sample-products.sql`. Hidden bracelets don't show in the shop.
