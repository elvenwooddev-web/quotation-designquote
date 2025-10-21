import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateQuotePDF } from '@/lib/pdf-generator';
import { PDFTemplate } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch quote with all related data
    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *,
        client:clients(*),
        items:quote_items(
          *,
          product:products(
            *,
            category:categories(*)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Fetch terms and conditions from settings
    const { data: termsData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'terms_conditions')
      .single();

    // Create policies array from settings terms
    const policies = termsData?.value ? [{
      type: 'TERMS',
      title: 'Terms and Conditions',
      description: termsData.value,
      isActive: true,
      order: 1,
    }] : [];

    // Map database columns to frontend format
    const mappedQuote = {
      ...quote,
      quoteNumber: quote.quotenumber,
      clientId: quote.clientid,
      discountMode: quote.discountmode,
      overallDiscount: quote.overalldiscount,
      taxRate: quote.taxrate,
      grandTotal: quote.grandtotal,
      createdAt: quote.createdat,
      updatedAt: quote.updatedat,
      items: quote.items?.map((item: any) => ({
        ...item,
        quoteId: item.quoteid,
        productId: item.productid,
        lineTotal: item.linetotal,
        createdAt: item.createdat,
        updatedAt: item.updatedat,
        product: item.product ? {
          ...item.product,
          baseRate: item.product.baserate,
          categoryId: item.product.categoryid,
          imageUrl: item.product.imageurl,
          createdAt: item.product.createdat,
          updatedAt: item.product.updatedat,
        } : null,
      })) || [],
      policies: policies,
    };

    // Load template for the quote (if templateid is set)
    let template: PDFTemplate | undefined;

    if (quote.templateid) {
      const { data: templateData, error: templateError } = await supabase
        .from('pdf_templates')
        .select('*')
        .eq('id', quote.templateid)
        .single();

      if (!templateError && templateData) {
        // Map database columns to frontend format
        template = {
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
      } else {
        console.warn(`Template ${quote.templateid} not found, using default template`);
      }
    } else {
      // No template specified, try to load the default template from database
      const { data: defaultTemplateData, error: defaultTemplateError } = await supabase
        .from('pdf_templates')
        .select('*')
        .eq('isdefault', true)
        .eq('ispublic', true)
        .limit(1)
        .single();

      if (!defaultTemplateError && defaultTemplateData) {
        template = {
          id: defaultTemplateData.id,
          name: defaultTemplateData.name,
          description: defaultTemplateData.description,
          category: defaultTemplateData.category,
          isDefault: defaultTemplateData.isdefault,
          isPublic: defaultTemplateData.ispublic,
          templateJson: defaultTemplateData.template_json,
          thumbnail: defaultTemplateData.thumbnail,
          createdBy: defaultTemplateData.createdby,
          createdAt: defaultTemplateData.createdat,
          updatedAt: defaultTemplateData.updatedat,
          version: defaultTemplateData.version,
        };
      }
      // If no default template in DB, generateQuotePDF will use the built-in default
    }

    // Handle status and revision tracking
    const currentVersion = quote.version || 1;
    const currentStatus = quote.status;
    let newStatus = currentStatus;
    let newVersion = currentVersion;

    // Auto-update status on first export (from DRAFT to SENT)
    if (currentStatus === 'DRAFT') {
      newStatus = 'SENT';
      newVersion = 1; // First version when sending
    } else if (currentStatus === 'SENT' || currentStatus === 'ACCEPTED') {
      // Increment version for subsequent exports
      newVersion = currentVersion + 1;
    }

    // Update quote with new status and version
    if (newStatus !== currentStatus || newVersion !== currentVersion) {
      await supabase
        .from('quotes')
        .update({
          status: newStatus,
          version: newVersion,
          updatedat: new Date().toISOString(),
        })
        .eq('id', id);
    }

    // Create revision history entry
    await supabase
      .from('quote_revisions')
      .insert({
        quoteid: id,
        version: newVersion,
        status: newStatus,
        exported_by: 'system', // TODO: Get from auth context
        exported_at: new Date().toISOString(),
        changes: {
          previous_status: currentStatus,
          new_status: newStatus,
          previous_version: currentVersion,
          new_version: newVersion,
        },
        notes: currentStatus === 'DRAFT' ? 'Initial quote export' : 'Quote re-exported',
      });

    // Generate PDF with template
    const pdfBlob = await generateQuotePDF(mappedQuote, template);

    // Convert blob to buffer for Next.js response
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Return PDF as downloadable file with version in filename
    const filename = `quote-${quote.quotenumber || id}-v${newVersion}.pdf`;
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
