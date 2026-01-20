# Sprint 2 Deployment Guide

## 📱 Web-Pro Application Deployment

### Local Testing

```bash
# Start all development servers (Turbo)
npm run dev

# OR individual servers
npm run dev:pro       # Port 3002 - Web Pro
npm run dev:api       # Port 3333 - API
npm run dev:client    # Port 3000 - Web Client
npm run dev:admin     # Port 3001 - Web Admin
```

### Build & Test

```bash
# Build all apps
npm run build

# Build only web-pro
cd apps/web-pro && npm run build
```

### Deploy to Vercel

#### Option 1: GitHub Integration (Recommended)

1. Push changes to GitHub:
   ```bash
   git push
   ```

2. Go to [Vercel Dashboard](https://vercel.com)

3. Click "New Project" → "Import Git Repository"

4. Select `casa-segura` repository

5. Configure settings:
   - **Framework**: Next.js
   - **Build Command**: `npm run build --workspace=@casa-segura/web-pro`
   - **Output Directory**: `apps/web-pro/.next`
   - **Install Command**: `npm install`

6. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your API base URL (e.g., `https://api.casasegura.com`)
   - `NEXT_PUBLIC_APP_NAME`: Casa Segura Pro

7. Click "Deploy"

#### Option 2: CLI Deployment

```bash
# Login to Vercel
vercel login

# Deploy from root directory
cd C:\Users\lucas\casa-segura
vercel deploy --yes

# Or deploy to production
vercel deploy --prod --yes
```

#### Option 3: Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build --workspace=@casa-segura/web-pro

EXPOSE 3002

CMD ["npm", "run", "start", "--workspace=@casa-segura/web-pro"]
```

### Environment Variables (Vercel)

#### Development
```
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_APP_NAME=Casa Segura Pro
```

#### Staging
```
NEXT_PUBLIC_API_URL=https://staging-api.casasegura.com
NEXT_PUBLIC_APP_NAME=Casa Segura Pro (Staging)
```

#### Production
```
NEXT_PUBLIC_API_URL=https://api.casasegura.com
NEXT_PUBLIC_APP_NAME=Casa Segura Pro
```

## 🗄️ Database Setup

### Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with test data
npm run db:seed

# View database (Prisma Studio)
npm run db:studio
```

## 🔐 API Backend Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Docker (optional)

### Deploy to Railway/Render/Heroku

Create a `.env` file:
```
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_jwt_secret_here
API_PORT=3333
```

Build and deploy:
```bash
cd apps/api
npm run build
npm start
```

## 📊 Deployment Checklist

- [ ] All tests pass: `npm run test`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API base URL updated in web-pro
- [ ] CORS configured correctly
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and logging configured
- [ ] Backups enabled
- [ ] Domain configured

## 🚨 Troubleshooting

### Build Fails with "Cannot find module '@casa-segura/database'"

**Solution**: This is a monorepo workspace issue. Ensure:
1. All packages are built: `npm run build`
2. Vercel uses correct build command (see above)
3. `package.json` has correct workspace references

### 404 on API Calls

**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check CORS configuration in API
3. Ensure API is running and accessible

### Styles Not Loading

**Solution**:
1. Verify Tailwind config is correct
2. Check PostCSS configuration
3. Rebuild: `npm run clean && npm install && npm run build`

## 📝 Post-Deployment

1. Test all major flows:
   - Professional login
   - View available jobs
   - Send quote
   - Client accept quote

2. Monitor logs:
   - Vercel: https://vercel.com/docs/monitoring
   - API: Configure logging service

3. Set up alerts for:
   - Build failures
   - API errors
   - High latency

## 🔄 Rollback Procedure

If deployment fails:

```bash
# Vercel rollback (automatic with git)
git revert <commit-hash>
git push

# Manual rollback
vercel rollback
```

## 📞 Support

- Issues: https://github.com/lucastigrereal-dev/casa-segura/issues
- Documentation: See `README.md`
- API Docs: `http://localhost:3333/api/docs`
