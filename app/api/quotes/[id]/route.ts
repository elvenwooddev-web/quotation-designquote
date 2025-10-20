import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: quote, error } = await supabase
      .from('quotes')
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
      .eq('id', id)
      .order('order', { foreignTable: 'quote_items', ascending: true })
      .order('order', { foreignTable: 'policy_clauses', ascending: true })
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Supabase specific error code for no rows found
        return NextResponse.json(
          { error: 'Quote not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Map database columns to frontend format
    const mappedQuote = {
      ...quote,
      quoteNumber: quote.quotenumber,
      clientId: quote.clientid,
      templateId: quote.templateid,
      discountMode: quote.discountmode,
      overallDiscount: quote.overalldiscount,
      taxRate: quote.taxrate,
      grandTotal: quote.grandtotal,
      createdAt: quote.createdat,
      updatedAt: quote.updatedat,
      template: quote.template ? {
        id: quote.template.id,
        name: quote.template.name,
        description: quote.template.description,
        category: quote.template.category,
        isDefault: quote.template.isdefault,
        isPublic: quote.template.ispublic,
        templateJson: quote.template.template_json,
        thumbnail: quote.template.thumbnail,
        createdBy: quote.template.createdby,
        createdAt: quote.template.createdat,
        updatedAt: quote.template.updatedat,
        version: quote.template.version,
      } : null,
    };

    return NextResponse.json(mappedQuote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, templateId } = body;

    // Build update object dynamically
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (templateId !== undefined) updateData.templateid = templateId;

    const { data: quote, error } = await supabase
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

    if (error) throw error;

    // Map database columns to frontend format
    const mappedQuote = {
      ...quote,
      quoteNumber: quote.quotenumber,
      clientId: quote.clientid,
      templateId: quote.templateid,
      discountMode: quote.discountmode,
      overallDiscount: quote.overalldiscount,
      taxRate: quote.taxrate,
      grandTotal: quote.grandtotal,
      createdAt: quote.createdat,
      updatedAt: quote.updatedat,
      template: quote.template ? {
        id: quote.template.id,
        name: quote.template.name,
        description: quote.template.description,
        category: quote.template.category,
        isDefault: quote.template.isdefault,
        isPublic: quote.template.ispublic,
        templateJson: quote.template.template_json,
        thumbnail: quote.template.thumbnail,
        createdBy: quote.template.createdby,
        createdAt: quote.template.createdat,
        updatedAt: quote.template.updatedat,
        version: quote.template.version,
      } : null,
    };

    return NextResponse.json(mappedQuote);
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}



