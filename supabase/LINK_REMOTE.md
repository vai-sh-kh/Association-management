# Link this project to Supabase remote

## If your remote project is the one in `.env.local` (mlkwtmnxpgpcwvltzsvg)

1. Log in with the Supabase account that owns that project:
   ```bash
   supabase login
   ```
2. From this directory, link and enter the **database password** when prompted (the one you set in the Supabase dashboard for that project):
   ```bash
   supabase link --project-ref mlkwtmnxpgpcwvltzsvg
   ```
   Or with password in one go (replace `YOUR_DB_PASSWORD` with your project’s database password):
   ```bash
   supabase link --project-ref mlkwtmnxpgpcwvltzsvg --password 'YOUR_DB_PASSWORD'
   ```

## If you want to use the project already visible in the CLI (e.g. starwood-cms)

1. Link to it (replace `YOUR_DB_PASSWORD` with that project’s database password):
   ```bash
   supabase link --project-ref nnnjssmenheceqyphats --password 'YOUR_DB_PASSWORD'
   ```
2. Update `.env.local` with that project’s URL and anon key from **Supabase Dashboard → Settings → API**.

## Current link

This project is **linked to: starwood-cms** (ref `nnnjssmenheceqyphats`).

Make sure `.env.local` uses that project’s credentials:
- **URL:** `https://nnnjssmenheceqyphats.supabase.co`
- **Anon key:** Supabase Dashboard → your project → Settings → API → anon public

## After linking

- Push migrations: `supabase db push`
- Run remote SQL (e.g. admin seed) in **Dashboard → SQL Editor**, or run seed SQL manually in the dashboard.
