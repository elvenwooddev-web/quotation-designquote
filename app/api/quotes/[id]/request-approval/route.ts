import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/quotes/[id]/request-approval
 * Requests approval for a quote (changes status from DRAFT to PENDING_APPROVAL)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Create authenticated Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Fetch the quote to verify it exists and check current status
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Verify quote is in DRAFT status
    if (quote.status !== 'DRAFT') {
      return NextResponse.json(
        {
          error: `Cannot request approval. Quote must be in DRAFT status. Current status: ${quote.status}`
        },
        { status: 400 }
      );
    }

    // Update quote status to PENDING_APPROVAL
    const now = new Date().toISOString();
    const updateData = {
      status: 'PENDING_APPROVAL',
      updatedat: now,
      // Could add fields like: requestedby, requestedat if needed
    };

    const { data: updatedQuote, error: updateError } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        client:clients(*),
        template:pdf_templates(*),
        items:quote_items(
          *,
          product:products(
            *,
            category:categories(*)
          )
        ),
        policies:policy_clauses(*)
      `)
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to request approval', details: updateError.message },
        { status: 500 }
      );
    }

    // Map database columns to frontend format
    const mappedQuote = {
      ...updatedQuote,
      quoteNumber: updatedQuote.quotenumber,
      clientId: updatedQuote.clientid,
      templateId: updatedQuote.templateid,
      discountMode: updatedQuote.discountmode,
      overallDiscount: updatedQuote.overalldiscount,
      taxRate: updatedQuote.taxrate,
      grandTotal: updatedQuote.grandtotal,
      isApproved: updatedQuote.isapproved || false,
      createdAt: updatedQuote.createdat,
      updatedAt: updatedQuote.updatedat,
      client: updatedQuote.client ? {
        id: updatedQuote.client.id,
        name: updatedQuote.client.name,
        email: updatedQuote.client.email,
        phone: updatedQuote.client.phone,
        address: updatedQuote.client.address,
      } : null,
      items: (updatedQuote.items || []).map((item: any) => ({
        id: item.id,
        productId: item.productid,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
        lineTotal: item.linetotal,
        product: {
          name: item.product.name,
          unit: item.product.unit,
          category: {
            name: item.product.category.name,
          },
        },
      })),
      policies: (updatedQuote.policies || []).map((policy: any) => ({
        id: policy.id,
        type: policy.type,
        title: policy.title,
        description: policy.description,
        isActive: policy.isactive,
      })),
      template: updatedQuote.template ? {
        id: updatedQuote.template.id,
        name: updatedQuote.template.name,
        description: updatedQuote.template.description,
        category: updatedQuote.template.category,
        isDefault: updatedQuote.template.isdefault,
        isPublic: updatedQuote.template.ispublic,
        templateJson: updatedQuote.template.template_json,
        thumbnail: updatedQuote.template.thumbnail,
        createdBy: updatedQuote.template.createdby,
        createdAt: updatedQuote.template.createdat,
        updatedAt: updatedQuote.template.updatedat,
        version: updatedQuote.template.version,
      } : null,
    };

    return NextResponse.json({
      success: true,
      message: 'Approval request submitted successfully',
      quote: mappedQuote,
    });
  } catch (error) {
    console.error('Unexpected error in request-approval endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}