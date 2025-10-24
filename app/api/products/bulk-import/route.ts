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
    console.log('=== Starting bulk import ===');

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.error('No authorization token provided');
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    console.log('Authorization token received');

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
    console.log('CSV data received, length:', csvData?.length);

    if (!csvData) {
      return NextResponse.json(
        { error: 'No CSV data provided' },
        { status: 400 }
      );
    }

    // Parse CSV data
    const lines = csvData.split('\n').filter((line: string) => line.trim());
    console.log('Total lines (including header):', lines.length);

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no data rows' },
        { status: 400 }
      );
    }

    // Helper function to parse CSV line (handles quoted fields with commas)
    function parseCSVLine(line: string): string[] {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    }

    // Use parseCSVLine for headers too (consistency)
    const headers = parseCSVLine(lines[0]);
    console.log('Headers found:', headers);

    // Validate required headers (case-insensitive)
    const requiredHeaders = ['Item Name', 'UOM', 'Rate', 'Category'];
    const headersLower = headers.map(h => h.toLowerCase());
    const missingHeaders = requiredHeaders.filter(h => !headersLower.includes(h.toLowerCase()));

    if (missingHeaders.length > 0) {
      console.error('Missing headers:', missingHeaders);
      console.error('Available headers:', headers);
      return NextResponse.json(
        { error: `Missing required columns: ${missingHeaders.join(', ')}. Found: ${headers.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch all categories to map names to IDs
    console.log('Fetching existing categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    console.log('Existing categories:', categories?.length || 0);

    const categoryMap = new Map(
      categories?.map(cat => [cat.name.toLowerCase(), cat.id]) || []
    );

    // Parse rows with proper CSV parsing
    const rows: CSVRow[] = lines.slice(1).map((line: string) => {
      const values = parseCSVLine(line);
      const row: any = {};
      headers.forEach((header: string, index: number) => {
        row[header] = values[index] || '';
      });
      return row as CSVRow;
    });

    let imported = 0;
    let skipped = 0;
    let categoriesCreated = 0;
    const errors: string[] = [];
    const createdCategories = new Set<string>();

    console.log(`Processing ${rows.length} rows...`);

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

        // Find or create category
        const categoryNameLower = row['Category'].toLowerCase();
        let categoryId = categoryMap.get(categoryNameLower);

        if (!categoryId) {
          // Category doesn't exist, create it
          console.log(`Creating new category: ${row['Category']}`);
          const { data: newCategory, error: createCategoryError } = await supabase
            .from('categories')
            .insert({
              name: row['Category'],
              description: `Auto-created from bulk import`,
              order: 999 // Put auto-created categories at the end
            })
            .select('id')
            .single();

          if (createCategoryError) {
            errors.push(`Row ${rowNum}: Failed to create category "${row['Category']}" - ${createCategoryError.message}`);
            skipped++;
            continue;
          }

          categoryId = newCategory.id;
          categoryMap.set(categoryNameLower, categoryId);

          // Track created categories
          if (!createdCategories.has(row['Category'])) {
            createdCategories.add(row['Category']);
            categoriesCreated++;
          }
        }

        // Insert product
        const productData = {
          itemcode: row['Item Code'] || null,
          name: row['Item Name'],
          description: row['Description'] || null,
          unit: row['UOM'],
          baserate: rate,
          categoryid: categoryId,
        };

        console.log(`Row ${rowNum}: Inserting product:`, {
          name: productData.name,
          unit: productData.unit,
          rate: productData.baserate,
          category: row['Category']
        });

        const { error: insertError } = await supabase
          .from('products')
          .insert(productData);

        if (insertError) {
          // Check if it's a duplicate item code error
          if (insertError.code === '23505') {
            errors.push(`Row ${rowNum}: Duplicate item code "${row['Item Code']}"`);
          } else {
            console.error(`Row ${rowNum} insert error:`, insertError);
            errors.push(`Row ${rowNum}: ${insertError.message}`);
          }
          skipped++;
        } else {
          imported++;
        }
      } catch (err: any) {
        console.error(`Row ${rowNum} exception:`, err);
        errors.push(`Row ${rowNum}: ${err.message}`);
        skipped++;
      }
    }

    console.log(`Import complete: ${imported} imported, ${skipped} skipped, ${categoriesCreated} categories created`);

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      categoriesCreated,
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
