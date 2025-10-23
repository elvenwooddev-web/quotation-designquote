'use client';

import React, { useState, useEffect } from 'react';
import { Save, Send, FileDown, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuoteStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { hasPermission } from '@/lib/permissions';
import { calculateQuoteTotals, calculateLineTotal } from '@/lib/calculations';

export function QuoteActions() {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<string>('DRAFT');

  const { user, permissions } = useAuth();
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

  // Check if user is Admin or Sales Head
  const isAdminOrSalesHead = user?.role?.name === 'Admin' || user?.role?.name === 'Sales Head';
  const canApprove = hasPermission(permissions, 'quotes', 'canapprove');

  // Update savedQuoteId when quoteId changes from store
  React.useEffect(() => {
    if (quoteId) {
      setSavedQuoteId(quoteId);
      // Fetch quote status when loading existing quote
      fetchQuoteStatus(quoteId);
    }
  }, [quoteId]);

  const fetchQuoteStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/quotes/${id}`);
      if (response.ok) {
        const quote = await response.json();
        setQuoteStatus(quote.status || 'DRAFT');
      }
    } catch (error) {
      console.error('Error fetching quote status:', error);
    }
  };

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
      const quoteData = {
        title,
        clientId,
        discountMode,
        overallDiscount,
        taxRate,
        status: !savedQuoteId ? 'DRAFT' : undefined, // All new quotes start as DRAFT
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
        setQuoteStatus(quote.status || 'DRAFT');
        setHasUnsavedChanges(false); // Clear unsaved changes flag after successful save
        alert(isUpdate ? 'Quote updated successfully! Revision history has been recorded.' : 'Quote saved as draft successfully!');
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

  const handleRequestApproval = async () => {
    if (!savedQuoteId) {
      alert('Please save the quote first before requesting approval');
      return;
    }

    if (quoteStatus !== 'DRAFT') {
      alert('Only draft quotes can be submitted for approval');
      return;
    }

    const confirmed = confirm('Are you sure you want to submit this quote for approval?');
    if (!confirmed) return;

    setIsRequestingApproval(true);

    try {
      const response = await fetch(`/api/quotes/${savedQuoteId}/request-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        setQuoteStatus('PENDING_APPROVAL');
        alert('Approval request submitted successfully! The quote will be reviewed by an Admin or Sales Head.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to request approval');
      }
    } catch (error) {
      console.error('Failed to request approval:', error);
      alert('Failed to request approval');
    } finally {
      setIsRequestingApproval(false);
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

  // Determine which buttons to show based on role and status
  const showRequestApproval = !isAdminOrSalesHead && savedQuoteId && quoteStatus === 'DRAFT';
  const showPreviewExport = isAdminOrSalesHead || quoteStatus === 'SENT' || quoteStatus === 'ACCEPTED';
  const showSendQuote = isAdminOrSalesHead;

  return (
    <>
      <div className="flex gap-3">
        {/* Save/Update Button - Always visible */}
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

        {/* Request Approval Button - For non-admins with DRAFT quotes */}
        {showRequestApproval && (
          <Button
            onClick={handleRequestApproval}
            disabled={isRequestingApproval || hasUnsavedChanges}
            variant="default"
            className="flex-1"
            title={hasUnsavedChanges ? 'Save changes before requesting approval' : ''}
            data-testid="request-approval-button"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isRequestingApproval ? 'Requesting...' : 'Request Approval'}
          </Button>
        )}

        {/* Preview Button - For admins or approved quotes */}
        {showPreviewExport && (
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
        )}

        {/* Export PDF Button - For admins or approved quotes */}
        {showPreviewExport && (
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
        )}

        {/* Send Quote Button - Only for admins */}
        {showSendQuote && (
          <Button
            variant="secondary"
            className="flex-1"
            disabled={!savedQuoteId || quoteStatus === 'DRAFT' || quoteStatus === 'PENDING_APPROVAL'}
            title={quoteStatus === 'DRAFT' ? 'Approve quote first before sending' : ''}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Quote
          </Button>
        )}
      </div>

      {/* Status Indicator */}
      {savedQuoteId && (
        <div className="mt-3 text-sm text-gray-600 text-center">
          Status: <span className={`font-semibold ${
            quoteStatus === 'DRAFT' ? 'text-gray-700' :
            quoteStatus === 'PENDING_APPROVAL' ? 'text-yellow-600' :
            quoteStatus === 'SENT' ? 'text-green-600' :
            quoteStatus === 'ACCEPTED' ? 'text-blue-600' :
            quoteStatus === 'REJECTED' ? 'text-red-600' :
            'text-gray-700'
          }`}>{quoteStatus}</span>
          {quoteStatus === 'PENDING_APPROVAL' && !isAdminOrSalesHead && (
            <span className="block mt-1 text-xs">Waiting for Admin/Sales Head approval</span>
          )}
          {quoteStatus === 'SENT' && !isAdminOrSalesHead && (
            <span className="block mt-1 text-xs">Approved! You can now edit and download the quote</span>
          )}
        </div>
      )}
    </>
  );
}



