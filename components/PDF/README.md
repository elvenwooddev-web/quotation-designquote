# PDF Preview Components

Phase 5A: Live PDF Preview Component Implementation

## Overview

This directory contains components for live PDF preview functionality with interactive controls.

## Components

### PDFPreview

Main component for displaying PDF preview with controls.

**Features:**
- Live PDF rendering using @react-pdf/renderer
- Interactive zoom controls (50%, 75%, 100%, 125%, 150%)
- Download functionality
- Fullscreen mode
- Loading states with spinner
- Error handling and display
- Auto-refresh on quote/template changes
- Debounced regeneration (500ms delay)
- Responsive design
- Memory management (auto-cleanup of object URLs)

**Usage:**

```tsx
import { PDFPreview } from '@/components/PDF';

function MyComponent() {
  const quote = {...}; // QuoteWithDetails
  const template = {...}; // Optional PDFTemplate

  return (
    <PDFPreview
      quote={quote}
      template={template}
      title="PDF Preview"
      onError={(error) => console.error(error)}
      showControls={true}
      defaultZoom={100}
    />
  );
}
```

**Props:**

- `quote: QuoteWithDetails` - **Required**. Quote data with all details (items, client, policies)
- `template?: PDFTemplate` - Optional. PDF template to use (uses default if not provided)
- `title?: string` - Optional. Title for the preview section (default: "PDF Preview")
- `onError?: (error: Error) => void` - Optional. Error callback function
- `showControls?: boolean` - Optional. Show/hide control buttons (default: true)
- `defaultZoom?: number` - Optional. Default zoom level (default: 100)

### PDFPreviewModal

Modal dialog wrapper for PDF preview with large viewing area.

**Features:**
- Opens PDF preview in a modal dialog
- Large preview area (90vh height, 7xl width)
- Close button with keyboard support (ESC key)
- Prevents body scroll when open
- Responsive design
- All PDFPreview features available

**Usage:**

```tsx
import { PDFPreviewModal } from '@/components/PDF';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const quote = {...}; // QuoteWithDetails
  const template = {...}; // Optional PDFTemplate

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Preview PDF
      </button>

      <PDFPreviewModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        quote={quote}
        template={template}
        title="Quote Preview"
        onError={(error) => console.error(error)}
      />
    </>
  );
}
```

**Props:**

- `open: boolean` - **Required**. Whether the modal is open
- `onClose: () => void` - **Required**. Callback when modal should close
- `quote: QuoteWithDetails` - **Required**. Quote data with all details
- `template?: PDFTemplate` - Optional. PDF template to use
- `title?: string` - Optional. Title for the preview (default: "PDF Preview")
- `onError?: (error: Error) => void` - Optional. Error callback function

## Performance Optimizations

### Debounced Regeneration

The component uses a 500ms debounce delay to prevent regeneration on every keystroke when quote or template changes. This significantly improves performance during editing.

### Memory Management

- Automatically revokes old object URLs when generating new PDFs
- Cleans up all URLs on component unmount
- Cancels pending generation timeouts on unmount

### Conditional Rendering

- Shows loading spinner only when necessary
- Displays error state with retry button
- Hides iframe until PDF is ready

## Integration Examples

### In Template Editor

```tsx
import { PDFPreview } from '@/components/PDF';

function TemplateEditor() {
  const [template, setTemplate] = useState<PDFTemplate>(currentTemplate);
  const sampleQuote = {...}; // Sample quote data

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Editor Panel */}
      <div>
        <TemplateEditorForm
          template={template}
          onChange={setTemplate}
        />
      </div>

      {/* Live Preview Panel */}
      <div className="h-screen sticky top-0">
        <PDFPreview
          quote={sampleQuote}
          template={template}
          title="Live Preview"
          showControls={true}
        />
      </div>
    </div>
  );
}
```

### In Quote Builder

```tsx
import { PDFPreviewModal } from '@/components/PDF';

function QuoteBuilder() {
  const [showPreview, setShowPreview] = useState(false);
  const [quote, setQuote] = useState<QuoteWithDetails>(currentQuote);
  const template = useTemplateForQuote(quote.id);

  return (
    <>
      <div>
        <QuoteBuilderForm quote={quote} onChange={setQuote} />

        <button onClick={() => setShowPreview(true)}>
          Preview PDF
        </button>
      </div>

      <PDFPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        quote={quote}
        template={template}
      />
    </>
  );
}
```

### In Quote List

```tsx
import { PDFPreviewModal } from '@/components/PDF';

function QuoteList() {
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithDetails | null>(null);

  return (
    <>
      <table>
        {quotes.map(quote => (
          <tr key={quote.id}>
            <td>{quote.quoteNumber}</td>
            <td>{quote.title}</td>
            <td>
              <button onClick={() => setSelectedQuote(quote)}>
                Preview
              </button>
            </td>
          </tr>
        ))}
      </table>

      {selectedQuote && (
        <PDFPreviewModal
          open={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          quote={selectedQuote}
        />
      )}
    </>
  );
}
```

## Styling

The components use Tailwind CSS for styling with the following features:

- Clean, professional design
- Loading animations (spinner)
- Disabled states for controls during loading
- Responsive layout
- Fullscreen support
- Dark mode compatible (can be extended)

## Error Handling

The component handles errors gracefully:

1. **Display**: Shows user-friendly error message with icon
2. **Callback**: Calls `onError` prop if provided
3. **Console**: Logs detailed error to console for debugging
4. **Retry**: Provides "Try Again" button to retry generation

## Browser Compatibility

- Requires modern browser with iframe support
- Fullscreen API support (optional feature)
- Object URL support (standard in all modern browsers)

## Dependencies

- `@react-pdf/renderer` - PDF generation
- `lucide-react` - Icons
- `@/components/ui/button` - Button component
- `@/components/ui/dialog` - Dialog component
- `@/lib/types` - TypeScript types
- `@/lib/pdf-generator` - PDF generation function

## Future Enhancements

- Multi-page navigation
- Print functionality
- Page thumbnails
- Text search within PDF
- Annotations/comments
- Dark mode support
- Custom zoom levels
- PDF.js integration for advanced features
