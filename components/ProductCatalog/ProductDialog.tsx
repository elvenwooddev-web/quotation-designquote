'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { UOMSelect } from '@/components/ui/uom-select';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: Category[];
  onSave: (productData: Partial<Product>) => void;
}

export function ProductDialog({ open, onOpenChange, product, categories, onSave }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    baseRate: 0,
    categoryId: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        unit: '',
        baseRate: product.baseRate || 0,
        categoryId: product.categoryId || '',
        imageUrl: product.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        unit: '',
        baseRate: 0,
        categoryId: '',
        imageUrl: '',
      });
    }
    setError(null);
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.unit || !formData.categoryId) {
      setError('Name, UOM, and Category are required.');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Item'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium mb-1">
                  Item Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter item name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="unit" className="block text-sm font-medium mb-1">
                  UOM *
                </Label>
                <UOMSelect
                  value={formData.unit}
                  onChange={(value) => setFormData({...formData, unit: value})}
                  placeholder="Search or select UOM"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="baseRate" className="block text-sm font-medium mb-1">
                  Rate (₹) *
                </Label>
                <Input
                  id="baseRate"
                  type="number"
                  value={formData.baseRate}
                  onChange={(e) => setFormData({...formData, baseRate: Number(e.target.value)})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="categoryId" className="block text-sm font-medium mb-1">
                  Category *
                </Label>
                <Select 
                  value={formData.categoryId} 
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            
            {/* Right Column - Image Preview */}
            <div>
              <Label className="block text-sm font-medium mb-1">
                Image Preview
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-64 flex flex-col items-center justify-center">
                {formData.imageUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={formData.imageUrl}
                      alt="Product preview"
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <div className="text-sm mb-2">No image selected</div>
                    <div className="text-xs">Maximum file size: 800x400px</div>
                  </div>
                )}
                <div className="mt-4">
                  <FileUpload 
                    onUploadComplete={(url) => setFormData({...formData, imageUrl: url})}
                    currentImage={formData.imageUrl}
                    accept="image/*"
                    maxSize={5}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save to Catalog'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}