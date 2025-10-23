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

# Database management
# NOTE: All database operations are done via Supabase dashboard or SQL editor
# The codebase uses Supabase client directly (NOT Prisma)
# Prisma commands in package.json are legacy and not functional
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.5.6 (App Router with Turbopack)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL) with `@supabase/supabase-js` v2.75.1
- **Database Access**: Supabase PostgREST API (NO ORM - Prisma is not used)
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
└── lib/                   # Shared utilities
    ├── auth.ts            # Authentication context
    ├── db.ts              # Supabase client initialization
    ├── permissions.ts     # Permission checking utilities
    ├── pdfGenerator.tsx   # Quote PDF generation logic
    ├── store.ts           # Zustand store for quote builder
    └── types.ts           # TypeScript type definitions
```

## Database Operations with Supabase

### Supabase Client Usage

All database operations use the Supabase JavaScript client via the PostgREST API. The client is initialized in [lib/db.ts](lib/db.ts):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Common Query Patterns

**SELECT queries:**
```typescript
// Simple select
const { data, error } = await supabase
  .from('products')
  .select('*')
  .order('name', { ascending: true });

// Select with joins (using PostgREST relationship syntax)
const { data, error } = await supabase
  .from('products')
  .select('*, category:categories(*)')
  .eq('id', productId)
  .single();

// Select with filtering
const { data, error } = await supabase
  .from('quotes')
  .select('*')
  .eq('status', 'DRAFT')
  .gte('createdat', startDate);
```

**INSERT queries:**
```typescript
const { data, error } = await supabase
  .from('products')
  .insert({
    itemcode: itemCode,
    name: name,
    baserate: baseRate,
    categoryid: categoryId,
  })
  .select()
  .single();
```

**UPDATE queries:**
```typescript
const { error } = await supabase
  .from('products')
  .update({
    name: name,
    baserate: baseRate,
    updatedat: new Date().toISOString(),
  })
  .eq('id', productId);
```

**DELETE queries:**
```typescript
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);
```

**Key characteristics:**
- All operations return `{ data, error }` - always check for errors
- Use `.single()` when expecting one result
- Use `.select()` after insert/update to return the created/updated data
- PostgREST join syntax: `foreignKey:tableName(columns)`
- No built-in transaction support (REST API limitation)

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
- `client_revisions` - Historical changes to client information
- `quotes` - Quote headers with totals and approval metadata
- `quote_items` - Individual line items in quotes
- `quote_revisions` - Version history for quotes (exports/status changes)
- `policy_clauses` - Terms and conditions for quotes (deprecated - use settings)
- `users` - System users with role assignments
- `roles` - User roles (Admin, Sales Head, Sales Executive, etc.)
- `role_permissions` - Permission matrix (role × resource × actions)
- `settings` - Global application settings (company info, terms, etc.)
- `pdf_templates` - PDF template configurations for quotes

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

### Optimistic UI Updates Pattern

**New Pattern (Oct 23, 2025)**: For better UX, implement optimistic updates for user actions that modify data.

```typescript
const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
  // 1. Optimistic update - immediately update UI
  const newStatus = !currentStatus;
  setUsers(users.map(user =>
    user.id === userId ? { ...user, isactive: newStatus } : user
  ));
  setUpdatingUserId(userId);

  try {
    // 2. Make API call
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, isactive: newStatus }),
    });

    if (!response.ok) throw new Error('Failed to update');

    // 3. Confirm with server response
    const updatedUser = await response.json();
    setUsers(users.map(user =>
      user.id === userId ? updatedUser : user
    ));
  } catch (error) {
    // 4. Rollback on error
    setUsers(users.map(user =>
      user.id === userId ? { ...user, isactive: currentStatus } : user
    ));
    alert('Failed to update. Please try again.');
  } finally {
    setUpdatingUserId(null);
  }
};
```

**Benefits**:
- ✅ Instant UI feedback (no waiting for API)
- ✅ Visual loading indicators during API call
- ✅ Automatic rollback on errors
- ✅ Better perceived performance

**Use Cases**:
- Status toggles (Active/Inactive)
- Boolean flags (enabled/disabled)
- Simple state changes
- Non-critical updates

**See**: `components/Settings/UserManagementTable.tsx:30-66` for implementation example.

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

**Dynamic Role System** - Roles are now managed through the UI in Settings → Roles.

**Default Roles:**
1. **Admin** - Full access to all features (protected, cannot be deleted)
2. **Sales Head** - Can approve quotes, manage quotes/clients/products
3. **Sales Executive** - Can create quotes requiring approval
4. **Designer** - Can create/edit, cannot delete (protected)
5. **Client** - View-only access (protected)

**Custom Roles:**
- Create new roles via Settings → Roles → Create New Role
- Assign permissions per resource using visual grid editor
- Roles stored in `roles` table, permissions in `role_permissions` table

### Permission Checking

Use `hasPermission()` from [lib/permissions.ts](lib/permissions.ts:1-44):

```typescript
import { hasPermission } from '@/lib/permissions';

