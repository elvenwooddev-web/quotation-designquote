'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PermissionsEditor } from './PermissionsEditor';

interface Role {
  id: string;
  name: string;
  description: string | null;
  isProtected: boolean;
  userCount?: number;
}

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (success: boolean, savedRole?: any) => void;
  role?: Role | null;
}

export function RoleDialog({ open, onOpenChange, role }: RoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const isEditing = !!role;

  // Reset form when role changes or dialog opens
  useEffect(() => {
    if (open) {
      setLoading(false); // Reset loading state when dialog opens
      if (role) {
        setFormData({
          name: role.name,
          description: role.description || '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
        });
      }
    }
  }, [role, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = role ? `/api/roles/${role.id}` : '/api/roles';
      const method = role ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save role');
      }

      const savedRole = await response.json();

      setLoading(false);

      // If creating a new role, pass the created role back to open in edit mode
      onOpenChange(true, savedRole); // success = true, with role data
    } catch (error: any) {
      console.error('Error saving role:', error);
      alert(error.message || 'Failed to save role. Please try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    onOpenChange(false); // success = false
  };

  return (
    <Dialog open={open} onOpenChange={() => handleCancel()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Create New Role'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Role Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Project Manager, Viewer"
              required
              disabled={role?.isProtected || loading}
            />
            {role?.isProtected && (
              <p className="text-xs text-blue-600 mt-1">
                Protected role names cannot be changed
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role's purpose and responsibilities"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Add a description to help users understand this role
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={loading}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Role'}
            </Button>
          </div>
        </form>

        {isEditing && role && (
          <div className="mt-6 border-t pt-6">
            <PermissionsEditor
              roleId={role.id}
              roleName={role.name}
              isProtected={role.isProtected}
              embedded={true}
              onSaveComplete={() => onOpenChange(true)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
