import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/roles/[id] - Get a single role
export async function GET(request: NextRequest, props: RouteParams) {
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

    const params = await props.params;
    const { id } = params;

    const { data: role, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error: any) {
    console.error('Error fetching role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/roles/[id] - Update a role
export async function PUT(request: NextRequest, props: RouteParams) {
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

    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    // Check if role is protected
    const { data: existingRole, error: fetchError } = await supabase
      .from('roles')
      .select('isprotected')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (existingRole.isprotected) {
      return NextResponse.json(
        { error: 'Cannot modify protected role' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('roles')
      .update({
        name: body.name,
        description: body.description,
        updatedat: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/roles/[id] - Delete a role
export async function DELETE(request: NextRequest, props: RouteParams) {
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

    const params = await props.params;
    const { id } = params;

    // Check if role is protected
    const { data: role, error: fetchError } = await supabase
      .from('roles')
      .select('isprotected, name')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (role.isprotected) {
      return NextResponse.json(
        { error: `Cannot delete protected role: ${role.name}` },
        { status: 403 }
      );
    }

    // Check if any users have this role
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('roleid', id)
      .limit(1);

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 400 });
    }

    if (users && users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that is assigned to users' },
        { status: 409 }
      );
    }

    // Delete role permissions first (foreign key constraint)
    const { error: permissionsError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('roleid', id);

    if (permissionsError) {
      return NextResponse.json(
        { error: permissionsError.message },
        { status: 400 }
      );
    }

    // Delete the role
    const { error: deleteError } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
