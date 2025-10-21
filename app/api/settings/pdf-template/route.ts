import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

const DEFAULT_TEMPLATE: any[] = [];

export async function GET() {
  try {
    const { data: template, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('isdefault', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      throw error;
    }

    // If no template exists, return defaults
    if (!template) {
      return NextResponse.json({
        elements: DEFAULT_TEMPLATE,
      });
    }

    // Check if template_json is a full TemplateJSON object or just an array
    const templateJson = template.template_json;
    let elements = DEFAULT_TEMPLATE;

    if (Array.isArray(templateJson)) {
      // Old format: array of elements
      elements = templateJson;
    } else if (templateJson && typeof templateJson === 'object' && Array.isArray(templateJson.elements)) {
      // New format: TemplateJSON object with elements array
      elements = templateJson.elements;
    }

    return NextResponse.json({
      elements,
    });
  } catch (error) {
    console.error('Error fetching PDF template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PDF template' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { elements } = body;

    // Check if default template already exists
    const { data: existing } = await supabase
      .from('pdf_templates')
      .select('id')
      .eq('isdefault', true)
      .single();

    const templateData = {
      template_json: elements,
      updatedat: new Date().toISOString(),
    };

    if (existing) {
      // Update existing template
      const { error } = await supabase
        .from('pdf_templates')
        .update(templateData)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new template
      const { error } = await supabase
        .from('pdf_templates')
        .insert({
          ...templateData,
          name: 'Default Template',
          isdefault: true,
          createdat: new Date().toISOString(),
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating PDF template:', error);
    return NextResponse.json(
      { error: 'Failed to update PDF template' },
      { status: 500 }
    );
  }
}
