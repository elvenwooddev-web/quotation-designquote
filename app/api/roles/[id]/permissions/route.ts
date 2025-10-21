import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify the role exists
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('id', id)
      .single();

    if (roleError || !role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Fetch all permissions for this role
    const { data: permissions, error: permissionsError } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('roleid', id)
      .order('resource', { ascending: true });

    if (permissionsError) throw permissionsError;

    // Map to frontend camelCase
    const mappedPermissions = (permissions || []).map((perm) => ({
      id: perm.id,
      roleId: perm.roleid,
      resource: perm.resource,
      canRead: perm.canread,
      canCreate: perm.cancreate,
      canEdit: perm.canedit,
      canDelete: perm.candelete,
      canApprove: perm.canapprove,
      canExport: perm.canexport,
    }));

    return NextResponse.json(mappedPermissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role permissions' },
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
    const { permissions } = body;

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Permissions must be an array' },
        { status: 400 }
      );
    }

    // Verify the role exists
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id, isprotected')
      .eq('id', id)
      .single();

    if (roleError || !role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Process each permission update
    const results = await Promise.all(
      permissions.map(async (perm) => {
        const {
          resource,
          canRead,
          canCreate,
          canEdit,
          canDelete,
          canApprove,
          canExport,
        } = perm;

        // Check if permission already exists for this role and resource
        const { data: existing, error: checkError } = await supabase
          .from('role_permissions')
          .select('id')
          .eq('roleid', id)
          .eq('resource', resource)
          .maybeSingle();

        if (checkError) throw checkError;

        const permissionData = {
          roleid: id,
          resource: resource,
          canread: canRead ?? true,
          cancreate: canCreate ?? false,
          canedit: canEdit ?? false,
          candelete: canDelete ?? false,
          canapprove: canApprove ?? false,
          canexport: canExport ?? false,
          updatedat: new Date().toISOString(),
        };

        if (existing) {
          // Update existing permission
          const { data, error } = await supabase
            .from('role_permissions')
            .update(permissionData)
            .eq('id', existing.id)
            .select()
            .single();

          if (error) throw error;
          return data;
        } else {
          // Create new permission
          const { data, error } = await supabase
            .from('role_permissions')
            .insert({
              ...permissionData,
              createdat: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;
          return data;
        }
      })
    );

    // Map results to frontend camelCase
    const mappedResults = results.map((perm) => ({
      id: perm.id,
      roleId: perm.roleid,
      resource: perm.resource,
      canRead: perm.canread,
      canCreate: perm.cancreate,
      canEdit: perm.canedit,
      canDelete: perm.candelete,
      canApprove: perm.canapprove,
      canExport: perm.canexport,
    }));

    return NextResponse.json(mappedResults);
  } catch (error: any) {
    console.error('Error updating role permissions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update role permissions' },
      { status: 500 }
    );
  }
}
