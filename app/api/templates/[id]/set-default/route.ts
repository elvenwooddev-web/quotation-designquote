import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { PDFTemplate } from '@/lib/types';

/**
 * POST /api/templates/[id]/set-default
 * Set a template as the default template
 *
 * This operation:
 * 1. Unsets isDefault on all other templates (ensures only one default)
 * 2. Sets isDefault=true on the specified template
 * 3. Returns the updated template
 *
 * IMPORTANT: In Next.js 15, params is a Promise and MUST be awaited
 *
 * Database Column Mapping:
 * Frontend (camelCase) → Database (lowercase)
 * - isDefault → isdefault
 * - isPublic → ispublic
 * - templateJson → template_json
 * - createdBy → createdby
 * - createdAt → createdat
 * - updatedAt → updatedat
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL: Await params in Next.js 15
    const { id } = await params;

    // First, verify the template exists
    const { data: template, error: fetchError } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // If this template is already the default, no action needed
    if (template.isdefault) {
      // Map database columns to frontend types
      const mappedTemplate: PDFTemplate = {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        isDefault: template.isdefault,
        isPublic: template.ispublic,
        templateJson: template.template_json,
        thumbnail: template.thumbnail,
        createdBy: template.createdby,
        createdAt: template.createdat,
        updatedAt: template.updatedat,
        version: template.version,
      };

      return NextResponse.json({
        message: 'Template is already the default',
        template: mappedTemplate,
      });
    }

    // Step 1: Unset isdefault on all templates
    const { error: unsetError } = await supabase
      .from('pdf_templates')
      .update({ isdefault: false })
      .neq('id', id); // Update all except the target template

    if (unsetError) throw unsetError;

    // Step 2: Set the specified template as default
    const { data: updatedTemplate, error: updateError } = await supabase
      .from('pdf_templates')
      .update({ isdefault: true })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Map database columns (lowercase) back to frontend types (camelCase)
    const result: PDFTemplate = {
      id: updatedTemplate.id,
      name: updatedTemplate.name,
      description: updatedTemplate.description,
      category: updatedTemplate.category,
      isDefault: updatedTemplate.isdefault,
      isPublic: updatedTemplate.ispublic,
      templateJson: updatedTemplate.template_json,
      thumbnail: updatedTemplate.thumbnail,
      createdBy: updatedTemplate.createdby,
      createdAt: updatedTemplate.createdat,
      updatedAt: updatedTemplate.updatedat,
      version: updatedTemplate.version,
    };

    return NextResponse.json({
      message: 'Template set as default successfully',
      template: result,
    });
  } catch (error) {
    console.error('Error setting default template:', error);
    return NextResponse.json(
      { error: 'Failed to set default template' },
      { status: 500 }
    );
  }
}
