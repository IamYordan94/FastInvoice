# Invoice Generator SaaS

A personal billing brain for small businesses that remembers your info, clients, and services to generate invoices in seconds.

## Features

- **Remember Everything**: Your business info, clients, and services are saved once and reused forever
- **Fast Invoicing**: Create invoices in 3 clicks after initial setup
- **PDF Generation**: Professional invoices with consistent formatting
- **Payment Tracking**: See who paid, who's late, and your totals
- **Dashboard**: Overview of all invoices and their status

## Tech Stack

- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database (via Vercel Postgres or Supabase)
- **NextAuth.js** - Authentication
- **Tailwind CSS** - Styling
- **@react-pdf/renderer** - PDF generation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your database URL and NextAuth secret.

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is optimized for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## Project Structure

```
/app              - Next.js app router pages
/components       - Reusable UI components
/lib              - Utilities and helpers
/prisma           - Database schema
/public           - Static assets
```

## License

MIT

