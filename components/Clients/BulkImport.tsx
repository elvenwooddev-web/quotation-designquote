'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/db';

interface BulkImportProps {
  onImportComplete: () => void;
}

export function BulkImport({ onImportComplete }: BulkImportProps) {
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

      // Helper function to parse CSV line (handles quoted fields with commas)
      function parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      }

      const headers = parseCSVLine(lines[0]);

      // Parse first 5 rows for preview
      const rows = lines.slice(1, 6).map(line => {
        const values = parseCSVLine(line);
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

      const response = await fetch('/api/clients/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ csvData: text }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import clients');
      }

      let successMessage = `Successfully imported ${result.imported} clients.`;
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
      const fileInput = document.getElementById('csvFileClients') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const sampleCSV = `Name,Email,Phone,Source,Address
John Doe,john.doe@example.com,+1-555-0101,Referral,"123 Main St, New York, NY 10001"
Jane Smith,jane.smith@example.com,+1-555-0102,Organic,"456 Oak Ave, San Francisco, CA 94102"
Bob Johnson,bob.j@company.com,+1-555-0103,Paid Ads,"789 Pine Rd, Austin, TX 73301"
Alice Williams,alice.w@email.com,+1-555-0104,Other,"321 Elm St, Seattle, WA 98101"`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-clients-import.csv';
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
          <li>Required column: Name</li>
          <li>Optional columns: Email, Phone, Source, Address</li>
          <li>Email addresses must be valid and unique</li>
          <li>Source values: Organic, Referral, Paid Ads, Other (defaults to Other if not provided)</li>
          <li>Addresses can contain commas (will be handled correctly)</li>
        </ul>
      </div>

      {/* Download Sample */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={downloadSample}
          className="w-full sm:w-auto"
          data-testid="download-sample-csv"
        >
          Download Sample CSV
        </Button>
      </div>

      {/* File Upload */}
      <div>
        <Label htmlFor="csvFileClients" className="block text-sm font-medium mb-2">
          Select CSV File
        </Label>
        <input
          id="csvFileClients"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          data-testid="csv-file-input"
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
            <table className="min-w-full divide-y divide-gray-200" data-testid="preview-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{row['Name']}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row['Email'] || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row['Phone'] || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row['Source'] || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate" title={row['Address']}>
                      {row['Address'] || '-'}
                    </td>
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
            data-testid="import-button"
          >
            {uploading ? 'Importing...' : 'Import Clients'}
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4" data-testid="error-message">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4" data-testid="success-message">
          <pre className="whitespace-pre-wrap text-sm font-sans">{success}</pre>
        </div>
      )}
    </div>
  );
}