// Check if user can perform action
const canEdit = hasPermission(userPermissions, 'products', 'canEdit');
const canApprove = hasPermission(userPermissions, 'quotes', 'canApprove');
```

**Resources**: `categories`, `products`, `clients`, `quotes`
**Actions**: `canCreate`, `canRead`, `canEdit`, `canDelete`, `canApprove`, `canExport`

**Permission Matrix Example:**

| Role | Quotes: canCreate | Quotes: canApprove | Quotes: canExport |
|------|-------------------|-------------------|-------------------|
| Admin | ✅ | ✅ | ✅ |
| Sales Head | ✅ | ✅ | ✅ |
| Sales Executive | ✅ | ❌ | ❌ |
| Designer | ✅ | ❌ | ✅ |
| Client | ❌ | ❌ | ❌ |

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

Since this project uses Supabase directly (no Prisma), schema changes are made via:

1. **Supabase Dashboard** - Use the Table Editor or SQL Editor at your Supabase project dashboard
2. **SQL Migrations** - Write SQL in the Supabase SQL Editor
3. **MCP Tools** - Use the Supabase MCP tools if available (e.g., `mcp__supabase__apply_migration`)

**After making schema changes:**
1. **Important**: Update corresponding TypeScript types in [lib/types.ts](lib/types.ts)
2. Update API routes to use new columns (remember: lowercase column names!)
3. Update components that display/edit the data
4. Test all affected API endpoints

**Example SQL for adding a column:**
```sql
ALTER TABLE products ADD COLUMN newfield TEXT;
```

**Remember:** All column names must be lowercase without underscores!

## Environment Variables

Required environment variables (in `.env` or `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are used to initialize the Supabase client in [lib/db.ts](lib/db.ts:1-14).

## MCP Servers & External Documentation

### Context7 MCP Server

This project has access to the **Context7 MCP server**, which provides up-to-date documentation for any library or framework used in the codebase.

**When to use Context7:**
- Looking up API documentation for libraries (Next.js, React, Supabase, etc.)
- Understanding how to use a specific library feature
- Finding code examples and best practices
- Checking for updates to library APIs
- Researching new libraries before adding them to the project

**How to use Context7:**

1. **Resolve Library ID** - First, find the Context7-compatible library ID:
   ```
   mcp__context7__resolve-library-id(libraryName: "next.js")
   ```
   Returns library ID like `/vercel/next.js` or `/vercel/next.js/v14.3.0-canary.87`

2. **Get Documentation** - Then fetch documentation for specific topics:
   ```
   mcp__context7__get-library-docs(
     context7CompatibleLibraryID: "/vercel/next.js",
     topic: "app router",
     tokens: 5000
   )
   ```

**Common library IDs for this project:**
- Next.js: `/vercel/next.js`
- React: Look up with `resolve-library-id`
- Supabase: `/supabase/supabase`
- Zustand: Look up with `resolve-library-id`
- Tailwind CSS: Look up with `resolve-library-id`
- Chart.js: Look up with `resolve-library-id`

