'use client';

import { useState } from 'react';
import { Category } from '@/lib/types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryDialog } from '@/components/ProductCatalog/CategoryDialog';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onCategoryAdded: (category: Category) => void;
  onCategoryUpdated: (category: Category) => void;
  onCategoryDeleted: (categoryId: string) => void;
}

export function CategorySidebar({ categories, selectedCategory, onSelectCategory, onCategoryAdded, onCategoryUpdated, onCategoryDeleted }: CategorySidebarProps) {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const totalItems = 0; // TODO: Add item count when available
  
  const handleCategoryCreated = (category: Category) => {
    if (editingCategory) {
      onCategoryUpdated(category);
    } else {
      onCategoryAdded(category);
    }
    setEditingCategory(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryDialog(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      onCategoryDeleted(category.id);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setEditingCategory(null);
              setShowCategoryDialog(true);
            }}
            title="Add new category"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (categories.length > 0) {
                handleEditCategory(categories[0]); // Edit first category for now
              }
            }}
            title="Edit categories"
            disabled={categories.length === 0}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory('all')}
          className={`w-full flex justify-between items-center p-3 rounded-lg text-left transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'hover:bg-gray-50 border border-transparent'
          }`}
          data-testid="category-filter-all"
        >
          <span className="font-medium">All Items</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            {totalItems}
          </span>
        </button>
        
        {categories.map((category) => (
          <div
            key={category.id}
            className={`w-full flex justify-between items-center p-3 rounded-lg text-left transition-colors group ${
              selectedCategory === category.id 
                ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <button
              onClick={() => onSelectCategory(category.id)}
              className="flex-1 flex justify-between items-center"
              data-testid={`category-filter-${category.id}`}
            >
              <span className="font-medium">{category.name}</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                {0}
              </span>
            </button>
            <div className="flex space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCategory(category);
                }}
                className="h-6 w-6 p-0"
                title="Edit category"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(category);
                }}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete category"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onCategoryCreated={handleCategoryCreated}
        editingCategory={editingCategory}
      />
    </div>
  );
}
