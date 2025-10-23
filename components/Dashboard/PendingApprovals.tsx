'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PendingApproval {
  id: string;
  quoteNumber: string;
  title: string;
  grandTotal: number;
  createdAt: string;
  clientName: string;
  createdByName: string;
}

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  onRefresh: () => void;
}

export default function PendingApprovals({
  approvals,
  onRefresh,
}: PendingApprovalsProps) {
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleAction = (quoteId: string, action: 'approve' | 'reject') => {
    setSelectedQuote(quoteId);
    setActionType(action);
    setShowDialog(true);
  };

  const handlePreview = (quoteId: string) => {
    // Open the quote PDF in a new tab
    window.open(`/api/quotes/${quoteId}/pdf`, '_blank');
  };

  const confirmAction = async () => {
    if (!selectedQuote || !actionType) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/quotes/${selectedQuote}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process approval');
      }

      // Close dialog and refresh
      setShowDialog(false);
      setSelectedQuote(null);
      setActionType(null);
      onRefresh();
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Failed to process approval. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelAction = () => {
    setShowDialog(false);
    setSelectedQuote(null);
    setActionType(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (approvals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No quotes pending approval
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Quote #</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Client</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Created By</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((approval) => (
              <tr key={approval.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{approval.quoteNumber}</td>
                <td className="py-3 px-4">{approval.clientName}</td>
                <td className="py-3 px-4 text-right font-semibold">
                  {formatCurrency(approval.grandTotal)}
                </td>
                <td className="py-3 px-4">{approval.createdByName}</td>
                <td className="py-3 px-4">{formatDate(approval.createdAt)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handlePreview(approval.id)}
                      title="Preview Quote PDF"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleAction(approval.id, 'approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleAction(approval.id, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Quote' : 'Reject Quote'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Are you sure you want to approve this quote? This action will mark the quote as accepted.'
                : 'Are you sure you want to reject this quote? This action will mark the quote as rejected.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={cancelAction}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={isProcessing}
              className={
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {isProcessing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