**Example use cases:**
- "How do I use Supabase RLS policies?" → Query Context7 for Supabase docs
- "What's the correct way to handle forms in Next.js 15?" → Query Context7 for Next.js docs
- "How do I optimize Zustand store performance?" → Query Context7 for Zustand docs

**Note**: Always prefer Context7 for library documentation over web search, as it provides focused, version-specific documentation with code examples.

### Vercel MCP Server

This project has access to the **Vercel MCP server**, which provides specialized tools for Vercel deployment and Next.js projects.

**When to use Vercel MCP:**
- Deploying the application to Vercel
- Managing Vercel project settings
- Accessing deployment logs and analytics
- Configuring environment variables on Vercel
- Managing custom domains and SSL certificates
- Accessing Vercel-specific Next.js features

**Configuration:**
- Transport: HTTP
- URL: https://mcp.vercel.com
- Configured in: `/Users/varun/.claude.json` (project-specific)

**Common use cases:**
- "Deploy the latest changes to production" → Use Vercel MCP deployment tools
- "Check deployment status" → Query Vercel deployment logs
- "Update environment variables" → Manage Vercel project settings
- "View production errors" → Access Vercel analytics and logs

**Note**: Since this is a Next.js 15 project hosted on Vercel, the Vercel MCP server provides direct integration with your hosting platform.

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
1. **DRAFT** - Being created/edited by user
2. **PENDING_APPROVAL** - ⭐ NEW: Submitted by Sales Executive, awaiting approval from Admin/Sales Head
3. **SENT** - Approved and sent to client for review
4. **ACCEPTED** - Client approved the quote
5. **REJECTED** - Rejected by approver OR client declined the quote

**Approval Workflow (October 2025):**
- Sales Executives create quotes with `PENDING_APPROVAL` status
- Admins/Sales Heads see pending approvals on dashboard
- After approval, status changes to `SENT`
- After rejection, status changes to `REJECTED`
- Approval metadata tracked: `approvedby`, `approvedat`, `approvalnotes`

See [approval.md](approval.md) for complete documentation.

### Client Revisions
- Track changes to client information over time
- Stored in `client_revisions` table
- Accessible via `/api/clients/[id]/revisions`

## Recent Feature Additions (October 2025)

### 1. Quote Approval System

**Overview:** Role-based approval workflow for quotations requiring management approval before sending to clients.

**Key Components:**
- **Dashboard KPI:** "Pending Approvals" card showing count of quotes awaiting approval
- **Approval Table:** List of pending quotes with approve/reject actions
- **API Endpoint:** `POST /api/quotes/[id]/approve` for approval actions
- **Database Fields:** `approvedby`, `approvedat`, `approvalnotes` columns in quotes table

**User Roles:**
- **Sales Executive:** Creates quotes → status: `PENDING_APPROVAL`
- **Sales Head / Admin:** Reviews and approves/rejects quotes
- **Permission Required:** `canapprove` on `quotes` resource

**Files:**
- `app/api/quotes/[id]/approve/route.ts` - Approval endpoint
- `components/Dashboard/PendingApprovals.tsx` - Approval interface
- `app/page.tsx` - Dashboard with pending approvals section
- `approval.md` - Complete documentation

**Workflow:**
1. Sales Executive creates quote
2. Quote status set to `PENDING_APPROVAL`
3. Appears on Admin/Sales Head dashboard
4. Approve → status changes to `SENT`
5. Reject → status changes to `REJECTED`
6. Metadata recorded in approval fields

---

### 2. Dynamic Role Management System

**Overview:** Full CRUD interface for managing user roles and permissions without database access.

**Features:**
- **Role CRUD:** Create, edit, delete custom roles
- **Permission Editor:** Visual grid for setting permissions per resource
- **Protected Roles:** Admin, Designer, Client roles cannot be deleted
- **Auto-Permissions:** Default permissions created when role is created
- **Embedded Workflow:** Create role → immediately edit permissions → save

