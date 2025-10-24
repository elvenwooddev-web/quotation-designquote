import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the authorization token from the request header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Create an authenticated Supabase client
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

    const { data: client, error } = await supabase
      .from('clients')
      .select(`
        *,
        quotes:quotes(
          id, title, quotenumber, status, grandtotal, createdat
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Map database columns to frontend format
    const mappedClient = {
      ...client,
      quotes: (client.quotes || []).map((quote: any) => ({
        id: quote.id,
        title: quote.title,
        quoteNumber: quote.quotenumber,
        status: quote.status,
        grandTotal: quote.grandtotal,
        createdAt: quote.createdat,
      })),
    };

    return NextResponse.json(mappedClient);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
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
    const { name, email, phone, address, source, expectedDealValue } = body;

    // Get the authorization token from the request header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Create an authenticated Supabase client
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

    // Get the current client data for revision logging
    const { data: currentClient, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone,
      address,
      source: source || 'Other',
      updatedat: new Date().toISOString(),
    };

    // Add expectedDealValue only if it's provided
    if (expectedDealValue !== undefined && expectedDealValue !== null && expectedDealValue !== '') {
      updateData.expecteddealvalue = Number(expectedDealValue);
    } else {
      // Explicitly set to null if empty string or null provided
      updateData.expecteddealvalue = null;
    }

    // Update the client
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log revision history
    const changes = {
      summary: `Updated client information`,
      fields: {
        name: { from: currentClient.name, to: name },
        email: { from: currentClient.email, to: email },
        phone: { from: currentClient.phone, to: phone },
        address: { from: currentClient.address, to: address },
        source: { from: currentClient.source, to: source },
        expectedDealValue: { from: currentClient.expecteddealvalue, to: expectedDealValue },
      }
    };

    await supabase
      .from('client_revisions')
      .insert({
        client_id: id,
        changed_by: 'system', // In a real app, this would be the current user
        changes: changes,
      });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
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

    // Get the authorization token from the request header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Create an authenticated Supabase client
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

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
