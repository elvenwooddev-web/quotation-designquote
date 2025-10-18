# IntelliQuote Features Guide

This document provides detailed information about all features in the Quote Builder application.

## 1. Product Catalog 📦

The left sidebar contains a searchable product catalog organized by categories.

### Features:
- **Category Navigation**: Switch between different product categories
- **Search**: Real-time search across product names and descriptions
- **Quick Add**: Click any product to instantly add it to the quote
- **Product Display**: Shows product name, description, and base rate
- **New Category**: Button to add new product categories

### Usage:
1. Select a category from the list
2. Browse or search for products
3. Click on a product or the "+" button to add it to the quote

## 2. Quote Details 📋

Configure basic information about the quote.

### Features:
- **Quote Title**: Give your quote a descriptive name
- **Client Selection**: Choose from existing clients or create new ones
- **New Client Dialog**: 
  - Name (required)
  - Email
  - Phone
  - Address
- **Auto Quote Number**: Automatically generated unique identifier

### Usage:
1. Enter a descriptive quote title
2. Select a client from the dropdown or click "+ New Client"
3. Fill in client details if creating a new client

## 3. Discount Modes 💰

Choose how discounts should be applied to the quote.

### Three Modes:

#### Line Item Discount
- Apply individual discount percentages to each product
- Each item can have its own discount
- Best for: Promotional items, bulk discounts on specific products

#### Overall Discount
- Apply a single discount percentage to the entire subtotal
- Affects all items proportionally
- Best for: Customer loyalty discounts, seasonal sales

#### Both
- Combine line item discounts with an overall discount
- Line item discounts applied first, then overall discount
- Best for: Complex pricing scenarios

### Calculations:
- **Line Item**: `LineTotal = (Quantity × Rate) - (Quantity × Rate × Discount%)`
- **Overall**: `Total = Subtotal - (Subtotal × OverallDiscount%)`
- **Both**: Line item discounts calculated first, then overall discount applied to sum

## 4. Quotation Items 📝

Manage all products added to the quote.

### Features:
- **Grouped by Category**: Items automatically organized by their categories
- **Category Totals**: Running total displayed for each category
- **Editable Fields**:
  - Quantity (supports decimals)
  - Rate (₹)
  - Discount (%) - when applicable
  - Description (optional)
- **Line Total**: Automatically calculated and displayed
- **Remove Items**: Delete button for each item
- **Product Images**: Visual reference for each item

### Item Details:
Each item shows:
- Product thumbnail
- Product name and unit
- Editable description field
- Input fields for quantity, rate, discount
- Calculated line total
- Delete button

## 5. Summary & Calculations 🧮

Real-time calculation summary with detailed breakdown.

### Displayed Information:
- **Subtotal**: Sum of all line totals
- **Discount**: Total discount amount (if applicable)
- **Tax (GST)**: Calculated at 18% by default
- **Grand Total**: Final amount including all calculations

### Category Contributions:
- Shows how much each category contributes to the total
- Helps analyze quote composition
- Useful for material vs. labor breakdowns

### Calculation Flow:
1. Calculate line totals for each item
2. Sum all line totals = Subtotal
3. Apply overall discount (if applicable)
4. Calculate taxable amount
5. Apply tax rate (18% GST)
6. Final Grand Total

## 6. Policy Builder 📜

Customize terms and conditions for the quote.

### Standard Policies:
Pre-configured policy templates that can be toggled on/off:

1. **Standard Warranty (1-year)**
   - Coverage for manufacturing defects
   - 1-year duration

2. **Extended Warranty (3-year)**
   - Comprehensive coverage
   - 3-year duration

3. **No Returns Policy**
   - Final sales clause
   - No exchanges policy

4. **Payment Terms: 50% Upfront**
   - Payment schedule
   - Upfront payment requirements

### Default Terms:
Active by default:
- All sales are final
- Prices exclusive of GST
- Payment terms
- Quotation validity (30 days)
- Delay communication policy

### Custom Clauses:
- Add any additional terms
- Free-form text area
- Appended to standard policies

