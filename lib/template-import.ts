/**
 * Template Import Functionality
 *
 * Provides utilities for importing PDF templates from JSON files with validation.
 * Ensures imported templates meet structure requirements before saving to database.
 */

import { PDFTemplate, TemplateCategory, TemplateJSON, TemplateElement } from './types';
import {
  ExportTemplateData,
  SingleTemplateExport,
  MultipleTemplatesExport,
} from './template-export';

/**
 * Validation result containing success status and error messages
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Import result for a single template
 */
export interface ImportResult {
  success: boolean;
  templateId?: string;
  templateName: string;
  error?: string;
}

/**
 * Valid template categories for validation
 */
const VALID_CATEGORIES: TemplateCategory[] = [
  'business',
  'modern',
  'creative',
  'elegant',
  'bold',
  'minimalist',
  'custom',
];

/**
 * Valid element types for validation
 */
const VALID_ELEMENT_TYPES = [
  'header',
  'footer',
  'table',
  'signature',
  'textBlock',
  'divider',
  'spacer',
  'image',
  'logo',
  'termsAndConditions',
];

/**
 * Valid page sizes
 */
const VALID_PAGE_SIZES = ['A4', 'Letter', 'Legal'];

/**
 * Valid orientations
 */
const VALID_ORIENTATIONS = ['portrait', 'landscape'];

/**
 * Safely parses JSON string with error handling
 *
 * @param jsonString - JSON string to parse
 * @returns Parsed object or null if parsing fails
 */
export function parseTemplateJSON(jsonString: string): any | null {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}

/**
 * Validates the structure of template metadata
 *
 * @param metadata - Metadata object to validate
 * @returns Validation result
 */