**Resources & Actions:**
| Resource | Actions |
|----------|---------|
| Categories | canCreate, canRead, canEdit, canDelete, canApprove, canExport |
| Products | canCreate, canRead, canEdit, canDelete, canApprove, canExport |
| Clients | canCreate, canRead, canEdit, canDelete, canApprove, canExport |
| Quotes | canCreate, canRead, canEdit, canDelete, **canApprove**, canExport |

**Files:**
- `app/api/roles/route.ts` - Role CRUD endpoints
- `app/api/roles/[id]/route.ts` - Individual role operations
- `app/api/roles/[id]/permissions/route.ts` - Permission management
- `components/Settings/RoleManagement.tsx` - Role list interface
- `components/Settings/RoleDialog.tsx` - Create/edit dialog
- `components/Settings/PermissionsEditor.tsx` - Permission grid editor
- `app/settings/page.tsx` - Settings page with roles tab

**Database:**
- `roles` table: id, name, description, isprotected, createdat, updatedat
- `role_permissions` table: id, roleid, resource, canCreate, canRead, canEdit, canDelete, canApprove, canExport

---

### 3. Global Settings System

**Overview:** Centralized settings management for company information, terms, and PDF templates.

**Settings Categories:**

**A. Company Information**
- Company name, logo, contact details
- Displayed on PDFs and quotes
- API: `GET/PUT /api/settings/company`

**B. Terms & Conditions**
- Global terms for all quotes
- Replaces per-quote policy builder
- Fetched from settings during PDF generation
- API: `GET/PUT /api/settings/terms`
- Database: `settings` table with key `terms_conditions`

**C. PDF Templates**
- Template selection for quote PDFs
- Default template configuration
- Template library management
- API: `GET /api/settings/pdf-template`
- Database: `pdf_templates` table

**Important Change:**
- **PolicyBuilder removed** from quote creation flow
- Terms now managed globally in Settings
- Quote PDFs fetch terms from `settings` table
- See `app/api/quotes/[id]/pdf/route.ts` lines 37-51

**Files:**
- `app/api/settings/company/route.ts`
- `app/api/settings/terms/route.ts`
- `app/api/settings/pdf-template/route.ts`
- `app/settings/page.tsx` - Settings interface with tabs

---

### 4. Quote Versioning & Revision Tracking

**Overview:** Automatic version tracking for quote creation and edits. (Updated October 23, 2025)

**Features:**
- **Version 1 for New Quotes:** All new quotes start at version 1
- **Auto-increment on Edit:** Version increments by 1 each time quote is edited
- **Revision History:** Complete change tracking in `quote_revisions` table
- **Change Tracking:** Field-by-field comparison of what changed
- **Metadata:** Edited by, edited at, changes, notes

**Workflow:**
1. Quote created: version = 1, status = DRAFT
2. First edit: version = 2, revision history entry created
3. Subsequent edits: version increments (3, 4, 5...)
4. Each edit creates `quote_revisions` entry with previous version data

**Database:**
- `quotes.version` column (integer)
- `quote_revisions` table: quoteid, version, status, exported_by, exported_at, changes, notes

**Files:**
- `app/api/quotes/route.ts` - Sets version: 1 for new quotes (line 139)
- `app/api/quotes/[id]/route.ts` - Increments version on edit (lines 234-235, 286, 353-361)
- `app/api/quotes/[id]/pdf/route.ts` - PDF generation with versioning
- `app/api/quotes/[id]/revisions/route.ts` - Revision history API

**Testing:**
- Run `node test-revision-system.js` to verify revision system works correctly

---

### 5. Enhanced Dashboard

**New Features:**
- **Pending Approvals KPI:** Count of quotes awaiting approval
- **Approval Section:** Table of pending quotes (permission-based visibility)
- **Period Filters:** 7 days, 30 days, 90 days, 12 months, year
- **Dynamic Charts:** Revenue over time adapts to period granularity
- **Top Deals:** Shows top 5 accepted quotes by value

**Components:**
- `PendingApprovals` - Approval table with actions
- `MetricCard` - Enhanced with icon support (Clock, TrendingUp, etc.)
- `TopDealsTable` - Top deals display
- `RevenueChart` - Revenue over time visualization

