import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateQuoteNumber, calculateQuoteTotals, calculateLineTotal } from '@/lib/calculations';

export async function GET() {
  try {
    const { data: quotes, error } = await supabase
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
      .order('createdat', { ascending: false });

    if (error) throw error;

    // Map database columns to frontend format
    const mappedQuotes = quotes?.map((quote: any) => ({
      ...quote,
      quoteNumber: quote.quotenumber,
      clientId: quote.clientid,
      templateId: quote.templateid,
      discountMode: quote.discountmode,
      overallDiscount: quote.overalldiscount,
      taxRate: quote.taxrate,
      grandTotal: quote.grandtotal,
      isApproved: quote.isapproved || false,
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
    })) || [];

    return NextResponse.json(mappedQuotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user from auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No auth token provided' },
        { status: 401 }
      );
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid auth token' },
        { status: 401 }
      );
    }

    // Get user profile to get the user UUID
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('authuserid', authUser.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      clientId,
      templateId,
      discountMode,
      overallDiscount,
      taxRate,
      items,
      policies,
      status, // Accept status from request body
    } = body;

    // Role-based status assignment is handled client-side in QuoteActions component
    // - Sales Executives: quotes are created with status='PENDING_APPROVAL'
    // - Admins/Sales Heads: quotes are created with status='DRAFT'
    // Future enhancement: Add server-side validation to ensure status matches user role
    const quoteStatus = status || 'DRAFT';

    // Calculate line totals for items
    const itemsWithTotals = items.map((item: any, index: number) => ({
      productid: item.productId,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      discount: item.discount || 0,
      linetotal: calculateLineTotal(item.quantity, item.rate, item.discount || 0),
      order: index,
      dimensions: item.dimensions,
    }));

    // Fetch products to get category info for calculations
    const productIds = items.map((item: any) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .in('id', productIds);

    if (productsError) throw productsError;

    const itemsWithProducts = itemsWithTotals.map((item: any) => ({
      ...item,
      product: products!.find((p) => p.id === item.productid)!,
    }));

    // Calculate totals
    const calculations = calculateQuoteTotals(
      itemsWithProducts as any,
      discountMode,
      overallDiscount || 0,
      taxRate || 18
    );

    // Create quote with version 1 for new quotes
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        title,
        quotenumber: generateQuoteNumber(),
        clientid: clientId || null,
        templateid: templateId || null,
        discountmode: discountMode,
        overalldiscount: overallDiscount || 0,
        taxrate: taxRate || 18,
        subtotal: calculations.subtotal,
        discount: calculations.discount,
        tax: calculations.tax,
        grandtotal: calculations.grandTotal,
        status: quoteStatus, // Use the determined status
        version: 1, // New quotes start at version 1
        createdby: userProfile.id, // Set quote owner for RLS
      })
      .select()
      .single();

    if (quoteError) throw quoteError;

    // Create quote items
    const itemsToInsert = itemsWithTotals.map((item: any) => ({
      ...item,
      quoteid: quote.id,
    }));

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // Create policy clauses
    if (policies && policies.length > 0) {
      const policiesToInsert = policies.map((policy: any, index: number) => ({
        quoteid: quote.id,
        type: policy.type,
        title: policy.title,
        description: policy.description,
        isactive: policy.isActive,
        order: index,
      }));

      const { error: policiesError } = await supabase
        .from('policy_clauses')
        .insert(policiesToInsert);

      if (policiesError) throw policiesError;
    }

    // Fetch complete quote with relations
    const { data: completeQuote, error: fetchError } = await supabase
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
      .eq('id', quote.id)
      .single();

    if (fetchError) throw fetchError;

    // Map database columns to frontend format
    const mappedQuote = {
      ...completeQuote,
      quoteNumber: completeQuote.quotenumber,
      clientId: completeQuote.clientid,
      templateId: completeQuote.templateid,
      discountMode: completeQuote.discountmode,
      overallDiscount: completeQuote.overalldiscount,
      taxRate: completeQuote.taxrate,
      grandTotal: completeQuote.grandtotal,
      createdAt: completeQuote.createdat,
      updatedAt: completeQuote.updatedat,
      template: completeQuote.template ? {
        id: completeQuote.template.id,
        name: completeQuote.template.name,
        description: completeQuote.template.description,
        category: completeQuote.template.category,
        isDefault: completeQuote.template.isdefault,
        isPublic: completeQuote.template.ispublic,
        templateJson: completeQuote.template.template_json,
        thumbnail: completeQuote.template.thumbnail,
        createdBy: completeQuote.template.createdby,
        createdAt: completeQuote.template.createdat,
        updatedAt: completeQuote.template.updatedat,
        version: completeQuote.template.version,
      } : null,
    };

    return NextResponse.json(mappedQuote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}



