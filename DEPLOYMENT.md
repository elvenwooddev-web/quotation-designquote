# Deployment Guide - IntelliQuote

This guide covers deploying your Quote Builder application to production.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is the company behind Next.js and provides the best deployment experience.

#### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Vercel auto-detects Next.js settings

3. **Add Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add: `DATABASE_URL` with your PostgreSQL connection string
   - Click "Deploy"

4. **Run Database Migrations**
   ```bash
   # Using Vercel CLI
   vercel env pull .env.local
   npm run db:push
   ```

**Cost**: Free tier available

---

### Option 2: Railway

Railway provides a simple deployment with built-in PostgreSQL.

#### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

3. **Add PostgreSQL Database**
   - Click "Add Plugin"
   - Select "PostgreSQL"
   - Railway auto-generates DATABASE_URL

4. **Configure Environment**
   - DATABASE_URL is automatically linked
   - Add any other environment variables

5. **Deploy**
   - Railway automatically builds and deploys
   - Run migrations in Railway's terminal

**Cost**: Free tier with $5 credit/month

---

### Option 3: Netlify

Good alternative to Vercel with similar features.

#### Steps:

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site"
   - Import from Git

2. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Add Environment Variables**
   - Site settings > Environment variables
   - Add DATABASE_URL

4. **Deploy**
   - Netlify builds and deploys automatically

**Cost**: Free tier available

---

### Option 4: DigitalOcean App Platform

More control, slightly more complex.

#### Steps:

1. **Create App**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Create new App
   - Connect GitHub repository

2. **Add Database**
   - Add Managed PostgreSQL database
   - Copy connection string

3. **Configure Environment**
   - Add DATABASE_URL in app settings

4. **Deploy**
   - DigitalOcean builds and deploys

**Cost**: Starts at $5/month for app + $15/month for database

---

### Option 5: AWS (Advanced)

Most flexible but requires more configuration.

#### Components Needed:
- **AWS Amplify** or **AWS Elastic Beanstalk**: For Next.js app
- **AWS RDS**: For PostgreSQL database
- **AWS CloudFront**: For CDN (optional)
- **AWS Route 53**: For domain management (optional)

**Cost**: Variable, pay-as-you-go

---

## 📦 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are set
- [ ] Database is accessible from deployment platform
- [ ] Prisma schema is up to date
- [ ] Build succeeds locally (`npm run build`)
- [ ] All dependencies are in package.json
- [ ] .gitignore includes sensitive files
- [ ] DATABASE_URL uses connection pooling (if needed)

## 🔒 Environment Variables

Required for production:

```env
# Database (Required)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# App URL (Optional)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Connection Pooling

For production with Prisma, use connection pooling:

**Supabase:**
```
DATABASE_URL="postgresql://...?pgbouncer=true"
```

**Neon:**
```
DATABASE_URL="postgresql://...?sslmode=require&connection_limit=10"
```

## 🗄️ Database Setup

### For New Production Database:

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Push schema to database
npm run db:push

# 3. Seed initial data (optional)
npm run db:seed
```

### For Existing Database:

```bash
# Create a migration instead of push
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## 🔍 Testing Production Build Locally

Before deploying, test the production build:

```bash
# Build the application
npm run build

# Start in production mode
npm start
```

Visit http://localhost:3000 and verify everything works.

## 🌐 Custom Domain Setup

### Vercel:
1. Go to Project Settings > Domains
2. Add your domain
3. Update DNS records as instructed

### Railway:
1. Go to Settings > Networking
2. Click "Add Domain"
3. Update DNS records

## 📊 Post-Deployment

### 1. Verify Deployment

Check these endpoints:
- `GET /` - Main application loads
- `GET /api/categories` - Returns categories
- `GET /api/products` - Returns products
- `POST /api/quotes` - Can create quotes

### 2. Monitor Performance

Use built-in analytics:
- **Vercel**: Built-in analytics dashboard
- **Railway**: Metrics tab
- **Netlify**: Analytics section

### 3. Set Up Error Tracking (Optional)

Integrate error tracking:
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)
- [Rollbar](https://rollbar.com)

## 🔄 Continuous Deployment

All platforms support automatic deployment:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Automatic Build**
   - Platform detects changes
   - Runs build process
   - Deploys new version

3. **Zero Downtime**
   - All platforms support zero-downtime deployments

## 🐛 Troubleshooting

### Build Failures

**Issue**: Build fails during deployment
```bash
# Solution: Check build logs
# Common causes:
# - Missing environment variables
# - TypeScript errors
# - Dependency issues
```

**Fix**:
```bash
# Test build locally first
npm run build

# Check all environment variables are set
# Fix any TypeScript errors
```

### Database Connection Issues

**Issue**: "Can't reach database server"
```bash
# Solutions:
# 1. Check DATABASE_URL is correct
# 2. Verify database is accessible from deployment platform
# 3. Check firewall rules
# 4. Use connection pooling for serverless
```

### API Route Errors

**Issue**: API routes return 500 errors
```bash
# Check:
# 1. Environment variables are set
# 2. Prisma Client is generated
# 3. Database schema is up to date
```

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit .env files
   - Use platform-specific secrets management
   - Rotate credentials regularly

2. **Database**
   - Use SSL connections
   - Enable connection pooling
   - Limit concurrent connections
   - Regular backups

3. **Application**
   - Keep dependencies updated
   - Enable CORS properly
   - Implement rate limiting
   - Add authentication (future)

## 📈 Scaling Considerations

As your application grows:

1. **Database**
   - Upgrade to larger instance
   - Enable read replicas
   - Implement caching (Redis)

2. **Application**
   - Enable CDN
   - Implement edge caching
   - Use serverless functions

3. **Monitoring**
   - Set up uptime monitoring
   - Track performance metrics
   - Monitor error rates

## 💰 Cost Estimates

### Free Tier (Good for testing)
- **Vercel**: Free
- **Database**: Supabase/Neon free tier
- **Total**: $0/month

### Starter Production (Small business)
- **Vercel Pro**: $20/month
- **Database**: Neon/Supabase Pro $25/month
- **Total**: $45/month

### Growing Business
- **Railway/DigitalOcean**: $20/month
- **Managed Database**: $50/month
- **CDN**: $10/month
- **Total**: $80/month

## 🎯 Recommended Setup

For most users:

1. **Platform**: Vercel (easy deployment, great Next.js support)
2. **Database**: Supabase or Neon (free tier, automatic backups)
3. **Domain**: Namecheap or Cloudflare (affordable)
4. **Monitoring**: Vercel Analytics (built-in)

**Total Cost**: $0-20/month depending on usage

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Railway Documentation](https://docs.railway.app)

## ✅ Deployment Complete!

Your Quote Builder is now live and ready to use. Share the URL with your team and start creating quotes!

---

**Need help?** Check the platform-specific documentation or contact their support teams.



