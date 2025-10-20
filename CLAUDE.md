# Intelli-Quoter Codebase Guide

This file provides essential context for AI assistants working on this codebase.

## Development Commands

```bash
# Development server (uses Turbopack)
npm run dev

# Production build (uses Turbopack)
npm run build

# Start production server
npm start

# Database commands (Prisma)
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio GUI
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.5.6 (App Router with Turbopack)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand 5.0.8
- **Styling**: Tailwind CSS 4
- **PDF Generation**: @react-pdf/renderer 4.3.1
- **Charts**: Chart.js 4.5.1 + react-chartjs-2
- **Icons**: lucide-react

### Project Structure

```
intelli-quoter/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API route handlers
│   │   ├── categories/    # Category CRUD
│   │   ├── clients/       # Client management and revisions
│   │   ├── dashboard/     # Dashboard statistics
│   │   ├── permissions/   # Role-based permissions
│   │   ├── products/      # Product CRUD
│   │   ├── quotes/        # Quote CRUD and PDF generation
│   │   └── users/         # User management
│   ├── catalog/           # Product catalog page
│   ├── clients/           # Client management page
│   ├── login/             # Authentication
│   ├── quotations/        # Quotations list page
│   ├── quotes/            # Quote builder page
│   ├── settings/          # User and permissions management
│   └── page.tsx           # Dashboard (home page)
├── components/            # React components
│   ├── Catalog/           # Product catalog components
│   ├── Clients/           # Client management components
│   ├── Dashboard/         # Dashboard widgets
│   ├── Navigation/        # Header and navigation
│   ├── QuoteBuilder/      # Quote creation interface
│   ├── Quotations/        # Quotations list components
│   └── Settings/          # Settings page components
├── lib/                   # Shared utilities
│   ├── auth.ts            # Authentication context
│   ├── db.ts              # Supabase client initialization
│   ├── permissions.ts     # Permission checking utilities
│   ├── pdfGenerator.tsx   # Quote PDF generation logic
│   ├── store.ts           # Zustand store for quote builder
│   └── types.ts           # TypeScript type definitions
└── prisma/                # Database schema (legacy, not actively used)
```

## Critical Database Schema Knowledge

### IMPORTANT: Column Naming Convention

**The database uses all lowercase column names WITHOUT underscores.** This is non-standard and differs from typical camelCase or snake_case conventions.

#### Examples:
- ✅ `createdat` (NOT `createdAt` or `created_at`)
- ✅ `updatedat` (NOT `updatedAt` or `updated_at`)
- ✅ `isactive` (NOT `isActive` or `is_active`)
- ✅ `quotenumber` (NOT `quoteNumber` or `quote_number`)
- ✅ `clientid` (NOT `clientId` or `client_id`)
- ✅ `baserate` (NOT `baseRate` or `base_rate`)
- ✅ `categoryid` (NOT `categoryId` or `category_id`)
- ✅ `imageurl` (NOT `imageUrl` or `image_url`)
- ✅ `discountmode` (NOT `discountMode` or `discount_mode`)
- ✅ `overalldiscount` (NOT `overallDiscount` or `overall_discount`)
- ✅ `taxrate` (NOT `taxRate` or `tax_rate`)
- ✅ `grandtotal` (NOT `grandTotal` or `grand_total`)
- ✅ `linetotal` (NOT `lineTotal` or `line_total`)
- ✅ `productid` (NOT `productId` or `product_id`)
- ✅ `quoteid` (NOT `quoteId` or `quote_id`)
- ✅ `authuserid` (NOT `authUserId` or `auth_user_id`)

### Database Tables

Key tables in the database:
- `categories` - Product categories
- `products` - Product catalog with base rates
- `clients` - Client contact information
- `quotes` - Quote headers with totals
- `quote_items` - Individual line items in quotes
- `policy_clauses` - Terms and conditions for quotes
- `users` - System users
- `role_permissions` - Permission matrix (role × resource)

### Frontend-to-Database Mapping Pattern

When working with API routes, you must map between:
- **Frontend types** (lib/types.ts): Use camelCase for TypeScript interfaces
- **Database columns**: Use lowercase without underscores in SQL queries and updates

**Example from a typical API route:**

```typescript
// Frontend sends camelCase
const { baseRate, categoryId, imageUrl } = await request.json();

// Database expects lowercase
await supabase
  .from('products')
  .update({
    baserate: baseRate,      // Map camelCase → lowercase
    categoryid: categoryId,
    imageurl: imageUrl,
    updatedat: new Date().toISOString(),
  });

