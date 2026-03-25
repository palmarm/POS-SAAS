import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { invoiceAPI } from '../../services/api';

interface Invoice {
  id: number;
  invoice_number: string;
  date: string;
  due_date: string;
  amount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'failed';
  payment_method: string;
  invoice_data: any;
  pdf_url: string;
}

export const InvoiceHistory: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, invoices]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceAPI.getAll();
      if (response.data.success) {
        setInvoices(response.data.data);
        setFilteredInvoices(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      showToast(error.response?.data?.message || 'Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];
    
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    setFilteredInvoices(filtered);
  };

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      const response = await invoiceAPI.download(invoice.invoice_number);
      // Create a blob from the response and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Invoice downloaded successfully', 'success');
    } catch (error) {
      showToast('Failed to download invoice', 'error');
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const config = {
      paid: { bg: 'bg-success-100', text: 'text-success-700', label: 'Paid', icon: '✓' },
      pending: { bg: 'bg-warning-100', text: 'text-warning-700', label: 'Pending', icon: '⏳' },
      failed: { bg: 'bg-danger-100', text: 'text-danger-700', label: 'Failed', icon: '✗' }
    };
    const { bg, text, label, icon } = config[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${bg} ${text} inline-flex items-center gap-1`}>
        <span>{icon}</span>
        {label}
      </span>
    );
  };

  const getTotalAmount = () => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  };

  if (loading) {
    return (
      <div className="pt-16 pl-[240px] bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-secondary-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pl-[240px] bg-background min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">Invoice History</h1>
          <p className="text-secondary-500 mt-1">View and download your billing history</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <p className="text-sm text-secondary-500 mb-1">Total Invoices</p>
            <p className="text-2xl font-bold text-secondary-900">{invoices.length}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-secondary-500 mb-1">Total Billed</p>
            <p className="text-2xl font-bold text-success-600">${getTotalAmount().toFixed(2)}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-secondary-500 mb-1">Paid Invoices</p>
            <p className="text-2xl font-bold text-secondary-900">
              {invoices.filter(i => i.status === 'paid').length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <Input
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                placeholder="Search by invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-span-4">
              <select
                className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Invoices Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Invoice #</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Date</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Due Date</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Amount</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Tax</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Total</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Status</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-secondary-400" />
                        <span className="font-mono text-sm font-medium">{invoice.invoice_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-secondary-600">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">${invoice.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">${invoice.tax.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-bold">${invoice.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1 hover:bg-secondary-100 rounded transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-5 h-5 text-primary-600" />
                        </button>
                        <button
                          onClick={() => downloadInvoice(invoice)}
                          className="p-1 hover:bg-secondary-100 rounded transition-colors"
                          title="Download PDF"
                          disabled={invoice.status === 'failed'}
                        >
                          <ArrowDownTrayIcon className={`w-5 h-5 ${invoice.status === 'failed' ? 'text-secondary-300' : 'text-secondary-600'}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12 text-secondary-400">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
                <p>No invoices found</p>
              </div>
            )}
          </div>
        </Card>

        {/* Invoice Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Invoice ${selectedInvoice?.invoice_number}`}
          size="lg"
        >
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start pb-4 border-b border-secondary-200">
                <div>
                  <h3 className="text-lg font-bold text-secondary-900">POS System</h3>
                  <p className="text-sm text-secondary-500">123 Main Street, City</p>
                  <p className="text-sm text-secondary-500">Tax ID: 123456789</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-600">Invoice Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  <p className="text-sm text-secondary-600">Due Date: {new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                  <p className="text-sm text-secondary-600">Status: {getStatusBadge(selectedInvoice.status)}</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="space-y-4">
                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-secondary-600">Subscription Plan</span>
                    <span className="font-medium">{selectedInvoice.invoice_data?.plan?.name || 'Pro Plan'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-secondary-600">Billing Period</span>
                    <span>{selectedInvoice.invoice_data?.billing_cycle || 'Monthly'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-secondary-200 mt-2">
                    <span className="text-secondary-600">Subtotal</span>
                    <span>${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Tax (10%)</span>
                    <span>${selectedInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-secondary-200 mt-2">
                    <span>Total</span>
                    <span>${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-secondary-500">Payment Method</p>
                  <p className="font-medium capitalize">{selectedInvoice.payment_method || 'Not specified'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
                <Button 
                  variant="secondary" 
                  onClick={() => downloadInvoice(selectedInvoice)}
                  disabled={selectedInvoice.status === 'failed'}
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};