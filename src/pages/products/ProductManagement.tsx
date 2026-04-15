import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { productAPI, categoryAPI } from '../../services/api';
import { set } from 'react-hook-form';
import { number } from 'yup';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name: string;
  stock: number;
  sku?: string;
  image_url?: string;
  created_at: string;
} 

interface Category {
  id: number;
  name: string;
  description?: string;
}

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    stock: 0,
    sku: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Fetch products (simulated)
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const normalizeProduct = (product: any): Product => ({
  id: Number(product.id) || 0,
  name: product.name ?? '',
  description: product.description ?? '',
  price: Number(product.price) || 0, // ✅ Ensures price is a number
  category_id: Number(product.category_id) || 0,
  category_name: product.category_name ?? 'Uncategorized',
  stock: Number(product.stock ?? product.stock_quantity) || 0,
  sku: product.sku ?? '',
  image_url: product.image_url ?? '',
  created_at: product.created_at ?? new Date().toISOString(),
});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getAll();
      
      let productsData:any[] = [];
      
      // Handle different response structures
      if (response.data && response.data.data) {
        productsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      } else {
        console.error('Unexpected products response:', response.data);
        productsData = [];
      }
      // Normalize products to ensure consistent structure
      const normalizedProducts: Product[] = productsData.map(normalizeProduct);

      setProducts(normalizedProducts);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      showToast(error.response?.data?.message || 'Failed to fetch products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      showToast(error.response?.data?.message || 'Failed to fetch categories', 'error');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' 
      || product.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (!formData.category_id) {
      showToast('Please select a category', 'error');
      return;
    }
    if (Number(formData.price) <= 0) {
      showToast('Price must be greater than zero', 'error');
      return;
    }
    if (Number(formData.stock) < 0) {
      showToast('Stock cannot be negative', 'error');
      return;
    }

    setLoading(true);
    try {
      // Retrieve branch_id from stored business data if available
      const business = JSON.parse(localStorage.getItem('business') || '{}');

      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        price: Number(formData.price),
        category_id: Number(formData.category_id),
        branch_id: business?.branch_id || 1, // Include branch_id if available
        stock: Number(formData.stock),
        ...formData.sku && { sku: formData.sku.trim() },
        ...formData.image_url && { image_url: formData.image_url.trim() }
      };
      console.log('Submitting product data:', productData);

      if (editingProduct) {
        await productAPI.update(editingProduct.id, productData);
        showToast('Product updated successfully', 'success');
      } else {
        await productAPI.create(productData);
        showToast('Product created successfully', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      await fetchProducts(); // Refresh product list after changes
    } catch (error: any) {
      console.error('Product operation error:', error.response?.data || error);

      const errorMessage = 
        error.response?.data ||
        error.response?.data.error ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response.data.errors.map((e: any) => e.msg).join(', ')
          : 'Operation failed');

      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        await productAPI.delete(id);
        showToast('Product deleted successfully', 'success');
        fetchProducts(); // Refresh product list after deletion
      } catch (error: any) {
        showToast(error.response?.data?.message || 'Failed to delete product', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => { // Clear form data and reset editing state
    setFormData({
      name: '',
      description: '',
      price: 0,
      category_id: 0,
      stock: 0,
      sku: '',
      image_url: ''
    });
    setEditingProduct(null);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category_id: product.category_id,
      stock: product.stock,
      sku: product.sku || '',
      image_url: product.image_url || ''
    });
    setIsModalOpen(true);
  };
  const getCategoryName = (category_id: number) => {
    const category = categories.find(c => c.id === category_id);
    return category ?.name || 'Unknown';
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
                onChange={(e) => setSelectedCategory(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                  <th className="text-left px-6 py-3 text-sm font-medium text-secondary-600">SKU</th>
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
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-secondary-900">{product.name}</p>
                        <p className="text-sm text-secondary-500">{product.description?.substring(0, 50)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">{product.sku || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-secondary-100 rounded-full text-xs text-secondary-600">
                        {getCategoryName(product.category_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                        {new Intl.NumberFormat('en-KE', {
                          style: 'currency',
                          currency: 'KES',
                        }).format(product.price)}
                      </td>
                    {/* <td className="px-6 py-4 text-right font-medium">${Number(product.price).toFixed(2)}</td> */}
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
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Enter SKU (optional)"
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
                onChange={(e) => setFormData({ 
                  ...formData, 
                  price: e.target.value === '' ? 0 : Number(e.target.value),
                 })}
                placeholder="0.00"
              />
              <Input
                label="Stock *"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  stock: e.target.value === '' ? 0 : Number(e.target.value),
                 })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Category *</label>
              <select
                className="w-full rounded-lg border border-secondary-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.category_id}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  category_id: e.target.value ? Number(e.target.value) : 0,
                })}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Image URL"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="Enter image URL (optional)"
            />
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