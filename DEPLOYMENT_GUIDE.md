# Deployment Guide

This guide explains how to deploy the ME Portal to production.

## Architecture

```
Developer / AI
     ↓
   GitHub Repository
     ↓
   Vercel (automatic deployment)
     ↓
   Next.js Application
     ↓
   Supabase
   ├── PostgreSQL Database
   ├── Auth
   └── Storage
```

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to Egypt, e.g., EU West)
3. Wait for the project to initialize
4. Go to **SQL Editor** and run the full contents of `supabase/migrations/001_initial_schema.sql`
5. Go to **Storage** and create two buckets:
   - `task-attachments` — set to **Public**
   - `materials` — set to **Public**

### Storage Policies for task-attachments bucket
In Supabase Storage > task-attachments > Policies:
- Enable public read: `(bucket_id = 'task-attachments')`
- Restrict write to authenticated admins

## Step 2: Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this SECRET!)

## Step 3: GitHub

1. Push the project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/must-me-portal.git
   git push -u origin main
   ```

## Step 4: Vercel Deployment

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your GitHub repository
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
   - `NEXT_PUBLIC_APP_URL` = your Vercel domain (e.g., `https://must-me-portal.vercel.app`)
5. Click **Deploy**
6. Wait for the build to complete

## Step 5: Create First Admin

1. Open your deployed app and create an account (or do it via Supabase Auth dashboard)
2. Go to Supabase SQL Editor and run:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```
3. Visit `/admin/login` and sign in

## Step 6: Custom Domain (Optional)

1. In Vercel project settings → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## Step 7: PWA Installation

Students can install the portal as a mobile app:
- **Android**: Tap the browser menu → "Add to Home Screen"
- **iPhone**: Tap the Share button → "Add to Home Screen"
- **Desktop Chrome**: Click the install icon in the address bar

## Environment Variables Reference

| Variable | Where to find it | Example |
|----------|------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | `https://abcd1234.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | `eyJhbGci...` |
| `NEXT_PUBLIC_APP_URL` | Your deployment URL | `https://me-portal.vercel.app` |

> ⚠️ **Never share your `SUPABASE_SERVICE_ROLE_KEY`**. It has full database access and must only be used on the server.

## Troubleshooting

**Build fails**: Check that all environment variables are set correctly in Vercel.

**"User not found" when granting admin**: The user must register on the app first.

**Files not uploading**: Make sure the storage buckets exist and are set to public.

**RLS errors**: Ensure you ran the complete migration SQL, including the RLS policies.
