# Deployment Guide - BBC Church Calendar

## Quick Deploy Options

### Option 1: Netlify Drop (Fastest - 2 minutes)
No account or build needed - just drag and drop!

1. **Build the project locally:**
   ```bash
   npm run build
   ```

2. **Go to [Netlify Drop](https://app.netlify.com/drop)**

3. **Drag the `dist` folder** onto the drop zone

4. **Your site is live!** 🎉

---

### Option 2: Git-based Deployment (Recommended for updates)
Auto-deploys when you push to GitHub.

#### Step 1: Push to GitHub
```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for BBC Church Calendar"

# Add your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/bbc-church-calendar.git

# Push
git push -u origin main
```

#### Step 2: Connect to Netlify

1. Go to [Netlify](https://app.netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize
4. Select your `bbc-church-calendar` repository
5. Build settings are pre-configured (see `netlify.toml`)
6. Click **Deploy site**

---

### Option 3: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

---

## Environment Variables (Optional)

If you later add Supabase backend, set these in Netlify:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

**To set in Netlify:**
1. Go to Site settings → Environment variables
2. Add each variable
3. Redeploy

---

## Custom Domain (Optional)

### Option A: Netlify Subdomain (Free)
Your site gets a free `your-site.netlify.app` URL.

To customize:
1. Site settings → Domain management
2. Click **Options** → **Edit site name**
3. Change to something like `bbc-calendar-2026`

### Option B: Custom Domain
1. Buy a domain (Namecheap, GoDaddy, Cloudflare)
2. In Netlify: Domain management → Add custom domain
3. Follow DNS instructions

---

## Updating the Site

### If using Git deployment:
```bash
# Make changes, then:
git add .
git commit -m "Update events"
git push
# Netlify auto-deploys!
```

### If using Netlify Drop:
1. Run `npm run build` again
2. Go to your site in Netlify dashboard
3. Deploys → Upload new folder
4. Drag new `dist` folder

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Node version (needs v18+) |
| 404 errors | Ensure `netlify.toml` redirects are in place |
| Images not showing | Images must be in `/public` folder |
| Changes not showing | Clear browser cache (Ctrl+Shift+R) |

---

## Current Data Storage

⚠️ **Important:** The app currently uses browser localStorage for data.
- Data is saved in each user's browser
- Different computers = different data
- Clear browser = data lost

To add persistent backend storage with Supabase, see `SUPABASE_SETUP.md`.
