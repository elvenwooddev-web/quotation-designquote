import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { User } from '@/lib/types';

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // For demo purposes, create user directly without Supabase Auth
    // In production, you would use supabase.auth.signUp() or admin.createUser()
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        role: role || 'Client',
        isactive: true,
      })
      .select()
      .single();

    if (userError) throw userError;

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, role, isactive } = body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        role,
        isactive,
        updatedat: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
