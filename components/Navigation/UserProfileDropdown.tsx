'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';

interface UserProfileDropdownProps {
  user: User;
}

export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
          <UserIcon className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700">{user.name}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                  user.role?.name === 'Admin'
                    ? 'bg-red-100 text-red-800'
                    : user.role?.name === 'Sales Head'
                    ? 'bg-purple-100 text-purple-800'
                    : user.role?.name === 'Sales Executive'
                    ? 'bg-indigo-100 text-indigo-800'
                    : user.role?.name === 'Sales'
                    ? 'bg-cyan-100 text-cyan-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role?.name || 'No Role'}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
