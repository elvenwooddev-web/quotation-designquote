# PDFPreviewModal Component

A reusable modal component for displaying PDF previews across the Intelli-Quoter application.

## Usage

### Basic Import

```typescript
import { PDFPreviewModal } from '@/components/PDFPreviewModal';
```

### Preview Template with Sample Data

```typescript
import { useState } from 'react';
import { PDFPreviewModal } from '@/components/PDFPreviewModal';

function TemplatePreview() {
  const [showPreview, setShowPreview] = useState(false);
  const templateId = 'template-123';

  return (
    <>
      <button onClick={() => setShowPreview(true)}>
        Preview Template
      </button>

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        templateId={templateId}
        title="Template Preview"
      />
    </>
  );
}
```

### Preview Saved Quote

```typescript
import { useState } from 'react';
import { PDFPreviewModal } from '@/components/PDFPreviewModal';

function QuotePreview() {
  const [showPreview, setShowPreview] = useState(false);
  const quoteId = 'quote-456';

  return (
    <>
      <button onClick={() => setShowPreview(true)}>
        Preview Quote
      </button>

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        quoteId={quoteId}
        title="Quote Preview"
      />
    </>
  );
}
```

### Preview with Quote Data (Future)

```typescript
import { useState } from 'react';
import { PDFPreviewModal } from '@/components/PDFPreviewModal';
import { QuoteWithDetails } from '@/lib/types';

function UnsavedQuotePreview() {
  const [showPreview, setShowPreview] = useState(false);
  const quoteData: QuoteWithDetails = {
    // ... quote data from form state
  };

  return (
    <>
      <button onClick={() => setShowPreview(true)}>
        Preview Draft
      </button>

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        quoteData={quoteData}
        title="Draft Preview"
      />
    </>
  );
}
```

## Props

### `isOpen` (required)
- **Type**: `boolean`
- **Description**: Controls modal visibility
- **Example**: `isOpen={showPreview}`

### `onClose` (required)
- **Type**: `() => void`
- **Description**: Callback when modal should close
- **Example**: `onClose={() => setShowPreview(false)}`

### `quoteId` (optional)
- **Type**: `string`
- **Description**: ID of saved quote to preview
- **Example**: `quoteId="quote-123"`
- **Note**: Uses `/api/quotes/[id]/pdf` endpoint

### `quoteData` (optional)
- **Type**: `QuoteWithDetails`
- **Description**: Direct quote data for preview (unsaved quotes)
- **Example**: `quoteData={currentQuote}`
- **Note**: Not yet implemented - placeholder for future feature

### `templateId` (optional)
- **Type**: `string`
- **Description**: ID of template to preview with sample data
- **Example**: `templateId="template-123"`
- **Note**: Uses `/api/templates/[id]/preview` endpoint

### `title` (optional)
- **Type**: `string`
- **Default**: `"PDF Preview"`
- **Description**: Modal title/heading
- **Example**: `title="Invoice Preview"`

## Features

### Auto-Cleanup
- Automatically revokes blob URLs when modal closes
- Prevents memory leaks in long-running sessions
- No manual cleanup needed

### Keyboard Shortcuts
- **Escape**: Close modal
- Automatically registered when modal opens
- Automatically cleaned up when modal closes

### Download Functionality
- Download button appears when preview is ready
- Automatically generates filename
- No regeneration needed

### Error Handling
- Displays error messages if PDF generation fails
- Provides "Try Again" button for retry
- Logs errors to console for debugging

### Loading States
- Shows spinner during PDF generation
- Displays "Generating PDF preview..." message
- Prevents user confusion during wait

## API Endpoints

### Template Preview
**Endpoint**: `GET /api/templates/[id]/preview`
- Fetches template from database
- Generates sample quote data
- Returns PDF with sample data

**Used when**: `templateId` prop is provided

### Quote Preview
**Endpoint**: `GET /api/quotes/[id]/pdf`
- Fetches complete quote with relations
- Uses quote's template or default
- Returns PDF with actual quote data

**Used when**: `quoteId` prop is provided

## Styling

The modal uses Tailwind CSS classes:
- Full-screen overlay with backdrop
- Responsive sizing (90vh height, max-w-6xl)
- Clean white modal with shadow
- Header, content, and footer sections

### Customization

