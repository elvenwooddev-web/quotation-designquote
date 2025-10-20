import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateQuotePDF } from '@/lib/pdf-generator';
import { PDFTemplate } from '@/lib/types';
import { generateSampleQuote } from '@/lib/sample-quote-data';

/**
 * GET /api/templates/[id]/preview
 * Generate a PDF preview of a template using sample quote data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch template from database
    const { data: templateData, error: templateError } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (templateError || !templateData) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Map database columns to frontend format
    const template: PDFTemplate = {
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

    // Generate sample quote data for preview
    const sampleQuote = generateSampleQuote();

    // Generate PDF with the template and sample data
    const pdfBlob = await generateQuotePDF(sampleQuote, template);

    // Convert blob to buffer for Next.js response
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Return PDF for inline viewing (not as download)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="template-preview.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating template preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate template preview' },
      { status: 500 }
    );
  }
}
