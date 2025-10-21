import { supabase } from '@/lib/db';
import { PDFTemplate } from '@/lib/types';
import { DEFAULT_TEMPLATES } from '@/lib/template-defaults';

/**
 * Fetches the default PDF template from the database.
 * Falls back to the built-in Modern template if no default is found.
 *
 * @returns Promise<PDFTemplate> - The default template
 */
export async function getDefaultTemplate(): Promise<PDFTemplate> {
  try {
    // Try to fetch the default template from database
    const { data: templateData, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('isdefault', true)
      .eq('ispublic', true)
      .limit(1)
      .single();

    if (!error && templateData) {
      // Map database columns to frontend format
      return {
        id: templateData.id,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        isDefault: templateData.isdefault,
        isPublic: templateData.ispublic,
        templateJson: templateData.template_json,
        thumbnail: templateData.thumbnail,
        createdBy: templateData.createdby,
        createdAt: templateData.createdat,
        updatedAt: templateData.updatedat,
        version: templateData.version,
      };
    }
  } catch (error) {
    console.warn('Failed to load default template from database:', error);
  }

  // Fallback to built-in Modern template
  const modernTemplate = DEFAULT_TEMPLATES.find((t) => t.name === 'Modern');
  if (modernTemplate) {
    // Convert template definition to PDFTemplate format
    return {
      id: 'default-modern',
      name: modernTemplate.name,
      description: modernTemplate.description,
      category: modernTemplate.category,
      isDefault: modernTemplate.isDefault,
      isPublic: true,
      templateJson: modernTemplate.templateJson,
      thumbnail: null,
      createdBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
  }

  // Ultimate fallback - return the first template
  const firstTemplate = DEFAULT_TEMPLATES[0];
  return {
    id: 'default-fallback',
    name: firstTemplate.name,
    description: firstTemplate.description,
    category: firstTemplate.category,
    isDefault: firstTemplate.isDefault,
    isPublic: true,
    templateJson: firstTemplate.templateJson,
    thumbnail: null,
    createdBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

/**
 * Fetches a template by ID from the database.
 * Returns null if not found.
 *
 * @param templateId - The template ID to fetch
 * @returns Promise<PDFTemplate | null> - The template or null
 */
export async function getTemplateById(templateId: string): Promise<PDFTemplate | null> {
  try {
    const { data: templateData, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error || !templateData) {
      console.warn(`Template ${templateId} not found`);
      return null;
    }

    // Map database columns to frontend format
    return {
      id: templateData.id,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      isDefault: templateData.isdefault,
      isPublic: templateData.ispublic,
      templateJson: templateData.template_json,
      thumbnail: templateData.thumbnail,
      createdBy: templateData.createdby,
      createdAt: templateData.createdat,
      updatedAt: templateData.updatedat,
      version: templateData.version,
    };
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}
