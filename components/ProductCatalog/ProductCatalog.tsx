'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuoteStore } from '@/lib/store';
import { Category, Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CategoryDialog } from './CategoryDialog';
import { ProductDialog } from './ProductDialog';

interface ProductWithCategory extends Product {
  category: Category;
}

export function ProductCatalog() {
  const [categories, setCategories] = useState<(Category & { products: Product[] })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const addItem = useQuoteStore((state) => state.addItem);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleAddProduct = (product: ProductWithCategory) => {
    addItem(product);
  };

  const handleCategoryCreated = (category: Category) => {
    fetchCategories();
    setSelectedCategory(category.id);
  };

  const handleProductCreated = (product: ProductWithCategory) => {
    fetchProducts();
  };

  return (
    <>
      <div className="w-80 border-r bg-gray-50 flex flex-col h-screen">
        {/* Search */}
        <div className="p-4 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 border-b bg-white">
          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'text-left px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                )}
              >
                {category.name}
              </button>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setShowCategoryDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </div>
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {products.map((product) => (
            <Card
              key={product.id}
              className="p-3 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleAddProduct(product)}
            >
              <div className="flex items-start gap-3">
                {product.imageUrl ? (
                  <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    ₹{product.baseRate.toLocaleString('en-IN')} / {product.unit}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={(e) => {
                  e.stopPropagation();
                  handleAddProduct(product);
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No products found
            </div>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setShowProductDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Item
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onCategoryCreated={handleCategoryCreated}
      />

      <ProductDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        onProductCreated={handleProductCreated}
        categories={categories}
      />
    </>
  );
}
