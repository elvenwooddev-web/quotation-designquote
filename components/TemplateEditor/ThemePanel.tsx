'use client';

import React, { useState } from 'react';
import { TemplateTheme } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ThemePanelProps {
  theme: TemplateTheme;
  onThemeChange: (theme: TemplateTheme) => void;
}

export default function ThemePanel({ theme, onThemeChange }: ThemePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleColorChange = (colorKey: keyof TemplateTheme['colors'], value: string) => {
    onThemeChange({
      ...theme,
      colors: {
        ...theme.colors,
        [colorKey]: value,
      },
    });
  };

  const handleFontChange = (
    fontType: keyof TemplateTheme['fonts'],
    property: 'family' | 'size' | 'weight',
    value: string | number
  ) => {
    onThemeChange({
      ...theme,
      fonts: {
        ...theme.fonts,
        [fontType]: {
          ...theme.fonts[fontType],
          [property]: value,
        },
      },
    });
  };

  return (
    <div className="border-t mt-6">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-gray-700">Theme Settings</h3>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-6 pb-4">
          {/* Colors Section */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Colors
            </h4>
            <div className="space-y-3">
              <ColorInput
                label="Primary Color"
                value={theme.colors.primary}
                onChange={(value) => handleColorChange('primary', value)}
              />
              <ColorInput
                label="Secondary Color"
                value={theme.colors.secondary}
                onChange={(value) => handleColorChange('secondary', value)}
              />
              <ColorInput
                label="Primary Text"
                value={theme.colors.textPrimary}
                onChange={(value) => handleColorChange('textPrimary', value)}
              />
              <ColorInput
                label="Secondary Text"
                value={theme.colors.textSecondary}
                onChange={(value) => handleColorChange('textSecondary', value)}
              />
              <ColorInput
                label="Background"
                value={theme.colors.background}
                onChange={(value) => handleColorChange('background', value)}
              />
            </div>
          </div>

          {/* Fonts Section */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Typography
            </h4>

            {/* Heading Font */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Heading Font</p>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="heading-family" className="text-xs">
                    Font Family
                  </Label>
                  <Select
                    id="heading-family"
                    value={theme.fonts.heading.family}
                    onChange={(e) =>
                      handleFontChange('heading', 'family', e.target.value)
                    }
                    className="mt-1"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="heading-size" className="text-xs">
                    Font Size
                  </Label>
                  <Input
                    id="heading-size"
                    type="number"
                    min="8"
                    max="72"
                    value={theme.fonts.heading.size}
                    onChange={(e) =>
                      handleFontChange('heading', 'size', parseInt(e.target.value))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="heading-weight" className="text-xs">
                    Font Weight
                  </Label>
                  <Select
                    id="heading-weight"
                    value={theme.fonts.heading.weight}
                    onChange={(e) =>
                      handleFontChange('heading', 'weight', parseInt(e.target.value))
                    }
                    className="mt-1"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi-Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra-Bold (800)</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Body Font */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Body Font</p>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="body-family" className="text-xs">
                    Font Family
                  </Label>
                  <Select
                    id="body-family"
                    value={theme.fonts.body.family}
                    onChange={(e) => handleFontChange('body', 'family', e.target.value)}
                    className="mt-1"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="body-size" className="text-xs">
                    Font Size
                  </Label>
                  <Input
                    id="body-size"
                    type="number"
                    min="8"
                    max="72"
                    value={theme.fonts.body.size}
                    onChange={(e) =>
                      handleFontChange('body', 'size', parseInt(e.target.value))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="body-weight" className="text-xs">
                    Font Weight
                  </Label>
                  <Select
                    id="body-weight"
                    value={theme.fonts.body.weight}
                    onChange={(e) =>
                      handleFontChange('body', 'weight', parseInt(e.target.value))
                    }
                    className="mt-1"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi-Bold (600)</option>
                    <option value="700">Bold (700)</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Small Font */}
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Small Font</p>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="small-family" className="text-xs">
                    Font Family
                  </Label>
                  <Select
                    id="small-family"
                    value={theme.fonts.small.family}
                    onChange={(e) => handleFontChange('small', 'family', e.target.value)}
                    className="mt-1"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="small-size" className="text-xs">
                    Font Size
                  </Label>
                  <Input
                    id="small-size"
                    type="number"
                    min="8"
                    max="72"
                    value={theme.fonts.small.size}
                    onChange={(e) =>
                      handleFontChange('small', 'size', parseInt(e.target.value))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="small-weight" className="text-xs">
                    Font Weight
                  </Label>
                  <Select
                    id="small-weight"
                    value={theme.fonts.small.weight}
                    onChange={(e) =>
                      handleFontChange('small', 'weight', parseInt(e.target.value))
                    }
                    className="mt-1"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi-Bold (600)</option>
                    <option value="700">Bold (700)</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2 mt-1">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-9 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
