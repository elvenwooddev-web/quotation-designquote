import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: permissions, error } = await supabase
      .from('role_permissions')
      .select('*')
      .order('role', { ascending: true })
      .order('resource', { ascending: true });

    if (error) throw error;

    // Map database columns to frontend format
    const mappedPermissions = permissions?.map(permission => ({
      ...permission,
      canCreate: permission.cancreate,
      canEdit: permission.canedit,
      canDelete: permission.candelete,
      canApprove: permission.canapprove,
      canExport: permission.canexport,
      createdAt: permission.createdat,
      updatedAt: permission.updatedat,
    })) || [];

    return NextResponse.json(mappedPermissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { permissions } = body;

    // Update all permissions with updatedat to satisfy database trigger
    for (const permission of permissions) {
      const { error } = await supabase
        .from('role_permissions')
        .update({
          cancreate: permission.canCreate,
          canedit: permission.canEdit,
          candelete: permission.canDelete,
          canapprove: permission.canApprove,
          canexport: permission.canExport,
          updatedat: new Date().toISOString(),
        })
        .eq('id', permission.id);

      if (error) {
        console.error('Error updating permission:', permission.id, error);
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    );
  }
}
