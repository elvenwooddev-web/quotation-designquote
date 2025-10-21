/**
 * Template Import Dialog Component
 *
 * Provides a UI for importing templates from JSON files with validation,
 * preview, and error handling.
 */

'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Upload,
  X,
  AlertTriangle,
  CheckCircle,
  FileJson,
  Loader2,
  Info,
} from 'lucide-react';
import { validateAndImportTemplates } from '@/lib/template-import';

interface TemplateImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (successCount: number) => void;
}

interface TemplatePreview {
  name: string;
  valid: boolean;
  imported: boolean;
  errors: string[];
  warnings: string[];
  templateId?: string;
}

export default function TemplateImportDialog({
  isOpen,
  onClose,
  onImportComplete,
}: TemplateImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<TemplatePreview[]>([]);
  const [importComplete, setImportComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setFile(null);
    setParseError(null);
    setPreviews([]);
    setImportComplete(false);
    setImporting(false);
    onClose();
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setParseError(null);
    setPreviews([]);
    setImportComplete(false);

    // Validate file type
    if (!selectedFile.name.endsWith('.json')) {
      setParseError('Please select a JSON file');
      return;
    }

    // Read and validate file
    try {
      const text = await selectedFile.text();
      const result = await validateAndImportTemplates(text);

      if (result.parseError) {
        setParseError(result.parseError);
      } else {
        setPreviews(result.templates);
        if (result.successCount > 0) {
          setImportComplete(true);
          if (onImportComplete) {
            onImportComplete(result.successCount);
          }
        }
      }
    } catch (error: any) {
      setParseError(error.message || 'Failed to read file');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  const successCount = previews.filter((p) => p.imported).length;
  const failureCount = previews.filter((p) => !p.imported).length;
  const hasWarnings = previews.some((p) => p.warnings.length > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Import Templates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload a JSON file to import templates
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* File Upload Area */}
          {!file && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Drop your JSON file here
                  </p>
                  <p className="text-sm text-gray-600">or</p>
                </div>
                <Button onClick={handleBrowseClick}>Browse Files</Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Parse Error */}
          {parseError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-1">Import Failed</h4>
                <p className="text-sm text-red-700">{parseError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setParseError(null);
                  }}
                  className="mt-3"
                >
                  Try Another File
                </Button>
              </div>
            </div>
          )}

          {/* Import Complete Summary */}
          {importComplete && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 mb-1">Import Complete</h4>
                  <p className="text-sm text-green-700">
                    Successfully imported {successCount} template{successCount !== 1 ? 's' : ''}
                    {failureCount > 0 && ` (${failureCount} failed)`}
                  </p>
                </div>
              </div>

              {hasWarnings && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3 mb-4">
                  <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900 mb-1">
                      Some templates have warnings
                    </h4>
                    <p className="text-sm text-yellow-700">
                      The templates were imported successfully, but there may be minor issues.
                      Check the details below.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Template Previews */}
          {previews.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 mb-3">
                Import Results ({previews.length} template{previews.length !== 1 ? 's' : ''})
              </h3>

              {previews.map((preview, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    preview.imported
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {preview.imported ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileJson className="h-4 w-4 text-gray-400" />
                        <h4
                          className={`font-medium ${
                            preview.imported ? 'text-green-900' : 'text-red-900'
                          }`}
                        >
                          {preview.name}
                        </h4>
                      </div>

                      {preview.imported && (
                        <p className="text-sm text-green-700 mb-2">
                          Successfully imported
                        </p>
                      )}

                      {/* Errors */}
                      {preview.errors.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-red-900 mb-1">Errors:</p>
                          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                            {preview.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Warnings */}
                      {preview.warnings.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-yellow-900 mb-1">
                            Warnings:
                          </p>
                          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                            {preview.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Help Text */}
          {!file && !parseError && previews.length === 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-blue-900">
                  <p className="font-medium mb-2">File Format Requirements</p>
                  <ul className="space-y-1 list-disc list-inside text-blue-800">
                    <li>File must be in JSON format (.json)</li>
                    <li>Can contain a single template or multiple templates</li>
                    <li>Templates must include: name, templateJson (metadata, theme, elements)</li>
                    <li>Duplicate template names will be automatically renamed</li>
                    <li>Imported templates will not be set as default</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          {importComplete ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {file && !parseError && previews.length === 0 && (
                <Button disabled className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
