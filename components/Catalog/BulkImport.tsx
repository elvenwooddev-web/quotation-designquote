'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/db';

interface BulkImportProps {
  categories: Array<{ id: string; name: string }>;
  onImportComplete: () => void;
}

export function BulkImport({ categories, onImportComplete }: BulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
      parseCSVPreview(selectedFile);
    }
  };

  const parseCSVPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());

      // Parse first 5 rows for preview
      const rows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setPreview(rows);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const text = await file.text();

      const response = await fetch('/api/products/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ csvData: text }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import products');
      }

      let successMessage = `Successfully imported ${result.imported} products.`;
      if (result.categoriesCreated > 0) {
        successMessage += ` Created ${result.categoriesCreated} new ${result.categoriesCreated === 1 ? 'category' : 'categories'}.`;
      }
      if (result.skipped > 0) {
        successMessage += ` Skipped ${result.skipped} rows due to errors.`;
      }

      // Show detailed errors if any
      if (result.errors && result.errors.length > 0) {
        console.log('Import errors:', result.errors);
        successMessage += '\n\nErrors:\n' + result.errors.join('\n');
      }

      setSuccess(successMessage);
      setFile(null);
      setPreview([]);
      onImportComplete();

      // Reset file input
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const sampleCSV = `Item Code,Item Name,Description,UOM,Rate,Category
PROD-001,Premium Flooring,High quality hardwood flooring,sq ft,150.00,Flooring
PROD-002,Standard Paint,Interior wall paint,gallon,45.00,Painting
PROD-003,LED Light Fixture,Energy efficient LED fixture,pcs,89.99,Electrical
PROD-004,Door Handle Set,Stainless steel handle,set,25.50,Hardware`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-products-import.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Import Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Download the sample CSV file to see the required format</li>
          <li>Required columns: Item Name, UOM, Rate, Category</li>
          <li>Optional columns: Item Code, Description</li>
          <li>Categories will be created automatically if they don&apos;t exist</li>
          <li>Rates should be numeric values without currency symbols</li>
          <li>Descriptions can contain commas (will be handled correctly)</li>
        </ul>
      </div>

      {/* Download Sample */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={downloadSample}
          className="w-full sm:w-auto"
        >
          Download Sample CSV
        </Button>
      </div>

      {/* File Upload */}
      <div>
        <Label htmlFor="csvFile" className="block text-sm font-medium mb-2">
          Select CSV File
        </Label>
        <input
          id="csvFile"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer"
        />
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Preview (First 5 rows)</h3>
          <div className="border rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{row['Item Code'] || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row['Item Name']}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row['UOM']}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row['Rate']}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row['Category']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {file && (
        <div>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? 'Importing...' : 'Import Products'}
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          <pre className="whitespace-pre-wrap text-sm font-sans">{success}</pre>
        </div>
      )}
    </div>
  );
}