**APIs:**
- `GET /api/dashboard` - Returns all metrics including `pendingApprovalsCount` and `pendingApprovals` array

**Permission Logic:**
```typescript
// Only users with canapprove permission see pending approvals section
{hasPermission(permissions, 'quotes', 'canapprove') &&
 pendingApprovals.length > 0 && (
  <PendingApprovals approvals={pendingApprovals} onRefresh={fetchData} />
)}
```

---

### 6. Authentication Improvements

**Timeout Protection:**
- Added 10-second timeout to session check
- Prevents infinite loading states
- See `lib/auth-context.tsx` lines 34-40

**Demo Mode:**
- Bypass password verification for testing
- Checkbox on login page
- Uses localStorage for session persistence

---

### 7. Project Structure Updates

**New API Routes:**
```
app/api/
├── quotes/[id]/approve/      # Approval endpoint
├── quotes/[id]/revisions/    # Revision history
├── roles/                    # Role CRUD
│   └── [id]/
│       ├── route.ts          # Role operations
│       └── permissions/      # Permission management
├── settings/
│   ├── company/              # Company info
│   ├── terms/                # Terms & conditions
│   └── pdf-template/         # PDF templates
└── templates/                # Template library
```

**New Components:**
```
components/
├── Dashboard/
│   ├── PendingApprovals.tsx  # Approval interface
│   ├── MetricCard.tsx         # Enhanced with icons
│   └── TopDealsTable.tsx      # Top deals display
└── Settings/
    ├── RoleManagement.tsx     # Role list
    ├── RoleDialog.tsx         # Create/edit role
    └── PermissionsEditor.tsx  # Permission grid
```

---

## Recent Database Changes

### New Columns

**`quotes` table:**
```sql
-- Approval tracking (October 2025)
ALTER TABLE quotes ADD COLUMN approvedby TEXT;
ALTER TABLE quotes ADD COLUMN approvedat TIMESTAMPTZ;
ALTER TABLE quotes ADD COLUMN approvalnotes TEXT;

-- Version tracking
-- (version column already exists)
```

**Column naming examples for new fields:**
- ✅ `approvedby` (NOT `approvedBy` or `approved_by`)
- ✅ `approvedat` (NOT `approvedAt` or `approved_at`)
- ✅ `approvalnotes` (NOT `approvalNotes` or `approval_notes`)

### Updated Constraints

**`quotes.status` check constraint:**
```sql
-- Added PENDING_APPROVAL to allowed values
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_status_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_status_check
  CHECK (status = ANY (ARRAY[
    'DRAFT'::text,
    'PENDING_APPROVAL'::text,  -- NEW
    'SENT'::text,
    'ACCEPTED'::text,
    'REJECTED'::text
  ]));
```

### New Tables

**`roles` table:**
- Dynamic role creation
- Protected roles cannot be deleted

**`settings` table:**
- key-value store for global settings
- Keys: `terms_conditions`, `company_name`, `company_logo`, etc.

**`pdf_templates` table:**
- Template library for PDFs
- Fields: name, description, category, template_json, thumbnail, isdefault, ispublic

---

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
- **Database**: Supabase PostgreSQL - all operations via PostgREST API
- **No ORM**: Prisma dependencies exist in package.json but are NOT used in the codebase
- **Schema Management**: Use Supabase Dashboard SQL Editor or MCP tools for schema changes
- **Team Collaboration**: Shared database - be careful with schema changes
- **Column Naming**: Lowercase-no-underscores convention (explains non-standard naming)

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
4. Verify database changes in Supabase Dashboard (Table Editor or SQL Editor)
5. Use browser DevTools Network tab to inspect API requests/responses
6. Check API route responses match expected TypeScript types

---

**Last Updated**: 2025-10-23

## Recent Updates (October 2025)

### Latest Changes (Oct 23, 2025):
1. ✅ **Approval Workflow Fix** - Role-based quote status assignment now working
   - Sales Executives create quotes with `PENDING_APPROVAL` status
   - Admin/Sales Head create quotes with `DRAFT` status
   - Optimistic UI updates for instant feedback
