import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
