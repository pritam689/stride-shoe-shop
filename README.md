# STRIDE — Shoe store (React + Tailwind + Supabase)

## Setup
1. Create a project at supabase.com.
2. Open **SQL Editor**, paste all of `supabase/schema.sql`, and run it (tables, RLS policies, storage bucket, sample shoes).
3. Copy `.env.example` to `.env` and fill in the project URL and **anon** key (Project Settings > API).
4. `npm install` then `npm run dev`.

## Make yourself admin
Register in the app, then run in the SQL Editor:
`update public.profiles set role = 'admin' where email = 'you@example.com';`
Roles can't be changed from the browser, so nobody can promote themselves.

## Optional
- **Google login**: Authentication > Providers > Google (add your Google OAuth client ID/secret there, not in the app). Add `http://localhost:5173` and your live URL under Authentication > URL Configuration.
- **Email confirmation**: Authentication > Providers > Email. Turn "Confirm email" off for quick local testing.
- **Hosting**: any static host; add a rewrite of all paths to `index.html` (single-page app).

## Not included
Online payment. Checkout creates a "pending" order on the server (`place_order` function, prices and stock checked in the database). Card payments need a secret key, so add Stripe through a Supabase Edge Function.
Website deployment update
