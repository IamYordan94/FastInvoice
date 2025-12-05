# Setup Guide

## Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL Database** - You can use:
   - [Vercel Postgres](https://vercel.com/storage/postgres) (recommended for Vercel deployment)
   - [Supabase](https://supabase.com) (free tier available)
   - [Neon](https://neon.tech) (free tier available)
   - Local PostgreSQL

## Local Development Setup

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/invoice_generator?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# App
NODE_ENV="development"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
5. Deploy!

### 3. Database Options for Vercel

**Option A: Vercel Postgres (Recommended)**
1. In your Vercel project, go to Storage
2. Create a Postgres database
3. Copy the connection string to `DATABASE_URL`
4. Run migrations: `npx prisma db push` (or use Vercel CLI)

**Option B: Supabase**
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (use "Connection pooling" for serverless)
5. Add to Vercel environment variables

**Option C: Neon**
1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to Vercel environment variables

### 4. Run Database Migrations

After deployment, you need to run migrations. You can:

**Option A: Use Vercel CLI**
```bash
npm i -g vercel
vercel env pull .env.local
npx prisma db push
```

**Option B: Use Prisma Migrate (Recommended for production)**
```bash
npx prisma migrate dev --name init
```

## First Use

1. Register a new account
2. Go to Settings and fill in your company information
3. Add your first client
4. Add your first service/item
5. Create your first invoice!

## Troubleshooting

### Database Connection Issues

- Make sure your `DATABASE_URL` is correct
- For serverless (Vercel), use connection pooling
- Check if your database allows connections from your IP (for local dev)

### PDF Generation Issues

- Make sure all dependencies are installed: `npm install`
- Check browser console for errors
- PDF generation happens server-side, so check Vercel function logs

### Authentication Issues

- Make sure `NEXTAUTH_SECRET` is set and consistent
- Check `NEXTAUTH_URL` matches your deployment URL
- Clear browser cookies if having login issues

## Project Structure

```
/app              - Next.js pages (App Router)
  /api            - API routes
  /dashboard      - Dashboard page
  /invoices       - Invoice pages
  /clients        - Client management
  /items          - Item management
  /settings       - User settings
/components       - React components
/lib              - Utilities and helpers
/prisma           - Database schema
/public           - Static assets
```

## Next Steps

- Add email sending (use Resend, SendGrid, or similar)
- Add automatic invoice numbering rules
- Add recurring invoices
- Add multiple invoice templates
- Add payment reminders
- Add statistics and reports

## Support

If you encounter issues:
1. Check the console/terminal for errors
2. Check Vercel function logs (if deployed)
3. Verify all environment variables are set
4. Make sure database is accessible

