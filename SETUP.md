# Setup Instructions for IntelliQuote

Follow these steps to get the Quote Builder application running on your local machine.

## Step 1: Prerequisites

Make sure you have the following installed:
- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **PostgreSQL**: Download from [postgresql.org](https://www.postgresql.org/download/) or use a cloud service like [Supabase](https://supabase.com/) or [Neon](https://neon.tech/)

## Step 2: Clone and Install

```bash
# Navigate to project directory
cd intelli-quote2

# Install dependencies
npm install
```

## Step 3: Database Setup

### Option A: Local PostgreSQL

1. **Start PostgreSQL** on your machine
2. **Create a database**:
   ```sql
   CREATE DATABASE intelli_quote;
   ```

3. **Create .env file** in the project root:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/intelli_quote?schema=public"
   ```
   
   Replace `your_password` with your PostgreSQL password.

### Option B: Cloud Database (Recommended for Quick Start)

**Using Supabase:**

1. Go to [supabase.com](https://supabase.com/) and create a free account
2. Create a new project
3. Go to Settings > Database > Connection String
4. Copy the connection string (Transaction mode)
5. Create `.env` file:
   ```env
   DATABASE_URL="your_connection_string_here"
   ```

**Using Neon:**

1. Go to [neon.tech](https://neon.tech/) and create a free account
2. Create a new project
3. Copy the connection string
4. Create `.env` file:
   ```env
   DATABASE_URL="your_connection_string_here"
   ```

## Step 4: Initialize Database

Run these commands to set up your database schema:

```bash
# Generate Prisma Client
npm run db:generate

# Push database schema
npm run db:push

# Seed with sample data
npm run db:seed
```

You should see:
```
✅ Categories created
✅ Living Room products created
✅ Kitchen products created
✅ Sample client created
🎉 Seed completed successfully!
```

## Step 5: Run the Application

```bash
npm run dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Step 6: Verify Everything Works

You should see:
1. **Left Sidebar**: Product catalog with "Living Room" and "Kitchen" categories
2. **Main Area**: Quote Builder interface
3. **Products**: 4 sample products (Luxury Sofa, Coffee Table, Kitchen Cabinets, Countertop)

## Common Issues and Solutions

### Issue: "Can't reach database server"

**Solution**: 
- Check that PostgreSQL is running
- Verify DATABASE_URL is correct
- Check firewall settings if using cloud database

### Issue: "Environment variable not found: DATABASE_URL"

**Solution**: 
- Make sure `.env` file exists in project root
- Check that DATABASE_URL is properly set
- Restart the development server

### Issue: Prisma Client errors

**Solution**:
```bash
# Regenerate Prisma Client
npm run db:generate

# If issues persist, delete node_modules and reinstall
rm -rf node_modules
npm install
npm run db:generate
```

### Issue: Port 3000 already in use

**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001
```

## Database Management

### View Database with Prisma Studio

```bash
npm run db:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) where you can:
- View all tables
- Add/edit/delete records
- Browse relationships

### Reset Database

If you need to start fresh:

```bash
# Warning: This deletes all data
npx prisma db push --force-reset
npm run db:seed
```

## Next Steps

Once everything is running:

1. **Create a Quote**:
   - Click on products in the sidebar to add them
   - Fill in quote title and select client
   - Adjust quantities and rates
   - Save the quote

2. **Export PDF**:
   - After saving, click "Export PDF"
   - A professional PDF will be downloaded

3. **Explore Features**:
   - Try different discount modes
   - Toggle policy clauses
   - Add custom terms
   - Create new clients

## Development Tips

- **Hot Reload**: Changes to code will automatically reload the page
- **Database Changes**: After modifying `prisma/schema.prisma`, run `npm run db:push`
- **Type Safety**: The app uses TypeScript for enhanced development experience

## Need Help?

- Check the main [README.md](README.md) for more documentation
- Review the code comments for implementation details
- Inspect the browser console for errors

Enjoy building quotes with IntelliQuote! 🎉



