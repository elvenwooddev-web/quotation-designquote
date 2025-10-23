import { RolePermission, PermissionResource } from './types';

/**
 * Check if user has permission for a specific action on a resource
 * @param permissions - Array of role permissions from auth context
 * @param resource - The resource to check (categories, products, clients, quotes)
 * @param action - The action to check (canCreate, canEdit, canDelete, canApprove, canExport, canRead)
 * @returns boolean indicating if user has permission
 */
export function hasPermission(
  permissions: RolePermission[],
  resource: PermissionResource,
  action: 'canCreate' | 'canEdit' | 'canDelete' | 'canApprove' | 'canExport' | 'canRead'
): boolean {
  if (!permissions || permissions.length === 0) {
    return false; // No permissions loaded
  }

  // Find the permission entry for this resource
  const permission = permissions.find(p => p.resource === resource);

  if (!permission) {
    return false; // No permission entry for this resource
  }

  // Check the specific action
  return permission[action] || false;
}

/**
 * Check if user has any permission for a resource
 * @param permissions - Array of role permissions from auth context
 * @param resource - The resource to check
 * @returns boolean indicating if user has any permission for the resource
 */
export function hasAnyPermission(
  permissions: RolePermission[],
  resource: PermissionResource
): boolean {
  const permission = permissions.find(p => p.resource === resource);

  if (!permission) {
    return false;
  }

  return (
    permission.canCreate ||
    permission.canEdit ||
    permission.canDelete ||
    permission.canApprove ||
    permission.canExport ||
    permission.canRead
  );
}
