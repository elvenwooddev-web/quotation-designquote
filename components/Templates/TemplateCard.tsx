'use client';

import React from 'react';
import { Check, Eye, Star } from 'lucide-react';
import { PDFTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: PDFTemplate;
  selected?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  compact?: boolean;
}

// Category color mapping
const categoryColors: Record<string, string> = {
  business: 'bg-blue-100 text-blue-800 border-blue-200',
  modern: 'bg-purple-100 text-purple-800 border-purple-200',
  creative: 'bg-pink-100 text-pink-800 border-pink-200',
  elegant: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  bold: 'bg-red-100 text-red-800 border-red-200',
  minimalist: 'bg-gray-100 text-gray-800 border-gray-200',
  custom: 'bg-green-100 text-green-800 border-green-200',
};

export function TemplateCard({
  template,
  selected = false,
  onSelect,
  onPreview,
  compact = false,
}: TemplateCardProps) {
  const categoryColor = categoryColors[template.category] || categoryColors.custom;

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-white transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02]',
        selected
          ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
          : 'border-gray-200 hover:border-gray-300',
        compact ? 'p-3' : 'p-4',
        onSelect && 'cursor-pointer'
      )}
      onClick={onSelect}
    >
      {/* Selected Indicator */}
      {selected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-lg z-10">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Thumbnail Section */}
      <div
        className={cn(
          'relative bg-gray-50 rounded-md overflow-hidden mb-3',
          compact ? 'h-32' : 'h-40'
        )}
      >
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className={cn('text-gray-300', compact ? 'h-16 w-16' : 'h-20 w-20')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        )}

        {/* Preview button overlay */}
        {onPreview && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="flex items-center gap-2 shadow-lg"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className={cn('space-y-2', compact && 'space-y-1')}>
        {/* Template Name */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'font-semibold text-gray-900 line-clamp-1',
              compact ? 'text-sm' : 'text-base'
            )}
            title={template.name}
          >
            {template.name}
          </h3>
          {template.isDefault && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </div>

        {/* Description */}
        {!compact && template.description && (
          <p className="text-xs text-gray-600 line-clamp-2" title={template.description}>
            {template.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Badge */}
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
              categoryColor
            )}
          >
            {template.category}
          </span>

          {/* Default Badge */}
          {template.isDefault && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">
              Default
            </span>
          )}
        </div>

        {/* Metadata */}
        {!compact && (
          <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span>
                {template.templateJson.metadata.pageSize} •{' '}
                {template.templateJson.metadata.orientation}
              </span>
              {template.isPublic && (
                <span className="text-gray-400">Public</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
