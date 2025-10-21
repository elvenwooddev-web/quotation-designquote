<!-- 6c6d111d-b492-431d-adc1-6384bc04e54b 5c3e2d87-bbce-469b-89bb-49913d883e5e -->
# Sales Dashboard Implementation

## Overview

Transform the home page (`app/page.tsx`) into a Sales Dashboard inspired by the provided design, using real data from the quotes and clients database, with role-based views.

## Database & API Setup

### 1. Create Dashboard Analytics API (`app/api/dashboard/route.ts`)

Create a new API endpoint that aggregates sales data:

- Calculate total revenue from `quotes.grandTotal` (where status is 'ACCEPTED')
- Calculate sales growth (compare current month vs previous month)
- Calculate average deal size from accepted quotes
- Calculate conversion rate (accepted quotes / total quotes)
- Get revenue over time data (monthly aggregation)
- Get lead source breakdown (by client source - will need to add source field to clients table)
- Get top deals (top 5 quotes by grandTotal, descending)

### 2. Add Client Source Field to Database

Update `clients` table schema to include a `source` field:

- Add `source` column (TEXT) with options: 'Organic', 'Referral', 'Paid Ads', 'Other'
- Update types in `lib/types.ts` to include source field

## Component Structure

### 3. Create Dashboard Components

#### `components/Dashboard/MetricCard.tsx`

Reusable card component for displaying metrics:

- Props: title, value, change (percentage), trend (up/down)
- Shows metric with colored trend indicator (green up arrow, red down arrow)
- Styling similar to reference image

#### `components/Dashboard/RevenueChart.tsx`

Line chart for revenue over time using Chart.js:

- Uses `react-chartjs-2` with Chart.js
- Shows revenue data by month (Jan - Jun)
- Smooth curved line, blue gradient fill
- Display growth percentage

#### `components/Dashboard/LeadSourceChart.tsx`

Donut chart for lead source breakdown:

- Multi-colored segments (green, blue, orange, gray)
- Center text showing total leads count
- Legend with percentages

#### `components/Dashboard/TopDealsTable.tsx`

Table component showing top deals:

- Columns: Deal Name, Salesperson, Amount, Close Date
- Clean table design with alternating row colors
- Format currency as ₹

### 4. Create Main Dashboard Page

#### Update `app/page.tsx`

Replace current Quote Builder with Sales Dashboard:

- Import and use dashboard components
- Fetch data from `/api/dashboard` endpoint
- Grid layout matching reference design:
  - Top row: 4 metric cards (Total Revenue, Sales Growth, Avg Deal Size, Conversion Rate)
  - Middle row: Revenue chart (left, 2/3 width), Lead Source chart (right, 1/3 width)
  - Bottom row: Top Deals table (full width)
- Add date range selector in header (for future implementation)
- Add user avatar in header

### 5. Role-Based Views

Implement different dashboard views based on user role using `useAuth` hook:

**Admin View** (Full Dashboard):

- All metrics visible
- Complete revenue chart
- All lead sources
- All top deals

**Designer View**:

- Personal metrics only (their deals)
- Filter revenue by assigned designer
- Show only their deals in top deals table
- Hide lead source breakdown

**Client View**:

- Show only their quotes/deals
- Total spent, number of quotes
- Status of their quotes (draft/sent/accepted)
- Simplified view without sensitive sales data

### 6. Install Chart.js Dependencies

Add required packages to `package.json`:

```bash
npm install chart.js react-chartjs-2
```

## Implementation Order

1. Install Chart.js dependencies
2. Add `source` field to clients table and update types
3. Create dashboard analytics API endpoint
4. Create reusable dashboard components (MetricCard, Charts, Table)
5. Update home page with new dashboard layout
6. Implement role-based filtering and views
7. Style components to match reference design
8. Test with different user roles

## Key Files to Modify

- `app/page.tsx` - Complete redesign as dashboard
- `lib/types.ts` - Add source field to Client interface
- Create: `app/api/dashboard/route.ts`
- Create: `components/Dashboard/MetricCard.tsx`
- Create: `components/Dashboard/RevenueChart.tsx`
- Create: `components/Dashboard/LeadSourceChart.tsx`
- Create: `components/Dashboard/TopDealsTable.tsx`

## Notes

- Move current Quote Builder to `/quotes/new` route for quote creation
- Keep Quote Builder accessible via "New Quote" button in dashboard
- Use Indian Rupee (₹) for all currency displays
- Implement responsive design for mobile views
- Add loading states for data fetching
- Handle empty states when no data available

### To-dos

- [ ] Install Chart.js and react-chartjs-2 dependencies
- [ ] Add source column to clients table and update Client interface
- [ ] Create dashboard analytics API endpoint for aggregating sales data
- [ ] Create reusable MetricCard component for displaying KPIs
- [ ] Create RevenueChart component with Chart.js line chart
- [ ] Create LeadSourceChart component with Chart.js donut chart
- [ ] Create TopDealsTable component for displaying best deals
- [ ] Move Quote Builder from home page to /quotes/new route
- [ ] Replace home page with Sales Dashboard layout and components
- [ ] Implement role-based filtering for Admin, Designer, and Client views
- [ ] Apply styling to match reference design with proper spacing and colors