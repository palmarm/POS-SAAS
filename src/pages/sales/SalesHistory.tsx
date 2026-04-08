import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { productAPI, saleAPI } from '../../services/api';

interface Sale {
  id: string;
  transactionId: string;
  customerName: string;
  items: number;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'credit';
  status: 'completed' | 'refunded';
  date: Date;
  cashier: string;
}

export const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [searchTerm, startDate, endDate, selectedPaymentMethod]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockSales: Sale[] = [
        {
          id: '1',
          transactionId: 'TRX-001',
          customerName: 'John Doe',
          items: 3,
          subtotal: 149.97,
          tax: 15.00,
          total: 164.97,
          paymentMethod: 'card',
          status: 'completed',
          date: new Date(),
          cashier: 'Jane Cashier'
        },
        {
          id: '2',
          transactionId: 'TRX-002',
          customerName: 'Walk-in Customer',
          items: 2,
          subtotal: 89.98,
          tax: 9.00,
          total: 98.98,
          paymentMethod: 'cash',
          status: 'completed',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          cashier: 'John Admin'
        },
        {
          id: '3',
          transactionId: 'TRX-003',
          customerName: 'Alice Johnson',
          items: 5,
          subtotal: 299.95,
          tax: 30.00,
          total: 329.95,
          paymentMethod: 'mobile',
          status: 'completed',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          cashier: 'Jane Cashier'
        }
      ];
      setSales(mockSales);
      setFilteredSales(mockSales);
    } finally {
      setLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = [...sales];

    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (startDate) {
      filtered = filtered.filter(sale => sale.date >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(sale => sale.date <= new Date(endDate));
    }

    if (selectedPaymentMethod !== 'all') {
      filtered = filtered.filter(sale => sale.paymentMethod === selectedPaymentMethod);
    }

    setFilteredSales(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Customer', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment', 'Date', 'Cashier'];
    const data = filteredSales.map(sale => [
      sale.transactionId,
      sale.customerName,
      sale.items,
      sale.subtotal,
      sale.tax,
      sale.total,
      sale.paymentMethod,
      sale.date.toLocaleString(),
      sale.cashier
    ]);

    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      cash: '💵',
      card: '💳',
      mobile: '📱',
      credit: '📝'
    };
    return icons[method] || '💰';
  };

  return (
    <div className="pt-16 pl-[240px] bg-background min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Sales History</h1>
            <p className="text-secondary-500 mt-1">View and manage all transactions</p>
          </div>
          <Button variant="secondary" icon={<ArrowDownTrayIcon className="w-5 h-5" />} onClick={exportToCSV}>
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <Input
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                placeholder="Search by transaction ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <Input
                type="date"
                label="From Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <Input
                type="date"
                label="To Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">Payment Method</label>
              <select
                className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile Money</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Sales Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Transaction ID</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Customer</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Items</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Total</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Payment</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Date</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-secondary-900">
                        {sale.transactionId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">{sale.customerName}</td>
                    <td className="px-6 py-4 text-right text-secondary-600">{sale.items} items</td>
                    <td className="px-6 py-4 text-right font-bold text-secondary-900">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl" title={sale.paymentMethod}>
                        {getPaymentMethodIcon(sale.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">
                      {sale.date.toLocaleDateString()} {sale.date.toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedSale(sale);
                          setIsReceiptModalOpen(true);
                        }}
                        className="p-1 hover:bg-secondary-100 rounded transition-colors"
                        title="View Receipt"
                      >
                        <DocumentTextIcon className="w-5 h-5 text-primary-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSales.length === 0 && (
              <div className="text-center py-12 text-secondary-400">
                No sales found
              </div>
            )}
          </div>
        </Card>

        {/* Receipt Modal */}
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Transaction Receipt"
          size="lg"
        >
          {selectedSale && (
            <div className="space-y-4">
              {/* Receipt Content */}
              <div className="text-center border-b border-secondary-200 pb-4">
                <h2 className="text-xl font-bold text-secondary-900">POS System</h2>
                <p className="text-sm text-secondary-500">123 Main Street, City</p>
                <p className="text-sm text-secondary-500">Tel: (555) 123-4567</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Transaction ID:</span>
                  <span className="font-mono font-medium">{selectedSale.transactionId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Date:</span>
                  <span>{selectedSale.date.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Cashier:</span>
                  <span>{selectedSale.cashier}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Customer:</span>
                  <span>{selectedSale.customerName}</span>
                </div>
              </div>

              <div className="border-t border-secondary-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${selectedSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${selectedSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-secondary-200">
                  <span>Total:</span>
                  <span>${selectedSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Payment Method:</span>
                  <span className="capitalize">{selectedSale.paymentMethod}</span>
                </div>
              </div>

              <div className="text-center text-sm text-secondary-500 pt-4 border-t border-secondary-200">
                <p>Thank you for your business!</p>
                <p>Please come again</p>
              </div>

              <div className="flex justify-center gap-3 mt-4">
                <Button variant="secondary" onClick={() => window.print()}>
                  Print Receipt
                </Button>
                <Button onClick={() => setIsReceiptModalOpen(false)}>
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