import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { PDFTemplate } from '@/lib/types';

/**
 * GET /api/templates/[id]
 * Retrieve a single PDF template by ID
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
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL: Await params in Next.js 15
    const { id } = await params;

    const { data, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Supabase specific error code for no rows found
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Map database columns (lowercase) to frontend types (camelCase)
    const template: PDFTemplate = {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      isDefault: data.isdefault,
      isPublic: data.ispublic,
      templateJson: data.template_json,
      thumbnail: data.thumbnail,
      createdBy: data.createdby,
      createdAt: data.createdat,
      updatedAt: data.updatedat,
      version: data.version,
    };

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/templates/[id]
 * Update an existing PDF template
 *
 * IMPORTANT: This increments the version number for optimistic locking
 *
 * Request Body (camelCase):
 * {
 *   name?: string,
 *   description?: string | null,
 *   category?: TemplateCategory,
 *   isDefault?: boolean,
 *   isPublic?: boolean,
 *   templateJson?: TemplateJSON,
 *   thumbnail?: string | null
 * }
 *
 * Response: Updated template with camelCase fields
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL: Await params in Next.js 15
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      description,
      category,
      isDefault,
      isPublic,
      templateJson,
      thumbnail,
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (isDefault !== undefined) updateData.isdefault = isDefault;
    if (isPublic !== undefined) updateData.ispublic = isPublic;
    if (templateJson !== undefined) updateData.template_json = templateJson;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // First, get current version to increment it
    const { data: currentTemplate, error: fetchError } = await supabase
      .from('pdf_templates')
      .select('version')
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

    // Increment version number
    updateData.version = (currentTemplate.version || 0) + 1;

    // The updatedat column will be automatically updated by the database trigger
    const { data, error } = await supabase
      .from('pdf_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Map database columns (lowercase) back to frontend types (camelCase)
    const template: PDFTemplate = {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      isDefault: data.isdefault,
      isPublic: data.ispublic,
      templateJson: data.template_json,
      thumbnail: data.thumbnail,
      createdBy: data.createdby,
      createdAt: data.createdat,
      updatedAt: data.updatedat,
      version: data.version,
    };

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]
 * Delete a PDF template
 *
 * This performs a hard delete. If soft delete is needed in the future,
 * add an 'isdeleted' column to the database and use UPDATE instead.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL: Await params in Next.js 15
    const { id } = await params;

    // Check if template exists and is not a default template
    const { data: template, error: fetchError } = await supabase
      .from('pdf_templates')
      .select('isdefault')
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

    // Prevent deletion of default template
    if (template.isdefault) {
      return NextResponse.json(
        { error: 'Cannot delete the default template. Please set another template as default first.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('pdf_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
