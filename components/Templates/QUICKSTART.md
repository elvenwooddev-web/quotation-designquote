# Template Selector - Quick Start Guide

Get up and running with the Template Selector components in 5 minutes.

## Installation

No installation required! Components are ready to use in your Next.js app.

## Basic Usage

### Option 1: Dialog Modal (Recommended)

Use the dialog for template selection in forms and workflows.

```tsx
'use client';

import { useState } from 'react';
import { TemplateSelectorDialog } from '@/components/Templates';
import { PDFTemplate } from '@/lib/types';

export function MyComponent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [template, setTemplate] = useState<PDFTemplate | null>(null);

  return (
    <div>
      <button onClick={() => setDialogOpen(true)}>
        Choose Template
      </button>

      <TemplateSelectorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={(id, template) => setTemplate(template)}
        currentTemplateId={template?.id}
      />
    </div>
  );
}
```

### Option 2: Inline Selector

Use the inline selector for dedicated template pages.

```tsx
'use client';

import { TemplateSelector } from '@/components/Templates';
import { PDFTemplate } from '@/lib/types';

export function MyPage() {
  return (
    <TemplateSelector
      selectedTemplateId={null}
      onSelect={(id, template) => {
        console.log('Selected:', template.name);
      }}
    />
  );
}
```

### Option 3: Individual Cards

Use template cards for custom layouts.

```tsx
import { TemplateCard } from '@/components/Templates';

<TemplateCard
  template={myTemplate}
  selected={true}
  onSelect={() => handleSelect(myTemplate)}
  onPreview={() => handlePreview(myTemplate.id)}
/>
```

## Common Props

### TemplateSelectorDialog

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Dialog open state |
| `onClose` | `() => void` | Yes | Close handler |
| `onSelect` | `(id, template) => void` | Yes | Selection handler |
| `currentTemplateId` | `string \| null` | No | Current template |
| `title` | `string` | No | Dialog title |

### TemplateSelector

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedTemplateId` | `string \| null` | No | Selected template |
| `onSelect` | `(id, template) => void` | Yes | Selection handler |
| `showPreview` | `boolean` | No | Enable preview (default: true) |
| `compact` | `boolean` | No | Compact mode (default: false) |

### TemplateCard

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `template` | `PDFTemplate` | Yes | Template object |
| `selected` | `boolean` | No | Selected state |
| `onSelect` | `() => void` | No | Click handler |
| `onPreview` | `() => void` | No | Preview handler |
| `compact` | `boolean` | No | Compact mode |

## Features

### Search

Search by template name - instant client-side filtering.

```tsx
<TemplateSelector
  selectedTemplateId={null}
  onSelect={handleSelect}
/>
// User types in search box - results filter instantly
```

### Filter by Category

Filter templates by category (business, modern, creative, etc).

```tsx
<TemplateSelector
  selectedTemplateId={null}
  onSelect={handleSelect}
/>
// User selects category from dropdown - grid updates
```

### Preview

Click preview button to see template with sample data.

```tsx
<TemplateSelector
  selectedTemplateId={null}
  onSelect={handleSelect}
  showPreview={true}  // Enable preview (default)
/>
```

### Keyboard Navigation

Navigate with keyboard for power users.

- **Arrow Keys**: Navigate grid
- **Enter**: Select focused template
- **Escape**: Close dialog / Clear focus

```tsx
<TemplateSelector
  selectedTemplateId={null}
  onSelect={handleSelect}
/>
// User presses arrow keys - focus moves
// User presses enter - template selected
```

### Compact Mode

Use compact mode for smaller spaces.

```tsx
<TemplateSelector
  selectedTemplateId={null}
  onSelect={handleSelect}
  compact={true}  // Smaller cards, 2-column grid
/>
```

## Integration Examples

### Quote Builder

Add template selection to quote creation.

```tsx
'use client';

import { useState } from 'react';
import { TemplateSelectorDialog } from '@/components/Templates';
import { PDFTemplate } from '@/lib/types';

export function QuoteBuilder() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [template, setTemplate] = useState<PDFTemplate | null>(null);

  const handleSaveQuote = async () => {
    const quote = {
      title: 'My Quote',
      templateId: template?.id,
      // ... other fields
    };

    await fetch('/api/quotes', {
      method: 'POST',
      body: JSON.stringify(quote),
    });
  };

  return (
    <div>
      {/* Template selector button */}
      <button onClick={() => setDialogOpen(true)}>
        {template ? template.name : 'Choose Template'}
      </button>

      {/* Save quote button */}
      <button onClick={handleSaveQuote} disabled={!template}>
        Save Quote
      </button>

      {/* Template selector dialog */}
      <TemplateSelectorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={(id, template) => setTemplate(template)}
        currentTemplateId={template?.id}
        title="Select PDF Template"
      />
    </div>
  );
}
```

### Settings Page

Set default template for the system.

```tsx
'use client';

