'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { supabase } from '@/lib/db';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string | null;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUpload({ 
  onUploadComplete, 
  currentImage,
  accept = 'image/*',
  maxSize = 5 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Provide helpful error messages based on error type
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')) {
          throw new Error('Storage bucket "product-images" not found. Please create it in Supabase Dashboard > Storage. See setup-storage.md for instructions.');
        }
        if (uploadError.message?.includes('row-level security') || uploadError.message?.includes('policy')) {
          throw new Error('Storage upload blocked by security policy. Please run the SQL script in fix-storage-policies.sql to configure bucket permissions. See setup-storage.md for details.');
        }
        if (uploadError.message?.includes('JWT') || uploadError.message?.includes('auth')) {
          throw new Error('Authentication required for upload. Please ensure you are logged in or configure public upload policies.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      onUploadComplete(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadComplete('');
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {preview ? (
        <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">Click to upload image</span>
              <span className="text-xs text-gray-400">Max {maxSize}MB</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

