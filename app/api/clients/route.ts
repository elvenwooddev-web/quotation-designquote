import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';

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
    // Use supabaseAdmin to bypass RLS when looking up the user profile
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('authuserid', authUser.id)
      .single();

    if (profileError || !userProfile) {
      console.error('User profile not found for auth user:', authUser.id, profileError);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, phone, address, source, expectedDealValue } = body;

    // Prepare insert data
    const insertData: any = {
      name,
      email,
      phone,
      address,
      source: source || 'Other', // Default to 'Other' if not provided
      createdby: userProfile.id, // Set client owner for RLS
    };

    // Add expectedDealValue only if it's provided and valid
    if (expectedDealValue !== undefined && expectedDealValue !== null && expectedDealValue !== '') {
      insertData.expecteddealvalue = Number(expectedDealValue);
    }

    // IMPORTANT: Use supabaseAdmin to bypass RLS for client creation
    // This is a server-side operation after verifying auth token
    const { data: client, error } = await supabaseAdmin
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