import { useState } from 'react';
import { TemplateSelector } from '@/components/Templates';

export default function SettingsPage() {
  const [defaultId, setDefaultId] = useState<string | null>(null);

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/templates/${id}/set-default`, {
      method: 'POST',
    });
    setDefaultId(id);
  };

  return (
    <div>
      <h1>Default Template</h1>
      <TemplateSelector
        selectedTemplateId={defaultId}
        onSelect={(id) => handleSetDefault(id)}
        showPreview={true}
      />
    </div>
  );
}
```

## Styling

### Category Colors

Templates are color-coded by category:

- **Business**: Blue
- **Modern**: Purple
- **Creative**: Pink
- **Elegant**: Indigo
- **Bold**: Red
- **Minimalist**: Gray
- **Custom**: Green

### Selected State

Selected templates show:
- Blue border (`border-blue-500`)
- Ring effect (`ring-2 ring-blue-500`)
- Checkmark badge (top-right)

### Hover Effects

Cards animate on hover:
- Scale up slightly (`hover:scale-[1.02]`)
- Elevated shadow (`hover:shadow-lg`)
- Preview button appears

### Responsive Grid

Grid adapts to screen size:
- **Desktop**: 3 columns
- **Tablet**: 2 columns
- **Mobile**: 1 column

## API Integration

### Fetch Templates

Components automatically fetch from:

```
GET /api/templates
```

Response format:
```json
[
  {
    "id": "abc123",
    "name": "Modern Business",
    "category": "business",
    "isDefault": true,
    "templateJson": { ... },
    ...
  }
]
```

### Preview Template

Preview uses endpoint:

```
GET /api/templates/{id}/preview
```

Returns PDF blob for display.

### Set Default

Set default template:

```
POST /api/templates/{id}/set-default
```

## Error Handling

### Loading State

Components show skeleton while loading:
```tsx
// Automatic - no code needed
<TemplateSelector ... />
```

### Error State

Components show error with retry:
```tsx
// Automatic - no code needed
<TemplateSelector ... />
```

### Empty State

Components show message when no templates:
```tsx
// Automatic - no code needed
<TemplateSelector ... />
```

## Accessibility

### Keyboard Support

Full keyboard navigation:
- Tab through interactive elements
- Arrow keys navigate grid
- Enter selects template
- Escape closes dialog

### Screen Readers

Proper ARIA labels and semantic HTML.

### Focus Management

Visible focus indicators for keyboard users.

## Performance Tips

### Lazy Loading

Preview modal only loads when opened:
```tsx
<TemplateSelector
  showPreview={true}  // Modal lazy-loaded
/>
```

### Client-Side Filtering

Search and filter are instant (no API calls):
```tsx
// No performance concerns - all client-side
<TemplateSelector ... />
```

### Memoization

Event handlers are memoized with `useCallback`.

## Troubleshooting

### Templates not loading?

1. Check API endpoint: `GET /api/templates`
2. Check browser console for errors
3. Verify Supabase connection

### Preview not working?

1. Check `showPreview={true}` prop is set
2. Verify `/api/templates/[id]/preview` endpoint exists
3. Check PDFPreviewModal is available

### Search not working?

1. Verify `searchQuery` state updates
2. Check `filteredTemplates` logic
3. Test with console.log

### Keyboard navigation not working?

1. Ensure component is focused
2. Check event listener is attached
3. Verify `sortedTemplates` has items

## Next Steps

- Read [README.md](./README.md) for full documentation
- See [EXAMPLES.md](./EXAMPLES.md) for more code examples
- Check [COMPONENT_TREE.md](./COMPONENT_TREE.md) for architecture

## Support

For issues or questions:
1. Check [README.md](./README.md)
2. Review [EXAMPLES.md](./EXAMPLES.md)
3. See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**Quick Links:**
- [README.md](./README.md) - Full documentation
- [EXAMPLES.md](./EXAMPLES.md) - Code examples
- [COMPONENT_TREE.md](./COMPONENT_TREE.md) - Architecture
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Implementation details

**Version**: Phase 6A
**Last Updated**: 2025-10-20
