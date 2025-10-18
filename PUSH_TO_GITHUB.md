# Push IntelliQuote to GitHub

## Quick Setup Guide

### Step 1: Create GitHub Repository

1. Go to: **https://github.com/new**
2. Fill in:
   - **Repository name**: `intelli-quoter`
   - **Description**: `Professional quotation builder with Next.js and Supabase`
   - **Visibility**: Choose Public or Private
   - ⚠️ **DO NOT** check "Initialize with README"
3. Click **"Create repository"**

### Step 2: Push Your Code

After creating the repo, run these commands in your terminal:

```bash
cd C:\Users\elvenwood\projects\intelli-quoter\intelli-quoter

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/intelli-quoter.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Verify

Visit your repository at: `https://github.com/YOUR_USERNAME/intelli-quoter`

---

## What's Included ✅

- 50 files committed
- 7,238 lines of code
- Complete Next.js 15 application
- Supabase integration
- Vercel deployment config
- Full documentation

## Live Demo

Your app is already deployed at:
**https://intelli-quoter.vercel.app**

---

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create intelli-quoter --public --source=. --remote=origin --push
```

---

## Need Help?

Tell me your GitHub username and I'll give you the exact commands!

