# Template Import/Export Quick Guide

## For End Users

### How to Export Templates

#### Export from Template Library

1. Go to **Templates** page
2. Check the boxes next to templates you want to export
3. Click **"Export Selected"** button
4. Your browser will download a JSON file

**OR**

Click **"Export All"** to download all templates at once.

#### Export from Template Editor

1. Open any template in the editor
2. Click the **"Export"** button (download icon) in the top bar
3. Your browser will download a JSON file

**Note**: Export from the editor includes any unsaved changes!

### How to Import Templates

1. Go to **Templates** page
2. Click **"Import"** button in the top right
3. Either:
   - Drag and drop your JSON file into the dialog
   - Click **"Browse Files"** to select a file
4. Wait for validation and import to complete
5. Review the results:
   - Green checkmarks = Successfully imported
   - Red warnings = Failed to import (see errors)
   - Yellow warnings = Imported with minor issues
6. Click **"Done"** to close

### Common Issues and Solutions

#### "Invalid JSON format"
- **Problem**: The file is not valid JSON
- **Solution**: Make sure you're importing a file that was exported from the template editor

#### "Template name is required"
- **Problem**: The JSON is missing the template name
- **Solution**: Edit the JSON file to add a "name" field

#### "Template already exists: [name]"
- **Don't worry!** The system automatically renames imported templates by adding "(Imported)" to avoid conflicts

#### "Failed to parse JSON"
- **Problem**: The JSON file is corrupted or malformed
- **Solution**: Try exporting the template again, or check the file wasn't edited incorrectly

## For Developers

### Exporting Templates Programmatically

```typescript
import {
  exportTemplate,
  exportTemplates,
  downloadTemplateAsFile
} from '@/lib/template-export';

// Export single template to JSON string
const jsonString = exportTemplate(myTemplate);
console.log(jsonString);

// Export multiple templates
const jsonString = exportTemplates([template1, template2]);

// Download as file (browser only)
downloadTemplateAsFile(myTemplate, 'my-custom-filename');
```

### Importing Templates Programmatically

```typescript
import {
  validateAndImportTemplates,
  validateTemplateStructure,
  importTemplate
} from '@/lib/template-import';

// Full import with validation
const result = await validateAndImportTemplates(jsonString);
if (result.success) {
  console.log(`Imported ${result.successCount} templates`);
} else {
  console.error(result.parseError);
}

// Validate only (no import)
const validation = validateTemplateStructure(templateData);
if (!validation.valid) {
  console.error(validation.errors);
}

// Manual import (after validation)
const templateId = await importTemplate(preparedTemplateData);
```

### Using the Import Dialog Component

```typescript
import { TemplateImportDialog } from '@/components/Templates';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleImportComplete = (successCount: number) => {
    console.log(`Imported ${successCount} templates`);
    // Refresh your template list here
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Import Templates</button>

      <TemplateImportDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </>
  );
}
```

### Export Format Specification

#### Single Template Export

```json
{
  "exportVersion": "1.0",
  "exportDate": "2025-10-20T12:34:56.789Z",
  "template": {
    "name": "My Template",
    "description": "Template description",
    "category": "modern",
    "isPublic": false,
    "templateJson": {
      "metadata": {
        "version": "1.0",
        "pageSize": "A4",
        "orientation": "portrait",
        "margins": { "top": 40, "bottom": 40, "left": 40, "right": 40 }
      },
      "theme": {
        "colors": {
          "primary": "#3B82F6",
          "secondary": "#10B981",
          "textPrimary": "#1F2937",
          "textSecondary": "#6B7280",
          "background": "#FFFFFF"
        },
        "fonts": {
          "heading": { "family": "Inter", "size": 24, "weight": 600 },
          "body": { "family": "Inter", "size": 12, "weight": 400 },
          "small": { "family": "Inter", "size": 10, "weight": 400 }
        }
      },
      "elements": [
        {
          "id": "header-1",
          "type": "header",
          "order": 0,
          "position": "auto",
          "size": { "width": "auto", "height": "auto" },
          "properties": {
            "text": "Quotation",
            "fontSize": 24,
            "color": "#000000",
            "alignment": "left"
          }
        }
      ]
    },
    "thumbnail": null
  }
}
```

#### Multiple Templates Export

```json
{
  "exportVersion": "1.0",
  "exportDate": "2025-10-20T12:34:56.789Z",
  "templates": [
    { /* template 1 */ },
    { /* template 2 */ }
  ]
}
```

### Validation Rules Reference

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Non-empty |
| `description` | string \| null | No | - |
| `category` | TemplateCategory | No | Must be valid category (defaults to "custom") |
| `isPublic` | boolean | No | Defaults to false |
| `templateJson.metadata.version` | string | No | Warning if missing |
| `templateJson.metadata.pageSize` | PageSize | Yes | "A4", "Letter", or "Legal" |
| `templateJson.metadata.orientation` | Orientation | Yes | "portrait" or "landscape" |
| `templateJson.metadata.margins` | Margins | Yes | top, bottom, left, right (non-negative numbers) |
| `templateJson.theme.colors.*` | string | Yes | Must include all 5 colors |
| `templateJson.theme.fonts.*` | FontConfig | Yes | Must include heading, body, small |
| `templateJson.elements` | TemplateElement[] | Yes | Array of valid elements |

### Element Types