// Frontend receives camelCase (map back when returning)
return NextResponse.json({
  baseRate: data.baserate,   // Map lowercase → camelCase
  categoryId: data.categoryid,
  imageUrl: data.imageurl,
});
```

## Next.js 15 App Router Patterns

### Dynamic Route Parameters

**CRITICAL**: In Next.js 15, route params are Promises and MUST be awaited:

```typescript
// ✅ CORRECT
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ... use id
}

// ❌ INCORRECT (will cause errors)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;  // params is a Promise, not an object!
}
```

### Server vs Client Components

- **Server Components** (default): All components in `app/` directory
  - Can directly query database
  - Cannot use hooks (useState, useEffect, etc.)
  - Cannot use browser APIs

- **Client Components**: Must have `'use client'` directive at top
  - Can use React hooks
  - Can use browser APIs
  - Cannot directly access server-side resources
  - Examples: forms, interactive tables, dialogs

## State Management with Zustand

The quote builder uses Zustand for client-side state management ([lib/store.ts](lib/store.ts:1-252)):

### Quote Store Structure
- **Quote metadata**: title, client, discount mode, tax rate
- **Items array**: products with quantity, rate, discount, dimensions
- **Policies array**: terms and conditions (warranty, returns, payment)

### Key Store Actions
- `addItem(product)` - Add product to quote
- `updateItem(id, updates)` - Update quantity, rate, discount, or dimensions
- `removeItem(id)` - Remove item from quote
- `setClient(clientId, client)` - Assign client to quote
- `setDiscountMode(mode)` - LINE_ITEM, OVERALL, or BOTH
- `loadQuote(quote)` - Load existing quote for editing
- `reset()` - Clear store and start fresh quote

### Dimensions Feature
Products can have dimensions (e.g., length × width for windows):
- Stored in `item.dimensions` as flexible key-value object
- Auto-calculates quantity from `length × width` when both present
- See [components/QuoteBuilder/QuotationItems.tsx](components/QuoteBuilder/QuotationItems.tsx) for implementation

## Authentication & Permissions

### Authentication System

The application uses **Supabase Authentication** integrated with a custom user profile system:

**Flow:**
1. User signs up via `/signup` page
2. Supabase Auth creates auth user (`supabase.auth.signUp()`)
3. User profile is created in `users` table with `authuserid` linking to Supabase auth user
4. On login, Supabase session is created and user profile is fetched
5. Middleware protects routes - redirects to `/login` if not authenticated

**Key Files:**
- [lib/auth-context.tsx](lib/auth-context.tsx) - Auth context provider with Supabase integration
- [app/login/page.tsx](app/login/page.tsx) - Login page with demo mode option
- [app/signup/page.tsx](app/signup/page.tsx) - Signup page with role selection
- [middleware.ts](middleware.ts) - Route protection middleware

**Demo Mode:**
- Checkbox on login page bypasses password check
- Allows testing with existing demo users without real authentication
- Stores user in localStorage for client-side session

**User Profile Structure:**
```typescript
{
  id: string,
  authuserid: string,  // Links to Supabase auth user
  name: string,
  email: string,
  role: 'Admin' | 'Designer' | 'Client',
  isactive: boolean,
  createdat: Date,
  updatedat: Date
}
```

### Role-Based Access Control

Three user roles with different permissions:
1. **Admin** - Full access to all features
2. **Designer** - Can create/edit, cannot delete
3. **Client** - View-only, can approve quotes

### Permission Checking

Use `hasPermission()` from [lib/permissions.ts](lib/permissions.ts:1-44):

```typescript
import { hasPermission } from '@/lib/permissions';

// Check if user can perform action
const canEdit = hasPermission(userRole, 'products', 'canEdit');
const canDelete = hasPermission(userRole, 'quotes', 'canDelete');
```

**Resources**: `categories`, `products`, `clients`, `quotes`
**Actions**: `canCreate`, `canEdit`, `canDelete`, `canApprove`, `canExport`

### Authentication Context

User authentication state is managed via [lib/auth.ts](lib/auth.ts). Components can access:
- `user` - Current logged-in user object
- `loading` - Authentication state loading
- `logout()` - Log out current user

## PDF Generation

Quote PDFs are generated using @react-pdf/renderer ([lib/pdfGenerator.tsx](lib/pdfGenerator.tsx)).

### PDF Generation Flow
1. Client requests PDF: `GET /api/quotes/[id]/pdf`
2. API fetches quote with all relations (client, items, products, policies)
3. `generateQuotePDF()` creates PDF document
4. Returns as downloadable blob

### PDF Includes
- Quote header with quote number and date
- Client information
- Itemized list with quantities, rates, discounts
- Subtotal, discount, tax calculations
- Grand total
- Active policy clauses (terms & conditions)

## UI Component Patterns

### Simplified shadcn/ui Components

This project uses **simplified versions** of shadcn/ui components. They are NOT the full Radix UI components.

**Key differences:**
- `<Select>` is a native HTML `<select>`, not Radix UI Select
- Use `onChange` instead of `onValueChange`
- Use `<option>` elements directly as children
- No `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`

```typescript
// ✅ CORRECT for this project
<Select value={status} onChange={(e) => setStatus(e.target.value)}>
  <option value="draft">Draft</option>
  <option value="sent">Sent</option>
