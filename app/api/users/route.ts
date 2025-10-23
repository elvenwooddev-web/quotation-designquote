import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { User } from '@/lib/types';

export async function GET() {
  try {
    // Fetch users with role details
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          isprotected,
          createdat,
          updatedat
        )
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    // Map to frontend camelCase
    const mappedUsers = (users || []).map((user) => ({
      id: user.id,
      authUserId: user.authuserid,
      name: user.name,
      email: user.email,
      roleId: user.roleid,
      isActive: user.isactive,
      createdAt: user.createdat,
      updatedAt: user.updatedat,
      role: user.role ? user.role.name : null,
    }));

    return NextResponse.json(mappedUsers);
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
    const { name, email, password, roleId } = body;

    // Validate email domain
    if (!email.endsWith('@elvenwood.in')) {
      return NextResponse.json(
        { error: 'Only @elvenwood.in email addresses are allowed' },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate roleId
    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    // Verify the role exists
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('id', roleId)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      );
    }

    // Step 1: Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Failed to create auth user' },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Step 2: Create user profile in users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        authuserid: authData.user.id,
        name,
        email,
        roleid: roleId,
        isactive: true,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
      })
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          isprotected,
          createdat,
          updatedat
        )
      `)
      .single();

    if (userError) {
      // If profile creation fails, we should ideally delete the auth user
      // For now, just log and return error
      console.error('Profile creation failed after auth user created:', userError);
      return NextResponse.json(
        { error: userError.message || 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Map to frontend camelCase
    const mappedUser = {
      id: user.id,
      authUserId: user.authuserid,
      name: user.name,
      email: user.email,
      roleId: user.roleid,
      isActive: user.isactive,
      createdAt: user.createdat,
      updatedAt: user.updatedat,
      role: user.role ? user.role.name : null,
    };

    return NextResponse.json(mappedUser, { status: 201 });
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
    const { id, roleId, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {
      updatedat: new Date().toISOString(),
    };

    // Validate roleId if provided
    if (roleId !== undefined) {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('id', roleId)
        .single();

      if (roleError || !roleData) {
        return NextResponse.json(
          { error: 'Invalid role ID' },
          { status: 400 }
        );
      }
      updateData.roleid = roleId;
    }

    if (isActive !== undefined) {
      updateData.isactive = isActive;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          isprotected,
          createdat,
          updatedat
        )
      `)
      .single();

    if (error) throw error;

    // Map to frontend camelCase
    const mappedUser = {
      id: user.id,
      authUserId: user.authuserid,
      name: user.name,
      email: user.email,
      roleId: user.roleid,
      isActive: user.isactive,
      createdAt: user.createdat,
      updatedAt: user.updatedat,
      role: user.role ? user.role.name : null,
    };

    return NextResponse.json(mappedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
