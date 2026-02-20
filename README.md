# GRE Vocab Master 📚

A production-ready web app for GRE vocabulary practice with user authentication, persistent weak-pairs tracking, and visual cluster learning.

**Live URL:** https://gre-vocab-app-phi.vercel.app/

---

## **Features**

✅ **Practice Quiz** — Interactive synonym pairing with visual feedback  
✅ **Word Search** — Find word definitions and synonyms from 1,100 GRE vocab list  
✅ **Visual Tree** — Explore word clusters organized by meaning  
✅ **Weak Pairs** — Auto-tracking of frequently incorrect pairs  
✅ **User Authentication** — Email/password signup & login via Supabase  
✅ **Persistent Storage** — Weak-pairs saved per user in Supabase PostgreSQL  
✅ **Automatic Deployment** — Every GitHub push deploys to Vercel instantly  

---

## **Quick Start (Local Development)**

### **Prerequisites**
- Node.js 18+ (https://nodejs.org/)
- npm (comes with Node.js)
- Git (https://git-scm.com/)

### **Setup**

```bash
# Clone the repository
git clone https://github.com/Bhuvan-BM/GRE_vocab_app.git
cd GRE_vocab_app

# Install dependencies
npm install

# Create .env.local file with Supabase credentials
echo "VITE_SUPABASE_URL=https://cexjkwmmuyfbsxfqgsrs.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=<your-anon-key>" >> .env.local
```

### **Run Dev Server**

```bash
npm run dev
```

Open http://localhost:5173/ in your browser.

### **Build for Production**

```bash
npm run build
npm run preview
```

---

## **Tech Stack**

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 5 |
| **Styling** | Tailwind CSS 3 |
| **Icons** | Lucide React |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Hosting** | Vercel |
| **CI/CD** | GitHub Actions |

---

## **Project Structure**

```
src/
├── GRE_Vocab_Complete_App_FINAL.jsx   # Main app logic (practice, tree, weak pairs, search)
├── AppWithAuth.jsx                     # Auth wrapper component
├── components/
│   └── Auth.jsx                        # Login/signup UI
├── lib/
│   ├── supabaseClient.js              # Supabase client initialization
│   └── weakPairsService.js            # Database operations for weak_pairs
├── main.jsx                            # Entry point (React + AppWithAuth)
└── index.css                           # Tailwind + globals
```

---

## **Environment Variables**

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://cexjkwmmuyfbsxfqgsrs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** `.env.local` is in `.gitignore` — it won't be pushed to GitHub.

---

## **Database Schema**

**Table:** `weak_pairs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Reference to auth.users (FK) |
| `word1` | TEXT | First word in pair |
| `word2` | TEXT | Second word in pair |
| `word1_info` | JSONB | Word metadata (meaning, synonyms, cluster) |
| `word2_info` | JSONB | Word metadata |
| `reason` | TEXT | Why this pair is weak |
| `attempts` | INT | Number of attempts |
| `correct_streak` | INT | Consecutive correct answers |
| `last_seen` | TIMESTAMPTZ | Last date/time seen |
| `created_at` | TIMESTAMPTZ | Created timestamp |
| `updated_at` | TIMESTAMPTZ | Last updated timestamp |

**Row Level Security (RLS):** Users can only access their own rows.

---

## **Deployment**

### **Vercel (Live)**

✅ **Already configured!** Every push to `main` triggers automatic deployment.

- **URL:** https://gre-vocab-app-phi.vercel.app/
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Already configured in Vercel dashboard

### **Making Changes & Deploying**

```bash
# Make changes locally
git add .
git commit -m "Your message"
git push origin main
```

Vercel will automatically rebuild and deploy within 1-2 minutes.

---

## **Commands Reference**

### **Local Development**
```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build locally
```

### **Git & Deployment**
```bash
git status        # Check what changed
git add .         # Stage all changes
git commit -m "message"  # Commit changes
git push origin main     # Push to GitHub (triggers Vercel deploy)
git log --oneline -10   # View last 10 commits
```

### **Supabase**
- **Dashboard:** https://supabase.com/dashboard/project/cexjkwmmuyfbsxfqgsrs
- **SQL Editor:** Write queries directly
- **Authentication:** Manage users and auth settings
- **Table Editor:** Browse/edit weak_pairs data

---

## **Common Tasks**

### **Add a New Feature**

1. Create a new branch (optional but recommended):
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make changes to files in `src/`

3. Test locally:
   ```bash
   npm run dev
   ```

4. Commit and push:
   ```bash
   git add .
   git commit -m "Add my feature"
   git push origin main  # (or feature/my-feature if on a branch)
   ```

5. Vercel will auto-deploy ✅

### **Check Build Status**

- **Vercel:** https://vercel.com/dashboard
- **GitHub Actions:** https://github.com/Bhuvan-BM/GRE_vocab_app/actions

### **Troubleshoot Build Failures**

1. Check GitHub Actions logs:
   ```
   https://github.com/Bhuvan-BM/GRE_vocab_app/actions
   ```

2. Check Vercel build logs:
   ```
   https://vercel.com/gre-vocab-app-phi/deployments
   ```

3. Run locally to debug:
   ```bash
   npm run dev
   npm run build  # test build
   ```

---

## **Sharing with Friends**

✅ **The app is ready to share!**

1. Send this URL: https://gre-vocab-app-phi.vercel.app
2. Friends can:
   - Click **"Create Account"** to sign up
   - Take practice quizzes
   - Search words
   - Track weak pairs (saved in their account)

---

## **Maintenance & Monitoring**

### **Uptime Monitoring** (Optional)

To get alerts if the app goes down, add a free uptime monitor:
1. Go to https://uptimerobot.com
2. Add URL: https://gre-vocab-app-phi.vercel.app
3. Get email alerts if down

### **Database Backups**

Supabase automatically backs up your database. To manually backup:
1. Go to Supabase Dashboard → Settings → Backups
2. Click "Request Backup Now"

### **View User Activity**

- Go to Supabase Dashboard → SQL Editor
- Run: `SELECT * FROM weak_pairs ORDER BY last_seen DESC LIMIT 20;`

---

## **Support & Troubleshooting**

| Issue | Solution |
|-------|----------|
| **Login not working** | Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel env vars |
| **Weak pairs not saving** | Check Supabase connection and RLS policies in `weak_pairs` table |
| **App won't build** | Run `npm install` locally, check for syntax errors, view GitHub Actions logs |
| **Slow deployment** | Vercel takes 1-2 min; check status at https://vercel.com/dashboard |

---

## **Future Enhancements**

- [ ] Add progress analytics/dashboard
- [ ] Export weak pairs as PDF
- [ ] Mobile app (React Native)
- [ ] Timed practice mode
- [ ] Custom word lists
- [ ] Leaderboard

---

## **License**

MIT

---

**Questions?** Check the code or open a GitHub Issue.

**Last Updated:** Feb 20, 2026
