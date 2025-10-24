import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/quotes/[id]/approve
 * Approves or rejects a quote
 * Body: { action: 'approve' | 'reject', notes?: string }
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

    const body = await request.json();
    const { action, notes } = body;

    // Validate action
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject".' },
        { status: 400 }
      );
    }

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

    // Verify quote is in PENDING_APPROVAL status
    if (quote.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        {
          error: `Cannot ${action} quote. Quote must be in PENDING_APPROVAL status. Current status: ${quote.status}`
        },
        { status: 400 }
      );
    }

    // Prepare update data based on action
    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      updatedat: now,
      approvedby: 'system', // Placeholder until auth integration
      approvedat: now,
    };

    if (notes) {
      updateData.approvalnotes = notes;
    }

    if (action === 'approve') {
      updateData.status = 'SENT';
      updateData.isapproved = true;
    } else {
      updateData.status = 'REJECTED';
      updateData.isapproved = false;
    }

    // Update the quote
    const { data: updatedQuote, error: updateError } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update quote', details: updateError.message },
        { status: 500 }
      );
    }

    // Map lowercase database columns to camelCase for frontend
    const response = {
      id: updatedQuote.id,
      quoteNumber: updatedQuote.quotenumber,
      title: updatedQuote.title,
      clientId: updatedQuote.clientid,
      status: updatedQuote.status,
      discountMode: updatedQuote.discountmode,
      overallDiscount: updatedQuote.overalldiscount,
      taxRate: updatedQuote.taxrate,
      subtotal: updatedQuote.subtotal,
      grandTotal: updatedQuote.grandtotal,
      isApproved: updatedQuote.isapproved,
      approvedBy: updatedQuote.approvedby,
      approvedAt: updatedQuote.approvedat,
      approvalNotes: updatedQuote.approvalnotes,
      createdAt: updatedQuote.createdat,
      updatedAt: updatedQuote.updatedat,
    };

    return NextResponse.json({
      success: true,
      message: `Quote ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      quote: response,
    });
  } catch (error) {
    console.error('Unexpected error in approve endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
