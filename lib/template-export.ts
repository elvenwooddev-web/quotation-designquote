/**
 * Template Export Functionality
 *
 * Provides utilities for exporting PDF templates as JSON files for backup and sharing.
 * Exports include template configuration without database-specific fields.
 */

import { PDFTemplate } from './types';

/**
 * Export format version for compatibility tracking
 */
const EXPORT_VERSION = '1.0';

/**
 * Template data for export (without database-specific fields)
 */
export interface ExportTemplateData {
  name: string;
  description: string | null;
  category: string;
  isPublic: boolean;
  templateJson: any;
  thumbnail: string | null;
}

/**
 * Single template export format
 */
export interface SingleTemplateExport {
  exportVersion: string;
  exportDate: string;
  template: ExportTemplateData;
}

/**
 * Multiple templates export format
 */
export interface MultipleTemplatesExport {
  exportVersion: string;
  exportDate: string;
  templates: ExportTemplateData[];
}

/**
 * Strips database-specific fields from a template for export
 * Removes: id, createdAt, updatedAt, createdBy, version, isDefault
 *
 * @param template - The template to prepare for export
 * @returns Clean template data ready for export
 */
function prepareTemplateForExport(template: PDFTemplate): ExportTemplateData {
  return {
    name: template.name,
    description: template.description,
    category: template.category,
    isPublic: template.isPublic,
    templateJson: template.templateJson,
    thumbnail: template.thumbnail,
  };
}

/**
 * Exports a single template to a JSON string
 *
 * @param template - The template to export
 * @returns Pretty-printed JSON string
 *
 * @example
 * const jsonString = exportTemplate(myTemplate);
 * console.log(jsonString);
 */
export function exportTemplate(template: PDFTemplate): string {
  const exportData: SingleTemplateExport = {
    exportVersion: EXPORT_VERSION,
    exportDate: new Date().toISOString(),
    template: prepareTemplateForExport(template),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Exports multiple templates to a JSON string
 *
 * @param templates - Array of templates to export
 * @returns Pretty-printed JSON string
 *
 * @example
 * const jsonString = exportTemplates([template1, template2]);
 * fs.writeFileSync('templates.json', jsonString);
 */
export function exportTemplates(templates: PDFTemplate[]): string {
  const exportData: MultipleTemplatesExport = {
    exportVersion: EXPORT_VERSION,
    exportDate: new Date().toISOString(),
    templates: templates.map(prepareTemplateForExport),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generates a safe filename from a template name
 * Removes special characters and replaces spaces with hyphens
 *
 * @param templateName - The template name to sanitize
 * @returns Safe filename without extension
 */
function sanitizeFilename(templateName: string): string {
  return templateName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50); // Limit length
}

/**
 * Downloads a template as a JSON file to the user's browser
 * Creates a download link and triggers it automatically
 *
 * @param template - The template to download
 * @param filename - Optional custom filename (without .json extension)
 *
 * @example
 * // Download with auto-generated filename
 * downloadTemplateAsFile(myTemplate);
 *
 * // Download with custom filename
 * downloadTemplateAsFile(myTemplate, 'my-custom-template');
 */
export function downloadTemplateAsFile(
  template: PDFTemplate,
  filename?: string
): void {
  const jsonString = exportTemplate(template);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename || sanitizeFilename(template.name)}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Downloads multiple templates as a single JSON file
 *
 * @param templates - Array of templates to download
 * @param filename - Optional custom filename (without .json extension)
 *
 * @example
 * downloadTemplatesAsFile([template1, template2], 'my-templates');
 */
export function downloadTemplatesAsFile(
  templates: PDFTemplate[],
  filename: string = 'templates'
): void {
  const jsonString = exportTemplates(templates);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Downloads multiple templates as a ZIP file (optional feature)
 * Each template is saved as a separate JSON file within the ZIP
 *
 * Note: Requires JSZip library. Install with: npm install jszip
 * This function will throw an error if JSZip is not installed.
 *
 * @param templates - Array of templates to download
 * @returns Promise that resolves when download is complete
 *
 * @example
 * await downloadTemplatesAsZip([template1, template2, template3]);
 */
export async function downloadTemplatesAsZip(
  templates: PDFTemplate[]
): Promise<void> {
  try {
    // Dynamically import JSZip to avoid bundling if not used
    // @ts-ignore - JSZip is an optional dependency
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add each template as a separate file
    templates.forEach((template) => {
      const jsonString = exportTemplate(template);
      const filename = `${sanitizeFilename(template.name)}.json`;
      zip.file(filename, jsonString);
    });

    // Add a manifest file
    const manifest = {
      exportVersion: EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      templateCount: templates.length,
      templates: templates.map((t) => ({
        name: t.name,
        category: t.category,
        filename: `${sanitizeFilename(t.name)}.json`,
      })),
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // Generate ZIP and download
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `templates-${new Date().toISOString().split('T')[0]}.zip`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to create ZIP file:', error);
    throw new Error('Failed to create ZIP file. Make sure JSZip is installed.');
  }
}

/**
 * Validates if a string is valid JSON
 *
 * @param jsonString - String to validate
 * @returns True if valid JSON, false otherwise
 */
export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets template metadata without the full templateJson content
 * Useful for generating template lists or previews
 *
 * @param template - The template to extract metadata from
 * @returns Metadata object with essential template information
 */
export function getTemplateMetadata(template: PDFTemplate) {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    isDefault: template.isDefault,
    isPublic: template.isPublic,
    thumbnail: template.thumbnail,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    elementCount: template.templateJson.elements.length,
    pageSize: template.templateJson.metadata.pageSize,
    orientation: template.templateJson.metadata.orientation,
  };
}
