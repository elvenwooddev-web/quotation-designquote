'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '@/lib/types';
import { CategorySidebar } from '@/components/Catalog/CategorySidebar';
import { ProductGrid } from '@/components/Catalog/ProductGrid';
import { ProductDialog } from '@/components/Catalog/ProductDialog';
import { BulkImport } from '@/components/Catalog/BulkImport';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { hasPermission } from '@/lib/permissions';

export default function CatalogPage() {
  const { user, permissions } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('catalog');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCategoryAdded = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories(prev => 
      prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
    );
  };

  const handleCategoryDeleted = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    // If the deleted category was selected, switch to "all"
    if (selectedCategory === categoryId) {
      setSelectedCategory('all');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.categoryId === selectedCategory);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductDialog(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      let response;
      if (editingProduct) {
        response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      } else {
        response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }
      await fetchProducts();
      setShowProductDialog(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }
      await fetchProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
    }
  };

  const canCreateProduct = permissions ? hasPermission(permissions, 'products', 'cancreate') : false;
  const canEditProduct = permissions ? hasPermission(permissions, 'products', 'canedit') : false;
  const canDeleteProduct = permissions ? hasPermission(permissions, 'products', 'candelete') : false;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar - Categories */}
      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onCategoryAdded={handleCategoryAdded}
        onCategoryUpdated={handleCategoryUpdated}
        onCategoryDeleted={handleCategoryDeleted}
      />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          {canCreateProduct && activeTab === 'catalog' && (
            <Button onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue={activeTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="catalog">Catalog</TabsTrigger>
            <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center py-8">{error}</div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                canEdit={canEditProduct}
                canDelete={canDeleteProduct}
              />
            )}
          </TabsContent>

          <TabsContent value="bulk-import">
            <BulkImport
              categories={categories}
              onImportComplete={() => {
                fetchProducts();
                setActiveTab('catalog');
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ProductDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        product={editingProduct}
        categories={categories}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
