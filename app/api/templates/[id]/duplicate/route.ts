import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { PDFTemplate } from '@/lib/types';

/**
 * POST /api/templates/[id]/duplicate
 * Duplicate an existing PDF template with a new name
 *
 * This creates a copy of the template with:
 * - New ID (auto-generated)
 * - Name appended with " (Copy)"
 * - Version reset to 1
 * - isDefault set to false (duplicates are never default)
 * - New createdAt/updatedAt timestamps
 *
 * Request Body (optional):
 * {
 *   name?: string  // Override the default "Template Name (Copy)"
 * }
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

    // Get the template to duplicate
    const { data: originalTemplate, error: fetchError } = await supabase
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

    // Parse request body for optional custom name
    const body = await request.json().catch(() => ({}));
    const customName = body.name;

    // Generate new name: append " (Copy)" to original name
    // Unless a custom name is provided
    const newName = customName || `${originalTemplate.name} (Copy)`;

    // Create the duplicate with database column names (lowercase)
    const { data: duplicatedTemplate, error: insertError } = await supabase
      .from('pdf_templates')
      .insert({
        name: newName,
        description: originalTemplate.description,
        category: originalTemplate.category,
        isdefault: false, // Duplicates are never default
        ispublic: originalTemplate.ispublic,
        template_json: originalTemplate.template_json,
        thumbnail: originalTemplate.thumbnail,
        createdby: originalTemplate.createdby,
        version: 1, // Reset version to 1 for new template
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Map database columns (lowercase) back to frontend types (camelCase)
    const template: PDFTemplate = {
      id: duplicatedTemplate.id,
      name: duplicatedTemplate.name,
      description: duplicatedTemplate.description,
      category: duplicatedTemplate.category,
      isDefault: duplicatedTemplate.isdefault,
      isPublic: duplicatedTemplate.ispublic,
      templateJson: duplicatedTemplate.template_json,
      thumbnail: duplicatedTemplate.thumbnail,
      createdBy: duplicatedTemplate.createdby,
      createdAt: duplicatedTemplate.createdat,
      updatedAt: duplicatedTemplate.updatedat,
      version: duplicatedTemplate.version,
    };

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error duplicating template:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate template' },
      { status: 500 }
    );
  }
}
