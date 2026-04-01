import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'cashier';
    phone: string;
    is_active: boolean;
    created_at: string;
}

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'cashier' as 'admin' | 'manager' | 'cashier',
    });
    const { showToast } = useToast();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getAll();
            setUsers(response.data.data);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            if (editingUser) {
                await userAPI.update(editingUser.id, formData);
                showToast('User updated successfully', 'success');
            } else {
                await userAPI.create(formData);
                showToast('User created successfully', 'success');
            }
            setIsModalOpen(false);
            resetForm();
            fetchUsers();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Operation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (id === currentUser?.id) {
            showToast('Cannot delete your own account', 'error');
            return;
        }
        
        if (window.confirm('Are you sure you want to delete this user?')) {
            setLoading(true);
            try {
                await userAPI.delete(id);
                showToast('User deleted successfully', 'success');
                fetchUsers();
            } catch (error: any) {
                showToast(error.response?.data?.message || 'Delete failed', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            role: 'cashier',
        });
        setEditingUser(null);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            phone: user.phone || '',
            role: user.role,
        });
        setIsModalOpen(true);
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            admin: 'bg-danger-100 text-danger-700',
            manager: 'bg-warning-100 text-warning-700',
            cashier: 'bg-info-100 text-info-700',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[role as keyof typeof colors]}`}>{role}</span>;
    };

    return (
        <div className="pt-16 pl-[240px] bg-background min-h-screen">
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-900">Team Management</h1>
                        <p className="text-secondary-500 mt-1">Manage your team members and their roles</p>
                    </div>
                    <Button icon={<PlusIcon className="w-5 h-5" />} onClick={() => setIsModalOpen(true)}>
                        Add Team Member
                    </Button>
                </div>

                {/* Users Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary-50 border-b border-secondary-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Name</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Email</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Role</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Phone</th>
                                    <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Status</th>
                                    <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-200">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-secondary-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-secondary-900">{user.name}</td>
                                        <td className="px-6 py-4 text-secondary-600">{user.email}</td>
                                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                        <td className="px-6 py-4 text-secondary-600">{user.phone || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                user.is_active ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
                                            }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-1 hover:bg-secondary-100 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="w-5 h-5 text-secondary-600" />
                                                </button>
                                                {user.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-1 hover:bg-danger-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-5 h-5 text-danger" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="text-center py-12 text-secondary-400">
                                <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
                                <p>No team members yet</p>
                                <p className="text-sm mt-1">Click "Add Team Member" to invite someone</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Add/Edit User Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        resetForm();
                    }}
                    title={editingUser ? 'Edit Team Member' : 'Add Team Member'}
                >
                    <div className="space-y-4">
                        <Input
                            label="Full Name *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter full name"
                        />
                        <Input
                            label="Email *"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter email address"
                        />
                        {!editingUser && (
                            <Input
                                label="Password *"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter password"
                            />
                        )}
                        <Input
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Enter phone number"
                        />
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Role *</label>
                            <select
                                className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                            >
                                <option value="admin">Admin - Full access</option>
                                <option value="manager">Manager - Can manage products and sales</option>
                                <option value="cashier">Cashier - Can process sales only</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} loading={loading}>
                                {editingUser ? 'Update' : 'Create'} User
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};