'use client';

/**
 * PDF Preview Modal Component
 * Phase 5A: Modal Wrapper for PDF Preview
 *
 * Features:
 * - Opens PDF preview in a modal dialog
 * - Large preview area for better viewing
 * - Close button with keyboard support (ESC)
 * - Responsive design
 * - All PDFPreview features available
 */

import React, { useEffect } from 'react';
import { QuoteWithDetails, PDFTemplate } from '@/lib/types';
import { PDFPreview } from './PDFPreview';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';

export interface PDFPreviewModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Quote data with all details */
  quote: QuoteWithDetails;
  /** Optional PDF template (uses default if not provided) */
  template?: PDFTemplate;
  /** Optional title for the preview */
  title?: string;
  /** Error callback */
  onError?: (error: Error) => void;
}

export function PDFPreviewModal({
  open,
  onClose,
  quote,
  template,
  title = 'PDF Preview',
  onError,
}: PDFPreviewModalProps) {
  /**
   * Handle ESC key to close modal
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  /**
   * Prevent body scroll when modal is open
   */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 overflow-hidden">
        {/* Close Button */}
        <DialogClose onClose={onClose} />

        {/* PDF Preview */}
        <div className="h-full">
          <PDFPreview
            quote={quote}
            template={template}
            title={title}
            onError={onError}
            showControls={true}
            defaultZoom={100}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
