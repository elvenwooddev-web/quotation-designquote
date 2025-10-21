'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Shield } from 'lucide-react';

interface Permission {
  id: string;
  roleId: string;
  resource: string;
  canCreate: boolean;
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

interface PermissionsEditorProps {
  roleId: string;
  roleName: string;
  isProtected: boolean;
  embedded?: boolean;
  onSaveComplete?: () => void;
}

const RESOURCES = [
  { id: 'categories', label: 'Categories', description: 'Product categories and organization' },
  { id: 'products', label: 'Products', description: 'Product catalog and pricing' },
  { id: 'clients', label: 'Clients', description: 'Client information and contacts' },
  { id: 'quotes', label: 'Quotes', description: 'Quotations and proposals' },
];

const PERMISSION_COLUMNS = [
  { key: 'canCreate', label: 'Create', description: 'Create new records' },
  { key: 'canRead', label: 'Read', description: 'View and access records' },
  { key: 'canEdit', label: 'Edit', description: 'Modify existing records' },
  { key: 'canDelete', label: 'Delete', description: 'Remove records' },
  { key: 'canApprove', label: 'Approve', description: 'Approve quotes and changes' },
  { key: 'canExport', label: 'Export', description: 'Export data and reports' },
];

export function PermissionsEditor({ roleId, roleName, isProtected, embedded = false, onSaveComplete }: PermissionsEditorProps) {
  const [permissions, setPermissions] = useState<Record<string, Permission>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`);
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();

      // Convert array to object keyed by resource
      const permissionsMap: Record<string, Permission> = {};
      data.forEach((perm: Permission) => {
        permissionsMap[perm.resource] = perm;
      });

      setPermissions(permissionsMap);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      alert('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [roleId]);

  const handlePermissionChange = (resource: string, permissionKey: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [permissionKey]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: Object.values(permissions),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save permissions');
      }

      setHasChanges(false);

      if (embedded && onSaveComplete) {
        // In embedded mode, notify parent to close instead of showing alert
        onSaveComplete();
      } else {
        alert('Permissions saved successfully');
      }
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      alert(error.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading permissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Permissions for {roleName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure what users with this role can do
            </p>
            {isProtected && (
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                <Shield className="h-4 w-4" />
                <span>Protected role - permissions cannot be modified</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving || isProtected}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}

      {embedded && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Role Permissions</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure what users with this role can do
          </p>
          {isProtected && (
            <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
              <Shield className="h-4 w-4" />
              <span>Protected role - permissions cannot be modified</span>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                {PERMISSION_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    title={col.description}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {RESOURCES.map((resource) => {
                const resourcePermissions = permissions[resource.id];

                return (
                  <tr key={resource.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {resource.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {resource.description}
                        </div>
                      </div>
                    </td>
                    {PERMISSION_COLUMNS.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={resourcePermissions?.[col.key as keyof Permission] as boolean || false}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(resource.id, col.key, checked)
                            }
                            disabled={isProtected}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {hasChanges && !isProtected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-yellow-800">
            You have unsaved changes. Click "Save Permissions" to apply your modifications.
          </p>
          {embedded && (
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Permissions'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
