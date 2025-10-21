# Template Selector Components

Phase 6A implementation of the PDF Template Editor - Template Selector Component.

## Overview

This package contains three React components for selecting PDF templates in the Intelli-Quoter application:

1. **TemplateCard** - Individual template card with thumbnail and metadata
2. **TemplateSelector** - Grid view of templates with search and filter
3. **TemplateSelectorDialog** - Modal wrapper for template selection

## Components

### TemplateCard

Displays a single template as a card with thumbnail, name, category, and badges.

**Props:**
```typescript
interface TemplateCardProps {
  template: PDFTemplate;        // Template data from API
  selected?: boolean;           // Whether this template is selected
  onSelect?: () => void;        // Called when card is clicked
  onPreview?: () => void;       // Called when preview button is clicked
  compact?: boolean;            // Compact mode for smaller cards
}
```

**Features:**
- Thumbnail display with fallback icon
- Category badge with color coding
- Default template indicator (star icon)
- Preview button on hover
- Selected state with checkmark
- Hover effects (scale, shadow)
- Responsive sizing

**Category Colors:**
- business: Blue
- modern: Purple
- creative: Pink
- elegant: Indigo
- bold: Red
- minimalist: Gray
- custom: Green

**Usage:**
```tsx
import { TemplateCard } from '@/components/Templates';

<TemplateCard
  template={template}
  selected={selectedId === template.id}
  onSelect={() => handleSelect(template)}
  onPreview={() => handlePreview(template.id)}
/>
```

---

### TemplateSelector

Main component for displaying and filtering templates in a grid layout.

**Props:**
```typescript
interface TemplateSelectorProps {
  selectedTemplateId?: string | null;  // Currently selected template ID
  onSelect: (templateId: string, template: PDFTemplate) => void;  // Selection handler
  showPreview?: boolean;               // Enable preview functionality (default: true)
  compact?: boolean;                   // Compact mode for dialogs (default: false)
}
```

**Features:**
- **Grid Layout**: 3 columns on desktop, 2 on tablet, 1 on mobile
- **Search**: Filter templates by name (case-insensitive)
- **Category Filter**: Dropdown with all template categories
- **Loading State**: Skeleton cards while fetching data
- **Empty State**: Message when no templates exist
- **No Results**: Message when search/filter returns nothing
- **Preview Integration**: Opens PDFPreviewModal for template preview
- **Keyboard Navigation**:
  - Arrow keys to navigate grid
  - Enter to select
  - Escape to clear focus
- **Default Suggestion**: Tip shown when default template exists

**Data Flow:**
1. Fetches templates from `/api/templates` on mount
2. Filters by search query and category
3. Sorts by default status, then alphabetically
4. Renders grid of TemplateCard components

**Usage:**
```tsx
import { TemplateSelector } from '@/components/Templates';

<TemplateSelector
  selectedTemplateId={currentTemplateId}
  onSelect={(templateId, template) => {
    console.log('Selected:', template.name);
    // Handle selection
  }}
  showPreview={true}
  compact={false}
/>
```

**Standalone Page Example:**
```tsx
'use client';

import { TemplateSelector } from '@/components/Templates';
import { useState } from 'react';

export default function TemplatesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Choose a Template</h1>
      <TemplateSelector
        selectedTemplateId={selectedId}
        onSelect={(id, template) => {
          setSelectedId(id);
          console.log('Selected:', template.name);
        }}
      />
    </div>
  );
}
```

---

### TemplateSelectorDialog

Modal dialog wrapper for template selection.

**Props:**
```typescript
interface TemplateSelectorDialogProps {
  open: boolean;                       // Dialog open state
  onClose: () => void;                 // Called when dialog is closed
  onSelect: (templateId: string, template: PDFTemplate) => void;  // Selection handler
  currentTemplateId?: string | null;   // Currently selected template
  title?: string;                      // Dialog title (default: "Select Template")
}
```

