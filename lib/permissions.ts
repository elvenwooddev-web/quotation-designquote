import { UserRole, PermissionResource } from './types';

export async function checkPermission(
  userRole: UserRole,
  resource: PermissionResource,
  action: 'canCreate' | 'canEdit' | 'canDelete' | 'canApprove' | 'canExport'
): Promise<boolean> {
  try {
    const response = await fetch('/api/permissions');
    const permissions = await response.json();
    
    const permission = permissions.find(
      (p: any) => p.role === userRole && p.resource === resource
    );
    
    return permission?.[action] || false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

export function hasPermission(
  userRole: UserRole,
  resource: PermissionResource,
  action: 'canCreate' | 'canEdit' | 'canDelete' | 'canApprove' | 'canExport'
): boolean {
  // Quick permission check without API call
  // This matches the permissions we inserted into the database
  
  if (userRole === 'Admin') {
    return true; // Admin has all permissions
  }
  
  if (userRole === 'Designer') {
    return action !== 'canDelete'; // Designer can do everything except delete
  }
  
  if (userRole === 'Client') {
    return action === 'canApprove'; // Client can only approve
  }
  
  return false;
}
