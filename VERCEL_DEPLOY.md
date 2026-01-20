# 🚀 Vercel Deployment Guide - Sprint 2

## Status: Ready for Production

- ✅ Code committed to GitHub
- ✅ Build tested locally
- ✅ Configuration files ready
- ✅ Environment variables documented

---

## 📋 Quick Deploy Steps

### Step 1: Ensure Code is on GitHub

```bash
cd C:\Users\lucas\casa-segura
git status              # Should show: "working tree clean"
git push               # All commits pushed
```

✅ **Status**: All commits already pushed to master

---

### Step 2: Deploy via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Find and select: `casa-segura`

#### Configure Project Settings:

- **Framework**: Next.js
- **Root Directory**: `apps/web-pro`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

### Step 3: Set Environment Variables

Click **"Environment Variables"** and add:

#### Development
```
NEXT_PUBLIC_API_URL = http://localhost:3333
NEXT_PUBLIC_APP_NAME = Casa Segura Pro
```

#### Production
```
NEXT_PUBLIC_API_URL = https://api.casasegura.com
NEXT_PUBLIC_APP_NAME = Casa Segura Pro
```

*(Replace with your actual API domain)*

---

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (typically 30-60 seconds)
3. Get your deployment URL: `https://web-pro-*.vercel.app`

---

## 🖥️ Alternative: CLI Deployment

### Option A: Deploy to Preview

```bash
cd C:\Users\lucas\casa-segura\apps\web-pro
vercel --yes
```

Output example:
```
✓ Deployed to https://web-pro-abc123.vercel.app [copied to clipboard]
```

### Option B: Deploy to Production

```bash
cd C:\Users\lucas\casa-segura\apps\web-pro
vercel --prod --yes
```

### Option C: Deploy from Root

```bash
cd C:\Users\lucas\casa-segura
vercel deploy --prod --yes
```

---

## 📊 Project Structure for Vercel

```
casa-segura/
├── apps/
│   └── web-pro/              ← Root Directory
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (dashboard)/
│       │   └── layout.tsx
│       ├── components/
│       ├── public/
│       ├── package.json       ← Dependencies
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       └── .next/             ← Build output
├── packages/
│   ├── shared/
│   └── database/
└── package.json              ← Workspace config
```

---

## 🔍 Troubleshooting

### Build Fails: "Cannot find module '@casa-segura/shared'"

**Solution**: Add `Root Directory` in Vercel settings:
- **Root Directory**: `./`
- Then Vercel will install workspace packages

### 404 on API Calls

**Solution**: Check environment variable in Vercel
```bash
vercel env ls
```

Update if needed:
```bash
vercel env add NEXT_PUBLIC_API_URL https://your-api.com
```

### Styles Not Loading

**Solution**: Rebuild with latest config
```bash
vercel rebuild --prod
```

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub: `git push`
- [ ] Latest commit: `0fa7d3c` or newer
- [ ] No pending changes: `git status` shows clean
- [ ] Build succeeds locally: `npm run build`
- [ ] Environment variables configured
- [ ] API endpoint updated (if not localhost)
- [ ] Test landing page loads
- [ ] Test login page displays
- [ ] Test dashboard components render

---

## 🔗 Useful Vercel Commands

```bash
# Login
vercel login

# Check who you're logged in as
vercel whoami

# List projects
vercel projects ls

# View deployments
vercel ls

# View logs
vercel logs

# Redeploy
vercel redeploy

# Rollback
vercel rollback

# Remove project
vercel remove web-pro
```

---

## 📈 Monitoring After Deploy

### Vercel Dashboard
- https://vercel.com/dashboard
- Check deployment logs
- Monitor performance metrics
- Set up alerts

### Test Checklist
1. ✅ Homepage loads
2. ✅ Login page displays
3. ✅ Dashboard renders
4. ✅ No console errors
5. ✅ Styles applied correctly
6. ✅ Mobile responsive

---

## 🚨 If Deployment Fails

### Step 1: Check Build Logs
```bash
vercel logs --pro
```

### Step 2: Verify Package.json
```bash
cd apps/web-pro
cat package.json
```

### Step 3: Test Build Locally
```bash
npm run build --workspace=@casa-segura/web-pro
```

### Step 4: Rollback
```bash
vercel rollback
```

---

## 🎯 Production Domain Setup

After deployment works:

1. Go to Vercel Project Settings
2. Click **"Domains"**
3. Add custom domain: `app-pro.casasegura.com` (example)
4. Update DNS records:
   ```
   CNAME: app-pro.casasegura.com → cname.vercel-dns.com
   ```
5. Wait for DNS propagation (5-48 hours)

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: https://github.com/lucastigrereal-dev/casa-segura/issues

---

## ✨ Current Deployment Status

| Component | Status | URL |
|-----------|--------|-----|
| Code | ✅ GitHub | https://github.com/lucastigrereal-dev/casa-segura |
| Build | ✅ Local | 87.2 KB bundle |
| Config | ✅ Ready | vercel.json, next.config.js |
| Env Vars | ⏳ Pending | Set in Vercel dashboard |
| Deployment | ⏳ Ready | Deploy now! |

---

**Ready to deploy? Start at Step 1 above!** 🚀