2. ✅ **User Status Toggle Optimization** - Instant status switching with visual feedback
   - Optimistic updates (immediate UI response)
   - Loading spinner during API call
   - Automatic rollback on error
3. ✅ **Dashboard Enhancement** - Pending approvals always visible for approvers
4. ✅ **Codebase Cleanup** - Removed 16 redundant documentation files
5. ✅ **Playwright Test Suite** - Created comprehensive approval workflow tests

### Major Features Added:
1. ✅ **Quote Approval System** - Full approval workflow with dashboard integration
2. ✅ **Dynamic Role Management** - CRUD interface for roles and permissions
3. ✅ **Global Settings System** - Centralized company info, terms, PDF templates
4. ✅ **Quote Versioning** - Automatic version tracking for exports
5. ✅ **Enhanced Dashboard** - Pending approvals KPI and approval interface
6. ✅ **Auth Improvements** - Timeout protection and demo mode

### Database Changes:
- Added `approvedby`, `approvedat`, `approvalnotes` columns to `quotes` table
- Updated `quotes.status` constraint to include `PENDING_APPROVAL`
- Created `roles`, `settings`, `pdf_templates` tables
- Updated `role_permissions` structure

### API Endpoints Added:
- `POST /api/quotes/[id]/approve` - Approve/reject quotes
- `GET/POST /api/roles` - Role management
- `GET/PUT/DELETE /api/roles/[id]` - Individual role operations
- `GET/PUT /api/roles/[id]/permissions` - Permission management
- `GET/PUT /api/settings/company` - Company information
- `GET/PUT /api/settings/terms` - Terms and conditions
- `GET /api/settings/pdf-template` - PDF template configuration
- `GET /api/quotes/[id]/revisions` - Quote revision history

### Components Added/Modified:
- `PendingApprovals` - Approval table with approve/reject actions
- `RoleManagement` - Role list with CRUD operations
- `RoleDialog` - Create/edit role dialog
- `PermissionsEditor` - Visual permission grid editor
- Enhanced `MetricCard` with icon support
- **Modified (Oct 23)**: `QuoteActions` - Added role-based status assignment
- **Modified (Oct 23)**: `UserManagementTable` - Optimistic updates for status toggle
- **Modified (Oct 23)**: `Dashboard` - Pending approvals always visible

### Breaking Changes:
- **PolicyBuilder removed** from quote creation flow
- Terms now managed globally in Settings (not per-quote)
- Quote PDFs fetch terms from `settings` table instead of `policy_clauses`

### Documentation:
- Created comprehensive `approval.md` documentation
- Updated `CLAUDE.md` with all new features and patterns
- Documented database schema changes and migrations

---

**Key Takeaway**: This codebase uses **Supabase PostgREST API exclusively** for database operations. There is NO ORM. The most critical pattern to remember is:
1. Database columns use lowercase-without-underscores (non-standard)
2. Frontend TypeScript uses camelCase
3. API routes map between these two conventions at the boundary

This column naming affects almost every API route and is the source of most bugs when adding new features.

---

## Quick Reference for New Developers

**Start here:**
1. Read this file (CLAUDE.md) for codebase overview
2. Review [approval.md](approval.md) for approval system details
3. Check database schema in Supabase Dashboard
4. Run `npm run dev` to start development server
5. Test features with demo user accounts

**Common Tasks:**
- **Add API endpoint**: Create `app/api/[resource]/route.ts`, map camelCase ↔ lowercase
- **Add page**: Create `app/[page]/page.tsx`, add to navigation
- **Update schema**: Use Supabase SQL Editor or MCP tools, update `lib/types.ts`
- **Check permissions**: Use `hasPermission()` from `lib/permissions.ts`
- **Create role**: Settings → Roles → Create New Role → Set Permissions

**Troubleshooting:**
- Infinite loading → Check auth timeout (10s)
- Database errors → Verify lowercase column names
- Permission denied → Check role_permissions table
- Hydration errors → Verify `'use client'` directive usage
