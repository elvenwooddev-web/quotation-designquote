'use client';

import React, { useState } from 'react';
import { Save, Send, FileDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuoteStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { calculateQuoteTotals, calculateLineTotal } from '@/lib/calculations';

export function QuoteActions() {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { user } = useAuth();
  const quoteId = useQuoteStore((state) => state.quoteId);
  const title = useQuoteStore((state) => state.title);
  const clientId = useQuoteStore((state) => state.clientId);
  const discountMode = useQuoteStore((state) => state.discountMode);
  const overallDiscount = useQuoteStore((state) => state.overallDiscount);
  const taxRate = useQuoteStore((state) => state.taxRate);
  const items = useQuoteStore((state) => state.items);
  const policies = useQuoteStore((state) => state.policies);

  // Track the current quote ID (either from store or newly created)
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(quoteId || null);

  // Update savedQuoteId when quoteId changes from store
  React.useEffect(() => {
    if (quoteId) {
      setSavedQuoteId(quoteId);
    }
  }, [quoteId]);

  // Track changes to quote data - if editing existing quote, mark as having unsaved changes
  React.useEffect(() => {
    if (savedQuoteId) {
      setHasUnsavedChanges(true);
    }
  }, [title, clientId, discountMode, overallDiscount, taxRate, items, policies, savedQuoteId]);

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      alert('Please enter a quote title');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setIsSaving(true);

    try {
      // Determine the appropriate status based on user role
      // Only set status when creating a new quote
      const determineQuoteStatus = () => {
        if (!savedQuoteId) {
          // New quote - check user role
          if (user?.role?.name === 'Sales Executive') {
            return 'PENDING_APPROVAL';
          }
          return 'DRAFT';
        }
        // Existing quote - don't change status on update
        return undefined;
      };

      const quoteData = {
        title,
        clientId,
        discountMode,
        overallDiscount,
        taxRate,
        status: determineQuoteStatus(),
        items: items.map((item) => ({
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          discount: item.discount,
          dimensions: item.dimensions,
        })),
        policies: policies.map((p) => ({
          type: p.type,
          title: p.title,
          description: p.description,
          isActive: p.isActive,
        })),
      };

      // Determine if creating new or updating existing
      const isUpdate = !!savedQuoteId;
      const url = isUpdate ? `/api/quotes/${savedQuoteId}` : '/api/quotes';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        const quote = await response.json();
        setSavedQuoteId(quote.id);
        setHasUnsavedChanges(false); // Clear unsaved changes flag after successful save
        alert(isUpdate ? 'Quote updated successfully! Revision history has been recorded.' : 'Quote saved successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save quote');
      }
    } catch (error) {
      console.error('Failed to save quote:', error);
      alert('Failed to save quote');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!savedQuoteId) {
      alert('Please save the quote first before previewing');
      return;
    }
    if (hasUnsavedChanges) {
      alert('Please update the quote first to save your changes before previewing');
      return;
    }
    // Open PDF in new tab for preview
    window.open(`/api/quotes/${savedQuoteId}/pdf`, '_blank');
  };

  const handleExportPDF = async () => {
    if (!savedQuoteId) {
      alert('Please save the quote first before exporting to PDF');
      return;
    }
    if (hasUnsavedChanges) {
      alert('Please update the quote first to save your changes before exporting to PDF');
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch(`/api/quotes/${savedQuoteId}/pdf`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quote-${savedQuoteId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <Button
          onClick={handleSaveDraft}
          disabled={isSaving}
          variant="outline"
          className="flex-1"
          data-testid="save-draft-button"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving
            ? (savedQuoteId ? 'Updating...' : 'Saving...')
            : (savedQuoteId ? 'Update Quote' : 'Save Draft')}
        </Button>

        <Button
          onClick={handlePreview}
          disabled={!savedQuoteId || hasUnsavedChanges}
          variant="outline"
          className="flex-1"
          title={hasUnsavedChanges ? 'Update quote first to preview' : ''}
          data-testid="preview-button"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>

        <Button
          onClick={handleExportPDF}
          disabled={isExporting || !savedQuoteId || hasUnsavedChanges}
          className="flex-1"
          title={hasUnsavedChanges ? 'Update quote first to export PDF' : ''}
          data-testid="export-pdf-button"
        >
          <FileDown className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>

        <Button variant="secondary" className="flex-1" disabled>
          <Send className="h-4 w-4 mr-2" />
          Send Quote
        </Button>
      </div>
    </>
  );
}



