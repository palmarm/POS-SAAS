import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  createdAt: Date;
}

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Categories (would come from API)
  const categories = ['Electronics', 'Clothing', 'Food', 'Accessories', 'Furniture'];

  // Fetch products (simulated)
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockProducts: Product[] = [
        { id: '1', name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 29.99, category: 'Electronics', stock: 15, createdAt: new Date() },
        { id: '2', name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', price: 89.99, category: 'Electronics', stock: 8, createdAt: new Date() },
        { id: '3', name: 'Cotton T-Shirt', description: '100% cotton t-shirt', price: 19.99, category: 'Clothing', stock: 25, createdAt: new Date() },
      ];
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingProduct) {
        // Update product
        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id 
            ? { ...p, ...formData, price: Number(formData.price), stock: Number(formData.stock) }
            : p
        ));
        showToast('Product updated successfully', 'success');
      } else {
        // Create product
        const newProduct: Product = {
          id: Date.now().toString(),
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          createdAt: new Date()
        };
        setProducts(prev => [...prev, newProduct]);
        showToast('Product created successfully', 'success');
      }
      setIsModalOpen(false);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast('Product deleted successfully', 'success');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: 0, category: '', stock: 0, image: '' });
    setEditingProduct(null);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="pt-16 pl-[240px] bg-background min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Product Management</h1>
            <p className="text-secondary-500 mt-1">Manage your inventory and products</p>
          </div>
          <Button icon={<PlusIcon className="w-5 h-5" />} onClick={() => setIsModalOpen(true)}>
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
              <Input
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-span-4">
              <select
                className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Products Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Image</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">Category</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Price</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-secondary-600">Stock</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📦</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-secondary-900">{product.name}</p>
                        <p className="text-sm text-secondary-500">{product.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-secondary-100 rounded-full text-xs text-secondary-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.stock < 10 ? 'bg-danger-100 text-danger-700' : 'bg-success-100 text-success-700'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1 hover:bg-secondary-100 rounded transition-colors"
                        >
                          <PencilIcon className="w-5 h-5 text-secondary-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1 hover:bg-danger-50 rounded transition-colors"
                        >
                          <TrashIcon className="w-5 h-5 text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-secondary-400">
                No products found
              </div>
            )}
          </div>
        </Card>

        {/* Product Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
        >
          <div className="space-y-4">
            <Input
              label="Product Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price *"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
              <Input
                label="Stock *"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Category *</label>
              <select
                className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} loading={loading}>
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};