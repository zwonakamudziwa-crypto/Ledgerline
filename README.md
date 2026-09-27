# Ledgerline — Bookkeeping Retainer Site

A landing page selling a monthly bookkeeping retainer at three tiers (R5,750 /
R10,700 / R16,500 per month), with Payfast subscription checkout and a
Supabase-backed lead capture form. Built for a South Africa-based business.

This guide assumes you've never done this before. Follow it in order.

## The accounts you'll need to create (all free to start)

1. **Payfast** — payfast.co.za — this is who actually processes the money.
2. **Supabase** — supabase.com — stores your leads and payment records.
3. **GitHub** — github.com — holds your code so a hosting service can find it.
4. **Vercel** — vercel.com — hosts the actual live website. Free for a site
   like this.

You don't need to be technical to sign up for any of these — they're normal
web signups, like making an email account.

## Step 1: Get a Payfast account

1. Go to payfast.co.za and click Sign Up, choose "Business" account.
2. You'll need a South African ID/business registration and a bank account
   for payouts. Approval can take a day or two — that's normal, don't worry
   if it's not instant.
3. **While you wait for approval**, you can build and test everything using
   Payfast's sandbox (fake-money test mode) — the credentials for that are
   already in `.env.local.example` and work without an account.
4. Once approved, go to Settings → Integration in your Payfast dashboard to
   find your real `merchant_id` and `merchant_key`. You'll also be able to
   set a "passphrase" there — do this, it adds a layer of security to every
   transaction. Keep all three private, never put them in code you share.

## Step 2: Get a Supabase account

1. Go to supabase.com, sign up, create a new project (pick a name and a
   database password — save that password somewhere).
2. Once it's created, go to the SQL Editor (left sidebar) and paste this in,
   then click Run — it creates the two tables this site needs:
   ```sql
   create table leads (
     id uuid primary key default gen_random_uuid(),
     email text not null,
     source text,
     created_at timestamp with time zone default now()
   );

   create table payments (
     id uuid primary key default gen_random_uuid(),
     m_payment_id text,
     pf_payment_id text,
     amount_gross text,
     item_name text,
     email text,
     status text,
     created_at timestamp with time zone default now()
   );
   ```
3. Go to Settings → API. You'll see a "Project URL" and an "anon public" key
   — copy both, you'll need them in Step 4.

## Step 3: Put the code on GitHub

1. If this is your first time: create a Next.js project locally with
   `npx create-next-app@latest ledgerline --typescript --tailwind --app`,
   then copy these files into it, keeping the same folder structure:
   - `app/page.tsx`
   - `app/api/checkout/route.ts`
   - `app/api/payfast/notify/route.ts`
   - `lib/payfast.ts`
   - `lib/supabase.ts`
2. Install the one extra package this needs: `npm install @supabase/supabase-js`
3. Create a new repository on github.com, then follow GitHub's instructions
   on that page to push your project to it (it gives you the exact commands
   to copy-paste, based on whether your code is already in a folder or not).

## Step 4: Set your environment variables

Copy `.env.local.example` to a new file called `.env.local` and fill it in
with the real values from Steps 1 and 2. Leave `PAYFAST_MODE=sandbox` for now
— you'll flip this to `live` only once you're ready to accept real payments.

## Step 5: Put it online

I can hand this off to a hosting service directly if you'd like — see the
option below. If you'd rather do it yourself: create a Vercel account, click
"Add New Project," pick your GitHub repository, then before clicking Deploy,
open "Environment Variables" and paste in everything from your `.env.local`
file (same names, same values), except set `NEXT_PUBLIC_SITE_URL` to the
`.vercel.app` address Vercel will give your project. Click Deploy.

## Step 6: Test it for real before going live

1. With `PAYFAST_MODE=sandbox`, click through your own pricing table and pay
   with Payfast's test card details (Payfast's sandbox login page shows these
   on screen — no real card needed).
2. Confirm a row appears in your Supabase `payments` table after a
   successful test payment. If it doesn't, check your Vercel deployment logs
   for errors — that's where problems will show up.
3. Once real payments matter: switch `PAYFAST_MODE` to `live`, replace the
   sandbox `PAYFAST_MERCHANT_ID`/`PAYFAST_MERCHANT_KEY` with your real ones
   from Step 1, and redeploy.

## Before you take real money

- Replace the footer placeholder with your real business name, address, and
  a support contact.
- Add a privacy policy and terms of service page — link them near checkout.
- Add a `/success` page (the checkout flow redirects here after payment).
- Replace the placeholder capacity numbers (150/500/unlimited transactions,
  5/15 employees) with what you can actually deliver per client.
- Re-check the three prices in `app/page.tsx` (`TIERS` array, near the top)
  against what similar SA bookkeepers charge — the numbers there are a rough
  starting point, not researched pricing.

## If something breaks

The most common issue is a Payfast "signature mismatch" — this almost always
means an environment variable is missing or has extra spaces in it. Double
check `.env.local` (or Vercel's environment variables) against
`.env.local.example` exactly.
