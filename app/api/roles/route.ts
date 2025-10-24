import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
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

    // Fetch all roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });

    if (rolesError) throw rolesError;

    // Get user count for each role
    const rolesWithCounts = await Promise.all(
      (roles || []).map(async (role) => {
        const { count, error: countError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('roleid', role.id);

        if (countError) {
          console.error(`Error counting users for role ${role.id}:`, countError);
        }

        return {
          id: role.id,
          name: role.name,
          description: role.description,
          isProtected: role.isprotected,
          createdAt: role.createdat,
          updatedAt: role.updatedat,
          userCount: count || 0,
        };
      })
    );

    return NextResponse.json(rolesWithCounts);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
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

    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Check for name uniqueness
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', name.trim())
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingRole) {
      return NextResponse.json(
        { error: 'A role with this name already exists' },
        { status: 409 }
      );
    }

    // Create new role
    const { data: role, error: createError } = await supabase
      .from('roles')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        isprotected: false,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) throw createError;

    // Create default permissions for the new role (all permissions set to false initially)
    const resources = ['categories', 'products', 'clients', 'quotes'];
    const defaultPermissions = resources.map((resource) => ({
      roleid: role.id,
      resource,
      canread: false,
      cancreate: false,
      canedit: false,
      candelete: false,
      canapprove: false,
      canexport: false,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
    }));

    const { error: permissionsError } = await supabase
      .from('role_permissions')
      .insert(defaultPermissions);

    if (permissionsError) {
      console.error('Error creating default permissions:', permissionsError);
      // Don't fail the role creation if permissions fail, just log it
    }

    // Map to frontend camelCase
    return NextResponse.json(
      {
        id: role.id,
        name: role.name,
        description: role.description,
        isProtected: role.isprotected,
        createdAt: role.createdat,
        updatedAt: role.updatedat,
        userCount: 0,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create role' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    // Fetch the role to check if it's protected
    const { data: existingRole, error: fetchError } = await supabase
      .from('roles')
      .select('isprotected')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    if (existingRole.isprotected) {
      return NextResponse.json(
        { error: 'Cannot update a protected role' },
        { status: 403 }
      );
    }

    // Check name uniqueness if name is being changed
    if (name && name.trim().length > 0) {
      const { data: duplicateRole, error: checkError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', name.trim())
        .neq('id', id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (duplicateRole) {
        return NextResponse.json(
          { error: 'A role with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update the role
    const updateData: any = {
      updatedat: new Date().toISOString(),
    };

    if (name && name.trim().length > 0) {
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    const { data: role, error: updateError } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Get user count
    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('roleid', role.id);

    // Map to frontend camelCase
    return NextResponse.json({
      id: role.id,
      name: role.name,
      description: role.description,
      isProtected: role.isprotected,
      createdAt: role.createdat,
      updatedAt: role.updatedat,
      userCount: count || 0,
    });
  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    // Fetch the role to check if it's protected
    const { data: existingRole, error: fetchError } = await supabase
      .from('roles')
      .select('isprotected')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    if (existingRole.isprotected) {
      return NextResponse.json(
        { error: 'Cannot delete a protected role' },
        { status: 403 }
      );
    }

    // Check if any users have this role
    const { count, error: countError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('roleid', id);

    if (countError) throw countError;

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete role. ${count} user(s) are assigned to this role.` },
        { status: 409 }
      );
    }

    // Delete the role
    const { error: deleteError } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      { message: 'Role deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete role' },
      { status: 500 }
    );
  }
}
