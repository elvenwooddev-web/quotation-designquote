# PDF Preview Components - Quick Start Guide

## Installation

No installation needed! The components are already part of your project.

## Basic Usage

### 1. Import the Component

```tsx
import { PDFPreview, PDFPreviewModal } from '@/components/PDF';
```

### 2. Use PDFPreview (Inline)

```tsx
function MyPage() {
  const quote = useQuote(); // Your quote data

  return (
    <div className="h-screen">
      <PDFPreview quote={quote} />
    </div>
  );
}
```

### 3. Use PDFPreviewModal (Dialog)

```tsx
function MyPage() {
  const [open, setOpen] = useState(false);
  const quote = useQuote();

  return (
    <>
      <button onClick={() => setOpen(true)}>Preview PDF</button>
      <PDFPreviewModal
        open={open}
        onClose={() => setOpen(false)}
        quote={quote}
      />
    </>
  );
}
```

## Common Patterns

### Template Editor (Split Screen)

```tsx
<div className="grid grid-cols-2 gap-4 h-screen">
  <div>
    <h2>Edit Template</h2>
    <TemplateForm template={template} onChange={setTemplate} />
  </div>
  <div>
    <PDFPreview quote={sampleQuote} template={template} />
  </div>
</div>
```

### Quote Builder

```tsx
function QuoteBuilder() {
  const [showPreview, setShowPreview] = useState(false);
  const [quote, setQuote] = useState(initialQuote);

  return (
    <>
      <QuoteForm quote={quote} onChange={setQuote} />
      <button onClick={() => setShowPreview(true)}>Preview</button>

      <PDFPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        quote={quote}
      />
    </>
  );
}
```

### Quote List

```tsx
function QuoteList() {
  const [selectedQuote, setSelectedQuote] = useState(null);

  return (
    <>
      <table>
        {quotes.map(quote => (
          <tr key={quote.id}>
            <td>{quote.quoteNumber}</td>
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

## Props Reference

### PDFPreview

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| quote | QuoteWithDetails | ✅ | - | Quote data to render |
| template | PDFTemplate | ❌ | Default | PDF template to use |
| title | string | ❌ | "PDF Preview" | Preview title |
| onError | (error: Error) => void | ❌ | - | Error callback |
| showControls | boolean | ❌ | true | Show control buttons |
| defaultZoom | number | ❌ | 100 | Default zoom level |

### PDFPreviewModal

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| open | boolean | ✅ | - | Modal open state |
| onClose | () => void | ✅ | - | Close callback |
| quote | QuoteWithDetails | ✅ | - | Quote data to render |
| template | PDFTemplate | ❌ | Default | PDF template to use |
| title | string | ❌ | "PDF Preview" | Preview title |
| onError | (error: Error) => void | ❌ | - | Error callback |

## Features

### Zoom Controls
- 50%, 75%, 100%, 125%, 150% presets
- Zoom in/out buttons
- Visual feedback on current zoom

### Download
- One-click download
- Automatic filename: `{quoteNumber}-{title}.pdf`

### Fullscreen
- Toggle fullscreen mode
- ESC key to exit
- Automatic state management

### Auto-Refresh
- Updates when quote/template changes
- Debounced (500ms delay)
- Visual "Updating..." indicator

### Loading States
- Spinner during generation
- "Generating PDF..." message
- Disabled controls while loading

### Error Handling
- User-friendly error messages
- Retry button
- Console logging
- Optional error callback

## Styling

Components use Tailwind CSS and match your existing design system:
- Gray/blue color scheme
- Professional, clean UI
- Responsive design
- Accessible controls

## Performance Tips

1. **Debouncing:** Changes are debounced by 500ms - no need to implement your own
2. **Memory:** Component automatically cleans up resources
3. **Large Quotes:** Loading time increases with item count (normal behavior)

## Troubleshooting

### PDF not displaying?
- Check that quote has valid data
- Check browser console for errors
- Verify @react-pdf/renderer is installed

### Slow generation?
- Normal for complex quotes
- Debouncing prevents rapid regeneration
- Consider reducing item count for testing

### Controls not working?
- Check `showControls` prop
- Verify buttons aren't disabled
- Check for JavaScript errors

## More Information

- **Full Documentation:** See `README.md`
- **Examples:** See `example-usage.tsx`
- **Types:** See `@/lib/types`
- **Generator:** See `@/lib/pdf-generator`

## Support

For issues or questions:
1. Check the README.md for detailed docs
2. Review example-usage.tsx for patterns
3. Check browser console for errors
4. Review @react-pdf/renderer documentation
