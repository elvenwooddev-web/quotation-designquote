'use client';

import React from 'react';
import { TemplateElement } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface PropertyPanelProps {
  selectedElement: TemplateElement | null;
  onUpdateElement: (elementId: string, updates: Partial<TemplateElement>) => void;
}

export default function PropertyPanel({ selectedElement, onUpdateElement }: PropertyPanelProps) {
  if (!selectedElement) {
    return (
      <div className="w-80 border-l bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (propertyKey: string, value: any) => {
    onUpdateElement(selectedElement.id, {
      properties: {
        ...selectedElement.properties,
        [propertyKey]: value,
      },
    });
  };

  const handleOrderChange = (order: number) => {
    onUpdateElement(selectedElement.id, { order });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string | number) => {
    let numValue: number | 'auto';

    if (value === 'auto' || value === '') {
      numValue = 'auto';
    } else {
      const parsed = typeof value === 'number' ? value : parseFloat(value);
      numValue = isNaN(parsed) ? 'auto' : parsed;
    }

    onUpdateElement(selectedElement.id, {
      size: {
        ...selectedElement.size,
        [dimension]: numValue,
      },
    });
  };

  const renderCommonProperties = () => (
    <div className="space-y-4">
      {/* Element Type Badge */}
      <div>
        <Label>Element Type</Label>
        <div className="mt-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium capitalize">
          {selectedElement.type}
        </div>
      </div>

      {/* Order/Position */}
      <div>
        <Label htmlFor="order">Order/Position</Label>
        <Input
          id="order"
          type="number"
          min="0"
          value={selectedElement.order}
          onChange={(e) => handleOrderChange(parseInt(e.target.value) || 0)}
          className="mt-1"
        />
      </div>

      {/* Width */}
      <div>
        <Label htmlFor="width">Width</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="width"
            type="number"
            value={selectedElement.size.width === 'auto' ? '' : selectedElement.size.width}
            onChange={(e) => handleSizeChange('width', e.target.value)}
            placeholder={selectedElement.size.width === 'auto' ? 'Auto' : 'Enter width'}
            disabled={selectedElement.size.width === 'auto'}
            className={selectedElement.size.width === 'auto' ? 'bg-gray-100 cursor-not-allowed' : ''}
          />
          <Select
            value={selectedElement.size.width === 'auto' ? 'auto' : 'custom'}
            onChange={(e) => {
              if (e.target.value === 'auto') {
                handleSizeChange('width', 'auto');
              } else {
                // Set to 100 as default when switching to custom
                handleSizeChange('width', 100);
              }
            }}
          >
            <option value="custom">Custom</option>
            <option value="auto">Auto</option>
          </Select>
        </div>
      </div>

      {/* Height */}
      <div>
        <Label htmlFor="height">Height</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="height"
            type="number"
            value={selectedElement.size.height === 'auto' ? '' : selectedElement.size.height}
            onChange={(e) => handleSizeChange('height', e.target.value)}
            placeholder={selectedElement.size.height === 'auto' ? 'Auto' : 'Enter height'}
            disabled={selectedElement.size.height === 'auto'}
            className={selectedElement.size.height === 'auto' ? 'bg-gray-100 cursor-not-allowed' : ''}
          />
          <Select
            value={selectedElement.size.height === 'auto' ? 'auto' : 'custom'}
            onChange={(e) => {
              if (e.target.value === 'auto') {
                handleSizeChange('height', 'auto');
              } else {
                // Set to 50 as default when switching to custom
                handleSizeChange('height', 50);
              }
            }}
          >
            <option value="custom">Custom</option>
            <option value="auto">Auto</option>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderHeaderProperties = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-semibold text-gray-700">Header Properties</h3>

      <div>
        <Label htmlFor="text">Text</Label>
        <Input
          id="text"
          type="text"
          value={selectedElement.properties.text || ''}
          onChange={(e) => handlePropertyChange('text', e.target.value)}
          className="mt-1"
          placeholder="Enter header text"
        />
      </div>

      <div>
        <Label htmlFor="fontSize">Font Size</Label>
        <Input
          id="fontSize"
          type="number"
          min="8"
          max="72"
          value={selectedElement.properties.fontSize || 16}
          onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="color">Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="color"
            type="color"
            value={selectedElement.properties.color || '#000000'}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="w-16 h-9"
          />
          <Input
            type="text"
            value={selectedElement.properties.color || '#000000'}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="alignment">Alignment</Label>
        <Select
          id="alignment"
          value={selectedElement.properties.alignment || 'left'}
          onChange={(e) => handlePropertyChange('alignment', e.target.value)}
          className="mt-1"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </Select>
      </div>
    </div>
  );

  const renderTextBlockProperties = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-semibold text-gray-700">Text Block Properties</h3>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={selectedElement.properties.content || ''}
          onChange={(e) => handlePropertyChange('content', e.target.value)}
          className="mt-1"
          placeholder="Enter text content"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="fontSize">Font Size</Label>
        <Input
          id="fontSize"
          type="number"
          min="8"
          max="72"
          value={selectedElement.properties.fontSize || 12}
          onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="color">Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="color"
            type="color"
            value={selectedElement.properties.color || '#000000'}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="w-16 h-9"
          />
          <Input
            type="text"
            value={selectedElement.properties.color || '#000000'}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );

  const renderTableProperties = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-semibold text-gray-700">Table Properties</h3>

      <div className="flex items-center gap-2">
        <Checkbox
          id="showBorders"
          checked={selectedElement.properties.showBorders ?? true}
          onCheckedChange={(checked) => handlePropertyChange('showBorders', checked)}
        />
        <Label htmlFor="showBorders" className="cursor-pointer">
          Show Borders
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="alternatingRows"
          checked={selectedElement.properties.alternatingRows ?? false}
          onCheckedChange={(checked) => handlePropertyChange('alternatingRows', checked)}
        />
        <Label htmlFor="alternatingRows" className="cursor-pointer">
          Alternating Rows
        </Label>
      </div>
    </div>
  );

  const renderDividerProperties = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-semibold text-gray-700">Divider Properties</h3>

      <div>
        <Label htmlFor="thickness">Thickness</Label>
        <Input
          id="thickness"
          type="number"
          min="1"
          max="10"
          value={selectedElement.properties.thickness || 1}
          onChange={(e) => handlePropertyChange('thickness', parseInt(e.target.value))}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="color">Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="color"
            type="color"
            value={selectedElement.properties.color || '#000000'}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="w-16 h-9"
          />
          <Input
            type="text"
            value={selectedElement.properties.color || '#000000'}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="style">Style</Label>
        <Select
          id="style"
          value={selectedElement.properties.style || 'solid'}
          onChange={(e) => handlePropertyChange('style', e.target.value)}
          className="mt-1"
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
        </Select>
      </div>
    </div>
  );

  const renderSpacerProperties = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-semibold text-gray-700">Spacer Properties</h3>

      <div>
        <Label htmlFor="spacerHeight">Height</Label>
        <Input
          id="spacerHeight"
          type="number"
          min="0"
          value={selectedElement.properties.height || 20}
          onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
          className="mt-1"
        />
      </div>
    </div>
  );

  const renderQRCodeProperties = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-semibold text-gray-700">QR Code Properties</h3>

      <div>
        <Label htmlFor="qrData">QR Data</Label>
        <Textarea
          id="qrData"
          value={selectedElement.properties.data || ''}
          onChange={(e) => handlePropertyChange('data', e.target.value)}
          className="mt-1"
          placeholder="Enter URL or {{variable}}"
          rows={2}
        />
        <p className="text-xs text-gray-500 mt-1">
          Use variables like: {`{{quoteNumber}}`}, {`{{paymentUrl}}`}
        </p>
      </div>

      <div>
        <Label htmlFor="qrSize">Size (pixels)</Label>
        <Input
          id="qrSize"
          type="number"
          min="50"
          max="300"
          value={selectedElement.properties.size || 100}
          onChange={(e) => handlePropertyChange('size', parseInt(e.target.value))}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="errorCorrection">Error Correction</Label>
        <Select
          id="errorCorrection"
          value={selectedElement.properties.errorCorrectionLevel || 'M'}
          onChange={(e) => handlePropertyChange('errorCorrectionLevel', e.target.value)}
          className="mt-1"
        >
          <option value="L">Low (7%)</option>
          <option value="M">Medium (15%)</option>
          <option value="Q">Quartile (25%)</option>
          <option value="H">High (30%)</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="qrForeground">Foreground Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="qrForeground"
            type="color"
            value={selectedElement.properties.foregroundColor || '#000000'}
            onChange={(e) => handlePropertyChange('foregroundColor', e.target.value)}
            className="w-16 h-9"
          />
          <Input
            type="text"
            value={selectedElement.properties.foregroundColor || '#000000'}
            onChange={(e) => handlePropertyChange('foregroundColor', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="qrBackground">Background Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="qrBackground"
            type="color"
            value={selectedElement.properties.backgroundColor || '#ffffff'}
            onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
            className="w-16 h-9"
          />
          <Input
            type="text"
            value={selectedElement.properties.backgroundColor || '#ffffff'}
            onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="qrLabel">Label (optional)</Label>
        <Input
          id="qrLabel"
          type="text"
          value={selectedElement.properties.label || ''}
          onChange={(e) => handlePropertyChange('label', e.target.value)}
          className="mt-1"
          placeholder="e.g., Scan to pay"
        />
      </div>

      <div>
        <Label htmlFor="qrAlignment">Alignment</Label>
        <Select
          id="qrAlignment"
          value={selectedElement.properties.alignment || 'center'}
          onChange={(e) => handlePropertyChange('alignment', e.target.value)}
          className="mt-1"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </div>
    </div>
  );

  const renderChartProperties = () => (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-semibold text-gray-700">Chart Properties</h3>

      <div>
        <Label htmlFor="chartType">Chart Type</Label>
        <Select
          id="chartType"
          value={selectedElement.properties.chartType || 'pie'}
          onChange={(e) => handlePropertyChange('chartType', e.target.value)}
          className="mt-1"
        >
          <option value="pie">Pie Chart</option>
          <option value="donut">Donut Chart</option>
          <option value="bar">Bar Chart</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="dataSource">Data Source</Label>
        <Select
          id="dataSource"
          value={selectedElement.properties.dataSource || 'categories'}
          onChange={(e) => handlePropertyChange('dataSource', e.target.value)}
          className="mt-1"
        >
          <option value="categories">Quote Categories</option>
          <option value="custom">Custom Data</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="chartTitle">Title (optional)</Label>
        <Input
          id="chartTitle"
          type="text"
          value={selectedElement.properties.title || ''}
          onChange={(e) => handlePropertyChange('title', e.target.value)}
          className="mt-1"
          placeholder="e.g., Category Breakdown"
        />
      </div>

      <div>
        <Label htmlFor="chartWidth">Width</Label>
        <Input
          id="chartWidth"
          type="number"
          min="100"
          max="500"
          value={selectedElement.properties.width || 200}
          onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="chartHeight">Height</Label>
        <Input
          id="chartHeight"
          type="number"
          min="100"
          max="500"
          value={selectedElement.properties.height || 200}
          onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
          className="mt-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="showLegend"
          checked={selectedElement.properties.showLegend ?? true}
          onCheckedChange={(checked) => handlePropertyChange('showLegend', checked)}
        />
        <Label htmlFor="showLegend" className="cursor-pointer">
          Show Legend
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="showValues"
          checked={selectedElement.properties.showValues ?? true}
          onCheckedChange={(checked) => handlePropertyChange('showValues', checked)}
        />
        <Label htmlFor="showValues" className="cursor-pointer">
          Show Values
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="showPercentages"
          checked={selectedElement.properties.showPercentages ?? true}
          onCheckedChange={(checked) => handlePropertyChange('showPercentages', checked)}
        />
        <Label htmlFor="showPercentages" className="cursor-pointer">
          Show Percentages
        </Label>
      </div>

      <div>
        <Label htmlFor="chartAlignment">Alignment</Label>
        <Select
          id="chartAlignment"
          value={selectedElement.properties.alignment || 'center'}
          onChange={(e) => handlePropertyChange('alignment', e.target.value)}
          className="mt-1"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </div>
    </div>
  );

  const renderTypeSpecificProperties = () => {
    switch (selectedElement.type) {
      case 'header':
        return renderHeaderProperties();
      case 'textBlock':
        return renderTextBlockProperties();
      case 'table':
        return renderTableProperties();
      case 'divider':
        return renderDividerProperties();
      case 'spacer':
        return renderSpacerProperties();
      case 'qrCode':
        return renderQRCodeProperties();
      case 'chart':
        return renderChartProperties();
      default:
        return null;
    }
  };

  return (
    <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>

      {renderCommonProperties()}
      {renderTypeSpecificProperties()}
    </div>
  );
}
