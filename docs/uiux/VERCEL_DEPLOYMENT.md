# 🚀 Vercel Production Deployment Guide

**Project**: OASYS Landing Page  
**Framework**: Next.js 16.0.7  
**Build Command**: `npm run build`  
**Output Directory**: `.next`

---

## 📋 Pre-Deployment Checklist

- [x] ✅ Build succeeds locally (`npm run build`)
- [x] ✅ All dependencies installed
- [x] ✅ Environment variables documented
- [x] ✅ Production optimizations complete
- [ ] ⏳ Environment variables configured in Vercel
- [ ] ⏳ Custom domain configured (if needed)

---

## 🚀 Quick Deployment

### Step 1: Navigate to Project Directory

```bash
cd apps/uiux
```

### Step 2: Deploy to Production

```bash
vercel --prod
```

This will:
1. Build your Next.js app
2. Upload to Vercel
3. Deploy to production
4. Give you a production URL

---

## 📝 Detailed Deployment Steps

### 1. Login to Vercel (if not already)

```bash
vercel login
```

### 2. Link Project (first time only)

If this is the first deployment:

```bash
vercel link
```

This will ask you:
- **Set up and deploy?** → Yes
- **Which scope?** → Your Vercel account
- **Link to existing project?** → No (or Yes if linking to existing)
- **What's your project's name?** → `oasys-landing-page` (or your preferred name)
- **In which directory is your code located?** → `./`

### 3. Set Environment Variables

Before deploying, set environment variables in Vercel:

**Option A: Via CLI**
```bash
vercel env add NEXT_PUBLIC_API_BASE_URL production
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
```

**Option B: Via Vercel Dashboard**
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add each variable:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend-api.com`
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-api.com/api`
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com`

### 4. Deploy to Production

```bash
vercel --prod
```

---

## 🔧 Environment Variables

### Required for Production

```bash
# API Configuration (Update with your production backend URL)
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api

# Site Configuration (Update with your production domain)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Optional

```bash
# Analytics (enabled by default)
NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED=true
```

---

## 📊 Post-Deployment

### 1. Verify Deployment

After deployment, Vercel will provide:
- **Production URL**: `https://your-project.vercel.app`
- **Preview URLs**: For each deployment

### 2. Test Production Site

- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Forms submit correctly
- [ ] Images load
- [ ] Mobile menu works
- [ ] All sections render

### 3. Set Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` environment variable

### 4. Monitor

- **Analytics**: Check Vercel Analytics dashboard
- **Logs**: Monitor deployment logs in Vercel dashboard
- **Performance**: Run Lighthouse audit

---

## 🐛 Troubleshooting

### Build Fails

1. **Check build logs**: `vercel --prod --debug`
2. **Test locally**: `npm run build`
3. **Check environment variables**: Ensure all required vars are set

### Environment Variables Not Working

1. **Redeploy after adding env vars**: `vercel --prod`
2. **Check variable names**: Must start with `NEXT_PUBLIC_` for client-side
3. **Verify in Vercel dashboard**: Settings → Environment Variables

### Images Not Loading

1. **Check image paths**: Should be relative to `/public`
2. **Verify Next.js Image config**: Check `next.config.mjs`
3. **Check CORS**: If loading from external source

### API Calls Failing

1. **Verify API URLs**: Check environment variables
2. **Check CORS**: Backend must allow your Vercel domain
3. **Check network**: Use browser DevTools Network tab

---

## 📈 Performance Optimization

After deployment, verify:

1. **Lighthouse Audit**: Run in Chrome DevTools
2. **Core Web Vitals**: Check Vercel Analytics
3. **Bundle Size**: Verify with `npm run analyze`
4. **Load Time**: Test from different locations

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production**: From `main`/`master` branch (if connected to Git)
- **Preview**: From pull requests and other branches

### Manual Deployment

```bash
# Production
vercel --prod

# Preview
vercel
```

---

## 📚 Resources

- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

## ✅ Deployment Checklist

Before deploying:
- [x] Build succeeds locally
- [ ] Environment variables configured
- [ ] Backend API is accessible from production
- [ ] Custom domain ready (if using)

After deploying:
- [ ] Production site loads
- [ ] Forms work correctly
- [ ] API calls succeed
- [ ] Analytics tracking works
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active

---

**Ready to deploy?** Run `vercel --prod` from the `apps/uiux` directory!

