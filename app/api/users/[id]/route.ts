import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, isactive } = body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        name,
        email,
        role,
        isactive,
        // Don't include updatedat - database trigger handles it
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // IMPORTANT: Use supabaseAdmin to bypass RLS for admin operations
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error: Admin client not available' },
        { status: 500 }
      );
    }

    // Step 1: Get the user's auth ID before deleting
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('authuserid')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      throw new Error('User not found');
    }

    // Step 2: Delete from public.users table
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      throw profileError;
    }

    // Step 3: Delete from auth.users (if auth user exists)
    if (user.authuserid) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        user.authuserid
      );

      if (authError) {
        console.error('Error deleting auth user:', authError);
        // Don't throw - profile is already deleted
        // Just log the error
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
