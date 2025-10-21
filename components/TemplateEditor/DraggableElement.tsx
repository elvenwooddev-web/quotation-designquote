'use client';

import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { TemplateElement } from '@/lib/types';
import { ELEMENT_TYPES } from './ElementToolbar';

interface DraggableElementProps {
  element: TemplateElement;
  index: number;
  isSelected: boolean;
  onSelect: (element: TemplateElement) => void;
  onDelete: (elementId: string) => void;
  onReorder: (dragIndex: number, dropIndex: number) => void;
}

/**
 * DraggableElement component wraps dropped elements in the canvas
 * Provides drag handle, delete button, and selection highlighting
 */
export default function DraggableElement({
  element,
  index,
  isSelected,
  onSelect,
  onDelete,
  onReorder,
}: DraggableElementProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ index, element }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const data = e.dataTransfer.getData('application/json');
      const dragData = JSON.parse(data);

      // Only handle reordering (not new element drops)
      if (dragData.index !== undefined && dragData.element) {
        const dragIndex = dragData.index;
        const dropIndex = index;

        if (dragIndex !== dropIndex) {
          onReorder(dragIndex, dropIndex);
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleClick = () => {
    onSelect(element);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(element.id);
  };

  // Find matching element type to get icon
  const elementType = ELEMENT_TYPES.find((et) => et.type === element.type);
  const Icon = elementType?.icon;
  const label = elementType?.label || element.type;

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        group flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer
        transition-all duration-200
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      {/* Drag Handle */}
      <div
        className="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600 transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Element Icon and Type */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {Icon && (
          <div
            className={`flex-shrink-0 ${
              isSelected ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isSelected ? 'text-blue-900' : 'text-gray-900'
            }`}
          >
            {label}
          </p>
          {element.properties?.title && (
            <p className="text-xs text-gray-500 truncate">
              {element.properties.title}
            </p>
          )}
        </div>
      </div>

      {/* Order Badge */}
      <div className="flex-shrink-0">
        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
          {index + 1}
        </span>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
        title="Delete element"
        aria-label="Delete element"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
