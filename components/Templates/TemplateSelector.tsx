'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Loader2, FileX } from 'lucide-react';
import { PDFTemplate, TemplateCategory } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { TemplateCard } from './TemplateCard';
import { PDFPreviewModal } from '@/components/PDFPreviewModal';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  selectedTemplateId?: string | null;
  onSelect: (templateId: string, template: PDFTemplate) => void;
  showPreview?: boolean;
  compact?: boolean;
}

const TEMPLATE_CATEGORIES: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'business', label: 'Business' },
  { value: 'modern', label: 'Modern' },
  { value: 'creative', label: 'Creative' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'bold', label: 'Bold' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'custom', label: 'Custom' },
];

export function TemplateSelector({
  selectedTemplateId,
  onSelect,
  showPreview = true,
  compact = false,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  // Preview state
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates');

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on search and category
  const filteredTemplates = templates.filter((template) => {
    // Search filter
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort: default template first, then alphabetically
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.name.localeCompare(b.name);
  });

  // Handle template selection
  const handleSelect = useCallback(
    (template: PDFTemplate) => {
      onSelect(template.id, template);
    },
    [onSelect]
  );

  // Handle preview
  const handlePreview = useCallback((templateId: string) => {
    setPreviewTemplateId(templateId);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sortedTemplates.length === 0) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < sortedTemplates.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < sortedTemplates.length - 3 ? prev + 3 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 2 ? prev - 3 : prev));
          break;
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < sortedTemplates.length) {
            e.preventDefault();
            handleSelect(sortedTemplates[focusedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setFocusedIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sortedTemplates, focusedIndex, handleSelect]);

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('space-y-4', compact && 'space-y-3')}>
        {/* Skeleton filters */}
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-gray-200 rounded-md animate-pulse" />
          <div className="w-48 h-10 bg-gray-200 rounded-md animate-pulse" />
        </div>

        {/* Skeleton cards */}
        <div className={cn(
          'grid gap-4',
          compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-lg border border-gray-200 p-4 space-y-3',
                compact ? 'p-3' : 'p-4'
              )}
            >
              <div className={cn('bg-gray-200 rounded-md animate-pulse', compact ? 'h-32' : 'h-40')} />
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Templates
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchTemplates}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Templates Found
        </h3>
        <p className="text-gray-600">
          No PDF templates are available. Create your first template to get started.
        </p>
      </div>
    );
  }

  // No results state
  if (sortedTemplates.length === 0) {
    return (
      <div className={cn('space-y-4', compact && 'space-y-3')}>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
              className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {TEMPLATE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* No results message */}
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Templates Match Your Search
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', compact && 'space-y-3')}>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {TEMPLATE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {sortedTemplates.length} template{sortedTemplates.length !== 1 ? 's' : ''} found
        {selectedCategory !== 'all' && ` in ${selectedCategory}`}
      </div>

      {/* Template Grid */}
      <div
        className={cn(
          'grid gap-4',
          compact
            ? 'grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {sortedTemplates.map((template, index) => (
          <div
            key={template.id}
            className={cn(
              'outline-none',
              focusedIndex === index && 'ring-2 ring-blue-400 rounded-lg'
            )}
            tabIndex={0}
            onFocus={() => setFocusedIndex(index)}
          >
            <TemplateCard
              template={template}
              selected={template.id === selectedTemplateId}
              onSelect={() => handleSelect(template)}
              onPreview={showPreview ? () => handlePreview(template.id) : undefined}
              compact={compact}
            />
          </div>
        ))}
      </div>

      {/* Default template suggestion */}
      {!selectedTemplateId && sortedTemplates.some((t) => t.isDefault) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> The default template is recommended for new quotes.
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewTemplateId && (
        <PDFPreviewModal
          isOpen={true}
          onClose={() => setPreviewTemplateId(null)}
          templateId={previewTemplateId}
          title="Template Preview"
        />
      )}
    </div>
  );
}
