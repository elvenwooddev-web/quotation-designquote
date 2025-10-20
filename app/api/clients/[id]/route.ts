import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: client, error } = await supabase
      .from('clients')
      .select(`
        *,
        quotes:quotes(
          id, title, quoteNumber, status, grandTotal, createdat
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

    return NextResponse.json(client);
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
    const { name, email, phone, address } = body;

    // Get the current client data for revision logging
    const { data: currentClient, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Update the client
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update({
        name,
        email,
        phone,
        address,
        updatedat: new Date().toISOString(),
      })
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