function validateMetadata(metadata: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!metadata) {
    errors.push('Template metadata is missing');
    return { valid: false, errors, warnings };
  }

  // Version
  if (!metadata.version || typeof metadata.version !== 'string') {
    warnings.push('Template version is missing or invalid (will use default)');
  }

  // Page size
  if (!metadata.pageSize || !VALID_PAGE_SIZES.includes(metadata.pageSize)) {
    errors.push(
      `Invalid page size: ${metadata.pageSize}. Must be one of: ${VALID_PAGE_SIZES.join(', ')}`
    );
  }

  // Orientation
  if (!metadata.orientation || !VALID_ORIENTATIONS.includes(metadata.orientation)) {
    errors.push(
      `Invalid orientation: ${metadata.orientation}. Must be one of: ${VALID_ORIENTATIONS.join(', ')}`
    );
  }

  // Margins
  if (!metadata.margins) {
    errors.push('Template margins are missing');
  } else {
    const requiredMargins = ['top', 'bottom', 'left', 'right'];
    for (const margin of requiredMargins) {
      if (
        typeof metadata.margins[margin] !== 'number' ||
        metadata.margins[margin] < 0
      ) {
        errors.push(`Invalid margin.${margin}: must be a non-negative number`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates the structure of template theme
 *
 * @param theme - Theme object to validate
 * @returns Validation result
 */
function validateTheme(theme: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!theme) {
    errors.push('Template theme is missing');
    return { valid: false, errors, warnings };
  }

  // Colors
  if (!theme.colors) {
    errors.push('Theme colors are missing');
  } else {
    const requiredColors = ['primary', 'secondary', 'textPrimary', 'textSecondary', 'background'];
    for (const color of requiredColors) {
      if (!theme.colors[color] || typeof theme.colors[color] !== 'string') {
        errors.push(`Theme color '${color}' is missing or invalid`);
      }
    }
  }

  // Fonts
  if (!theme.fonts) {
    errors.push('Theme fonts are missing');
  } else {
    const requiredFonts = ['heading', 'body', 'small'];
    for (const font of requiredFonts) {
      if (!theme.fonts[font]) {
        errors.push(`Theme font '${font}' is missing`);
      } else {
        const fontConfig = theme.fonts[font];
        if (!fontConfig.family || typeof fontConfig.family !== 'string') {
          errors.push(`Font '${font}' is missing family`);
        }
        if (typeof fontConfig.size !== 'number' || fontConfig.size <= 0) {
          errors.push(`Font '${font}' has invalid size`);
        }
        if (typeof fontConfig.weight !== 'number') {
          errors.push(`Font '${font}' has invalid weight`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates a single template element
 *
 * @param element - Element object to validate
 * @param index - Element index for error messages
 * @returns Validation result
 */
function validateElement(element: any, index: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const prefix = `Element ${index}`;

  // ID
  if (!element.id || typeof element.id !== 'string') {
    errors.push(`${prefix}: Missing or invalid id`);
  }

  // Type
  if (!element.type || typeof element.type !== 'string') {
    errors.push(`${prefix}: Missing or invalid type`);
  } else if (!VALID_ELEMENT_TYPES.includes(element.type)) {
    warnings.push(
      `${prefix}: Unknown element type '${element.type}'. It may not render correctly.`
    );
  }

  // Order
  if (typeof element.order !== 'number' || element.order < 0) {
    errors.push(`${prefix}: Invalid order (must be a non-negative number)`);
  }

  // Position
  if (!element.position) {
    errors.push(`${prefix}: Missing position`);
  } else if (element.position !== 'auto') {
    if (typeof element.position.x !== 'number' || typeof element.position.y !== 'number') {
      errors.push(`${prefix}: Invalid position coordinates`);
    }
  }

  // Size
  if (!element.size) {
    errors.push(`${prefix}: Missing size`);
  } else {
    if (
      element.size.width !== 'auto' &&
      (typeof element.size.width !== 'number' || element.size.width <= 0)
    ) {
      errors.push(`${prefix}: Invalid width (must be 'auto' or positive number)`);
    }
    if (
      element.size.height !== 'auto' &&
      (typeof element.size.height !== 'number' || element.size.height <= 0)
    ) {
      errors.push(`${prefix}: Invalid height (must be 'auto' or positive number)`);
    }
  }

  // Properties
  if (!element.properties || typeof element.properties !== 'object') {
    errors.push(`${prefix}: Missing or invalid properties`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates the templateJson structure
 *
 * @param templateJson - Template JSON object to validate
 * @returns Validation result
 */
function validateTemplateJson(templateJson: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!templateJson || typeof templateJson !== 'object') {
    errors.push('templateJson is missing or not an object');
    return { valid: false, errors, warnings };
  }

  // Validate metadata
  const metadataResult = validateMetadata(templateJson.metadata);
  errors.push(...metadataResult.errors);
  warnings.push(...metadataResult.warnings);

  // Validate theme
  const themeResult = validateTheme(templateJson.theme);
  errors.push(...themeResult.errors);
  warnings.push(...themeResult.warnings);

  // Validate elements
  if (!Array.isArray(templateJson.elements)) {
    errors.push('templateJson.elements must be an array');
  } else {
    if (templateJson.elements.length === 0) {
      warnings.push('Template has no elements');
    }

    templateJson.elements.forEach((element: any, index: number) => {
      const elementResult = validateElement(element, index);
      errors.push(...elementResult.errors);
      warnings.push(...elementResult.warnings);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates the complete template structure
 *
 * @param template - Template object to validate
 * @returns Validation result with errors and warnings
 *
 * @example
 * const result = validateTemplateStructure(importedTemplate);
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 */
export function validateTemplateStructure(template: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!template || typeof template !== 'object') {
    errors.push('Template data is missing or not an object');
    return { valid: false, errors, warnings };
  }

  // Name (required)
  if (!template.name || typeof template.name !== 'string' || template.name.trim() === '') {
    errors.push('Template name is required and must be a non-empty string');
  }

  // Description (optional)
  if (template.description !== null && template.description !== undefined) {
    if (typeof template.description !== 'string') {
      warnings.push('Template description should be a string (will be ignored)');
    }
  }

  // Category (optional but validated if present)
  if (template.category) {
    if (!VALID_CATEGORIES.includes(template.category)) {
      warnings.push(
        `Unknown category '${template.category}'. Will default to 'custom'. Valid categories: ${VALID_CATEGORIES.join(', ')}`
      );
    }
  } else {
    warnings.push("Template category is missing (will default to 'custom')");
  }

  // isPublic (optional)
  if (template.isPublic !== undefined && typeof template.isPublic !== 'boolean') {
    warnings.push('Template isPublic should be a boolean (will default to false)');
  }

  // templateJson (required)
  if (!template.templateJson) {
    errors.push('Template templateJson is required');
  } else {
    const templateJsonResult = validateTemplateJson(template.templateJson);
    errors.push(...templateJsonResult.errors);
    warnings.push(...templateJsonResult.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Detects the format of imported JSON (single or multiple templates)
 *
 * @param data - Parsed JSON data
 * @returns 'single', 'multiple', or 'unknown'
 */
export function detectImportFormat(
  data: any
): 'single' | 'multiple' | 'unknown' {
  if (!data || typeof data !== 'object') {
    return 'unknown';
  }

  // Check for export format
  if (data.exportVersion && data.exportDate) {
    if (data.template && typeof data.template === 'object') {
      return 'single';
    }
    if (Array.isArray(data.templates)) {
      return 'multiple';
    }
  }

  // Check for direct template format
  if (data.name && data.templateJson) {
    return 'single';
  }

  // Check for array of templates
  if (Array.isArray(data) && data.length > 0 && data[0].name && data[0].templateJson) {
    return 'multiple';
  }

  return 'unknown';
}

/**
 * Extracts templates from imported JSON data
 *
 * @param data - Parsed JSON data
 * @returns Array of template data
 */
export function extractTemplatesFromImport(data: any): ExportTemplateData[] {
  const format = detectImportFormat(data);

  if (format === 'single') {
    const template = data.template || data;
    return [template];
  }

  if (format === 'multiple') {
    return data.templates || data;
  }

  return [];
}

/**
 * Checks if a template name already exists
 *
 * @param name - Template name to check
 * @param existingNames - Array of existing template names
 * @returns True if name exists
 */
export function isTemplateNameDuplicate(
  name: string,
  existingNames: string[]
): boolean {
  return existingNames.some(
    (existingName) => existingName.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Generates a unique template name by appending a suffix
 *
 * @param baseName - Original template name
 * @param existingNames - Array of existing template names
 * @param suffix - Suffix to append (default: '(Imported)')
 * @returns Unique template name
 */
export function generateUniqueTemplateName(
  baseName: string,
  existingNames: string[],
  suffix: string = '(Imported)'
): string {
  let uniqueName = `${baseName} ${suffix}`;
  let counter = 1;

  while (isTemplateNameDuplicate(uniqueName, existingNames)) {
    uniqueName = `${baseName} ${suffix} ${counter}`;
    counter++;
  }

  return uniqueName;
}

/**
 * Prepares template data for import by setting defaults and cleaning data
 *
 * @param templateData - Raw template data from import
 * @param existingNames - Array of existing template names (for duplicate detection)
 * @returns Prepared template data ready for database insert
 */
export function prepareTemplateForImport(
  templateData: ExportTemplateData,
  existingNames: string[]
): Partial<PDFTemplate> {
  // Check for duplicate name
  let finalName = templateData.name;
  if (isTemplateNameDuplicate(templateData.name, existingNames)) {
    finalName = generateUniqueTemplateName(templateData.name, existingNames);
  }

  // Set defaults
  const category: TemplateCategory = VALID_CATEGORIES.includes(
    templateData.category as TemplateCategory
  )
    ? (templateData.category as TemplateCategory)
    : 'custom';

  return {
    name: finalName,
    description: templateData.description || null,
    category,
    isDefault: false, // Never set imported templates as default
    isPublic: templateData.isPublic ?? false,
    templateJson: templateData.templateJson,
    thumbnail: templateData.thumbnail || null,
  };
}

/**
 * Imports a single template to the database via API
 *
 * @param templateData - Template data to import
 * @returns Promise resolving to the new template ID
 *
 * @example
 * const templateId = await importTemplate(parsedTemplate);
 * console.log('Imported template ID:', templateId);
 */
export async function importTemplate(
  templateData: Partial<PDFTemplate>
): Promise<string> {
  const response = await fetch('/api/templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(templateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to import template');
  }

  const result = await response.json();
  return result.id;
}

/**
 * Imports multiple templates to the database
 *
 * @param templatesData - Array of template data to import
 * @returns Promise resolving to array of import results
 *
 * @example
 * const results = await importTemplates([template1, template2]);
 * const successCount = results.filter(r => r.success).length;
 */
export async function importTemplates(
  templatesData: Partial<PDFTemplate>[]
): Promise<ImportResult[]> {
  const results: ImportResult[] = [];

  for (const templateData of templatesData) {
    try {
      const templateId = await importTemplate(templateData);
      results.push({
        success: true,
        templateId,
        templateName: templateData.name || 'Unknown',
      });
    } catch (error: any) {
      results.push({
        success: false,
        templateName: templateData.name || 'Unknown',
        error: error.message || 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Fetches existing template names from the database
 *
 * @returns Promise resolving to array of template names
 */
export async function fetchExistingTemplateNames(): Promise<string[]> {
  try {
    const response = await fetch('/api/templates');
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    const templates: PDFTemplate[] = await response.json();
    return templates.map((t) => t.name);
  } catch (error) {
    console.error('Failed to fetch existing template names:', error);
    return [];
  }
}

/**
 * Validates and imports templates from a JSON file
 * This is the main function to use for importing templates
 *
 * @param jsonString - JSON string from uploaded file
 * @returns Promise resolving to import results with validation errors
 *
 * @example
 * const fileContent = await file.text();
 * const result = await validateAndImportTemplates(fileContent);
 *
 * if (result.parseError) {
 *   console.error('Failed to parse JSON');
 * } else {
 *   console.log(`Imported ${result.successCount} templates`);
 * }
 */
export async function validateAndImportTemplates(jsonString: string): Promise<{
  success: boolean;
  parseError?: string;
  templates: {
    name: string;
    valid: boolean;
    imported: boolean;
    errors: string[];
    warnings: string[];
    templateId?: string;
  }[];
  successCount: number;
  failureCount: number;
}> {
  // Parse JSON
  const parsed = parseTemplateJSON(jsonString);
  if (!parsed) {
    return {
      success: false,
      parseError: 'Invalid JSON format',
      templates: [],
      successCount: 0,
      failureCount: 0,
    };
  }

  // Extract templates
  const templatesData = extractTemplatesFromImport(parsed);
  if (templatesData.length === 0) {
    return {
      success: false,
      parseError: 'No valid templates found in the file',
      templates: [],
      successCount: 0,
      failureCount: 0,
    };
  }

  // Fetch existing template names
  const existingNames = await fetchExistingTemplateNames();

  // Validate all templates
  const validatedTemplates = templatesData.map((templateData) => {
    const validation = validateTemplateStructure(templateData);
    return {
      name: templateData.name || 'Unknown',
      valid: validation.valid,
      imported: false,
      errors: validation.errors,
      warnings: validation.warnings,
      templateData: validation.valid ? templateData : null,
    };
  });

  // Import valid templates
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const validated of validatedTemplates) {
    if (validated.valid && validated.templateData) {
      try {
        const preparedData = prepareTemplateForImport(
          validated.templateData,
          existingNames
        );
        const templateId = await importTemplate(preparedData);

        results.push({
          name: validated.name,
          valid: true,
          imported: true,
          errors: [],
          warnings: validated.warnings,
          templateId,
        });

        // Add imported name to existing names to prevent duplicates in batch
        existingNames.push(preparedData.name!);
        successCount++;
      } catch (error: any) {
        results.push({
          name: validated.name,
          valid: true,
          imported: false,
          errors: [error.message || 'Failed to import template'],
          warnings: validated.warnings,
        });
        failureCount++;
      }
    } else {
      results.push({
        name: validated.name,
        valid: false,
        imported: false,
        errors: validated.errors,
        warnings: validated.warnings,
      });
      failureCount++;
    }
  }

  return {
    success: successCount > 0,
    templates: results,
    successCount,
    failureCount,
  };
}
