# Setup Guide - Quotation DesignQuote

This guide will help you set up and run the Quotation DesignQuote application on a new computer.

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

- **Node.js** (v20.x or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

To verify installations, run:
```bash
node --version
npm --version
git --version
```

## Step-by-Step Setup

### 1. Clone the Repository

Open your terminal/command prompt and run:

```bash
git clone https://github.com/elvenwooddev-web/quotation-designquote.git
cd quotation-designquote
```

### 2. Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will download and install all dependencies listed in `package.json`. It may take a few minutes.

### 3. Configure Environment Variables

⚠️ **IMPORTANT**: The `.env` file is not included in the repository for security reasons.

Create a new file named `.env` in the project root directory and add the following:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://tmrjuedenuidfhbnocya.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcmp1ZWRlbnVpZGZoYm5vY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTc4MDksImV4cCI6MjA3NjI5MzgwOX0.mv6vhKF9uuMoByeHghzeDePBgjt_3mU8Au22kL1VpbQ"
```

**How to create the .env file:**

**On Windows:**
- Open Notepad or any text editor
- Paste the environment variables above
- Save as `.env` (not `.env.txt`) in the project root folder
- Make sure "Save as type" is set to "All Files"

**On Mac/Linux:**
```bash
touch .env
nano .env
# Paste the environment variables, then press Ctrl+X, Y, Enter to save
```

### 4. Run the Development Server

Start the development server:

```bash
npm run dev
```

You should see output similar to:
```
▲ Next.js 15.5.6 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 3.8s
```

### 5. Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

You should see the login page of the Quotation DesignQuote application.

## Default Login Credentials

The application may have demo users set up. Check with your team for login credentials.

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in development mode with Turbopack (faster builds).
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`
Builds the app for production to the `.next` folder.
Uses Turbopack for faster builds.

### `npm start`
Runs the production build.
You must run `npm run build` first.

### `npm test`
Runs Playwright end-to-end tests.

### `npm run test:ui`
Runs Playwright tests with UI mode for debugging.

### `npm run db:studio`
Opens Prisma Studio (database GUI) if configured.

## Project Structure

```
quotation-designquote/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # Backend API endpoints
│   ├── catalog/           # Product catalog page
│   ├── clients/           # Client management page
│   ├── login/             # Authentication page
│   ├── quotations/        # Quotations list page
│   ├── quotes/            # Quote builder and detail pages
│   ├── settings/          # Settings page
│   └── page.tsx           # Dashboard (home page)
├── components/            # React components
├── lib/                   # Utilities and shared logic
├── migrations/            # Database migration files
├── public/                # Static assets
├── .env                   # Environment variables (YOU CREATE THIS)
├── package.json           # Project dependencies
└── README.md             # Project documentation
```

## Database

This application uses **Supabase** as the database (PostgreSQL). The database is hosted in the cloud, so:

- ✅ You don't need to install or configure a local database
- ✅ All data is shared across all installations
- ✅ Changes made on one PC are immediately available on others
- ✅ The `.env` file contains the connection credentials

## Troubleshooting

### Issue: "Module not found" errors

**Solution:** Make sure you've run `npm install`

### Issue: "Cannot connect to database"

**Solution:**
1. Check that your `.env` file exists and has the correct credentials
2. Verify you have internet connection (Supabase is cloud-based)
3. Ensure the environment variable names are exactly as shown (case-sensitive)

### Issue: Port 3000 is already in use

**Solution:**
- Stop any other application using port 3000
- Or run on a different port: `npm run dev -- -p 3001`

### Issue: "EACCES" or permission errors

**Solution:**
- On Mac/Linux: You may need to use `sudo` for some commands
- On Windows: Run your terminal as Administrator

### Issue: Build/compilation errors after cloning

**Solution:**
1. Delete `node_modules` folder
2. Delete `package-lock.json` file
3. Run `npm install` again
4. Run `npm run dev`

### Issue: Changes not reflecting in the browser

**Solution:**
- Hard refresh the browser (Ctrl+F5 on Windows, Cmd+Shift+R on Mac)
- Clear browser cache
- Restart the development server

## Technology Stack

- **Framework:** Next.js 15.5.6 (App Router with Turbopack)
- **Runtime:** React 19.1.0
- **Language:** TypeScript 5
- **Database:** Supabase (PostgreSQL)
- **State Management:** Zustand 5.0.8
- **Styling:** Tailwind CSS 4
- **PDF Generation:** @react-pdf/renderer
- **Charts:** Chart.js with react-chartjs-2
- **Testing:** Playwright

## Database Migrations

If you need to apply database migrations, you can find SQL migration files in the `migrations/` folder.

To apply them manually:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration file contents
4. Execute the SQL

## Need Help?

- Check the `CLAUDE.md` file for detailed codebase documentation
- Review `README.md` for project overview
- Check `QUICKSTART.md` for quick start instructions
- Review other documentation files in the root directory

## Production Deployment

For production deployment to Vercel:

1. Push your code to GitHub (already done)
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables from `.env` file
5. Deploy

Vercel will automatically detect Next.js and configure the build settings.

## Important Notes

- 🔒 **Never commit the `.env` file to Git** - It contains sensitive credentials
- 📦 The `node_modules/` folder is also not committed (it's large and generated)
- 🔄 Always run `npm install` after pulling new changes from Git
- 🗄️ Database changes made on any computer affect all installations (shared Supabase database)
- 🌐 The application requires internet connection to access the Supabase database

## Support

For issues or questions, contact your development team or refer to the project documentation.

---

**Last Updated:** October 2025
