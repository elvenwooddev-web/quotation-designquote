# Template Selector - Usage Examples

Complete code examples for integrating the Template Selector components.

## Example 1: Quote Builder Integration

Add template selection to the quote builder form.

```tsx
'use client';

import { useState } from 'react';
import { TemplateSelectorDialog } from '@/components/Templates';
import { PDFTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FileText, Edit } from 'lucide-react';

export function QuoteBuilderForm() {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);

  // Quote data state
  const [quoteData, setQuoteData] = useState({
    title: '',
    clientId: null,
    items: [],
    // ... other quote fields
  });

  const handleTemplateSelect = (templateId: string, template: PDFTemplate) => {
    setSelectedTemplate(template);
    console.log('Template selected:', template.name);

    // Optionally save to quote data
    setQuoteData(prev => ({
      ...prev,
      templateId: templateId
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Quote</h1>

      <form className="space-y-6">
        {/* Quote Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Quote Title
          </label>
          <input
            type="text"
            value={quoteData.title}
            onChange={(e) => setQuoteData({ ...quoteData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter quote title"
          />
        </div>

        {/* PDF Template Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            PDF Template
          </label>

          {selectedTemplate ? (
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium">{selectedTemplate.name}</h4>
                <p className="text-sm text-gray-600">
                  {selectedTemplate.category} • {selectedTemplate.templateJson.metadata.pageSize}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTemplateDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Change
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setTemplateDialogOpen(true)}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Choose Template
            </Button>
          )}
        </div>

        {/* Other quote fields... */}

        <div className="flex gap-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedTemplate}>
            Create Quote
          </Button>
        </div>
      </form>

      {/* Template Selector Dialog */}
      <TemplateSelectorDialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        onSelect={handleTemplateSelect}
        currentTemplateId={selectedTemplate?.id}
        title="Select PDF Template"
      />
    </div>
  );
}
```

---

## Example 2: Settings Page - Default Template

