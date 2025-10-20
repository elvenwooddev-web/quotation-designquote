'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Copy, Trash2, Star, Eye, ExternalLink } from 'lucide-react';
import { PDFTemplate } from '@/lib/types';
import { PDFPreview } from '@/components/PDF/PDFPreview';
import { generateSampleQuote } from '@/lib/sample-quote-data';

export function TemplateManager() {
  const router = useRouter();
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);

        // Select the default template
        const defaultTemplate = data.find((t: PDFTemplate) => t.isDefault);
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/set-default`, {
        method: 'POST',
      });

      if (response.ok) {
        // Reload templates to update default status
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error setting default template:', error);
    }
  };

  const handleDuplicate = async (template: PDFTemplate) => {
    try {
      const response = await fetch(`/api/templates/${template.id}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadTemplates();
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null);
        }
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleCreateTemplate = () => {
    router.push('/templates/editor/new');
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/templates/editor/${templateId}`);
  };

  const handleViewTemplates = () => {
    router.push('/templates');
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      modern: 'bg-blue-100 text-blue-700',
      business: 'bg-green-100 text-green-700',
      minimalist: 'bg-gray-100 text-gray-700',
      bold: 'bg-purple-100 text-purple-700',
      elegant: 'bg-pink-100 text-pink-700',
      custom: 'bg-orange-100 text-orange-700',
    };
    return colors[category] || colors.custom;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">PDF Templates</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage your quote PDF templates. Create custom designs or use pre-built templates.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleViewTemplates}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View All Templates
            </button>
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Custom Template
            </button>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template List */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Your Templates ({templates.length})</h4>

          {templates.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No templates yet</p>
              <button
                onClick={handleCreateTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Your First Template
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900">{template.name}</h5>
                        {template.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                            <Star className="h-3 w-3 fill-yellow-800" />
                            Default
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getCategoryBadgeColor(template.category)}`}>
                      {template.category}
                    </span>

                    <div className="flex items-center gap-1">
                      {!template.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(template.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                          title="Set as default"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(template);
                          setShowPreview(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemplate(template.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(template);
                        }}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {!template.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(template.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Template Preview */}
        <div className="sticky top-6">
          {selectedTemplate ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedTemplate.name}</h4>
                    {selectedTemplate.description && (
                      <p className="text-sm text-gray-600 mt-1">{selectedTemplate.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </button>
                </div>
              </div>

              {showPreview && (
                <div className="p-4 bg-gray-50">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <PDFPreview
                      quote={generateSampleQuote()}
                      template={selectedTemplate}
                      title={`${selectedTemplate.name} Preview`}
                      showControls={true}
                      defaultZoom={80}
                    />
                  </div>
                </div>
              )}

              {!showPreview && (
                <div className="p-8 text-center bg-gray-50">
                  <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-4 border-2 border-gray-200">
                    <Eye className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Click "Show Preview" to see how this template looks</p>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Show Preview
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Select a template to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
