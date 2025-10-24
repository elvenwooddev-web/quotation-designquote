'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserManagementTable } from '@/components/Settings/UserManagementTable';
import { UserDialog } from '@/components/Settings/UserDialog';
import { RoleManagement } from '@/components/Settings/RoleManagement';
import { Plus } from 'lucide-react';
import { CompanyInfoForm, CompanyInfo } from '@/components/Settings/CompanyInfoForm';
import { CompanyLogoUpload } from '@/components/Settings/CompanyLogoUpload';
import { TermsConditionsEditor } from '@/components/Settings/TermsConditionsEditor';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('user-management');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Company Info State
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Terms State
  const [terms, setTerms] = useState('');

  // PDF Template State
  const [pdfTemplate, setPdfTemplate] = useState<any[]>([]);

  // Initial state for detecting changes
  const [initialState, setInitialState] = useState<any>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load company info
      const companyRes = await fetch('/api/settings/company');
      if (companyRes.ok) {
        const companyData = await companyRes.json();
        setCompanyInfo({
          companyName: companyData.companyName,
          email: companyData.email,
          phone: companyData.phone,
          website: companyData.website,
          address: companyData.address,
        });
        setLogoUrl(companyData.logoUrl);
      }

      // Load terms
      const termsRes = await fetch('/api/settings/terms');
      if (termsRes.ok) {
        const termsData = await termsRes.json();
        setTerms(termsData.content);
      }

      // PDF template loading removed - endpoint doesn't exist
      // Template functionality is not currently implemented in UI

      // Store initial state
      const state = {
        companyInfo: { ...companyInfo },
        logoUrl,
        terms,
        pdfTemplate: [...pdfTemplate],
      };
      setInitialState(state);
    } catch (error) {
      console.error('Error loading settings:', error);
      alert('Failed to load settings');
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setLogoUrl(data.url);
      } else {
        throw new Error('Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    }
  };

  const handleLogoRemove = () => {
    setLogoUrl(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save company info
      const companyRes = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...companyInfo, logoUrl }),
      });

      if (!companyRes.ok) throw new Error('Failed to save company info');

      // Save terms
      const termsRes = await fetch('/api/settings/terms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: terms }),
      });

      if (!termsRes.ok) throw new Error('Failed to save terms');

      // PDF template save removed - endpoint doesn't exist
      // Template functionality is not currently implemented in UI

      alert('Settings saved successfully!');
      await loadSettings(); // Reload to update initial state
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (initialState) {
      setCompanyInfo(initialState.companyInfo);
      setLogoUrl(initialState.logoUrl);
      setTerms(initialState.terms);
      setPdfTemplate(initialState.pdfTemplate);
    }
  };

  // Redirect if not admin
  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Settings</h1>
          {/* Only show Save Changes button on Company Info tab */}
          {activeTab === 'company-info' && (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleDiscard}>
                Discard
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue={activeTab}>
          <TabsList>
            <TabsTrigger value="user-management">User Management</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
            <TabsTrigger value="company-info">Company Info</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="user-management">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage user accounts and their roles</p>
                  </div>
                  <Button onClick={() => setShowUserDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <UserManagementTable key={refreshKey} />
              </div>
            </div>
          </TabsContent>

          {/* Role Management Tab */}
          <TabsContent value="roles">
            <RoleManagement />
          </TabsContent>

          {/* Company Info Tab */}
          <TabsContent value="company-info">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CompanyInfoForm value={companyInfo} onChange={setCompanyInfo} />
                <TermsConditionsEditor value={terms} onChange={setTerms} />
              </div>
              <div className="space-y-6">
                <CompanyLogoUpload
                  logoUrl={logoUrl}
                  onUpload={handleLogoUpload}
                  onRemove={handleLogoRemove}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* User Dialog */}
        <UserDialog
          open={showUserDialog}
          onOpenChange={setShowUserDialog}
          onUserCreated={() => setRefreshKey(prev => prev + 1)}
        />
      </div>
    </div>
  );
}
