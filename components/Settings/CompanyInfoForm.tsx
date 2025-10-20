'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CompanyInfo {
  companyName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
}

interface CompanyInfoFormProps {
  value: CompanyInfo;
  onChange: (value: CompanyInfo) => void;
}

export function CompanyInfoForm({ value, onChange }: CompanyInfoFormProps) {
  const [formData, setFormData] = useState<CompanyInfo>(value);

  useEffect(() => {
    setFormData(value);
  }, [value]);

  const handleChange = (field: keyof CompanyInfo, fieldValue: string) => {
    const updated = { ...formData, [field]: fieldValue };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Information</h3>
      <p className="text-sm text-gray-600 mb-6">Update your company's details here.</p>

      <div className="space-y-4">
        {/* Company Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 mb-2">
              Company Name
            </Label>
            <Input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Innovate Corp"
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="contact@innovate.com"
              className="w-full"
            />
          </div>
        </div>

        {/* Phone and Website Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="website" className="text-sm font-medium text-gray-700 mb-2">
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://innovate.com"
              className="w-full"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2">
            Address
          </Label>
          <Input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="123 Innovation Drive, Tech City, 10101"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
