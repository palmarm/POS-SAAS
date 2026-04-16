import React, { useState, useEffect } from 'react';
import { PlusIcon,
     PencilIcon,
     TrashIcon,
     MagnifyingGlassIcon,
     CreditCardIcon, 
     BellIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';


interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalPurchases: number;
  outstandingBalance: number;
  creditStatus: 'paid' | 'pending' | 'overdue';
  expectedPaymentDate: Date;
  notes?: string;
  createdAt: Date;
}

interface CreditTransaction {
  id: string;
  customerId: string;
  amount: number;
  type: 'credit' | 'payment';
  date: Date;
  notes: string;
}

export const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [creditFilter, setCreditFilter] = useState<'all' | 'credit' | 'overdue' | 'paid'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');

      const parsedCustomers = storedCustomers.map((c: any) => ({
        ...c,
        expectedPaymentDate: new Date(c.expectedPaymentDate),
        createdAt: new Date(c.createdAt)
      }));

      setCustomers(parsedCustomers);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = creditFilter === 'all' || customer.creditStatus === creditFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: Customer['creditStatus']) => {
    const config = {
      paid: { bg: 'bg-success-100', text: 'text-success-700', label: 'Paid' },
      pending: { bg: 'bg-warning-100', text: 'text-warning-700', label: 'Pending' },
      overdue: { bg: 'bg-danger-100', text: 'text-danger-700', label: 'Overdue' }
    };
    const { bg, text, label } = config[status];
    return <span className={`px-2 py-1 rounded-full text-xs ${bg} ${text}`}>{label}</span>;
  };

  const handleRecordPayment = async (customer: Customer) => {
    if (paymentAmount <= 0 || paymentAmount > customer.outstandingBalance) {
      showToast('Invalid payment amount', 'error');
      return;
    }

    setLoading(true);
    try {
      // Update customer balance
      setCustomers(prev => prev.map(c =>
        c.id === customer.id
          ? {
              ...c,
              outstandingBalance: c.outstandingBalance - paymentAmount,
              creditStatus: c.outstandingBalance - paymentAmount === 0 ? 'paid' : 'pending'
            }
          : c
      ));
      
      // Record transaction
      const newTransaction: CreditTransaction = {
        id: Date.now().toString(),
        customerId: customer.id,
        amount: paymentAmount,
        type: 'payment',
        date: new Date(),
        notes: paymentNotes
      };
      setTransactions(prev => [...prev, newTransaction]);
      
      showToast(`Payment of $${paymentAmount} recorded successfully`, 'success');
      setIsPaymentModalOpen(false);
      setPaymentAmount(0);
      setPaymentNotes('');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = (customer: Customer) => {
    showToast(`Reminder sent to ${customer.name} about overdue payment of $${customer.outstandingBalance}`, 'info');
  };

  return (
    <div className="pt-16 pl-[240px] bg-background min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Customer Management</h1>
            <p className="text-secondary-500 mt-1">Manage customers and track credit balances</p>
          </div>
          <Button icon={<PlusIcon className="w-5 h-5" />} onClick={() => setIsModalOpen(true)}>
            Add Customer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="text-center">
            <p className="text-sm text-secondary-500 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-secondary-900">{customers.length}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-secondary-500 mb-1">Outstanding Credit</p>
            <p className="text-2xl font-bold text-warning-600">
              ${customers.reduce((sum, c) => sum + c.outstandingBalance, 0).toFixed(2)}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-secondary-500 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-danger-600">
              ${customers.filter(c => c.creditStatus === 'overdue').reduce((sum, c) => sum + c.outstandingBalance, 0).toFixed(2)}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-secondary-500 mb-1">Total Purchases</p>
            <p className="text-2xl font-bold text-secondary-900">
              ${customers.reduce((sum, c) => sum + c.totalPurchases, 0).toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <Input
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-span-4">
              <select
                className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={creditFilter}
                onChange={(e) => setCreditFilter(e.target.value as any)}
              >
                <option value="all">All Customers</option>
                <option value="credit">Credit Customers</option>
                <option value="overdue">Overdue</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Customers Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Contact</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Total Purchases</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Outstanding</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Status</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Expected Payment</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-secondary-900">{customer.name}</p>
                        <p className="text-sm text-secondary-500">{customer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">{customer.phone}</td>
                    <td className="px-6 py-4 text-right font-medium">${customer.totalPurchases.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-bold text-warning-600">
                      ${customer.outstandingBalance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(customer.creditStatus)}</td>
                    <td className="px-6 py-4 text-center text-sm">
                      {customer.expectedPaymentDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {customer.outstandingBalance > 0 && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setIsPaymentModalOpen(true);
                              }}
                              className="p-1 hover:bg-success-50 rounded transition-colors"
                              title="Record Payment"
                            >
                              <CreditCardIcon className="w-5 h-5 text-success" />
                            </button>
                            <button
                              onClick={() => handleSendReminder(customer)}
                              className="p-1 hover:bg-warning-50 rounded transition-colors"
                              title="Send Reminder"
                            >
                              <BellIcon className="w-5 h-5 text-warning" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            // Open details modal
                          }}
                          className="p-1 hover:bg-secondary-100 rounded transition-colors"
                        >
                          <PencilIcon className="w-5 h-5 text-secondary-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12 text-secondary-400">
                No customers found
              </div>
            )}
          </div>
        </Card>

        {/* Payment Modal */}
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentAmount(0);
            setPaymentNotes('');
          }}
          title={`Record Payment - ${selectedCustomer?.name}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-warning-600">${selectedCustomer?.outstandingBalance.toFixed(2)}</p>
            </div>
            <Input
              label="Payment Amount"
              type="number"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
              placeholder="Enter amount"
            />
            <Input
              label="Notes"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Payment notes..."
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => selectedCustomer && handleRecordPayment(selectedCustomer)}
                disabled={paymentAmount <= 0}
                loading={loading}
              >
                Record Payment
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add Customer Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Customer"
        >
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button>Add Customer</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};