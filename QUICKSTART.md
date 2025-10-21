# IntelliQuote - Quick Start Guide

Get up and running with IntelliQuote in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies (1 min)
```bash
npm install
```

### 2. Set Up Database (2 min)

**Option A: Use a Free Cloud Database (Easiest)**

1. Go to [Supabase.com](https://supabase.com) or [Neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the PostgreSQL connection string
5. Create a `.env` file in project root:
   ```
   DATABASE_URL="your_connection_string_here"
   ```

**Option B: Use Local PostgreSQL**

1. Start PostgreSQL
2. Create a database: `CREATE DATABASE intelli_quote;`
3. Create `.env` file:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/intelli_quote"
   ```

### 3. Initialize Database (1 min)
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Start Application (1 min)
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✅ Verify It's Working

You should see:
- ✅ Product catalog on the left with "Living Room" and "Kitchen" categories
- ✅ 4 sample products (Luxury Sofa, Coffee Table, Kitchen Cabinets, Countertop)
- ✅ Quote Builder interface in the center
- ✅ No error messages in the console

## 🎯 Create Your First Quote (2 minutes)

1. **Add Products**
   - Click "Luxury Sofa" in the sidebar → Added to quote!
   - Click "Coffee Table" → Another item added!

2. **Fill Quote Details**
   - Quote Title: Type "Sample Living Room Quote"
   - Client: Select "Sample Client" from dropdown

3. **Adjust Items**
   - Change sofa quantity to 2
   - Add discount: 10%

4. **Configure Policies**
   - Scroll down to Policy Builder
   - Toggle on "Standard Warranty"
   - See it appear in preview!

5. **Save Quote**
   - Click "Save Draft" button
   - Success message appears!

6. **Export PDF**
   - Click "Export PDF" button
   - PDF downloads automatically!
   - Open and view your professional quote!

## 🎨 Explore Features

### Try Different Discount Modes
1. Click "Overall Discount" tab
2. Enter 15% in the discount field
3. Watch the totals recalculate instantly!

### Add a New Client
1. In Quote Details, select "+ New Client" from dropdown
2. Fill in details:
   - Name: "Test Customer"
   - Email: "test@example.com"
   - Phone: "+91 9876543210"
3. Click "Create Client"
4. New client is selected automatically!

### Experiment with Items
- Add multiple products from different categories
- See category totals update automatically
- View category contributions in the summary
- Delete items with the trash icon

## 📊 Understanding the Interface

```
┌─────────────────┬──────────────────────────────────────┐
│  Product        │  Quote Builder Wizard                │
│  Catalog        │                                      │
│                 │  1️⃣ Quote Details                    │
│  🔍 Search      │     - Title, Client                  │
│                 │                                      │
│  Living Room    │  2️⃣ Discount Mode Tabs              │
│  Kitchen        │     - Line Item / Overall / Both     │
│                 │                                      │
│  Products:      │  3️⃣ Quotation Items                 │
│  - Sofa         │     - Living Room                    │
│  - Table        │       • Luxury Sofa                  │
│  - Cabinets     │       • Coffee Table                 │
│  - Countertop   │     - Kitchen                        │
│                 │       • Kitchen Cabinets             │
│                 │       • Countertop                   │
│                 │                                      │
│                 │  4️⃣ Summary & Policy Builder        │
│                 │     - Totals | Terms & Conditions   │
│                 │                                      │
│                 │  💾 Save  📄 Export  ✉️ Send        │
└─────────────────┴──────────────────────────────────────┘
```

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Update database schema
npm run db:seed          # Add sample data
npm run db:studio        # Open database GUI

# Prisma Studio
npm run db:studio        # View/edit data at localhost:5555
```

## 💡 Pro Tips

1. **Always Save First**: You must save a quote before exporting to PDF
2. **Discount Modes**: Choose before adding items for clearest pricing
3. **Search Products**: Use the search bar to find items quickly
4. **Category Totals**: Help clients understand cost breakdown
5. **Policy Preview**: Check how terms look before saving
6. **Database GUI**: Use Prisma Studio to manage data easily

## 🆘 Quick Troubleshooting

### Can't connect to database?
```bash
# Check .env file exists and has correct DATABASE_URL
cat .env
```

### Prisma errors?
```bash
# Regenerate Prisma Client
npm run db:generate
```

### Port 3000 in use?
```bash
# Use different port
npm run dev -- -p 3001
```

### No products showing?
```bash
# Re-run seed
npm run db:seed
```

## 📚 Next Steps

Now that you're up and running:

1. **Read the Full Documentation**
   - [README.md](README.md) - Complete overview
   - [FEATURES.md](FEATURES.md) - Feature details
   - [SETUP.md](SETUP.md) - Detailed setup guide

2. **Customize for Your Business**
   - Add your products and categories
   - Update policy templates
   - Modify tax rates
   - Add company branding

3. **Explore the Code**
   - Check out the components in `/components`
   - Review API routes in `/app/api`
   - Understand calculations in `/lib/calculations.ts`

## 🎉 You're Ready!

Your Quote Builder is now running. Start creating professional quotes for your business!

**Need help?** Check the documentation or review the inline code comments.

---

**Time to First Quote**: ~5 minutes ⏱️
**Difficulty**: Easy 🟢
**Prerequisites**: Node.js, Database 📦



