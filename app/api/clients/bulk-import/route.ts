import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface CSVRow {
  'Name': string;
  'Email'?: string;
  'Phone'?: string;
  'Source'?: string;
  'Address'?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Starting client bulk import ===');

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

    // Get current user for createdby field
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid auth token' },
        { status: 401 }
      );
    }

    // Get user profile to get the user UUID
    const { data: userProfile, error: profileError } = await supabase
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
    const requiredHeaders = ['Name'];
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
    const errors: string[] = [];

    console.log(`Processing ${rows.length} rows...`);

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because of header and 0-index

      try {
        // Validate required fields
        if (!row['Name']) {
          errors.push(`Row ${rowNum}: Missing required field 'Name'`);
          skipped++;
          continue;
        }

        // Validate email format if provided
        if (row['Email'] && row['Email'].trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(row['Email'])) {
            errors.push(`Row ${rowNum}: Invalid email format`);
            skipped++;
            continue;
          }
        }

        // Insert client
        const clientData: any = {
          name: row['Name'],
          email: row['Email'] || null,
          phone: row['Phone'] || null,
          address: row['Address'] || null,
          source: row['Source'] || 'Other', // Default to 'Other' if not provided
          createdby: userProfile.id, // Set client owner for RLS
        };

        console.log(`Row ${rowNum}: Inserting client:`, {
          name: clientData.name,
          email: clientData.email,
          source: clientData.source
        });

        const { error: insertError } = await supabase
          .from('clients')
          .insert(clientData);

        if (insertError) {
          // Check if it's a duplicate email error
          if (insertError.code === '23505') {
            errors.push(`Row ${rowNum}: Duplicate email "${row['Email']}"`);
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

    console.log(`Import complete: ${imported} imported, ${skipped} skipped`);

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error importing clients:', error);
    return NextResponse.json(
      { error: 'Failed to import clients' },
      { status: 500 }
    );
  }
}
