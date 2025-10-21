import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    // Optimized query: Use a single query with aggregation instead of N+1 queries
    // This fetches all clients with their quote counts in one database call
    const { data: clients, error } = await supabase
      .from('clients')
      .select(`
        *,
        quotes:quotes(count)
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    // Map the aggregated counts to the quoteCount field
    const clientsWithCounts = (clients || []).map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      source: client.source,
      expecteddealvalue: client.expecteddealvalue,
      createdat: client.createdat,
      updatedat: client.updatedat,
      quoteCount: Array.isArray(client.quotes) ? client.quotes.length : 0
    }));

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
    const { name, email, phone, address, source, expectedDealValue } = body;

    // Prepare insert data
    const insertData: any = {
      name,
      email,
      phone,
      address,
      source: source || 'Other', // Default to 'Other' if not provided
    };

    // Add expectedDealValue only if it's provided and valid
    if (expectedDealValue !== undefined && expectedDealValue !== null && expectedDealValue !== '') {
      insertData.expecteddealvalue = Number(expectedDealValue);
    }

    const { data: client, error } = await supabase
      .from('clients')
      .insert(insertData)
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



