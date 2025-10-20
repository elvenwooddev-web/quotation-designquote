'use client';

import { useState, useEffect } from 'react';
import { RolePermission, UserRole, PermissionResource } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const ROLES: UserRole[] = ['Admin', 'Designer', 'Client'];
const RESOURCES: PermissionResource[] = ['categories', 'products', 'clients', 'quotes'];
const ACTIONS = ['canCreate', 'canEdit', 'canDelete', 'canApprove', 'canExport'] as const;

export function RolePermissionsTable() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (role: UserRole, resource: PermissionResource, action: string, checked: boolean) => {
    setPermissions(prev => 
      prev.map(permission => 
        permission.role === role && permission.resource === resource
          ? { ...permission, [action]: checked }
          : permission
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Permissions updated successfully!');
        // Refresh permissions to show latest from database
        await fetchPermissions();
      } else {
        console.error('Server error:', result);
        throw new Error(result.error || 'Failed to update permissions');
      }
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      alert(`Failed to update permissions: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const getPermission = (role: UserRole, resource: PermissionResource) => {
    return permissions.find(p => p.role === role && p.resource === resource);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              {ACTIONS.map(action => (
                <th key={action} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {action.replace('can', '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ROLES.map(role => 
              RESOURCES.map(resource => {
                const permission = getPermission(role, resource);
                return (
                  <tr key={`${role}-${resource}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role === 'Admin' 
                          ? 'bg-red-100 text-red-800'
                          : role === 'Designer'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {resource}
                    </td>
                    {ACTIONS.map(action => (
                      <td key={action} className="px-6 py-4 whitespace-nowrap text-center">
                        <Checkbox
                          checked={permission?.[action] || false}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(role, resource, action, checked as boolean)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="px-6"
        >
          {saving ? 'Saving...' : 'Save Permissions'}
        </Button>
      </div>
    </div>
  );
}
