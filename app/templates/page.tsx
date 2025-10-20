'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PDFTemplate, TemplateCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Plus, Search, Edit, Copy, Trash2, CheckCircle, Eye, Download, Upload, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { hasPermission } from '@/lib/permissions';
import { PDFPreviewModal } from '@/components/PDFPreviewModal';
import { downloadTemplateAsFile, downloadTemplatesAsFile } from '@/lib/template-export';
import TemplateImportDialog from '@/components/Templates/TemplateImportDialog';

export default function TemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [previewTemplateName, setPreviewTemplateName] = useState<string>('');
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Permission checks
  const canCreate = user?.role ? hasPermission(user.role, 'quotes', 'canCreate') : false;
  const canEdit = user?.role ? hasPermission(user.role, 'quotes', 'canEdit') : false;
  const canDelete = user?.role ? hasPermission(user.role, 'quotes', 'canDelete') : false;

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/templates');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch templates');
      }

      const data: PDFTemplate[] = await response.json();
      setTemplates(data);
    } catch (err: any) {
      console.error('Failed to fetch templates:', err);
      setError(err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    router.push('/templates/editor/new');
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/templates/editor/${templateId}`);
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to duplicate template');
      }

      await fetchTemplates();
    } catch (err: any) {
      console.error('Error duplicating template:', err);
      setError(err.message || 'Failed to duplicate template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete template');
      }

      await fetchTemplates();
    } catch (err: any) {
      console.error('Error deleting template:', err);
      setError(err.message || 'Failed to delete template');
    }
  };

  const handleSetDefault = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/set-default`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set default template');
      }

      await fetchTemplates();
    } catch (err: any) {
      console.error('Error setting default template:', err);
      setError(err.message || 'Failed to set default template');
    }
  };

  const handlePreviewTemplate = (template: PDFTemplate) => {
    setPreviewTemplateId(template.id);
    setPreviewTemplateName(template.name);
  };

  const handleToggleSelect = (templateId: string) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTemplates.size === filteredTemplates.length) {
      setSelectedTemplates(new Set());
    } else {
      setSelectedTemplates(new Set(filteredTemplates.map((t) => t.id)));
    }
  };

  const handleExportSelected = () => {
    if (selectedTemplates.size === 0) {
      setError('Please select at least one template to export');
      return;
    }

    const templatesToExport = templates.filter((t) => selectedTemplates.has(t.id));

    if (templatesToExport.length === 1) {
      downloadTemplateAsFile(templatesToExport[0]);
    } else {
      downloadTemplatesAsFile(templatesToExport, 'templates');
    }

    setSuccessMessage(`Exported ${templatesToExport.length} template${templatesToExport.length !== 1 ? 's' : ''}`);
    setTimeout(() => setSuccessMessage(null), 3000);
    setSelectedTemplates(new Set());
  };

  const handleExportAll = () => {
    if (templates.length === 0) {
      setError('No templates available to export');
      return;
    }

    downloadTemplatesAsFile(templates, 'all-templates');
    setSuccessMessage(`Exported ${templates.length} template${templates.length !== 1 ? 's' : ''}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleImportComplete = (successCount: number) => {
    setSuccessMessage(`Successfully imported ${successCount} template${successCount !== 1 ? 's' : ''}`);
    setTimeout(() => setSuccessMessage(null), 5000);
    fetchTemplates(); // Refresh the template list
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDF Templates</h1>
              <p className="text-gray-600 mt-1">Manage your quotation PDF templates</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsImportDialogOpen(true)}
                title="Import templates from JSON"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              {canCreate && (
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
              className="w-48"
            >
              <option value="all">All Categories</option>
              <option value="business">Business</option>
              <option value="modern">Modern</option>
              <option value="creative">Creative</option>
              <option value="elegant">Elegant</option>
              <option value="bold">Bold</option>
              <option value="minimalist">Minimalist</option>
              <option value="custom">Custom</option>
            </Select>
          </div>

          {/* Bulk Actions */}
          {filteredTemplates.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                checked={selectedTemplates.size === filteredTemplates.length && filteredTemplates.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {selectedTemplates.size === 0
                  ? 'Select templates'
                  : `${selectedTemplates.size} selected`}
              </span>

              {selectedTemplates.size > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-300 mx-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportSelected}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Selected
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTemplates(new Set())}
                    className="text-gray-600"
                  >
                    Clear Selection
                  </Button>
                </>
              )}

              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAll}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export All
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-600">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No templates found</p>
            {canCreate && (
              <Button onClick={handleCreateTemplate} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                  selectedTemplates.has(template.id)
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200'
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedTemplates.has(template.id)}
                    onChange={() => handleToggleSelect(template.id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded shadow-sm"
                  />
                </div>
                {/* Thumbnail */}
                <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                  {template.thumbnail ? (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-sm">No Preview</p>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {template.isDefault && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Default
                      </span>
                    )}
                    <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full capitalize">
                      {template.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewTemplate(template)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTemplate(template.id)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template.id)}
                        title="Duplicate template"
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </Button>

                      {!template.isDefault && canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(template.id)}
                          title="Set as default"
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Default
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          title="Delete template"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={!!previewTemplateId}
        onClose={() => {
          setPreviewTemplateId(null);
          setPreviewTemplateName('');
        }}
        templateId={previewTemplateId || undefined}
        title={`Preview: ${previewTemplateName}`}
      />

      {/* Import Dialog */}
      <TemplateImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
