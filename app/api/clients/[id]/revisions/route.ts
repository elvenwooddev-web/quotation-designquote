import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
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

    const { data: revisions, error } = await supabase
      .from('client_revisions')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(revisions);
  } catch (error) {
    console.error('Error fetching client revisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client revisions' },
      { status: 500 }
    );
  }
}
