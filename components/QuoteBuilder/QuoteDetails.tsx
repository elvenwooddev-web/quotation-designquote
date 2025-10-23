'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuoteStore } from '@/lib/store';
import { Client } from '@/lib/types';
import { ClientDialog } from './ClientDialog';

export function QuoteDetails() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showClientDialog, setShowClientDialog] = useState(false);

  const title = useQuoteStore((state) => state.title);
  const clientId = useQuoteStore((state) => state.clientId);
  const setTitle = useQuoteStore((state) => state.setTitle);
  const setClient = useQuoteStore((state) => state.setClient);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const handleClientChange = (value: string) => {
    if (value === 'new') {
      setShowClientDialog(true);
    } else {
      const client = clients.find((c) => c.id === value);
      setClient(value, client);
    }
  };

  const handleClientCreated = (newClient: Client) => {
    setClients([...clients, newClient]);
    setClient(newClient.id, newClient);
    setShowClientDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm">
              1
            </span>
            Quote Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Quote Title
            </label>
            <Input
              type="text"
              placeholder="Modular Kitchen Quote"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="quote-title-input"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Client
            </label>
            <div className="flex gap-2">
              <Select
                value={clientId || ''}
                onChange={(e) => handleClientChange(e.target.value)}
                className="flex-1"
                data-testid="client-select"
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
                <option value="new">+ New Client</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <ClientDialog
        open={showClientDialog}
        onOpenChange={setShowClientDialog}
        onClientCreated={handleClientCreated}
      />
    </>
  );
}