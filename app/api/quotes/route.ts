import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateQuoteNumber, calculateQuoteTotals, calculateLineTotal } from '@/lib/calculations';

export async function GET() {
  try {
    const quotes = await prisma.quote.findMany({
      include: {
        client: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        policies: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      clientId,
      discountMode,
      overallDiscount,
      taxRate,
      items,
      policies,
    } = body;

    // Calculate line totals for items
    const itemsWithTotals = items.map((item: any, index: number) => ({
      productId: item.productId,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      discount: item.discount || 0,
      lineTotal: calculateLineTotal(item.quantity, item.rate, item.discount || 0),
      order: index,
      dimensions: item.dimensions,
    }));

    // Fetch products to get category info for calculations
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    const itemsWithProducts = itemsWithTotals.map((item: any) => ({
      ...item,
      product: products.find((p) => p.id === item.productId)!,
    }));

    // Calculate totals
    const calculations = calculateQuoteTotals(
      itemsWithProducts as any,
      discountMode,
      overallDiscount || 0,
      taxRate || 18
    );

    // Create quote with items and policies
    const quote = await prisma.quote.create({
      data: {
        title,
        quoteNumber: generateQuoteNumber(),
        clientId: clientId || null,
        discountMode,
        overallDiscount: overallDiscount || 0,
        taxRate: taxRate || 18,
        subtotal: calculations.subtotal,
        discount: calculations.discount,
        tax: calculations.tax,
        grandTotal: calculations.grandTotal,
        items: {
          create: itemsWithTotals,
        },
        policies: {
          create: policies.map((policy: any, index: number) => ({
            type: policy.type,
            title: policy.title,
            description: policy.description,
            isActive: policy.isActive,
            order: index,
          })),
        },
      },
      include: {
        client: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        policies: true,
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}



