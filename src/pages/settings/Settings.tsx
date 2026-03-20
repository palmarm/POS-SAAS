import React, { useState } from 'react';
import { Switch } from '@headlessui/react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PlusIcon } from '@heroicons/react/24/outline';

interface Role {
  id: string;
  name: string;
  permissions: {
    products: { create: boolean; edit: boolean; delete: boolean };
    sales: { view: boolean; refund: boolean };
    reports: { view: boolean; export: boolean };
    customers: { manage: boolean };
    settings: { manage: boolean };
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
}

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'general'>('roles');
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'admin',
      name: 'Administrator',
      permissions: {
        products: { create: true, edit: true, delete: true },
        sales: { view: true, refund: true },
        reports: { view: true, export: true },
        customers: { manage: true },
        settings: { manage: true }
      }
    },
    {
      id: 'manager',
      name: 'Manager',
      permissions: {
        products: { create: true, edit: true, delete: false },
        sales: { view: true, refund: true },
        reports: { view: true, export: true },
        customers: { manage: true },
        settings: { manage: false }
      }
    },
    {
      id: 'cashier',
      name: 'Cashier',
      permissions: {
        products: { create: false, edit: false, delete: false },
        sales: { view: true, refund: false },
        reports: { view: false, export: false },
        customers: { manage: false },
        settings: { manage: false }
      }
    }
  ]);
  
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John Admin', email: 'admin@pos.com', roleId: 'admin' },
    { id: '2', name: 'Jane Manager', email: 'manager@pos.com', roleId: 'manager' },
    { id: '3', name: 'Bob Cashier', email: 'cashier@pos.com', roleId: 'cashier' }
  ]);
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', roleId: 'cashier' });
  const [companyName, setCompanyName] = useState('POS System');
  const [taxRate, setTaxRate] = useState(10);
  const [currency, setCurrency] = useState('USD');

  const updatePermission = (roleId: string, category: keyof Role['permissions'], permission: string, value: boolean) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [category]: {
              ...role.permissions[category],
              [permission]: value
            }
          }
        };
      }
      return role;
    }));
  };

  const addRole = () => {
    if (newRoleName) {
      const newRole: Role = {
        id: newRoleName.toLowerCase().replace(/\s/g, '-'),
        name: newRoleName,
        permissions: {
          products: { create: false, edit: false, delete: false },
          sales: { view: false, refund: false },
          reports: { view: false, export: false },
          customers: { manage: false },
          settings: { manage: false }
        }
      };
      setRoles([...roles, newRole]);
      setNewRoleName('');
      setIsRoleModalOpen(false);
    }
  };

  const addUser = () => {
    if (newUser.name && newUser.email) {
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        roleId: newUser.roleId
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', password: '', roleId: 'cashier' });
      setIsUserModalOpen(false);
    }
  };

  return (
    <div className="pt-16 pl-[240px] bg-background min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-secondary-200 mb-6">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'roles'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Roles & Permissions
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            General
          </button>
        </div>

        {/* Roles & Permissions Tab */}
        {activeTab === 'roles' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-secondary-900">User Roles</h2>
              <Button icon={<PlusIcon className="w-5 h-5" />} onClick={() => setIsRoleModalOpen(true)}>
                Add Role
              </Button>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Role List */}
              <div className="col-span-3">
                <Card>
                  <div className="space-y-2">
                    {roles.map(role => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedRole?.id === role.id
                            ? 'bg-primary-50 text-primary-600'
                            : 'hover:bg-secondary-50 text-secondary-700'
                        }`}
                      >
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm text-secondary-500 mt-1">
                          {Object.values(role.permissions).flatMap(p => Object.values(p)).filter(v => v).length} permissions
                        </p>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Permissions Matrix */}
              <div className="col-span-9">
                {selectedRole && (
                  <Card>
                    <h3 className="text-lg font-bold text-secondary-900 mb-4">
                      Permissions for {selectedRole.name}
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Products Section */}
                      <div>
                        <h4 className="font-medium text-secondary-900 mb-3">Products</h4>
                        <div className="space-y-2">
                          <PermissionSwitch
                            label="Create Products"
                            checked={selectedRole.permissions.products.create}
                            onChange={(v) => updatePermission(selectedRole.id, 'products', 'create', v)}
                          />
                          <PermissionSwitch
                            label="Edit Products"
                            checked={selectedRole.permissions.products.edit}
                            onChange={(v) => updatePermission(selectedRole.id, 'products', 'edit', v)}
                          />
                          <PermissionSwitch
                            label="Delete Products"
                            checked={selectedRole.permissions.products.delete}
                            onChange={(v) => updatePermission(selectedRole.id, 'products', 'delete', v)}
                          />
                        </div>
                      </div>

                      {/* Sales Section */}
                      <div>
                        <h4 className="font-medium text-secondary-900 mb-3">Sales</h4>
                        <div className="space-y-2">
                          <PermissionSwitch
                            label="View Sales"
                            checked={selectedRole.permissions.sales.view}
                            onChange={(v) => updatePermission(selectedRole.id, 'sales', 'view', v)}
                          />
                          <PermissionSwitch
                            label="Process Refunds"
                            checked={selectedRole.permissions.sales.refund}
                            onChange={(v) => updatePermission(selectedRole.id, 'sales', 'refund', v)}
                          />
                        </div>
                      </div>

                      {/* Reports Section */}
                      <div>
                        <h4 className="font-medium text-secondary-900 mb-3">Reports</h4>
                        <div className="space-y-2">
                          <PermissionSwitch
                            label="View Reports"
                            checked={selectedRole.permissions.reports.view}
                            onChange={(v) => updatePermission(selectedRole.id, 'reports', 'view', v)}
                          />
                          <PermissionSwitch
                            label="Export Reports"
                            checked={selectedRole.permissions.reports.export}
                            onChange={(v) => updatePermission(selectedRole.id, 'reports', 'export', v)}
                          />
                        </div>
                      </div>

                      {/* Customers Section */}
                      <div>
                        <h4 className="font-medium text-secondary-900 mb-3">Customers</h4>
                        <PermissionSwitch
                          label="Manage Customers"
                          checked={selectedRole.permissions.customers.manage}
                          onChange={(v) => updatePermission(selectedRole.id, 'customers', 'manage', v)}
                        />
                      </div>

                      {/* Settings Section */}
                      <div>
                        <h4 className="font-medium text-secondary-900 mb-3">System Settings</h4>
                        <PermissionSwitch
                          label="Manage Settings"
                          checked={selectedRole.permissions.settings.manage}
                          onChange={(v) => updatePermission(selectedRole.id, 'settings', 'manage', v)}
                        />
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-secondary-900">System Users</h2>
              <Button icon={<PlusIcon className="w-5 h-5" />} onClick={() => setIsUserModalOpen(true)}>
                Add User
              </Button>
            </div>

            <Card>
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Email</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Role</th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 font-medium">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-secondary-100 rounded-full text-xs">
                          {roles.find(r => r.id === user.roleId)?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-primary-600 hover:text-primary-700 mr-3">Edit</button>
                        <button className="text-danger-600 hover:text-danger-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <Card>
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Company Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Tax Rate (%)</label>
                  <Input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Currency</label>
                  <select
                    className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="KES">KES - Kenyan Shilling</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Receipt Footer Message</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Thank you for your business!"
                />
              </div>

              <div className="pt-4">
                <Button>Save Settings</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Add Role Modal */}
        <Modal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          title="Create New Role"
        >
          <Input
            label="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="e.g., Supervisor"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
            <Button onClick={addRole}>Create Role</Button>
          </div>
        </Modal>

        {/* Add User Modal */}
        <Modal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          title="Add New User"
        >
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Enter full name"
            />
            <Input
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Enter email"
            />
            <Input
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Enter password"
            />
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Role</label>
              <select
                className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={newUser.roleId}
                onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
              <Button onClick={addUser}>Add User</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Permission Switch Component
const PermissionSwitch: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-secondary-700">{label}</span>
      <Switch
        checked={checked}
        onChange={onChange}
        className={`${checked ? 'bg-primary-600' : 'bg-secondary-200'}
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
      >
        <span
          className={`${checked ? 'translate-x-6' : 'translate-x-1'}
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
    </div>
  );
};