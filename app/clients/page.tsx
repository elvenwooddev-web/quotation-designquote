'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { hasPermission } from '@/lib/permissions';
import { Client } from '@/lib/types';
import { ClientsTable } from '@/components/Clients/ClientsTable';
import { ClientSidebar } from '@/components/Clients/ClientSidebar';
import { ClientDialog } from '@/components/Clients/ClientDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { supabase } from '@/lib/db';

export default function ClientsPage() {
  const { user, permissions } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Permission checks
  const canCreate = permissions ? hasPermission(permissions, 'clients', 'canCreate') : false;
  const canEdit = permissions ? hasPermission(permissions, 'clients', 'canEdit') : false;
  const canDelete = permissions ? hasPermission(permissions, 'clients', 'canDelete') : false;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch clients');
      }

      setClients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelect = async (client: Client) => {
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch(`/api/clients/${client.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch client details');
      }

      setSelectedClient(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientDialog(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!canDelete) return;
    
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete client');
        }
        
        setClients(clients.filter(c => c.id !== clientId));
        if (selectedClient?.id === clientId) {
          setSelectedClient(null);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
      const method = editingClient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(clientData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save client');
      }
      
      if (editingClient) {
        setClients(clients.map(c => c.id === editingClient.id ? data : c));
      } else {
        setClients([...clients, data]);
      }
      
      setShowClientDialog(false);
      setEditingClient(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                <p className="text-gray-600 mt-1">Manage your client relationships</p>
              </div>
              {canCreate && (
                <Button onClick={() => setShowClientDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Clients Table */}
          <ClientsTable
            clients={filteredClients}
            onClientSelect={handleClientSelect}
            onEdit={canEdit ? handleEditClient : undefined}
            onDelete={canDelete ? handleDeleteClient : undefined}
          />
        </div>

        {/* Sidebar */}
        {selectedClient && (
          <ClientSidebar
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
          />
        )}
      </div>

      {/* Client Dialog */}
      <ClientDialog
        open={showClientDialog}
        onOpenChange={(open) => {
          setShowClientDialog(open);
          if (!open) setEditingClient(null);
        }}
        client={editingClient}
        onSave={handleSaveClient}
      />
    </div>
  );
}
