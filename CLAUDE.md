# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev                    # Start development server with Turbopack (port 3000)
npm run build                  # Production build with Turbopack
npm start                      # Start production server

# Testing (Playwright)
npm test                       # Run all tests
npm run test:headed            # Run tests with browser UI
npm run test:debug             # Debug tests
npm run test:ui                # Open Playwright UI mode
npm run test:report            # Show test report
npm run test:auth              # Test authentication flows
npm run test:catalog           # Test product catalog
npm run test:quotes            # Test quote builder
npm run test:approval          # Test approval workflow
npm run test:e2e               # End-to-end tests

# Linting
npm run lint                   # Run Next.js linter
```

## Critical Architecture Patterns

### Database Column Naming Convention ⚠️

**MOST IMPORTANT**: The database uses **all lowercase column names WITHOUT underscores**. This non-standard convention is the source of most bugs.

**Mapping Pattern:**
- Frontend TypeScript: `camelCase`
- Database columns: `lowercasenounderscores`
- API routes MUST map between these conventions

```typescript
// API Route Example
const { baseRate, categoryId, isActive } = await request.json();

// Database insert/update - map to lowercase
await supabase.from('products').insert({
  baserate: baseRate,        // baseRate → baserate
  categoryid: categoryId,    // categoryId → categoryid
  isactive: isActive,         // isActive → isactive
});
```

Common mappings:
- `createdAt` → `createdat`
- `updatedAt` → `updatedat`
- `clientId` → `clientid`
- `quoteNumber` → `quotenumber`
- `authUserId` → `authuserid`

### Supabase PostgREST API (No ORM)

Despite Prisma being in package.json, this project uses **Supabase client directly**. Prisma commands are legacy and non-functional.

```typescript
// Supabase client initialization (lib/db.ts)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Query patterns
const { data, error } = await supabase
  .from('table')
  .select('*, relation:table_name(*)')  // PostgREST join syntax
  .eq('column', value)
  .single();  // For single results

// Always check for errors
if (error) throw error;
```

### Next.js 15 Dynamic Route Parameters

Route params are **Promises** in Next.js 15:

```typescript
// ✅ CORRECT
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // Must await!
}

// ❌ WRONG - Will cause runtime errors
{ params }: { params: { id: string } }
```

### Quote Versioning System

Implemented October 2025:
- New quotes: `version = 1`
- Each edit: version increments (2, 3, 4...)
- Tracked in `quote_revisions` table

### Role-Based Approval Workflow

Quote status flow with role-based permissions:

1. **Sales Executive** creates quote → `DRAFT` → Requests approval → `PENDING_APPROVAL`
2. **Admin/Sales Head** reviews → Approves → `SENT` OR Rejects → `REJECTED`
3. PDF export only available for approved quotes

Permission checking:
```typescript
import { hasPermission } from '@/lib/permissions';

const canApprove = hasPermission(permissions, 'quotes', 'canApprove');
```

## Tech Stack

- **Framework**: Next.js 15.5.6 (App Router + Turbopack)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5
- **Database**: Supabase PostgreSQL (PostgREST API)
- **State**: Zustand 5.0.8
- **Styling**: Tailwind CSS 4
- **PDF**: @react-pdf/renderer 4.3.1
- **Charts**: Chart.js + react-chartjs-2
- **Testing**: Playwright
- **Auth**: Supabase Auth + custom user profiles

## Key Database Tables

- `quotes` - Quote headers with approval metadata
- `quote_items` - Line items in quotes
- `quote_revisions` - Version history
- `products` - Product catalog
- `categories` - Product categories
- `clients` - Client information
- `users` - User profiles (linked to Supabase auth)
- `roles` - User roles (Admin, Sales Head, Sales Executive)
- `role_permissions` - Permission matrix
- `settings` - Global settings (terms, company info)

## Authentication Flow

1. Supabase Auth creates auth user
2. Custom user profile in `users` table with `authuserid`
3. Role-based permissions from `role_permissions`
4. Auth context provider: `lib/auth-context.tsx`
5. Middleware protection: `middleware.ts`

**Development Mode**: Set `DEV_MODE_BYPASS_AUTH = true` in `lib/auth-context.tsx` to bypass authentication.

## UI Component Patterns

### Simplified shadcn/ui Components

This project uses **native HTML** versions, not full Radix UI:

```typescript
// ✅ CORRECT - Native select
<Select value={status} onChange={(e) => setStatus(e.target.value)}>
  <option value="draft">Draft</option>
</Select>

// ❌ WRONG - Will cause hydration errors
<Select onValueChange={setStatus}>
  <SelectTrigger><SelectValue /></SelectTrigger>
</Select>
```

## MCP Server Integration

### Supabase MCP Server
- Database migrations: `mcp__supabase__apply_migration`
- SQL execution: `mcp__supabase__execute_sql`
- Type generation: `mcp__supabase__generate_typescript_types`

### Vercel MCP Server
- Deployment: `mcp__vercel__deploy_to_vercel`
- Logs: `mcp__vercel__get_deployment_build_logs`

### Context7 MCP Server
- Library docs: `mcp__context7__get-library-docs`
- Use for Next.js, React, Supabase documentation

## Common Troubleshooting

### Database Column Errors
- Check lowercase naming: `isactive` not `isActive`
- Verify mapping in API routes

### Hydration Errors
- Check `'use client'` directive
- Verify Select components use native pattern

### Route Parameter Errors
- Ensure params are `Promise<{ id: string }>`
- Always await before using

### Build Errors
- Type mismatches often due to column naming
- Check `lib/types.ts` matches database schema

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Recent Major Changes (October 2025)

1. **Quote Revision System**: Version tracking on all edits
2. **Approval Workflow**: Role-based quote approval system
3. **Global Settings**: Centralized terms & conditions
4. **PolicyBuilder Removed**: Terms now in global settings
5. **Authentication Fix**: Disabled dev mode bypass for production

## Key Files to Understand

- `lib/db.ts` - Supabase client setup
- `lib/types.ts` - TypeScript interfaces (must match DB)
- `lib/auth-context.tsx` - Authentication provider
- `lib/permissions.ts` - Permission checking
- `lib/store.ts` - Zustand quote builder state
- `app/api/quotes/[id]/route.ts` - Quote API with versioning
- `components/QuoteBuilder/QuoteActions.tsx` - Role-based actions