# 🚀 Push KoinClink to GitHub & Deploy to Netlify

## 📦 Step 1: Create GitHub Repository

### Option A: Using GitHub Website (Recommended)
1. Go to [github.com](https://github.com)
2. Click "New repository" (green button)
3. Repository name: `koinclink-casino`
4. Description: `🎰 Professional virtual casino with user authentication and leaderboards`
5. Keep it **Public** (for free Netlify deployment)
6. **DO NOT** initialize with README (we already have files)
7. Click "Create repository"

### Option B: Using GitHub CLI (if you have it)
```bash
gh repo create koinclink-casino --public --description "🎰 Professional virtual casino with user authentication and leaderboards"
```

## 📤 Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/koinclink-casino.git

# Push code to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 3: Deploy to Netlify

### Quick Deploy (5 minutes)
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify
4. Select your `koinclink-casino` repository
5. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `out`
6. Click "Deploy site"

### Add Environment Variables (Required for Authentication)
After deployment:
1. Go to Site settings → Environment variables
2. Add these variables (you'll get them from Supabase):
   ```
   NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
   ```
3. Trigger a new deploy

## 🗄️ Step 4: Setup Supabase (Before Going Live)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy Project URL and anon key
4. Run all SQL from `DATABASE_SETUP.md` in SQL Editor

### Test Your Live Site
1. Visit your Netlify URL
2. Test guest mode (should work immediately)
3. Test user registration (requires Supabase setup)
4. Check leaderboards and authentication flow

## ✅ Your Site Will Be Live At:
`https://your-site-name.netlify.app`

## 🎯 Next Steps After Deployment
1. **Custom Domain** (optional): Add your own domain in Netlify
2. **Analytics**: Add Google Analytics or Netlify Analytics
3. **Monitoring**: Set up error tracking with Sentry
4. **SEO**: Add meta tags and sitemap

---

**Total Time**: ~15 minutes from code to live site with user accounts! 🚀
