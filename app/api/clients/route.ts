import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    // Get quote counts for each client
    const clientsWithCounts = await Promise.all(
      (clients || []).map(async (client) => {
        const { count } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('clientId', client.id);
        
        return {
          ...client,
          quoteCount: count || 0
        };
      })
    );

    return NextResponse.json(clientsWithCounts);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address } = body;

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name,
        email,
        phone,
        address,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}



