# Authority13 - Deployment Guide

## Quick Start for Local Development

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Setup Environment Variables

Copy `.env.example` to `.env`:

\`\`\`bash
DATABASE_URL="postgresql://user:password@localhost:5432/authority13"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="your-secret-here"  # Generate: openssl rand -base64 32
MASTER_KEY="your-master-key-here"   # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

### 3. Database Setup

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed demo data
npm run db:seed
\`\`\`

### 4. Start Development

Terminal 1 (Web server):
\`\`\`bash
npm run dev
\`\`\`

Terminal 2 (Worker):
\`\`\`bash
npm run worker
\`\`\`

### 5. Login

- URL: http://localhost:3000
- Email: demo@authority13.ai
- Password: demo1234

---

## Production Deployment (Vercel + Supabase + Upstash)

### Step 1: Supabase (PostgreSQL)

1. Go to https://supabase.com
2. Create new project
3. Copy connection string from Settings → Database
4. Format as: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true`

### Step 2: Upstash (Redis)

1. Go to https://upstash.com
2. Create Redis database
3. Copy REST URL (format: `redis://...`)

### Step 3: Vercel Deployment

1. Push code to GitHub
2. Import to Vercel: https://vercel.com/new
3. Add environment variables:
   - `DATABASE_URL` (from Supabase)
   - `REDIS_URL` (from Upstash)
   - `NEXTAUTH_SECRET` (generate new)
   - `MASTER_KEY` (generate new)
   - `NEXTAUTH_URL` (your Vercel URL)

4. Deploy

### Step 4: Run Migrations

In Vercel dashboard, go to Settings → Environment Variables and add:
\`\`\`bash
npx prisma migrate deploy
npx prisma db seed
\`\`\`

Or run locally with production DATABASE_URL.

### Step 5: Worker Deployment (Railway/Render)

The BullMQ worker must run separately:

**Railway:**
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add same environment variables
4. Set start command: `npm run worker`
5. Deploy

**Render:**
1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Build Command: `npm install`
4. Start Command: `npm run worker`
5. Add environment variables
6. Deploy

---

## Configuration

### Add Your First API Key

1. Login to Authority13
2. Go to Settings → API Keys
3. Select provider (OpenAI/Anthropic/Google)
4. Paste your API key
5. Save

Keys are encrypted with AES-256-GCM.

### Create Your First Task

1. Go to Mission Control
2. In Commander chat, type: "Draft outreach to 10 leads"
3. Watch the task plan generate
4. Check Approvals page for pending actions
5. Approve or edit the action
6. See results in Timeline

---

## Troubleshooting

### Database Connection Issues

- Check `DATABASE_URL` format
- Supabase: Use connection pooler (pgbouncer=true)
- Ensure firewall allows connections

### Worker Not Processing Jobs

- Check `REDIS_URL` is correct
- Ensure worker is running: `npm run worker`
- Check worker logs for errors

### API Keys Not Working

- Verify `MASTER_KEY` is set and consistent
- Check API key is valid with provider
- View Settings → API Keys to confirm saved

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

---

## Monitoring

### Database

\`\`\`bash
npx prisma studio
\`\`\`

### Logs

- **Vercel**: View in dashboard
- **Worker**: Check Railway/Render logs
- **Local**: Terminal output

### Redis

- Upstash Console: View job queue
- Check active jobs and failed jobs

---

## Backup & Recovery

### Database Backup

Supabase provides automatic backups. To manually backup:

\`\`\`bash
pg_dump $DATABASE_URL > backup.sql
\`\`\`

### Restore

\`\`\`bash
psql $DATABASE_URL < backup.sql
\`\`\`

---

## Scaling

### Horizontal Scaling

- **Frontend**: Vercel auto-scales
- **Workers**: Deploy multiple worker instances to Railway/Render
- **Database**: Supabase handles scaling
- **Redis**: Upstash handles scaling

### Performance Optimization

- Add database indexes for common queries
- Enable Redis caching for read-heavy operations
- Use connection pooling (pgbouncer)
- Monitor with Vercel Analytics

---

## Security Checklist

- [ ] `MASTER_KEY` is strong (32+ bytes)
- [ ] `NEXTAUTH_SECRET` is unique per environment
- [ ] API keys are never logged or exposed
- [ ] Database connection uses SSL
- [ ] Rate limiting is enabled
- [ ] CORS is configured properly
- [ ] Workspace isolation is enforced

---

## Support

For deployment issues:
- Check logs first
- Review this guide
- Contact: support@authority13.ai
