import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      throw error;
    }

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        companyName: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        logoUrl: null,
      });
    }

    // Map database columns to frontend format
    const mappedSettings = {
      companyName: settings.companyname || '',
      email: settings.email || '',
      phone: settings.phone || '',
      website: settings.website || '',
      address: settings.address || '',
      logoUrl: settings.logourl || null,
    };

    return NextResponse.json(mappedSettings);
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, email, phone, website, address, logoUrl } = body;

    // Check if settings already exist
    const { data: existing } = await supabase
      .from('company_settings')
      .select('id')
      .single();

    const settingsData = {
      companyname: companyName,
      email,
      phone,
      website,
      address,
      logourl: logoUrl,
      updatedat: new Date().toISOString(),
    };

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('company_settings')
        .update(settingsData)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('company_settings')
        .insert({
          ...settingsData,
          createdat: new Date().toISOString(),
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating company settings:', error);
    return NextResponse.json(
      { error: 'Failed to update company settings' },
      { status: 500 }
    );
  }
}
