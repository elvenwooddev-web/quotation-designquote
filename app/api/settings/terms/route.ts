import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_TERMS = `<ol>
<li>All prices are quoted in USD and are exclusive of applicable taxes.</li>
<li>Payment terms are Net 30 days from the date of invoice.</li>
<li>This quotation is valid for a period of 30 days from the date of issue.</li>
</ol>`;

export async function GET(request: NextRequest) {
  try {
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

    const { data: terms, error } = await supabase
      .from('terms_conditions')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      throw error;
    }

    // If no terms exist, return defaults
    if (!terms) {
      return NextResponse.json({
        content: DEFAULT_TERMS,
      });
    }

    return NextResponse.json({
      content: terms.content || DEFAULT_TERMS,
    });
  } catch (error) {
    console.error('Error fetching terms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch terms and conditions' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
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
    const { content } = body;

    // Check if terms already exist
    const { data: existing } = await supabase
      .from('terms_conditions')
      .select('id')
      .single();

    const termsData = {
      content,
      updatedat: new Date().toISOString(),
    };

    if (existing) {
      // Update existing terms
      const { error } = await supabase
        .from('terms_conditions')
        .update(termsData)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new terms
      const { error } = await supabase
        .from('terms_conditions')
        .insert({
          ...termsData,
          createdat: new Date().toISOString(),
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating terms:', error);
    return NextResponse.json(
      { error: 'Failed to update terms and conditions' },
      { status: 500 }
    );
  }
}
