'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useQuoteStore } from '@/lib/store';

export function PolicyBuilder() {
  const policies = useQuoteStore((state) => state.policies);
  const updatePolicy = useQuoteStore((state) => state.updatePolicy);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm">
            4
          </span>
          Policy Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Select and customize policy clauses:
        </p>

        {/* Policy Toggles */}
        <div className="space-y-4">
          {policies.map((policy) => (
            <div key={`${policy.type}-${policy.order}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {policy.title}
                </label>
                <Switch
                  checked={policy.isActive}
                  onCheckedChange={(checked) =>
                    updatePolicy(policy.type, { isActive: checked })
                  }
                />
              </div>
              {policy.isActive && (
                <Textarea
                  value={policy.description}
                  onChange={(e) =>
                    updatePolicy(policy.type, { description: e.target.value })
                  }
                  rows={2}
                  className="text-sm"
                />
              )}
            </div>
          ))}
        </div>

        {/* Custom Clauses */}
        <div className="pt-4 border-t">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Custom Clauses
          </label>
          <Textarea
            placeholder="Add any additional terms here..."
            rows={4}
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}



