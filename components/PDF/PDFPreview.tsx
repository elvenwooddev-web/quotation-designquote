'use client';

/**
 * PDF Preview Component
 * Phase 5A: Live PDF Preview with Interactive Controls
 *
 * Features:
 * - Live PDF rendering using @react-pdf/renderer
 * - Interactive zoom controls (50%, 75%, 100%, 125%, 150%)
 * - Download functionality
 * - Fullscreen mode
 * - Loading states with spinner
 * - Error handling and display
 * - Auto-refresh on quote/template changes
 * - Debounced regeneration
 * - Responsive design
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { QuoteWithDetails, PDFTemplate } from '@/lib/types';
import { generateQuotePDF } from '@/lib/pdf-generator';
import { Button } from '@/components/ui/button';
import {
  ZoomIn,
  ZoomOut,
  Download,
  Maximize,
  Minimize,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export interface PDFPreviewProps {
  /** Quote data with all details */
  quote: QuoteWithDetails;
  /** Optional PDF template (uses default if not provided) */
  template?: PDFTemplate;
  /** Optional title for the preview section */
  title?: string;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Show/hide controls (default: true) */
  showControls?: boolean;
  /** Default zoom level (default: 100) */
  defaultZoom?: number;
}

// Zoom level presets
const ZOOM_LEVELS = [50, 75, 100, 125, 150] as const;
type ZoomLevel = typeof ZOOM_LEVELS[number];

export function PDFPreview({
  quote,
  template,
  title = 'PDF Preview',
  onError,
  showControls = true,
  defaultZoom = 100,
}: PDFPreviewProps) {
  // State management
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<ZoomLevel>(defaultZoom as ZoomLevel);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentBlobRef = useRef<Blob | null>(null);

  /**
   * Generate PDF blob and create object URL
   */
  const generatePDF = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate PDF blob
      const blob = await generateQuotePDF(quote, template);
      currentBlobRef.current = blob;

      // Revoke old URL to prevent memory leaks
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      // Create new object URL
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      setIsLoading(false);

      // Call error callback if provided
      if (onError && err instanceof Error) {
        onError(err);
      }

      console.error('PDF generation error:', err);
    }
  }, [quote, template, pdfUrl, onError]);

  /**
   * Debounced PDF regeneration
   * Prevents regeneration on every keystroke
   */
  const debouncedGenerate = useCallback(() => {
    // Clear existing timeout
    if (generationTimeoutRef.current) {
      clearTimeout(generationTimeoutRef.current);
    }

    // Set loading state immediately
    setIsRegenerating(true);

    // Schedule generation after delay
    generationTimeoutRef.current = setTimeout(async () => {
      await generatePDF();
      setIsRegenerating(false);
    }, 500); // 500ms debounce delay
  }, [generatePDF]);

  /**
   * Generate PDF on mount and when quote/template changes
   */
  useEffect(() => {
    debouncedGenerate();

    // Cleanup function
    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
    };
  }, [quote, template]); // Regenerate when quote or template changes

  /**
   * Cleanup object URL on unmount
   */
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  /**
   * Handle zoom change
   */
  const handleZoomChange = (newZoom: ZoomLevel) => {
    setZoom(newZoom);
  };

  /**
   * Handle zoom in
   */
  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  /**
   * Handle zoom out
   */
  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  /**
   * Handle download
   */
  const handleDownload = () => {
    if (!currentBlobRef.current) return;

    // Create download link
    const url = URL.createObjectURL(currentBlobRef.current);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quote.quoteNumber}-${quote.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  /**
   * Toggle fullscreen mode
   */
  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  /**
   * Listen for fullscreen changes
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  /**
   * Manual refresh
   */
  const handleRefresh = async () => {
    setIsRegenerating(true);
    await generatePDF();
    setIsRegenerating(false);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {isRegenerating && (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center gap-2">
            {/* Zoom Out */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={isLoading || zoom === ZOOM_LEVELS[0]}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            {/* Zoom Level Buttons */}
            <div className="flex items-center gap-1">
              {ZOOM_LEVELS.map((level) => (
                <Button
                  key={level}
                  variant={zoom === level ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleZoomChange(level)}
                  disabled={isLoading}
                  className="min-w-[3rem]"
                >
                  {level}%
                </Button>
              ))}
            </div>

            {/* Zoom In */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={isLoading || zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300" />

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRegenerating}
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            </Button>

            {/* Download */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isLoading || !currentBlobRef.current}
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Fullscreen */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {/* Loading State */}
        {isLoading && !pdfUrl && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Generating PDF...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <p className="text-sm font-medium">Failed to generate PDF</p>
            </div>
            <p className="text-xs text-gray-600">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* PDF Iframe */}
        {pdfUrl && !error && (
          <div
            className="mx-auto bg-white shadow-lg"
            style={{
              width: `${zoom}%`,
              minHeight: '100%',
            }}
          >
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              className="w-full border-0"
              style={{
                height: isFullscreen ? 'calc(100vh - 80px)' : '800px',
              }}
              title="PDF Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
