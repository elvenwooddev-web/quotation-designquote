'use client';

import { useState, useEffect } from 'react';
import { Client, Quote } from '@/lib/types';
import { QuotationCard } from './QuotationCard';
import { RevisionTimeline } from './RevisionTimeline';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ClientSidebarProps {
  client: Client & { quotes?: Quote[] };
  onClose: () => void;
}

export function ClientSidebar({ client, onClose }: ClientSidebarProps) {
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(true);

  useEffect(() => {
    fetchRevisions();
  }, [client.id]);

  const fetchRevisions = async () => {
    try {
      setLoadingRevisions(true);
      const response = await fetch(`/api/clients/${client.id}/revisions`);
      const data = await response.json();
      
      if (response.ok) {
        setRevisions(data);
      }
    } catch (error) {
      console.error('Error fetching revisions:', error);
    } finally {
      setLoadingRevisions(false);
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Client Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Client Info */}
      <div className="p-6">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
          <p className="text-gray-600 mt-1">{client.email || 'No email'}</p>
          {client.phone && (
            <p className="text-sm text-gray-500 mt-1">{client.phone}</p>
          )}
        </div>

        {/* Contact Details */}
        <div className="mt-6 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-sm text-gray-900">{client.email || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-sm text-gray-900">{client.phone || 'Not provided'}</p>
          </div>
          {client.address && (
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-sm text-gray-900">{client.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quotations Section */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotations</h3>
        {client.quotes && client.quotes.length > 0 ? (
          <div className="space-y-3">
            {client.quotes.map((quote) => (
              <QuotationCard key={quote.id} quote={quote} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No quotations yet</p>
        )}
      </div>

      {/* Revision History Section */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revision History</h3>
        {loadingRevisions ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : revisions.length > 0 ? (
          <RevisionTimeline revisions={revisions} />
        ) : (
          <p className="text-sm text-gray-500">No revisions yet</p>
        )}
      </div>
    </div>
  );
}
