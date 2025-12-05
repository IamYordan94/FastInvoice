# Deployment Guide

## Quick Deploy to Vercel

### Step 1: Prepare Your Code

Make sure your code is in a Git repository (GitHub, GitLab, or Bitbucket).

### Step 2: Deploy to Vercel and Set Up Vercel Postgres

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your Git repository (`https://github.com/IamYordan94/FastInvoice.git`)
4. Vercel will detect Next.js automatically

5. **Before clicking "Deploy", set up Vercel Postgres:**
   - In the project configuration page, scroll down to "Storage"
   - Click "Create Database" → Select "Postgres"
   - Choose a name for your database (e.g., "fastinvoice-db")
   - Select a region (choose closest to you)
   - Click "Create"
   - **Important:** Vercel will automatically add the `POSTGRES_URL` environment variable
   - Copy the connection string that appears (you'll need it for Prisma)

6. **Set Environment Variables:**
   
   Vercel Postgres automatically creates `POSTGRES_URL`, but Prisma uses `DATABASE_URL`. You need to:
   
   - In the Environment Variables section, add:
     ```
     DATABASE_URL = (copy the POSTGRES_URL value here)
     ```
   
   - Generate and add `NEXTAUTH_SECRET`:
     ```bash
     # Run this locally to generate a secret:
     openssl rand -base64 32
     ```
     Then add it as:
     ```
     NEXTAUTH_SECRET = (paste the generated secret)
     ```
   
   - Add `NEXTAUTH_URL` (you'll update this after first deployment):
     ```
     NEXTAUTH_URL = https://your-app-name.vercel.app
     ```
     (Replace `your-app-name` with your actual project name, or leave it and update after deployment)

7. **Build Settings** (should auto-detect):
   - Framework Preset: Next.js
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

8. Click "Deploy"

### Step 3: Run Database Migrations

After the first deployment completes:

1. **Install Vercel CLI** (if you haven't already):
   ```bash
   npm i -g vercel
   ```

2. **Link your local project to Vercel:**
   ```bash
   vercel login
   vercel link
   ```
   (Select your project when prompted)

3. **Pull environment variables:**
   ```bash
   vercel env pull .env.local
   ```
   This will create a `.env.local` file with your Vercel environment variables.

4. **Run Prisma migrations:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   This will create all the database tables in your Vercel Postgres database.

**Alternative:** If you prefer to use the Vercel dashboard:
- Go to your project → Storage → Your Postgres database
- Use the "Query" tab to run SQL manually (not recommended for initial setup)

### Step 4: Update NEXTAUTH_URL (If Needed)

After deployment completes, check your actual deployment URL:

1. Go to your Vercel project dashboard
2. Check the "Domains" section to see your actual URL (e.g., `fastinvoice-xyz.vercel.app`)
3. Go to Project Settings → Environment Variables
4. Update `NEXTAUTH_URL` to match your actual deployment URL:
   ```
   NEXTAUTH_URL = https://fastinvoice-xyz.vercel.app
   ```
5. Click "Save" and Vercel will automatically redeploy

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

