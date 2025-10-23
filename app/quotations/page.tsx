'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { hasPermission } from '@/lib/permissions';
import { QuotationsTable } from '@/components/Quotations/QuotationsTable';
import { QuotationsFilters } from '@/components/Quotations/QuotationsFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Quote {
  id: string;
  quotenumber: string;
  title: string;
  status: string;
  grandtotal: number;
  createdat: string;
  isApproved?: boolean;
  client: {
    id: string;
    name: string;
  } | null;
}

export default function QuotationsPage() {
  const { user, permissions } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Permission checks
  const canCreate = hasPermission(permissions, 'quotes', 'canCreate');
  const canDelete = hasPermission(permissions, 'quotes', 'canDelete');

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quotes, searchTerm, statusFilter, sortBy]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quotes');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quotations');
      }

      setQuotes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...quotes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (quote) =>
          quote.quotenumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quote.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((quote) => quote.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdat).getTime() - new Date(a.createdat).getTime();
        case 'date-asc':
          return new Date(a.createdat).getTime() - new Date(b.createdat).getTime();
        case 'value-desc':
          return b.grandtotal - a.grandtotal;
        case 'value-asc':
          return a.grandtotal - b.grandtotal;
        case 'client':
          return (a.client?.name || '').localeCompare(b.client?.name || '');
        default:
          return 0;
      }
    });

    setFilteredQuotes(filtered);
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!canDelete) return;

    if (confirm('Are you sure you want to delete this quotation?')) {
      try {
        const response = await fetch(`/api/quotes/${quoteId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete quotation');
        }

        setQuotes(quotes.filter((q) => q.id !== quoteId));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date-desc');
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
              <p className="text-gray-600 mt-1">
                Manage and track all your quotations
              </p>
            </div>
            {canCreate && (
              <Button onClick={() => router.push('/quotes/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Quotation
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <QuotationsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onApplyFilters={applyFilters}
          onReset={handleReset}
        />

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Quotations Table */}
        <QuotationsTable
          quotes={filteredQuotes}
          onDelete={canDelete ? handleDeleteQuote : undefined}
        />

        {/* Pagination Info */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredQuotes.length} of {quotes.length} quotations
          </div>
        </div>
      </div>
    </div>
  );
}
