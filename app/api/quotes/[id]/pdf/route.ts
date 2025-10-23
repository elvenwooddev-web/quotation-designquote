import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateQuotePDF } from '@/lib/pdf-generator';

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

    // Check if quote status allows PDF generation
    if (quote.status === 'DRAFT' || quote.status === 'PENDING_APPROVAL') {
      return NextResponse.json(
        {
          error: 'PDF export not available',
          message: 'Quote must be approved before exporting to PDF. Current status: ' + quote.status
        },
        { status: 403 }
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
      type: 'TERMS' as const,
      title: 'Terms and Conditions',
      description: termsData.value,
      isActive: true,
      order: 1,
      id: 'terms-1',
      quoteId: quote.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }] : [];

    // Map database fields to frontend types (camelCase)
    const mappedQuote = {
      id: quote.id,
      title: quote.title,
      quoteNumber: quote.quotenumber,
      clientId: quote.clientid,
      discountMode: quote.discountmode,
      overallDiscount: quote.overalldiscount,
      taxRate: quote.taxrate,
      subtotal: quote.subtotal,
      discount: quote.discount,
      tax: quote.tax,
      grandTotal: quote.grandtotal,
      status: quote.status,
      version: quote.version || 1,
      isApproved: quote.isapproved,
      approvedBy: quote.approvedby,
      approvedAt: quote.approvedat,
      approvalNotes: quote.approvalnotes,
      createdAt: quote.createdat,
      updatedAt: quote.updatedat,
      client: quote.client ? {
        id: quote.client.id,
        name: quote.client.name,
        email: quote.client.email,
        phone: quote.client.phone,
        company: quote.client.company,
        address: quote.client.address,
        isActive: quote.client.isactive,
        createdAt: quote.client.createdat,
        updatedAt: quote.client.updatedat,
      } : null,
      items: quote.items.map((item: any) => ({
        id: item.id,
        quoteId: item.quoteid,
        productId: item.productid,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
        lineTotal: item.linetotal,
        order: item.order,
        dimensions: item.dimensions,
        createdAt: item.createdat,
        updatedAt: item.updatedat,
        product: {
          id: item.product.id,
          itemCode: item.product.itemcode,
          name: item.product.name,
          description: item.product.description,
          categoryId: item.product.categoryid,
          baseRate: item.product.baserate,
          imageUrl: item.product.imageurl,
          isActive: item.product.isactive,
          createdAt: item.product.createdat,
          updatedAt: item.product.updatedat,
          category: item.product.category ? {
            id: item.product.category.id,
            name: item.product.category.name,
            description: item.product.category.description,
            isActive: item.product.category.isactive,
            parentId: item.product.category.parentid,
            createdAt: item.product.category.createdat,
            updatedAt: item.product.category.updatedat,
          } : null,
        },
      })),
      policies: policies
    };

    // Track PDF export and update version if status is DRAFT
    if (quote.status === 'DRAFT') {
      // This is the first export, set status to SENT
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          status: 'SENT',
          updatedat: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('Failed to update quote status:', updateError);
      }
    } else {
      // Quote already sent, increment version for subsequent exports
      const newVersion = (quote.version || 1) + 1;
      const { error: versionError } = await supabase
        .from('quotes')
        .update({
          version: newVersion,
          updatedat: new Date().toISOString()
        })
        .eq('id', id);

      if (versionError) {
        console.error('Failed to update quote version:', versionError);
      }
    }

    // Record the export in quote_revisions table
    const { error: revisionError } = await supabase
      .from('quote_revisions')
      .insert({
        quoteid: quote.id,
        version: quote.version || 1,
        status: quote.status === 'DRAFT' ? 'SENT' : quote.status,
        exported_by: 'system', // In a real app, this would be the current user ID
        exported_at: new Date().toISOString(),
        changes: quote.status === 'DRAFT' ? 'Initial export - Status changed to SENT' : 'Re-exported',
        notes: null
      });

    if (revisionError) {
      console.error('Failed to record quote revision:', revisionError);
    }

    // Generate PDF without template
    const pdfBlob = await generateQuotePDF(mappedQuote);

    // Return PDF as response
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quote.quotenumber}.pdf"`,
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