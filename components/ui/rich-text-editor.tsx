'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Undo,
  Redo,
  RemoveFormatting,
  Table as TableIcon,
  Strikethrough,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  disabled = false
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      checkEmpty();
    }
  }, [value]);

  const checkEmpty = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent?.trim() || '';
      setIsEmpty(text.length === 0);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      checkEmpty();
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    if (disabled) return;
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleStrikethrough = () => execCommand('strikeThrough');
  const handleBulletList = () => execCommand('insertUnorderedList');
  const handleNumberedList = () => execCommand('insertOrderedList');
  const handleUndo = () => execCommand('undo');
  const handleRedo = () => execCommand('redo');
  const handleRemoveFormat = () => execCommand('removeFormat');

  const handleAlignLeft = () => execCommand('justifyLeft');
  const handleAlignCenter = () => execCommand('justifyCenter');
  const handleAlignRight = () => execCommand('justifyRight');

  const handleHeading1 = () => execCommand('formatBlock', '<h1>');
  const handleHeading2 = () => execCommand('formatBlock', '<h2>');
  const handleHeading3 = () => execCommand('formatBlock', '<h3>');
  const handleParagraph = () => execCommand('formatBlock', '<p>');

  const handleCode = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const code = document.createElement('code');
      code.style.backgroundColor = '#f4f4f4';
      code.style.padding = '2px 6px';
      code.style.borderRadius = '3px';
      code.style.fontFamily = 'monospace';
      code.style.fontSize = '0.9em';
      try {
        range.surroundContents(code);
      } catch (e) {
        // If surroundContents fails, use insertHTML
        code.textContent = range.toString();
        range.deleteContents();
        range.insertNode(code);
      }
      handleInput();
    }
  };

  const handleLink = () => {
    if (disabled) return;
    const url = prompt('Enter the URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleFontSize = (size: string) => {
    execCommand('fontSize', size);
  };

  const handleFontFamily = (font: string) => {
    execCommand('fontName', font);
  };

  const handleTextColor = () => {
    if (disabled) return;
    const color = prompt('Enter color (e.g., #000000 or red):');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  const handleBackgroundColor = () => {
    if (disabled) return;
    const color = prompt('Enter background color (e.g., #ffff00 or yellow):');
    if (color) {
      execCommand('backColor', color);
    }
  };

  const handleInsertTable = () => {
    if (disabled) return;
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');

    if (rows && cols) {
      const numRows = parseInt(rows);
      const numCols = parseInt(cols);

      if (numRows > 0 && numCols > 0 && numRows <= 20 && numCols <= 10) {
        // Create a wrapper div with delete button
        const tableId = `table-${Date.now()}`;
        let tableHTML = `
          <div class="table-wrapper" style="position: relative; margin: 10px 0;">
            <button
              type="button"
              class="delete-table-btn"
              onclick="this.parentElement.remove()"
              style="position: absolute; top: -10px; right: -10px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; line-height: 1; z-index: 10; display: none;"
              title="Delete Table"
            >×</button>
            <table
              id="${tableId}"
              contenteditable="true"
              style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; cursor: text;"
              onmouseover="this.parentElement.querySelector('.delete-table-btn').style.display='block'"
              onmouseout="this.parentElement.querySelector('.delete-table-btn').style.display='none'"
            >`;

        for (let i = 0; i < numRows; i++) {
          tableHTML += '<tr>';
          for (let j = 0; j < numCols; j++) {
            const cellType = i === 0 ? 'th' : 'td';
            tableHTML += `<${cellType} style="border: 1px solid #ddd; padding: 8px; text-align: left; min-width: 60px;" contenteditable="true">${cellType === 'th' ? `Header ${j + 1}` : '<br>'}</${cellType}>`;
          }
          tableHTML += '</tr>';
        }

        tableHTML += '</table></div><p><br></p>';

        execCommand('insertHTML', tableHTML);

        // Focus the first cell
        setTimeout(() => {
          const table = document.getElementById(tableId);
          if (table) {
            const firstCell = table.querySelector('th, td');
            if (firstCell) {
              firstCell.focus();
            }
          }
        }, 10);
      } else {
        alert('Please enter valid numbers (max 20 rows, 10 columns)');
      }
    }
  };

  return (
    <div className={cn(
      'border border-gray-300 rounded-lg overflow-hidden bg-white transition-all',
      disabled && 'opacity-60 pointer-events-none',
      className
    )}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {/* Undo/Redo */}
        <button
          type="button"
          onClick={handleUndo}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Undo"
          disabled={disabled}
        >
          <Undo className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleRedo}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Redo"
          disabled={disabled}
        >
          <Redo className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={handleHeading1}
          className="px-2 py-1 hover:bg-gray-200 rounded transition-colors text-xs font-semibold"
          title="Heading 1"
          disabled={disabled}
        >
          <Heading1 className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleHeading2}
          className="px-2 py-1 hover:bg-gray-200 rounded transition-colors text-xs font-semibold"
          title="Heading 2"
          disabled={disabled}
        >
          <Heading2 className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleHeading3}
          className="px-2 py-1 hover:bg-gray-200 rounded transition-colors text-xs font-semibold"
          title="Heading 3"
          disabled={disabled}
        >
          <Heading3 className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleParagraph}
          className="px-2 py-1 hover:bg-gray-200 rounded transition-colors text-xs"
          title="Paragraph"
          disabled={disabled}
        >
          <Type className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Formatting */}
        <button
          type="button"
          onClick={handleBold}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bold (Ctrl+B)"
          disabled={disabled}
        >
          <Bold className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Italic (Ctrl+I)"
          disabled={disabled}
        >
          <Italic className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleUnderline}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Underline (Ctrl+U)"
          disabled={disabled}
        >
          <Underline className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleStrikethrough}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Strikethrough"
          disabled={disabled}
        >
          <Strikethrough className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleCode}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Inline Code"
          disabled={disabled}
        >
          <Code className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Font Size */}
        <select
          onChange={(e) => handleFontSize(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Font Size"
          disabled={disabled}
          defaultValue="3"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>

        {/* Font Family */}
        <select
          onChange={(e) => handleFontFamily(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors max-w-[120px]"
          title="Font Family"
          disabled={disabled}
          defaultValue="Arial"
        >
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Comic Sans MS">Comic Sans</option>
          <option value="Impact">Impact</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={handleAlignLeft}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Align Left"
          disabled={disabled}
        >
          <AlignLeft className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleAlignCenter}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Align Center"
          disabled={disabled}
        >
          <AlignCenter className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleAlignRight}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Align Right"
          disabled={disabled}
        >
          <AlignRight className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={handleBulletList}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bullet List"
          disabled={disabled}
        >
          <List className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={handleNumberedList}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Numbered List"
          disabled={disabled}
        >
          <ListOrdered className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Table */}
        <button
          type="button"
          onClick={handleInsertTable}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Insert Table"
          disabled={disabled}
        >
          <TableIcon className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link */}
        <button
          type="button"
          onClick={handleLink}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Insert Link"
          disabled={disabled}
        >
          <LinkIcon className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Colors */}
        <button
          type="button"
          onClick={handleTextColor}
          className="px-2 py-1 hover:bg-gray-200 rounded transition-colors text-xs"
          title="Text Color"
          disabled={disabled}
        >
          <span className="inline-block w-4 h-4 border border-gray-400 rounded" style={{ background: 'linear-gradient(45deg, red, blue)' }}></span>
        </button>
        <button
          type="button"
          onClick={handleBackgroundColor}
          className="px-2 py-1 hover:bg-gray-200 rounded transition-colors text-xs"
          title="Background Color"
          disabled={disabled}
        >
          <span className="inline-block w-4 h-4 border border-gray-400 rounded" style={{ background: 'linear-gradient(45deg, yellow, orange)' }}></span>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={handleRemoveFormat}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Clear Formatting"
          disabled={disabled}
        >
          <RemoveFormatting className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      {/* Editor */}
      <div className="relative">
        {isEmpty && !disabled && (
          <div className="absolute top-4 left-4 text-gray-400 text-sm pointer-events-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          className={cn(
            'p-4 min-h-[300px] max-h-[600px] overflow-y-auto focus:outline-none text-sm text-gray-900',
            'prose prose-sm max-w-none',
            '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4',
            '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3',
            '[&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2',
            '[&_p]:mb-3',
            '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3',
            '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3',
            '[&_li]:mb-1',
            '[&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800',
            '[&_.table-wrapper]:relative [&_.table-wrapper]:my-3',
            '[&_table]:border-collapse [&_table]:w-full [&_table]:border [&_table]:border-gray-300',
            '[&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold [&_th]:min-w-[60px]',
            '[&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_td]:text-left [&_td]:min-w-[60px]',
            '[&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs',
            '[&_.delete-table-btn]:hover:bg-red-600 [&_.delete-table-btn]:transition-colors'
          )}
          suppressContentEditableWarning
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        {disabled ? (
          <span>Read-only mode</span>
        ) : (
          <span>Changes are auto-saved when you click &quot;Save Changes&quot; button above</span>
        )}
      </div>
    </div>
  );
}