To customize styling, modify the classes in `PDFPreviewModal.tsx`:

```typescript
// Modal container
<div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">

// Overlay
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
```

## Examples in Codebase

### Template Editor
**File**: `components/TemplateEditor/TemplateEditor.tsx`

```typescript
<PDFPreviewModal
  isOpen={showPreview}
  onClose={() => setShowPreview(false)}
  templateId={template.id || undefined}
  title={`Preview: ${templateName}`}
/>
```

### Quote Builder
**File**: `components/QuoteBuilder/QuoteActions.tsx`

```typescript
<PDFPreviewModal
  isOpen={showPreview}
  onClose={() => setShowPreview(false)}
  quoteId={savedQuoteId || undefined}
  title="Quote Preview"
/>
```

### Template Library
**File**: `app/templates/page.tsx`

```typescript
<PDFPreviewModal
  isOpen={!!previewTemplateId}
  onClose={() => {
    setPreviewTemplateId(null);
    setPreviewTemplateName('');
  }}
  templateId={previewTemplateId || undefined}
  title={`Preview: ${previewTemplateName}`}
/>
```

## Common Patterns

### Toggle Preview

```typescript
const [showPreview, setShowPreview] = useState(false);

// Open
<Button onClick={() => setShowPreview(true)}>Preview</Button>

// Modal
<PDFPreviewModal
  isOpen={showPreview}
  onClose={() => setShowPreview(false)}
  // ... other props
/>
```

### Conditional Preview with ID

```typescript
const [previewId, setPreviewId] = useState<string | null>(null);

// Open
<Button onClick={() => setPreviewId(item.id)}>Preview</Button>

// Modal
<PDFPreviewModal
  isOpen={!!previewId}
  onClose={() => setPreviewId(null)}
  quoteId={previewId || undefined}
/>
```

### Preview with Validation

```typescript
const handlePreview = () => {
  if (!savedQuoteId) {
    alert('Please save the quote first');
    return;
  }
  setShowPreview(true);
};

<Button onClick={handlePreview} disabled={!savedQuoteId}>
  Preview
</Button>
```

## Troubleshooting

### Preview Not Loading
1. Check browser console for errors
2. Verify template/quote ID exists in database
3. Ensure API endpoint is accessible
4. Check network tab for failed requests

### Blank PDF
1. Verify PDF generation library is working
2. Check sample data generator output
3. Ensure template JSON is valid
4. Review server logs for generation errors

### Memory Issues
1. Component auto-cleans blob URLs
2. If issues persist, check for state leaks
3. Verify modal unmounts properly
4. Clear browser cache if needed

### Modal Won't Close
1. Ensure `onClose` prop is provided
2. Check state is updated in `onClose`
3. Verify no errors preventing state update
4. Test Escape key functionality

## Performance Considerations

### PDF Generation
- Template previews use sample data (faster)
- Quote previews use real data (may be slower)
- Large quotes may take longer to generate
- Consider caching for frequently previewed items

### Memory Management
- Blob URLs automatically revoked
- Modal cleanup on unmount
- No memory leaks in normal usage
- Test with long sessions to verify

### Network Usage
- PDF generated on each preview request
- No caching by default
- Consider adding cache for templates
- Minimize preview requests when possible

## Accessibility

### Keyboard Navigation
- Escape key closes modal
- Focus management automatic
- Tab navigation supported in buttons

### Screen Readers
- Modal has proper ARIA labels (to be added)
- Buttons have descriptive text
- Loading/error states announced (to be added)

### Future Improvements
- Add ARIA attributes
- Improve focus management
- Add screen reader announcements
- Support reduced motion preferences

## Related Components

- `TemplateEditor` - Uses preview for template editing
- `QuoteActions` - Uses preview for quote review
- `TemplatesPage` - Uses preview for template browsing

## Related Files

- `lib/sample-quote-data.ts` - Sample data generator
- `lib/pdf-generator.ts` - PDF generation logic
- `app/api/templates/[id]/preview/route.ts` - Template preview API
- `app/api/quotes/[id]/pdf/route.ts` - Quote PDF API

## Version History

- **v1.0** (2025-10-20): Initial implementation
  - Basic preview modal
  - Template and quote preview support
  - Download functionality
  - Error handling and loading states
  - Keyboard shortcuts

## License

Part of the Intelli-Quoter application.
