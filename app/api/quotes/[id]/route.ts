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
      isApproved: quote.isapproved || false,
      createdAt: quote.createdat,
      updatedAt: quote.updatedat,
      client: quote.client ? {
        id: quote.client.id,
        name: quote.client.name,
        email: quote.client.email,
        phone: quote.client.phone,
        address: quote.client.address,
      } : null,
      items: (quote.items || []).map((item: any) => ({
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
      policies: (quote.policies || []).map((policy: any) => ({
        id: policy.id,
        type: policy.type,
        title: policy.title,
        description: policy.description,
        isActive: policy.isactive,
      })),
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

    // Check if this is a simple status/template update or a full quote update
    const isFullUpdate = body.items !== undefined;

    if (!isFullUpdate) {
      // Simple update for status or template changes
      const { status, templateId } = body;
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (templateId !== undefined) updateData.templateid = templateId;
      updateData.updatedat = new Date().toISOString();

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
        isApproved: quote.isapproved || false,
        createdAt: quote.createdat,
        updatedAt: quote.updatedat,
        client: quote.client ? {
          id: quote.client.id,
          name: quote.client.name,
          email: quote.client.email,
          phone: quote.client.phone,
          address: quote.client.address,
        } : null,
        items: (quote.items || []).map((item: any) => ({
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
        policies: (quote.policies || []).map((policy: any) => ({
          id: policy.id,
          type: policy.type,
          title: policy.title,
          description: policy.description,
          isActive: policy.isactive,
        })),
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
    }

    // Full quote update with items and policies
    const {
      title,
      clientId,
      templateId,
      discountMode,
      overallDiscount,
      taxRate,
      items,
      policies,
    } = body;

    // Get current quote for revision tracking
    const { data: currentQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Get the current version and increment it
    const currentVersion = currentQuote.version || 1;
    const newVersion = currentVersion + 1;

    // Fetch product details for each item to get category info
    const itemsWithProducts = await Promise.all(
      items.map(async (item: any) => {
        const { data: product } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('id', item.productId)
          .single();

        return {
          ...item,
          product,
        };
      })
    );

    // Calculate totals using the same logic as quote creation
    const { calculateQuoteTotals, calculateLineTotal } = await import('@/lib/calculations');

    const itemsWithTotals = itemsWithProducts.map((item: any, index: number) => ({
      ...item,
      order: index,
      lineTotal: calculateLineTotal(item.quantity, item.rate, item.discount),
    }));

    const totals = calculateQuoteTotals(
      itemsWithTotals,
      discountMode,
      overallDiscount,
      taxRate
    );

    // Update quote header with incremented version
    const { data: updatedQuote, error: quoteError } = await supabase
      .from('quotes')
      .update({
        title,
        clientid: clientId,
        templateid: templateId,
        discountmode: discountMode,
        overalldiscount: overallDiscount,
        taxrate: taxRate,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        grandtotal: totals.grandTotal,
        version: newVersion, // Increment version on edit
        updatedat: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (quoteError) throw quoteError;

    // Delete existing items and policies
    await supabase.from('quote_items').delete().eq('quoteid', id);
    await supabase.from('policy_clauses').delete().eq('quoteid', id);

    // Insert new items
    if (items && items.length > 0) {
      const itemsToInsert = itemsWithTotals.map((item: any, index: number) => ({
        quoteid: id,
        productid: item.productId,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
        linetotal: item.lineTotal,
        order: index,
        dimensions: item.dimensions || null,
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    // Insert new policies
    if (policies && policies.length > 0) {
      const policiesToInsert = policies.map((policy: any, index: number) => ({
        quoteid: id,
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

    // Create revision history entry
    const changes = {
      summary: 'Quote updated',
      fields: {
        title: { from: currentQuote.title, to: title },
        clientId: { from: currentQuote.clientid, to: clientId },
        discountMode: { from: currentQuote.discountmode, to: discountMode },
        overallDiscount: { from: currentQuote.overalldiscount, to: overallDiscount },
        taxRate: { from: currentQuote.taxrate, to: taxRate },
        grandTotal: { from: currentQuote.grandtotal, to: totals.grandTotal },
      },
      itemsCount: items.length,
      policiesCount: policies.filter((p: any) => p.isActive).length,
    };

    await supabase.from('quote_revisions').insert({
      quoteid: id,
      version: currentQuote.version || 1,
      status: currentQuote.status,
      exported_by: 'system',
      exported_at: new Date().toISOString(),
      changes,
      notes: 'Quote edited and saved',
    });

    // Fetch updated quote with all relations
    const { data: finalQuote, error: finalError } = await supabase
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

    if (finalError) throw finalError;

    // Map database columns to frontend format
    const mappedQuote = {
      ...finalQuote,
      quoteNumber: finalQuote.quotenumber,
      clientId: finalQuote.clientid,
      templateId: finalQuote.templateid,
      discountMode: finalQuote.discountmode,
      overallDiscount: finalQuote.overalldiscount,
      taxRate: finalQuote.taxrate,
      grandTotal: finalQuote.grandtotal,
      isApproved: finalQuote.isapproved || false,
      createdAt: finalQuote.createdat,
      updatedAt: finalQuote.updatedat,
      client: finalQuote.client ? {
        id: finalQuote.client.id,
        name: finalQuote.client.name,
        email: finalQuote.client.email,
        phone: finalQuote.client.phone,
        address: finalQuote.client.address,
      } : null,
      items: (finalQuote.items || []).map((item: any) => ({
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
      policies: (finalQuote.policies || []).map((policy: any) => ({
        id: policy.id,
        type: policy.type,
        title: policy.title,
        description: policy.description,
        isActive: policy.isactive,
      })),
      template: finalQuote.template ? {
        id: finalQuote.template.id,
        name: finalQuote.template.name,
        description: finalQuote.template.description,
        category: finalQuote.template.category,
        isDefault: finalQuote.template.isdefault,
        isPublic: finalQuote.template.ispublic,
        templateJson: finalQuote.template.template_json,
        thumbnail: finalQuote.template.thumbnail,
        createdBy: finalQuote.template.createdby,
        createdAt: finalQuote.template.createdat,
        updatedAt: finalQuote.template.updatedat,
        version: finalQuote.template.version,
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



