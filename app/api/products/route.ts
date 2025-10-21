import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .order('name', { ascending: true });

    if (categoryId) {
      query = query.eq('categoryid', categoryId);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    // Map database columns to frontend format
    const mappedProducts = products?.map(product => ({
      ...product,
      itemCode: product.itemcode,
      baseRate: product.baserate,
      categoryId: product.categoryid,
      imageUrl: product.imageurl,
      createdAt: product.createdat,
      updatedAt: product.updatedat,
    })) || [];

    return NextResponse.json(mappedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
        const { itemCode, name, description, unit, baseRate, categoryId, imageUrl } = body;

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        itemcode: itemCode,
        name,
        description,
        unit: unit || 'pcs',
        baserate: baseRate,
        categoryid: categoryId,
        imageurl: imageUrl,
      })
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (error) throw error;

    // Map database columns to frontend format
    const mappedProduct = {
      ...product,
      itemCode: product.itemcode,
      baseRate: product.baserate,
      categoryId: product.categoryid,
      imageUrl: product.imageurl,
      createdAt: product.createdat,
      updatedAt: product.updatedat,
    };

    return NextResponse.json(mappedProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}



