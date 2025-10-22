'use client';

import { useState, useRef, useEffect } from 'react';
import { INDIAN_STANDARD_UOMS, searchUOMs, UOMOption } from '@/lib/uom-standards';
import { Input } from '@/components/ui/input';
import { ChevronDown, X, Search } from 'lucide-react';

interface UOMSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function UOMSelect({
  value,
  onChange,
  required = false,
  placeholder = 'Search or select UOM',
  className = ''
}: UOMSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<UOMOption[]>(INDIAN_STANDARD_UOMS);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the selected option
  const selectedOption = INDIAN_STANDARD_UOMS.find(opt => opt.value === value);

  // Filter options when search query changes
  useEffect(() => {
    const filtered = searchUOMs(searchQuery);
    setFilteredOptions(filtered);
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSelect = (option: UOMOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <div
          className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white cursor-pointer hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
          onClick={handleToggle}
        >
          {isOpen ? (
            <>
              <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 outline-none bg-transparent text-sm"
                autoComplete="off"
              />
            </>
          ) : (
            <>
              <div className="flex-1 text-sm truncate">
                {selectedOption ? (
                  <span className="text-gray-900">{selectedOption.label}</span>
                ) : (
                  <span className="text-gray-400">{placeholder}</span>
                )}
              </div>
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 ml-2 flex-shrink-0 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
        {required && !value && (
          <input
            type="text"
            value=""
            onChange={() => {}}
            required
            className="absolute inset-0 opacity-0 pointer-events-none"
            tabIndex={-1}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            <div ref={dropdownRef}>
              {filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    index === highlightedIndex
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-gray-900 hover:bg-gray-50'
                  } ${value === option.value ? 'bg-blue-100' : ''}`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="font-medium">{option.value}</div>
                  <div className="text-xs text-gray-500">{option.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-6 text-center text-sm text-gray-500">
              No units found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
