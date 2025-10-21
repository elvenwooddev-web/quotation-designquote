'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteWithDetails, PDFTemplate } from '@/lib/types';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId?: string; // For actual quote previews
  quoteData?: QuoteWithDetails; // For direct quote data previews
  templateId?: string; // For template previews with sample data
  template?: PDFTemplate; // For direct template preview (unsaved templates)
  title?: string;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  quoteId,
  quoteData,
  templateId,
  template,
  title = 'PDF Preview',
}: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generatePreview();
    } else {
      // Cleanup PDF URL when modal closes
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    }

    // Cleanup on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, quoteId, templateId, template]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const generatePreview = async () => {
    setLoading(true);
    setError(null);

    try {
      let response: Response;

      if (quoteId) {
        // Generate PDF for existing quote
        response = await fetch(`/api/quotes/${quoteId}/pdf`);
      } else if (templateId) {
        // Generate preview for template with sample data
        response = await fetch(`/api/templates/${templateId}/preview`);
      } else if (template) {
        // Generate preview for direct template data (unsaved templates)
        response = await fetch('/api/templates/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ template }),
        });
      } else if (quoteData) {
        // Generate PDF from quote data (for unsaved quotes)
        // This would require a separate endpoint
        throw new Error('Direct quote data preview not yet implemented');
      } else {
        throw new Error('No quote or template ID provided');
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to generate PDF' }));
        throw new Error(data.error || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      console.error('Error generating PDF preview:', err);
      setError(err.message || 'Failed to generate PDF preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `preview-${quoteId || templateId || 'quote'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            {pdfUrl && !loading && !error && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Generating PDF preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-red-600 text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Preview Error
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={generatePreview} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {pdfUrl && !loading && !error && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          )}
        </div>

        {/* Footer with helpful text */}
        {!loading && !error && pdfUrl && (
          <div className="px-6 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-600">
              Press <kbd className="px-2 py-1 bg-white border rounded text-xs">Esc</kbd> to close
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