Valid element types include:
- `header` - Page header
- `footer` - Page footer
- `table` - Generic table
- `signature` - Signature block
- `textBlock` - Text content
- `divider` - Horizontal line
- `spacer` - Vertical spacing
- `image` - Image placeholder
- `logo` - Company logo
- `termsAndConditions` - Terms text
- `clientDetails` - Client information
- `itemTable` - Quote items table
- `summaryBox` - Quote totals summary
- `signatureBlock` - Signature area

### Error Handling Best Practices

```typescript
try {
  const result = await validateAndImportTemplates(jsonString);

  if (result.parseError) {
    // Handle JSON parse error
    showError(`Failed to parse JSON: ${result.parseError}`);
    return;
  }

  if (result.successCount === 0) {
    // All templates failed
    showError('No templates could be imported. Check validation errors.');
    result.templates.forEach(t => {
      console.error(`${t.name}:`, t.errors);
    });
    return;
  }

  if (result.failureCount > 0) {
    // Partial success
    showWarning(
      `Imported ${result.successCount} templates. ${result.failureCount} failed.`
    );
  } else {
    // Full success
    showSuccess(`Successfully imported ${result.successCount} templates`);
  }

  // Show warnings if any
  result.templates.forEach(t => {
    if (t.warnings.length > 0) {
      console.warn(`${t.name} warnings:`, t.warnings);
    }
  });

} catch (error) {
  showError('Unexpected error during import');
  console.error(error);
}
```

### Security Considerations

1. **Never trust imported data**: Always validate before using
2. **Sanitize filenames**: The export library automatically sanitizes filenames
3. **No code execution**: JSON parsing only, no eval() or Function()
4. **Database field filtering**: id, createdBy, etc. are never imported
5. **Permission checks**: Respect user roles for import/export operations

### Performance Tips

1. **Large exports**: For 50+ templates, consider ZIP export (requires jszip)
2. **Batch imports**: Import processes sequentially to avoid race conditions
3. **Memory**: Keep JSON files under 10MB for best browser performance
4. **Validation caching**: Existing template names are fetched once per import session

### Testing Your Templates

```typescript
import { validateTemplateStructure } from '@/lib/template-import';

// Test your template structure
const myTemplate = {
  name: 'Test Template',
  category: 'modern',
  templateJson: { /* ... */ }
};

const validation = validateTemplateStructure(myTemplate);

if (!validation.valid) {
  console.error('Validation failed:', validation.errors);
  console.warn('Warnings:', validation.warnings);
} else {
  console.log('Template is valid!');
  if (validation.warnings.length > 0) {
    console.warn('Minor issues:', validation.warnings);
  }
}
```

## Troubleshooting

### Import Hangs or Freezes
- Check browser console for errors
- Try importing templates one at a time
- Verify JSON file is not corrupted
- Check file size (should be under 10MB)

### Export Not Downloading
- Check browser's download settings
- Allow downloads from the site
- Check for popup blockers
- Try a different browser

### Template Looks Different After Import
- Verify all custom fonts are installed
- Check that element types are supported
- Review warnings in import dialog
- Compare exported JSON with original

### Can't Find Imported Template
- Check the template name (may have "(Imported)" suffix)
- Use search bar in template library
- Check category filter
- Refresh the page

## Need Help?

- Check the validation errors in the import dialog
- Review the export format specification above
- Consult the implementation summary: `PHASE_7A_IMPORT_EXPORT_SUMMARY.md`
- Check browser console for detailed error messages

## API Reference

### Export Functions

```typescript
// Single template export
exportTemplate(template: PDFTemplate): string

// Multiple templates export
exportTemplates(templates: PDFTemplate[]): string

// Browser download (single)
downloadTemplateAsFile(template: PDFTemplate, filename?: string): void

// Browser download (multiple)
downloadTemplatesAsFile(templates: PDFTemplate[], filename?: string): void

// ZIP export (optional, requires jszip)
downloadTemplatesAsZip(templates: PDFTemplate[]): Promise<void>

// Get metadata only
getTemplateMetadata(template: PDFTemplate): TemplateMetadata
```

### Import Functions

```typescript
// Parse JSON safely
parseTemplateJSON(jsonString: string): any | null

// Validate structure
validateTemplateStructure(template: any): ValidationResult

// Detect format
detectImportFormat(data: any): 'single' | 'multiple' | 'unknown'

// Extract templates
extractTemplatesFromImport(data: any): ExportTemplateData[]

// Prepare for import
prepareTemplateForImport(
  templateData: ExportTemplateData,
  existingNames: string[]
): Partial<PDFTemplate>

// Import single template
importTemplate(templateData: Partial<PDFTemplate>): Promise<string>

// Import multiple templates
importTemplates(templatesData: Partial<PDFTemplate>[]): Promise<ImportResult[]>

// Full import with validation
validateAndImportTemplates(jsonString: string): Promise<ImportResult>

// Check name conflicts
isTemplateNameDuplicate(name: string, existingNames: string[]): boolean

// Generate unique name
generateUniqueTemplateName(
  baseName: string,
  existingNames: string[],
  suffix?: string
): string
```

### Type Definitions

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface ImportResult {
  success: boolean;
  templateId?: string;
  templateName: string;
  error?: string;
}

interface ExportTemplateData {
  name: string;
  description: string | null;
  category: string;
  isPublic: boolean;
  templateJson: TemplateJSON;
  thumbnail: string | null;
}
```
