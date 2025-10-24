import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface CSVRow {
  'Item Code'?: string;
  'Item Name': string;
  'Description'?: string;
  'UOM': string;
  'Rate': string;
  'Category': string;
}

export async function POST(request: NextRequest) {
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

    const { csvData } = await request.json();

    if (!csvData) {
      return NextResponse.json(
        { error: 'No CSV data provided' },
        { status: 400 }
      );
    }

    // Parse CSV data
    const lines = csvData.split('\n').filter((line: string) => line.trim());
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no data rows' },
        { status: 400 }
      );
    }

    const headers = lines[0].split(',').map((h: string) => h.trim());

    // Validate required headers
    const requiredHeaders = ['Item Name', 'UOM', 'Rate', 'Category'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch all categories to map names to IDs
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) throw categoriesError;

    const categoryMap = new Map(
      categories?.map(cat => [cat.name.toLowerCase(), cat.id]) || []
    );

    // Parse rows
    const rows: CSVRow[] = lines.slice(1).map((line: string) => {
      const values = line.split(',').map((v: string) => v.trim());
      const row: any = {};
      headers.forEach((header: string, index: number) => {
        row[header] = values[index] || '';
      });
      return row as CSVRow;
    });

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because of header and 0-index

      try {
        // Validate required fields
        if (!row['Item Name'] || !row['UOM'] || !row['Rate'] || !row['Category']) {
          errors.push(`Row ${rowNum}: Missing required fields`);
          skipped++;
          continue;
        }

        // Validate rate is a number
        const rate = parseFloat(row['Rate']);
        if (isNaN(rate) || rate < 0) {
          errors.push(`Row ${rowNum}: Invalid rate value`);
          skipped++;
          continue;
        }

        // Find category ID
        const categoryId = categoryMap.get(row['Category'].toLowerCase());
        if (!categoryId) {
          errors.push(`Row ${rowNum}: Category "${row['Category']}" not found`);
          skipped++;
          continue;
        }

        // Insert product
        const { error: insertError } = await supabase
          .from('products')
          .insert({
            itemcode: row['Item Code'] || null,
            name: row['Item Name'],
            description: row['Description'] || null,
            unit: row['UOM'],
            baserate: rate,
            categoryid: categoryId,
          });

        if (insertError) {
          // Check if it's a duplicate item code error
          if (insertError.code === '23505') {
            errors.push(`Row ${rowNum}: Duplicate item code "${row['Item Code']}"`);
          } else {
            errors.push(`Row ${rowNum}: ${insertError.message}`);
          }
          skipped++;
        } else {
          imported++;
        }
      } catch (err: any) {
        errors.push(`Row ${rowNum}: ${err.message}`);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    );
  }
}