**Features:**
- Full-screen modal overlay
- TemplateSelector embedded inside
- Confirm/Cancel buttons
- Shows selected template name in footer
- Keyboard shortcuts displayed
- Escape key to close
- Prevents body scroll when open
- Resets selection on cancel

**Usage:**
```tsx
import { TemplateSelectorDialog } from '@/components/Templates';
import { useState } from 'react';

function QuoteBuilder() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);

  return (
    <>
      <button onClick={() => setDialogOpen(true)}>
        Choose Template
      </button>

      <TemplateSelectorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={(id, template) => {
          setTemplateId(id);
          console.log('Selected:', template.name);
        }}
        currentTemplateId={templateId}
        title="Select PDF Template"
      />
    </>
  );
}
```

---

## Integration Examples

### Quote Builder Integration

```tsx
'use client';

import { useState } from 'react';
import { TemplateSelectorDialog } from '@/components/Templates';
import { PDFTemplate } from '@/lib/types';

export function QuoteBuilder() {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);

  return (
    <div>
      {/* Template Selection Button */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">PDF Template</label>
        <button
          onClick={() => setTemplateDialogOpen(true)}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          {selectedTemplate ? selectedTemplate.name : 'Choose Template'}
        </button>
      </div>

      {/* Template Selector Dialog */}
      <TemplateSelectorDialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        onSelect={(id, template) => {
          setSelectedTemplate(template);
        }}
        currentTemplateId={selectedTemplate?.id}
      />

      {/* Rest of quote builder... */}
    </div>
  );
}
```

### Embedded in Settings Page

```tsx
'use client';

import { TemplateSelector } from '@/components/Templates';
import { useState } from 'react';

export default function TemplateSettingsPage() {
  const [defaultTemplateId, setDefaultTemplateId] = useState<string | null>(null);

  const handleSetDefault = async (id: string, template: PDFTemplate) => {
    // Call API to set as default
    const response = await fetch(`/api/templates/${id}/set-default`, {
      method: 'POST',
    });

    if (response.ok) {
      setDefaultTemplateId(id);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-2">Default PDF Template</h1>
      <p className="text-gray-600 mb-6">
        Select the default template for new quotes.
      </p>

      <TemplateSelector
        selectedTemplateId={defaultTemplateId}
        onSelect={handleSetDefault}
        showPreview={true}
      />
    </div>
  );
}
```

---

## API Integration

All components integrate with the `/api/templates` endpoint:

**GET /api/templates**
- Returns array of PDFTemplate objects
- Supports optional query params:
  - `category`: Filter by category
  - `isdefault`: Filter by default status

**Response Format:**
```typescript
PDFTemplate[] = [
  {
    id: string,
    name: string,
    description: string | null,
    category: TemplateCategory,
    isDefault: boolean,
    isPublic: boolean,
    templateJson: TemplateJSON,
    thumbnail: string | null,
    createdBy: string | null,
    createdAt: string,
    updatedAt: string,
    version: number
  }
]
```

---

## Styling & Theming

### Tailwind Classes Used

**Card Styling:**
- `group` - For group hover effects
- `hover:scale-[1.02]` - Card lift on hover
- `ring-2 ring-blue-500` - Selected state
- `border-blue-500` - Selected border

**Grid Layout:**
- Desktop (lg): `grid-cols-3`
- Tablet (md): `grid-cols-2`
- Mobile: `grid-cols-1`

**Category Badges:**
- Each category has unique color scheme
- Uses `bg-{color}-100`, `text-{color}-800`, `border-{color}-200`

### Responsive Breakpoints

```scss
// Mobile first
.grid {
  grid-cols-1;  // Mobile

  @media (md) {
    grid-cols-2;  // Tablet
  }

  @media (lg) {
    grid-cols-3;  // Desktop
  }
}
```

---

## Accessibility

### Keyboard Navigation

**TemplateSelector:**
- Arrow keys navigate grid
- Enter selects focused template
- Escape clears focus

**TemplateSelectorDialog:**
- Escape closes dialog
- Tab navigation through elements
- Focus trap within dialog

### Screen Readers

