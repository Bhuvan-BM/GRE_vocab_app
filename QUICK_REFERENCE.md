# GRE Vocab App – Quick Reference Cheatsheet

## 🚀 **Production Workflow (for you & collaborators)**

### **1. Start Fresh** (First time only)
```bash
git clone https://github.com/Bhuvan-BM/GRE_vocab_app.git
cd GRE_vocab_app
npm install
```

### **2. Local Development Loop**
```bash
npm run dev                # Start dev server → http://localhost:5173
# Make changes to src/ files
# Browser hot-reloads automatically
```

### **3. Test Before Deploy**
```bash
npm run build             # Build optimized dist/
npm run preview           # Preview production build locally
```

### **4. Deploy to Live** (Automatic!)
```bash
git add .
git commit -m "Your message"
git push origin main
# ✅ Vercel auto-deploys within 1-2 minutes
```

---

## 📊 **Monitoring & Debugging**

| What to Check | Where |
|---------------|-------|
| **App Status** | https://gre-vocab-app-phi.vercel.app |
| **Build Logs** | https://github.com/Bhuvan-BM/GRE_vocab_app/actions |
| **Deployments** | https://vercel.com/dashboard |
| **Database** | https://supabase.com/dashboard/project/cexjkwmmuyfbsxfqgsrs |
| **Source Code** | https://github.com/Bhuvan-BM/GRE_vocab_app |

---

## 🔧 **Common Commands**

```bash
# Git
git status                # See what changed
git log --oneline         # View commit history
git add .                 # Stage all changes
git commit -m "msg"       # Commit locally
git push origin main      # Push to GitHub (triggers deploy)
git pull origin main      # Get latest from GitHub

# Dev
npm run dev               # Dev server
npm run build             # Production build
npm run preview           # Preview prod build
npm install <package>     # Add new package

# Supabase (SQL Editor in dashboard)
SELECT * FROM weak_pairs WHERE user_id = 'user-id';
SELECT * FROM weak_pairs ORDER BY last_seen DESC LIMIT 10;
```

---

## 📁 **Key Files & What They Do**

```
src/GRE_Vocab_Complete_App_FINAL.jsx  → Main quiz app (47 clusters, 1100+ words)
src/AppWithAuth.jsx                    → Login wrapper
src/components/Auth.jsx                → Signup/login form
src/lib/supabaseClient.js              → Database connection
src/lib/weakPairsService.js            → Database CRUD operations
src/main.jsx                           → App entry point
```

---

## 🌍 **URLs at a Glance**

| Purpose | Link |
|---------|------|
| **Live App** | https://gre-vocab-app-phi.vercel.app |
| **GitHub Repo** | https://github.com/Bhuvan-BM/GRE_vocab_app |
| **GitHub Actions** | https://github.com/Bhuvan-BM/GRE_vocab_app/actions |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/cexjkwmmuyfbsxfqgsrs |

---

## 💾 **Environment Variables**

**Local (.env.local — NOT in git):**
```env
VITE_SUPABASE_URL=https://cexjkwmmuyfbsxfqgsrs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Production (in Vercel dashboard):** Same vars already configured ✅

---

## 🐛 **Troubleshooting**

**Problem:** `npm install` fails  
**Solution:** `rm -rf node_modules package-lock.json && npm install`

**Problem:** Changes not showing on live site  
**Solution:** Check Vercel build logs → https://vercel.com/dashboard

**Problem:** Login not working  
**Solution:** Verify env vars in Vercel dashboard contain correct Supabase keys

**Problem:** Build fails on GitHub Actions  
**Solution:** View logs → https://github.com/Bhuvan-BM/GRE_vocab_app/actions

---

## ✅ **Deployment Checklist**

- [x] **Frontend** — Vite + React + Tailwind (done)
- [x] **Backend** — Supabase auth + weak_pairs table (done)
- [x] **Hosting** — Vercel live (done)
- [x] **CI/CD** — GitHub Actions build verification (done)
- [x] **Documentation** — README + this cheatsheet (done)
- [ ] **Custom Domain** — Optional (add in Vercel Settings → Domains)
- [ ] **Uptime Monitor** — Optional (use UptimeRobot)
- [ ] **Analytics** — Optional (Vercel Web Analytics)

---

## 🎯 **Share with Friends**

✅ App is production-ready!

**Send them:** https://gre-vocab-app-phi.vercel.app

They can sign up → practice → track weak pairs (all persistent & secured)

---

## ⚡ **Quick Stats**

| Metric | Value |
|--------|-------|
| **Word Clusters** | 47 |
| **GRE Vocab** | 1,100+ words |
| **Users** | Multi-user with auth |
| **Database** | PostgreSQL (Supabase) |
| **Build Time** | ~30 seconds |
| **Deploy Time** | 1-2 minutes |
| **Uptime** | 99.9% (Vercel) |

---

## 📞 **In Case of Emergency**

1. Check GitHub Actions logs for build errors
2. Check Vercel deployment status
3. Check Supabase dashboard for database connectivity
4. Review code for recent changes
5. Rollback last commit: `git revert HEAD`

---

**Last Updated:** Feb 20, 2026  
**Status:** ✅ Production Live & Auto-Deploying
