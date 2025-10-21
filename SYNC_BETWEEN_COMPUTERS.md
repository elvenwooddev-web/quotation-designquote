# Syncing Work Between Your Computers

This guide explains how to keep your work synchronized between multiple computers when you're the same developer working on different machines.

## Initial Setup on Second Computer

Since you're the same person, you have two options:

### Option 1: Pull from GitHub (Recommended)

If this is the first time setting up on your second computer:

```bash
# Navigate to where you want the project
cd your-projects-folder

# Pull from GitHub
git clone https://github.com/elvenwooddev-web/quotation-designquote.git
cd quotation-designquote

# Install dependencies
npm install

# Create .env file (see below)
# Then run
npm run dev
```

### Option 2: Copy Project Folder

Alternatively, you can copy the entire project folder to your second computer via:
- USB drive
- Cloud storage (Google Drive, OneDrive, Dropbox)
- Network share

**If copying the folder:**
1. Copy the entire `quotation-designquote` folder
2. On the second computer, open terminal in that folder
3. Run `npm install` (to rebuild node_modules for your OS)
4. Verify `.env` file exists
5. Run `npm run dev`

## Environment Setup (.env file)

On your second computer, create a `.env` file in the project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://tmrjuedenuidfhbnocya.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcmp1ZWRlbnVpZGZoYm5vY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTc4MDksImV4cCI6MjA3NjI5MzgwOX0.mv6vhKF9uuMoByeHghzeDePBgjt_3mU8Au22kL1VpbQ"
```

## Daily Workflow: Syncing Between Computers

### When Starting Work on Computer A

```bash
# Pull latest changes from GitHub
git pull origin main

# Install any new dependencies (if package.json changed)
npm install

# Start working
npm run dev
```

### When Finishing Work on Computer A

```bash
# Save your changes
git add .
git commit -m "Your commit message"
git push origin main
```

### When Starting Work on Computer B

```bash
# Pull the changes you made on Computer A
git pull origin main

# Install any new dependencies (if package.json changed)
npm install

# Start working
npm run dev
```

### When Finishing Work on Computer B

```bash
# Save your changes
git add .
git commit -m "Your commit message"
git push origin main
```

## Quick Reference Commands

### Check Current Status
```bash
git status
```

### See What Changed
```bash
git diff
```

### Pull Latest Changes
```bash
git pull origin main
```

### Save and Push Your Work
```bash
git add .
git commit -m "Description of what you changed"
git push origin main
```

### Check Commit History
```bash
git log --oneline -10
```

## Important Notes

### ✅ What Gets Synced via GitHub:
- All source code files
- Configuration files (package.json, tsconfig.json, etc.)
- Documentation files
- Migration files
- Everything except what's in `.gitignore`

### ❌ What Does NOT Get Synced:
- `node_modules/` folder (too large, OS-specific)
- `.env` file (security - keep separate copy)
- `.next/` build folder
- Build artifacts
- Local cache files

### 💡 Pro Tips:

1. **Always pull before starting work:**
   ```bash
   git pull origin main
   ```
   This prevents conflicts and ensures you have the latest code.

2. **Commit frequently:**
   - Don't wait until end of day
   - Commit after completing each feature/fix
   - Use descriptive commit messages

3. **Push regularly:**
   - Push after each commit or at end of work session
   - This backs up your work to GitHub
   - Makes it available on your other computer

4. **Keep .env file consistent:**
   - Same credentials on both computers
   - Store a backup copy somewhere safe (password manager, secure note)

5. **Run `npm install` after pulling:**
   - Only needed if `package.json` or `package-lock.json` changed
   - Safe to run anytime - won't hurt

## Database Considerations

**Good News:** You don't need to worry about database sync!

- ✅ Both computers connect to the same Supabase database (cloud)
- ✅ Data changes are immediately available on both computers
- ✅ No need to export/import data between computers
- ✅ Users, clients, quotes, products are all shared

## Handling Conflicts

If you accidentally work on both computers without syncing:

```bash
# When git pull shows conflicts
git status  # See conflicting files

# Option 1: Keep your local changes
git stash
git pull origin main
git stash pop
# Manually resolve conflicts in your editor

# Option 2: Discard local changes and use GitHub version
git reset --hard origin/main
```

**Best Practice:** Always push from one computer before switching to another!

## Typical Work Pattern

### Morning - Computer A (Home)
```bash
cd quotation-designquote
git pull origin main
npm run dev
# ... work on features ...
git add .
git commit -m "Add client KPI dashboard"
git push origin main
```

### Afternoon - Computer B (Office)
```bash
cd quotation-designquote
git pull origin main  # Gets your morning work
npm run dev
# ... continue working ...
git add .
git commit -m "Fix dashboard styling"
git push origin main
```

### Evening - Back to Computer A (Home)
```bash
cd quotation-designquote
git pull origin main  # Gets your afternoon work
npm run dev
# ... continue working ...
```

## Troubleshooting

### "Your branch is behind 'origin/main'"
```bash
git pull origin main
```

### "Your local changes would be overwritten"
```bash
# Save your work first
git stash
git pull origin main
git stash pop
```

### "Failed to push - updates were rejected"
```bash
# Someone else (or you on another computer) pushed first
git pull origin main
git push origin main
```

### Different Node.js versions on computers
- Use the same Node.js version on both (v20.x recommended)
- Use `nvm` (Node Version Manager) to switch versions easily

## First Time Setup Checklist for Second Computer

- [ ] Install Node.js v20+
- [ ] Install Git
- [ ] Clone repository OR copy project folder
- [ ] Create `.env` file with Supabase credentials
- [ ] Run `npm install`
- [ ] Run `npm run dev` to verify everything works
- [ ] Test: Open http://localhost:3000

## Regular Workflow Checklist

**Before Starting Work:**
- [ ] Run `git pull origin main`
- [ ] Run `npm install` (if package.json changed)
- [ ] Run `npm run dev`

**After Finishing Work:**
- [ ] Run `git add .`
- [ ] Run `git commit -m "descriptive message"`
- [ ] Run `git push origin main`

---

**Remember:** GitHub is your "sync service" - always push from one computer before switching to another!
