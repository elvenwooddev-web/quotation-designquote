'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuoteStore } from '@/lib/store';
import { Client, PDFTemplate } from '@/lib/types';
import { ClientDialog } from './ClientDialog';
import { TemplateDisplay } from './TemplateDisplay';
import { TemplateSelectorDialog } from './TemplateSelectorDialog';
import { getDefaultTemplate } from '@/lib/get-default-template';

export function QuoteDetails() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const title = useQuoteStore((state) => state.title);
  const clientId = useQuoteStore((state) => state.clientId);
  const templateId = useQuoteStore((state) => state.templateId);
  const template = useQuoteStore((state) => state.template);
  const setTitle = useQuoteStore((state) => state.setTitle);
  const setClient = useQuoteStore((state) => state.setClient);
  const setTemplate = useQuoteStore((state) => state.setTemplate);

  useEffect(() => {
    fetchClients();
    loadDefaultTemplate();
  }, []);

  const loadDefaultTemplate = async () => {
    // Only load default template if no template is already set
    if (!templateId && !template) {
      setLoadingTemplate(true);
      try {
        const defaultTemplate = await getDefaultTemplate();
        setTemplate(defaultTemplate.id, defaultTemplate);
      } catch (error) {
        console.error('Failed to load default template:', error);
      } finally {
        setLoadingTemplate(false);
      }
    }
  };

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

  const handleTemplateSelected = (selectedTemplate: PDFTemplate) => {
    setTemplate(selectedTemplate.id, selectedTemplate);
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

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              PDF Template
            </label>
            <TemplateDisplay
              template={template}
              onChangeTemplate={() => setShowTemplateDialog(true)}
              loading={loadingTemplate}
            />
          </div>
        </CardContent>
      </Card>

      <ClientDialog
        open={showClientDialog}
        onOpenChange={setShowClientDialog}
        onClientCreated={handleClientCreated}
      />

      <TemplateSelectorDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onSelectTemplate={handleTemplateSelected}
        currentTemplateId={templateId}
      />
    </>
  );
}



