import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { PDFTemplate } from '@/lib/types';

/**
 * GET /api/templates
 * Retrieve all PDF templates with optional filtering
 *
 * Query Parameters:
 * - category: Filter by template category (optional)
 * - isdefault: Filter by default status (optional, boolean)
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
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isDefaultParam = searchParams.get('isdefault');

    // Build query
    let query = supabase
      .from('pdf_templates')
      .select('*')
      .order('createdat', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (isDefaultParam !== null) {
      const isDefault = isDefaultParam === 'true';
      query = query.eq('isdefault', isDefault);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Map database columns (lowercase) to frontend types (camelCase)
    const templates: PDFTemplate[] = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      isDefault: row.isdefault,
      isPublic: row.ispublic,
      templateJson: row.template_json,
      thumbnail: row.thumbnail,
      createdBy: row.createdby,
      createdAt: row.createdat,
      updatedAt: row.updatedat,
      version: row.version,
    }));

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new PDF template
 *
 * Request Body (camelCase):
 * {
 *   name: string,
 *   description?: string | null,
 *   category: TemplateCategory,
 *   isDefault?: boolean,
 *   isPublic?: boolean,
 *   templateJson: TemplateJSON,
 *   thumbnail?: string | null,
 *   createdBy?: string | null
 * }
 *
 * Response: Created template with camelCase fields
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      isDefault,
      isPublic,
      templateJson,
      thumbnail,
      createdBy,
    } = body;

    // Validate required fields
    if (!name || !templateJson) {
      return NextResponse.json(
        { error: 'Missing required fields: name and templateJson are required' },
        { status: 400 }
      );
    }

    // Map camelCase (frontend) to lowercase (database)
    const { data, error } = await supabase
      .from('pdf_templates')
      .insert({
        name,
        description: description || null,
        category: category || 'custom',
        isdefault: isDefault || false,
        ispublic: isPublic || false,
        template_json: templateJson,
        thumbnail: thumbnail || null,
        createdby: createdBy || null,
        version: 1, // Start with version 1
      })
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

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
