'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { PDFTemplate } from '@/lib/types';
import { TemplateEditor } from '@/components/TemplateEditor/TemplateEditor';
import { useAuth } from '@/lib/auth-context';

export default function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [template, setTemplate] = useState<PDFTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNewTemplate = id === 'new';

  useEffect(() => {
    if (isNewTemplate) {
      // Initialize a new template with default values
      const newTemplate: PDFTemplate = {
        id: '',
        name: 'Untitled Template',
        description: null,
        category: 'custom',
        isDefault: false,
        isPublic: false,
        templateJson: {
          metadata: {
            version: '1.0',
            pageSize: 'A4',
            orientation: 'portrait',
            margins: {
              top: 40,
              bottom: 40,
              left: 40,
              right: 40,
            },
          },
          theme: {
            colors: {
              primary: '#2563eb',
              secondary: '#64748b',
              textPrimary: '#1e293b',
              textSecondary: '#64748b',
              background: '#ffffff',
            },
            fonts: {
              heading: {
                family: 'Inter',
                size: 18,
                weight: 600,
              },
              body: {
                family: 'Inter',
                size: 12,
                weight: 400,
              },
              small: {
                family: 'Inter',
                size: 10,
                weight: 400,
              },
            },
          },
          elements: [],
        },
        thumbnail: null,
        createdBy: user?.id || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };
      setTemplate(newTemplate);
      setLoading(false);
    } else {
      fetchTemplate();
    }
  }, [id, isNewTemplate, user]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/templates/${id}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch template');
      }

      const data: PDFTemplate = await response.json();
      setTemplate(data);
    } catch (err: any) {
      console.error('Failed to fetch template:', err);
      setError(err.message || 'Failed to fetch template');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedTemplate: PDFTemplate) => {
    try {
      const url = isNewTemplate ? '/api/templates' : `/api/templates/${id}`;
      const method = isNewTemplate ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedTemplate.name,
          description: updatedTemplate.description,
          category: updatedTemplate.category,
          isDefault: updatedTemplate.isDefault,
          isPublic: updatedTemplate.isPublic,
          templateJson: updatedTemplate.templateJson,
          thumbnail: updatedTemplate.thumbnail,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save template');
      }

      const savedTemplate: PDFTemplate = await response.json();

      // If it was a new template, redirect to its edit page
      if (isNewTemplate) {
        router.push(`/templates/editor/${savedTemplate.id}`);
      } else {
        setTemplate(savedTemplate);
      }

      return savedTemplate;
    } catch (err: any) {
      console.error('Error saving template:', err);
      throw err;
    }
  };

  const handleBack = () => {
    router.push('/templates');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TemplateEditor
        template={template}
        onSave={handleSave}
        onBack={handleBack}
      />
    </div>
  );
}