Allow admins to set the default template for all quotes.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { TemplateSelector } from '@/components/Templates';
import { PDFTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';

export default function DefaultTemplatePage() {
  const [currentDefaultId, setCurrentDefaultId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load current default template
  useEffect(() => {
    loadDefaultTemplate();
  }, []);

  const loadDefaultTemplate = async () => {
    try {
      const response = await fetch('/api/templates?isdefault=true');
      const templates = await response.json();

      if (templates.length > 0) {
        setCurrentDefaultId(templates[0].id);
        setSelectedId(templates[0].id);
      }
    } catch (error) {
      console.error('Error loading default template:', error);
    }
  };

  const handleSetDefault = async () => {
    if (!selectedId) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/templates/${selectedId}/set-default`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to set default template');
      }

      setCurrentDefaultId(selectedId);
      setMessage({
        type: 'success',
        text: 'Default template updated successfully!',
      });
    } catch (error) {
      console.error('Error setting default:', error);
      setMessage({
        type: 'error',
        text: 'Failed to set default template. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = selectedId !== currentDefaultId;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Star className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Default PDF Template</h1>
        </div>
        <p className="text-gray-600">
          Select the default template that will be used for all new quotes.
          Users can still choose a different template when creating quotes.
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <span className="text-xl">⚠️</span>
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Template Selector */}
      <TemplateSelector
        selectedTemplateId={selectedId}
        onSelect={(id, template) => {
          setSelectedId(id);
          setMessage(null);
        }}
        showPreview={true}
        compact={false}
      />

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="container mx-auto flex items-center justify-between">
            <p className="text-sm text-gray-600">
              You have unsaved changes
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedId(currentDefaultId)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSetDefault}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Set as Default'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Example 3: Template Gallery Page

Browse and preview all available templates.

```tsx
'use client';

import { TemplateSelector } from '@/components/Templates';
import { PDFTemplate } from '@/lib/types';
import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TemplateGalleryPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);

  const handleDownloadTemplate = async () => {
    if (!selectedTemplate) return;

    // Download template JSON
    const blob = new Blob(
      [JSON.stringify(selectedTemplate.templateJson, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Template Gallery</h1>
              <p className="text-gray-600">
                Browse and preview PDF templates for your quotes
              </p>
            </div>

            {selectedTemplate && (
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template JSON
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="container mx-auto px-4 py-8">
        <TemplateSelector
          selectedTemplateId={selectedTemplate?.id}
          onSelect={(id, template) => {
            setSelectedTemplate(template);
            console.log('Selected template:', template);
          }}
          showPreview={true}
          compact={false}
        />
      </div>

      {/* Selected Template Info Panel */}
      {selectedTemplate && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="container mx-auto">
            <div className="flex items-center gap-4">
              <FileText className="h-10 w-10 text-blue-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedTemplate.description || 'No description'}
                </p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>{selectedTemplate.templateJson.metadata.pageSize}</div>
                <div>{selectedTemplate.templateJson.metadata.orientation}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Example 4: Inline Template Selector

Compact inline selector for quick template switching.

```tsx
'use client';

import { TemplateCard } from '@/components/Templates';
import { PDFTemplate } from '@/lib/types';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InlineTemplateSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string, template: PDFTemplate) => void;
}) {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);

      // Find current template index
      if (selectedId) {
        const index = data.findIndex((t: PDFTemplate) => t.id === selectedId);
        if (index >= 0) setCurrentIndex(index);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : templates.length - 1;
    setCurrentIndex(newIndex);
    onSelect(templates[newIndex].id, templates[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentIndex < templates.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onSelect(templates[newIndex].id, templates[newIndex]);
  };

  if (loading || templates.length === 0) {
    return <div className="text-center py-4">Loading templates...</div>;
  }

  const currentTemplate = templates[currentIndex];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">PDF Template</label>
        <span className="text-xs text-gray-500">
          {currentIndex + 1} of {templates.length}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={templates.length <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <TemplateCard
            template={currentTemplate}
            selected={true}
            onSelect={() => onSelect(currentTemplate.id, currentTemplate)}
            compact={true}
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={templates.length <= 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

---

## Example 5: Template Comparison View

Compare two templates side-by-side.

```tsx
'use client';

import { TemplateCard } from '@/components/Templates';
import { PDFTemplate } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';

export function TemplateComparison() {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [templateA, setTemplateA] = useState<PDFTemplate | null>(null);
  const [templateB, setTemplateB] = useState<PDFTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);

      // Select first two templates by default
      if (data.length >= 2) {
        setTemplateA(data[0]);
        setTemplateB(data[1]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const swapTemplates = () => {
    const temp = templateA;
    setTemplateA(templateB);
    setTemplateB(temp);
  };

  if (templates.length < 2) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          Need at least 2 templates to compare
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Compare Templates</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template A */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Template A</h2>
            <select
              value={templateA?.id || ''}
              onChange={(e) => {
                const template = templates.find((t) => t.id === e.target.value);
                if (template) setTemplateA(template);
              }}
              className="px-3 py-2 border rounded-md"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {templateA && (
            <TemplateCard
              template={templateA}
              selected={false}
              compact={false}
            />
          )}
        </div>

        {/* Template B */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Template B</h2>
            <select
              value={templateB?.id || ''}
              onChange={(e) => {
                const template = templates.find((t) => t.id === e.target.value);
                if (template) setTemplateB(template);
              }}
              className="px-3 py-2 border rounded-md"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {templateB && (
            <TemplateCard
              template={templateB}
              selected={false}
              compact={false}
            />
          )}
        </div>
      </div>

      {/* Swap Button */}
      <div className="text-center mt-6">
        <Button
          variant="outline"
          onClick={swapTemplates}
          className="flex items-center gap-2 mx-auto"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Swap Templates
        </Button>
      </div>

      {/* Comparison Table */}
      {templateA && templateB && (
        <div className="mt-8 border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Feature</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{templateA.name}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{templateB.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3 text-sm font-medium">Category</td>
                <td className="px-4 py-3 text-sm">{templateA.category}</td>
                <td className="px-4 py-3 text-sm">{templateB.category}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium">Page Size</td>
                <td className="px-4 py-3 text-sm">
                  {templateA.templateJson.metadata.pageSize}
                </td>
                <td className="px-4 py-3 text-sm">
                  {templateB.templateJson.metadata.pageSize}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium">Orientation</td>
                <td className="px-4 py-3 text-sm">
                  {templateA.templateJson.metadata.orientation}
                </td>
                <td className="px-4 py-3 text-sm">
                  {templateB.templateJson.metadata.orientation}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium">Default</td>
                <td className="px-4 py-3 text-sm">
                  {templateA.isDefault ? '✓ Yes' : '✗ No'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {templateB.isDefault ? '✓ Yes' : '✗ No'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Loading State

```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData();
}, []);

if (loading) {
  return <div>Loading templates...</div>;
}
```

### Pattern 2: Error Handling

```tsx
const [error, setError] = useState<string | null>(null);

try {
  // fetch operation
} catch (err) {
  setError(err.message);
}

if (error) {
  return <div>Error: {error}</div>;
}
```

### Pattern 3: Template State Management

```tsx
const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);

const handleSelect = (id: string, template: PDFTemplate) => {
  setSelectedTemplate(template);
  // Save to parent state, database, etc.
};
```

---

## Integration Checklist

When integrating Template Selector into your app:

- [ ] Import components from `@/components/Templates`
- [ ] Set up state for selected template ID
- [ ] Implement `onSelect` handler
- [ ] Handle dialog open/close state (for dialog variant)
- [ ] Add PDFPreviewModal if showing previews
- [ ] Style container with appropriate spacing
- [ ] Test keyboard navigation
- [ ] Verify API endpoint `/api/templates` is working
- [ ] Add loading and error states
- [ ] Test responsive layout on mobile
- [ ] Verify category colors display correctly
- [ ] Test search and filter functionality

---

**Created**: Phase 6A - Template Selector Examples
**Last Updated**: 2025-10-20