</Select>

// ❌ INCORRECT (will cause hydration errors)
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="draft">Draft</SelectItem>
  </SelectContent>
</Select>
```

### Common UI Components
- `Button` - Standard button with variants (default, outline, ghost)
- `Input` - Text input fields
- `Select` - Native select dropdowns
- `Dialog` - Modal dialogs
- `Checkbox` - Checkbox inputs
- `Switch` - Toggle switches

## Common Development Scenarios

### Adding a New API Endpoint

1. Create route file in `app/api/[resource]/route.ts`
2. Export async function: `GET`, `POST`, `PUT`, `DELETE`
3. **Remember**: Use lowercase column names for database queries
4. Map camelCase frontend types ↔ lowercase database columns
5. Handle errors and return appropriate status codes

### Creating a New Page

1. Add directory in `app/[page-name]/`
2. Create `page.tsx` with default export
3. Decide if Server Component (default) or Client Component (`'use client'`)
4. Add navigation link in [components/Navigation/Header.tsx](components/Navigation/Header.tsx)

### Adding Client-Side Interactivity

1. Add `'use client'` at top of file
2. Can now use useState, useEffect, event handlers
3. For form submissions, use fetch to call API routes
4. Consider using Zustand store for complex shared state

### Updating Database Schema

1. Modify Prisma schema in `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. **Important**: Update corresponding TypeScript types in [lib/types.ts](lib/types.ts)
4. Update API routes to use new columns (remember: lowercase!)
5. Update components that display/edit the data

## Environment Variables

Required environment variables (in `.env` or `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are used to initialize the Supabase client in [lib/db.ts](lib/db.ts:1-14).

## Known Patterns & Conventions

### Quotation Number Generation
- Format: `QT-YYYY-NNNN` (e.g., `QT-2025-0001`)
- Auto-increments per year
- Generated server-side when quote is saved

### Discount Modes
- **LINE_ITEM**: Discount applied per product line
- **OVERALL**: Single discount on subtotal
- **BOTH**: Line item discounts + overall discount

### Quote Status Flow
1. **DRAFT** - Being created/edited
2. **SENT** - Sent to client for review
3. **ACCEPTED** - Client approved the quote
4. **REJECTED** - Client declined the quote

### Client Revisions
- Track changes to client information over time
- Stored in `client_revisions` table
- Accessible via `/api/clients/[id]/revisions`

## Troubleshooting

### Common Issues

**Hydration Errors**
- Usually caused by server/client mismatch
- Check for correct use of `'use client'` directive
- Verify Select components use native HTML pattern

**Database Column Errors**
- Most common issue: using camelCase or snake_case instead of lowercase
- Always check database error messages for column names
- Update both query and type mapping

**Route Parameter Errors**
- Ensure params are typed as `Promise<{ id: string }>`
- Always await params before using: `const { id } = await params`

**Permission Issues**
- Verify user role is correctly set in session
- Check `hasPermission()` logic in [lib/permissions.ts](lib/permissions.ts)
- Ensure UI hides/disables actions user cannot perform

## Development Notes

- **Port**: Dev server runs on port 3000 by default
- **Turbopack**: Uses Turbopack for faster builds (experimental)
- **Database**: Shared database - be careful with schema changes
- **Team Collaboration**: Another developer's app uses same database (explains non-standard naming)

## File Naming Conventions

- **Components**: PascalCase (e.g., `QuotationItems.tsx`)
- **Routes**: lowercase with hyphens for URLs (e.g., `app/quotations/page.tsx` → `/quotations`)
- **Utilities**: camelCase (e.g., `pdfGenerator.tsx`)
- **Types**: camelCase interfaces in `types.ts`

## Testing Approach

Currently no automated tests configured. Manual testing workflow:
1. Run `npm run dev`
2. Test features in browser
3. Check browser console for errors
4. Verify database changes in Supabase dashboard or Prisma Studio

---

**Last Updated**: Based on session ending 2025-10-19

**Key Takeaway**: The most important thing to remember about this codebase is the lowercase-without-underscores database column naming convention. This affects almost every API route and is the source of most bugs when adding new features.
