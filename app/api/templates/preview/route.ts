import { NextRequest, NextResponse } from 'next/server';
import { generateQuotePDF } from '@/lib/pdf-generator';
import { generateSampleQuote } from '@/lib/sample-quote-data';
import { PDFTemplate } from '@/lib/types';

/**
 * POST /api/templates/preview
 * Generate PDF preview for a template object (for unsaved templates)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template } = body as { template: PDFTemplate };

    if (!template) {
      return NextResponse.json(
        { error: 'Template data is required' },
        { status: 400 }
      );
    }

    // Generate sample quote data
    const sampleQuote = generateSampleQuote();

    // Generate PDF with the provided template
    const pdfBlob = await generateQuotePDF(sampleQuote, template);

    // Convert blob to buffer for response
    const buffer = await pdfBlob.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="template-preview.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating template preview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF preview' },
      { status: 500 }
    );
  }
}