### Features:
- **Toggle Switches**: Easy on/off for each policy
- **Editable Text**: Customize policy descriptions
- **Real-time Preview**: See how terms will appear
- **Order Management**: Policies displayed in defined order

## 7. Terms Preview 👁️

Real-time preview of active terms and conditions.

### Features:
- Shows only active policies
- Formatted as bullet points
- Updates instantly when policies change
- Matches PDF output format

### Display Format:
```
Terms and Conditions for Quotation:
• Policy Title: Description text
• Another Policy: Its description
• Custom Clause: Custom text
```

## 8. Quote Actions 💾

Save and export functionality.

### Available Actions:

#### Save Draft
- Saves quote to database
- Generates unique quote number
- Stores all items, policies, and calculations
- Can be edited later
- Status: DRAFT

#### Export PDF
- Requires saved quote
- Generates professional PDF document
- Includes all quote details
- Downloads automatically
- Format: `quote-[NUMBER].pdf`

#### Send Quote (Coming Soon)
- Email functionality
- Send to client directly
- Track sent status
- Currently disabled

### PDF Contents:
1. Quote header with number
2. Quote title and client details
3. Itemized table by category
4. Calculations summary
5. Terms and conditions
6. Professional formatting

## 9. Client Management 👥

Store and manage client information.

### Client Fields:
- **Name** (required): Client or company name
- **Email**: Contact email address
- **Phone**: Contact phone number
- **Address**: Full mailing address

### Features:
- Quick client creation from quote screen
- Reusable client list
- Dropdown selection
- Associated with multiple quotes

## 10. Real-time Updates ⚡

The application updates instantly as you work.

### Auto-calculated:
- Line totals
- Category totals
- Subtotal
- Discount amount
- Tax amount
- Grand total
- Category contributions

### Live Updates:
- Change quantity → Line total updates
- Change discount mode → All calculations recalculate
- Toggle policies → Preview updates
- Add/remove items → Summary updates

## 11. Data Persistence 💾

All data is stored in PostgreSQL database.

### Stored Entities:
- **Categories**: Product organization
- **Products**: Catalog items with pricing
- **Clients**: Customer information
- **Quotes**: Complete quote details
- **Quote Items**: Individual line items
- **Policies**: Terms and conditions

### Relationships:
- Products belong to Categories
- Quote Items reference Products
- Quotes belong to Clients
- Policies belong to Quotes

## 12. User Experience Features 🎨

### Visual Design:
- Clean, modern interface
- Color-coded sections
- Numbered workflow steps
- Intuitive icons
- Responsive layout

### Interaction:
- Hover effects on clickable elements
- Clear button labels
- Disabled states for unavailable actions
- Loading indicators during saves
- Success/error notifications

### Accessibility:
- Keyboard navigation support
- Clear focus indicators
- Descriptive labels
- Logical tab order

## Technical Features 🛠️

### Performance:
- Client-side state management (Zustand)
- Optimized re-renders
- Instant calculations
- Efficient database queries

### Type Safety:
- Full TypeScript implementation
- Type-safe API calls
- Prisma type generation
- Compile-time error checking

### Validation:
- Required field checks
- Numeric input validation
- Min/max constraints
- Client-side validation

### Error Handling:
- Try-catch blocks in all API calls
- User-friendly error messages
- Console logging for debugging
- Graceful degradation

## Future Enhancements 🚀

Planned features for future releases:

1. **Authentication**: User accounts and permissions
2. **Templates**: Reusable quote templates
3. **Multi-currency**: Support for different currencies
4. **Email Integration**: Send quotes directly to clients
5. **Quote Versioning**: Track changes to quotes
6. **Advanced Reporting**: Analytics and insights
7. **Image Upload**: Add product images
8. **Drag-and-drop**: Reorder items
9. **Approval Workflow**: Multi-step approval process
10. **Custom Branding**: Company logos and colors

---

For more information, see [README.md](README.md) and [SETUP.md](SETUP.md).



