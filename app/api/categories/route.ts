import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        *,
        products (count)
      `)
      .order('order', { ascending: true });

    if (error) throw error;

    const categoriesWithCounts = categories?.map(cat => ({
      ...cat,
      itemCount: cat.products?.[0]?.count || 0
    }));

    return NextResponse.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, imageUrl, order } = body;

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name,
        description,
        imageUrl,
        order: order || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}



