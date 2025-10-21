# IntelliQuote - Quote Builder Web Application

A professional quotation builder web application built with Next.js 14, React, TypeScript, PostgreSQL, and Prisma.

## Features

- **Product Catalog System**: Browse and search products organized by categories
- **Interactive Quote Builder**: Create quotes with multiple discount modes (Line Item, Overall, Both)
- **Client Management**: Add and manage client information
- **Real-time Calculations**: Automatic calculation of subtotals, discounts, taxes, and totals
- **Policy Builder**: Customize terms and conditions with toggles and custom clauses
- **PDF Export**: Generate professional PDF quotes
- **Draft Saving**: Save quotes as drafts to the database
- **Category Contributions**: View breakdown of totals by category

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **State Management**: Zustand
- **PDF Generation**: @react-pdf/renderer
- **UI Components**: Custom components built with Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database instance (local or cloud)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a `.env` file in the root directory with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/intelli_quote?schema=public"
```

### 3. Initialize Database

Generate Prisma client and push schema to database:

```bash
npm run db:generate
npm run db:push
```

### 4. Seed Database

Populate the database with sample data:

```bash
npm run db:seed
```

This will create:
- 2 categories (Living Room, Kitchen)
- 4 products (Luxury Sofa, Coffee Table, Kitchen Cabinets, Countertop)
- 1 sample client

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
intelli-quote2/
├── app/
│   ├── api/              # API routes
│   │   ├── categories/   # Category CRUD
│   │   ├── clients/      # Client CRUD
│   │   ├── products/     # Product CRUD
│   │   └── quotes/       # Quote CRUD and PDF generation
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main quote builder page
├── components/
│   ├── ProductCatalog/   # Product catalog sidebar
│   ├── QuoteBuilder/     # Quote builder components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── calculations.ts   # Quote calculation logic
│   ├── db.ts            # Prisma client
│   ├── pdf-generator.tsx # PDF generation
│   ├── store.ts         # Zustand state management
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
└── package.json
```

## Usage

### Creating a Quote

1. **Select Products**: Click on products in the left sidebar to add them to the quote
2. **Enter Quote Details**: Add a quote title and select a client (or create new)
3. **Choose Discount Mode**: Select how discounts should be applied
4. **Edit Items**: Modify quantities, rates, and discounts for each item
5. **Configure Policies**: Toggle terms and conditions and add custom clauses
6. **Save Draft**: Click "Save Draft" to persist the quote to the database
7. **Export PDF**: Once saved, click "Export PDF" to download a professional quote document

### Discount Modes

- **Line Item Discount**: Apply individual discounts to each item
- **Overall Discount**: Apply a single discount percentage to the entire subtotal
- **Both**: Combine line item discounts with an overall discount

## Database Schema

The application uses the following main models:

- **Category**: Product categories
- **Product**: Products with pricing and category association
- **Client**: Client information
- **Quote**: Quote header with totals and settings
- **QuoteItem**: Individual line items in a quote
- **PolicyClause**: Terms and conditions for quotes

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## API Endpoints

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category
- `GET /api/products` - List products (with optional filters)
- `POST /api/products` - Create a new product
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create a new client
- `GET /api/quotes` - List all quotes
- `POST /api/quotes` - Create a new quote
- `GET /api/quotes/[id]` - Get a specific quote
- `PUT /api/quotes/[id]` - Update a quote
- `DELETE /api/quotes/[id]` - Delete a quote
- `GET /api/quotes/[id]/pdf` - Generate and download PDF

## Future Enhancements

- Email sending functionality
- Quote templates
- Multiple currency support
- User authentication and authorization
- Quote versioning and history
- Advanced reporting and analytics
- Image upload for products
- Drag-and-drop item reordering

## License

MIT
