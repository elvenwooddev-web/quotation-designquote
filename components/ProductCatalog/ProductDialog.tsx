'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { Product, Category } from '@/lib/types';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: (product: Product & { category: Category }) => void;
  categories: Category[];
}

export function ProductDialog({ open, onOpenChange, onProductCreated, categories }: ProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: 'pcs',
    baseRate: 0,
    categoryId: '',
    imageUrl: '',
  });

  // Set default category when dialog opens
  useEffect(() => {
    if (open && categories.length > 0 && !formData.categoryId) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [open, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create product');

      const product = await response.json();
      onProductCreated(product);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        unit: 'pcs',
        baseRate: 0,
        categoryId: categories[0]?.id || '',
        imageUrl: '',
      });
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product/Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Product Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Luxury Sofa, Kitchen Cabinet"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Category *
            </label>
            <Select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the product"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Base Rate (₹) *
              </label>
              <Input
                type="number"
                value={formData.baseRate}
                onChange={(e) => setFormData({ ...formData, baseRate: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Unit *
              </label>
              <Select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="sqft">Square Feet (sqft)</option>
                <option value="sqm">Square Meter (sqm)</option>
                <option value="ft">Feet (ft)</option>
                <option value="m">Meter (m)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="ltr">Liter (ltr)</option>
                <option value="set">Set</option>
                <option value="unit">Unit</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Product Image
            </label>
            <FileUpload
              onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
              currentImage={formData.imageUrl}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

