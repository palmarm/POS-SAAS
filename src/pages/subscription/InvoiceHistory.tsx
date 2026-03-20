import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: {
    name: string;
    period: string;
  };
  paymentMethod: string;
  pdfUrl: string;
}

export const InvoiceHistory: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, invoices]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          date: new Date(2024, 1, 15),
          dueDate: new Date(2024, 1, 29),
          amount: 79,
          status: 'paid',
          plan: { name: 'Pro Plan', period: 'Feb 15, 2024 - Mar 15, 2024' },
          paymentMethod: 'Visa ending in 4242',
          pdfUrl: '#'
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          date: new Date(2024, 0, 15),
          dueDate: new Date(2024, 0, 29),
          amount: 79,
          status: 'paid',
          plan: { name: 'Pro Plan', period: 'Jan 15, 2024 - Feb 15, 2024' },
          paymentMethod: 'Visa ending in 4242',
          pdfUrl: '#'
        },
        {
          id: '3',
          invoiceNumber: 'INV-2024-003',
          date: new Date(2023, 11, 15),
          dueDate: new Date(2023, 11, 29),
          amount: 79,
          status: 'paid',
          plan: { name: 'Pro Plan', period: 'Dec 15, 2023 - Jan 15, 2024' },
          paymentMethod: 'Visa ending in 4242',
          pdfUrl: '#'
        }
      ];
      
      setInvoices(mockInvoices);
      setFilteredInvoices(mockInvoices);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];
    
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    setFilteredInvoices(filtered);
  };

  const downloadInvoice = (invoice: Invoice) => {
    // In production, this would trigger PDF download
    alert(`Downloading invoice ${invoice.invoiceNumber}`);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const config = {
      paid: { bg: 'bg-success-100', text: 'text-success-700', label: 'Paid' },
      pending: { bg: 'bg-warning-100', text: 'text-warning-700', label: 'Pending' },
      failed: { bg: 'bg-danger-100', text: 'text-danger-700', label: 'Failed' }
    };
    const { bg, text, label } = config[status];
    return <span className={`px-2 py-1 rounded-full text-xs ${bg} ${text}`}>{label}</span>;
  };

  const getTotalAmount = () => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  };

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
            <p className="text-sm text-secondary-500 mb-1">Last Invoice</p>
            <p className="text-2xl font-bold text-secondary-900">
              ${invoices[0]?.amount.toFixed(2) || '0'}
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
                        <span className="font-mono text-sm font-medium">{invoice.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">
                      {invoice.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-secondary-600">
                      {invoice.dueDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-secondary-900">
                      ${invoice.amount.toFixed(2)}
                    </td>
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
                        >
                          <ArrowDownTrayIcon className="w-5 h-5 text-secondary-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12 text-secondary-400">
                No invoices found
              </div>
            )}
          </div>
        </Card>

        {/* Invoice Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Invoice ${selectedInvoice?.invoiceNumber}`}
          size="lg"
        >
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-secondary-900">POS System</h3>
                  <p className="text-sm text-secondary-500">123 Main Street, City</p>
                  <p className="text-sm text-secondary-500">Tax ID: 123456789</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-600">Invoice Date: {selectedInvoice.date.toLocaleDateString()}</p>
                  <p className="text-sm text-secondary-600">Due Date: {selectedInvoice.dueDate.toLocaleDateString()}</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="border-t border-secondary-200 pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-secondary-500">Plan</p>
                    <p className="font-medium">{selectedInvoice.plan.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Period</p>
                    <p className="font-medium">{selectedInvoice.plan.period}</p>
                  </div>
                </div>
                
                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-secondary-600">Subscription</span>
                    <span>${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-secondary-200">
                    <span>Total</span>
                    <span>${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-secondary-500">Payment Method</p>
                  <p className="font-medium">{selectedInvoice.paymentMethod}</p>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-secondary-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
                <Button variant="secondary" onClick={() => downloadInvoice(selectedInvoice)}>
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