- Semantic HTML elements
- ARIA labels where needed
- Alt text for template thumbnails
- Screen reader text for icons

---

## Performance Considerations

### Optimizations

1. **Loading States**: Skeleton screens prevent layout shift
2. **Memoization**: useCallback for event handlers
3. **Conditional Rendering**: Preview modal only when needed
4. **Efficient Filtering**: Client-side filtering for instant results
5. **Image Optimization**: Thumbnails use object-cover for consistent sizing

### Data Fetching

- Templates fetched once on mount
- Cached in component state
- Refetch on error recovery
- No polling or real-time updates

---

## Testing Scenarios

### Manual Testing Checklist

- [ ] Templates load correctly from API
- [ ] Search filters templates by name
- [ ] Category filter works for all categories
- [ ] Selected template shows checkmark and border
- [ ] Preview button opens PDFPreviewModal
- [ ] Keyboard navigation works (arrows, enter, escape)
- [ ] Loading skeleton displays during fetch
- [ ] Error state shows with retry button
- [ ] Empty state shows when no templates
- [ ] No results state shows when search/filter returns nothing
- [ ] Default template badge displays correctly
- [ ] Compact mode reduces card size
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Dialog opens and closes correctly
- [ ] Dialog confirm/cancel buttons work
- [ ] Dialog shows selected template name
- [ ] Dialog keyboard shortcuts work

---

## Troubleshooting

### Templates not loading

**Symptom**: Skeleton cards show indefinitely

**Solutions:**
1. Check API endpoint: `GET /api/templates`
2. Verify Supabase connection in `/lib/db.ts`
3. Check browser console for fetch errors
4. Verify `pdf_templates` table exists in database

### Preview not working

**Symptom**: Preview button does nothing

**Solutions:**
1. Verify `showPreview={true}` prop is set
2. Check PDFPreviewModal import
3. Verify `/api/templates/[id]/preview` endpoint exists
4. Check template has valid templateJson

### Search/Filter not working

**Symptom**: Filters don't affect displayed templates

**Solutions:**
1. Check searchQuery and selectedCategory state
2. Verify filteredTemplates logic
3. Check template.name and template.category fields
4. Console.log filteredTemplates to debug

### Keyboard navigation issues

**Symptom**: Arrow keys don't navigate

**Solutions:**
1. Verify event listener is attached
2. Check sortedTemplates array length
3. Ensure focusedIndex state updates
4. Verify tabIndex on card containers

---

## Future Enhancements

Potential improvements for future phases:

1. **Template Upload**: Allow users to upload custom template thumbnails
2. **Template Cloning**: Duplicate existing templates as starting point
3. **Template Sharing**: Share templates between users/organizations
4. **Template Versioning**: Track changes and rollback
5. **Template Analytics**: Most used templates, user preferences
6. **Template Tags**: Additional tagging system beyond categories
7. **Template Comparison**: Side-by-side comparison of 2-3 templates
8. **Template Ratings**: User ratings and favorites
9. **Bulk Operations**: Select multiple templates for batch actions
10. **Drag & Drop Ordering**: Custom sort order for templates

---

## File Structure

```
components/Templates/
├── index.ts                        # Barrel exports
├── README.md                       # This file
├── TemplateCard.tsx               # Individual card component
├── TemplateSelector.tsx           # Main selector with grid
└── TemplateSelectorDialog.tsx     # Modal wrapper
```

---

## Dependencies

- React 19.1.0
- Next.js 15.5.6
- Tailwind CSS 4
- lucide-react (icons)
- @/components/ui/* (Button, Input, Dialog)
- @/components/PDFPreviewModal
- @/lib/types (PDFTemplate, TemplateCategory)
- @/lib/utils (cn helper)

---

## Related Documentation

- [PDFPreviewModal README](../PDFPreviewModal.README.md)
- [Template API Documentation](../../app/api/templates/README.md)
- [Template Editor Components](../TemplateEditor/README.md)

---

**Created**: Phase 6A - Template Selector Component
**Last Updated**: 2025-10-20
