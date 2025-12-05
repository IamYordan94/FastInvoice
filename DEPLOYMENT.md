# Deployment Guide

## Quick Deploy to Vercel

### Step 1: Prepare Your Code

Make sure your code is in a Git repository (GitHub, GitLab, or Bitbucket).

### Step 2: Set Up Database

Choose one:

**Vercel Postgres (Easiest)**
1. In Vercel dashboard, go to your project
2. Click "Storage" → "Create Database" → "Postgres"
3. Copy the connection string

**Supabase (Free Tier)**
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Settings → Database → Connection string (use pooling mode)
4. Copy connection string

**Neon (Free Tier)**
1. Go to [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:

   **Environment Variables:**
   ```
   DATABASE_URL=your_postgres_connection_string
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_random_secret_here
   ```

   **Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. Click "Deploy"

### Step 4: Run Database Migrations

After first deployment:

**Option A: Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma generate
npx prisma db push
```

**Option B: Direct Database Access**
If you have direct database access:
```bash
# Set DATABASE_URL in your local .env
npx prisma db push
```

### Step 5: Update NEXTAUTH_URL

After deployment, update `NEXTAUTH_URL` in Vercel:
1. Go to Project Settings → Environment Variables
2. Update `NEXTAUTH_URL` to your actual Vercel URL
3. Redeploy

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables set correctly
- [ ] NEXTAUTH_URL matches deployment URL
- [ ] Can register new account
- [ ] Can create invoice
- [ ] PDF generation works
- [ ] All pages load correctly

## Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Update `NEXTAUTH_URL` environment variable
4. Redeploy

## Monitoring

- Check Vercel dashboard for function logs
- Monitor database usage
- Set up error tracking (Sentry, etc.)

## Scaling

- Vercel automatically scales
- Database: Upgrade plan if needed
- Consider connection pooling for high traffic

