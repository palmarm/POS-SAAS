import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { productAPI, saleAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { set } from 'react-hook-form';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category_name?: string;
  stock: number;
  sku?: string;
  image_url?: string;
  description?: string;
}

export const PosCheckout: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'card' | 'mobile' | 'credit'>('cash');
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const normalizeProduct = (product: any): Product => ({
    id: Number(product.id) || 0,
    name: product.name ?? '',
    price: Number(product.price) || 0, // ✅ Ensures price is a number
    category_id: Number(product.category_id) || 0,
    category_name: product.category_name ?? '',
    stock: Number(product.stock ?? product.stock_quantity) || 0,
    sku: product.sku ?? '',
    image_url: product.image_url ?? '',
    description: product.description ?? '',
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


  const filteredProducts = Array.isArray(products) 
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      showToast('Product is out of stock', 'warning');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Only ${product.stock} items in stock`, 'warning');
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        stock: product.stock,
        image: product.image_url

      }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          if (newQuantity < 1) return item;
          if (newQuantity > item.stock) {
            showToast(`Only ${item.stock} items in stock`, 'warning');
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );     
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
      setDiscount(0);
      showToast('Cart cleared', 'info');
    }
  };

  const applyDiscount = () => {
    if (discountAmount > 0 && discountAmount <= subtotal) {
      setDiscount(discountAmount);
      setShowDiscountModal(false);
      showToast(`Discount of $${discountAmount} applied`, 'success');
    } else if (discountAmount > subtotal) {
      showToast('Discount cannot exceed subtotal', 'error');
    }  
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'warning');
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        customer_id: null, // Can be extended to select customer
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.price) * item.quantity
        })),
        subtotal: Number(subtotal),
        tax: Number(tax),
        discount: Number(discount),
        total: Number(total),
        payment_type: selectedPayment,
        payment_details: {
          method: selectedPayment,
          amount: Number(total),
        },
        notes: `Discount applied: $${discount}`,
      };
      console.log('Submitting sale data:', saleData);

      // Call API to create sale
      const response = await saleAPI.create(saleData);

      if (response.data.success) {
        showToast('Sale completed successfully', 'success');
        // Print receipt logic can go here
        setCart([]);
        setDiscount(0);
        // Refresh products to update stock levels
        await fetchProducts();
      }
    } catch (error: any) {
      console.error('Error creating sale:', error);
      showToast(error.response?.data?.message || 'Sale Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [creditCustomer, setCreditCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    expectedPaymentDate: ''
  });

  const handleAddCreditCustomer = () => {
      if (!creditCustomer.name || !creditCustomer.phone) {
        showToast('Customer name and phone are required', 'error');
        return;
    }

    const newCustomer = {
        id: Date.now().toString(),
        name: creditCustomer.name,
        email: creditCustomer.email || '',
        phone: creditCustomer.phone,
        totalPurchases: total,
        outstandingBalance: total,
        creditStatus: 'pending',
        expectedPaymentDate: new Date(creditCustomer.expectedPaymentDate),
        notes: creditCustomer.notes,
        createdAt: new Date()
    };

    // Save to localStorage (temporary solution)
    const existing = JSON.parse(localStorage.getItem('customers') || '[]');
    localStorage.setItem('customers', JSON.stringify([...existing, newCustomer]));

    showToast('Credit customer added successfully', 'success');

    // Reset form
    setCreditCustomer({
      name: '',
      phone: '',
      email: '',
      notes: '',
      expectedPaymentDate: ''
    });
  };

  // Format currency
  const currencyFormatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax - discount;

  // Show loading state while fetching products
  if (loading && products.length === 0) {
    return (
      <div className="h-screen pt-16 pl-[240px] bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="h-screen pt-16 pl-[240px] bg-slate-50">
    <div className="h-full grid grid-cols-12 gap-6 p-6">
      
      {/* ===================== */}
      {/* Product Selection Area */}
      {/* ===================== */}
      <div className="col-span-12 xl:col-span-7 space-y-4">
        <Card className="p-5 shadow-sm rounded-2xl border border-slate-200">
          
          {/* Search & Refresh */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Input
                icon={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              variant="secondary"
              onClick={fetchProducts}
              className="px-5 py-2 rounded-xl"
            >
              Refresh
            </Button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="group bg-white rounded-2xl border border-slate-200 p-4 text-left 
                           hover:shadow-lg hover:border-primary-500 transition-all duration-200"
              >
                {/* Product Image */}
                <div className="aspect-square bg-slate-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-14 h-14 object-cover"
                    />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>

                {/* Product Info */}
                <h3 className="font-semibold text-slate-800 group-hover:text-primary-600">
                  {product.name}
                </h3>
                <p className="text-primary-600 font-bold mt-1">
                  {currencyFormatter.format(Number(product.price))}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Stock: {product.stock} {product.sku && `| SKU: ${product.sku}`}
                </p>

                {product.stock === 0 && (
                  <span className="inline-block mt-2 text-xs text-red-500 font-medium">
                    Out of Stock
                  </span>
                )}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              No products found
            </div>
          )}
        </Card>
      </div>

      {/* ===================== */}
      {/* Current Sale Panel */}
      {/* ===================== */}
      <div className="col-span-12 xl:col-span-5">
        <Card className="h-full flex flex-col p-5 shadow-sm rounded-2xl border border-slate-200">
          
          {/* Header */}
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Current Sale
          </h2>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-500">
                    {currencyFormatter.format(Number(item.price))}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1.5 bg-white border rounded-lg hover:bg-slate-100"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-1.5 bg-white border rounded-lg hover:bg-slate-100"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <p className="font-medium">Cart is empty</p>
                <p className="text-sm mt-1">
                  Click on products to add to cart
                </p>
              </div>
            )}
          </div>

          {/* ===================== */}
          {/* Order Summary */}
          {/* ===================== */}
          <div className="border-t pt-4 mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium">
                {currencyFormatter.format(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (10%)</span>
              <span className="font-medium">
                {currencyFormatter.format(tax)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{currencyFormatter.format(discount)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-3 mt-3 border-t">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary-600">
                {currencyFormatter.format(total)}
              </span>
            </div>
          </div>

          {/* ===================== */}
          {/* Payment Methods */}
          {/* ===================== */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            <Button
              className={`rounded-xl ${
                selectedPayment === 'cash'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-50 text-green-700'
              }`}
              onClick={() => setSelectedPayment('cash')}
            >
              💵 Cash
            </Button>
            <Button
              className={`rounded-xl ${
                selectedPayment === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700'
              }`}
              onClick={() => setSelectedPayment('card')}
            >
              💳 Card
            </Button>
            <Button
              className={`rounded-xl ${
                selectedPayment === 'mobile'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-50 text-orange-700'
              }`}
              onClick={() => setSelectedPayment('mobile')}
            >
              📱 Mobile
            </Button>
            <Button
              className={`rounded-xl ${
                selectedPayment === 'credit'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700'
              }`}
              onClick={() => setSelectedPayment('credit')}
            >
              📝 Credit
            </Button>
          </div>

          {/* Credit Details */}
          {selectedPayment === 'credit' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl space-y-3">
              <Input 
                label="Customer Name"
                placeholder="Enter customer name"
                value={creditCustomer.name}
                onChange={(e) => 
                  setCreditCustomer({...creditCustomer, name: e.target.value})}
               />
              <Input 
                label="Phone"
                placeholder="Enter phone number"
                value={creditCustomer.phone}
                onChange={(e) => 
                  setCreditCustomer({...creditCustomer, phone: e.target.value})}
               />
              <Input 
                label="Email"
                placeholder="Enter email address"
                value={creditCustomer.email}
                onChange={(e) => 
                  setCreditCustomer({...creditCustomer, email: e.target.value})}
               />
              <Input 
                label="Notes"
                placeholder="Add payment notes..."
                value={creditCustomer.notes}
                onChange={(e) => 
                  setCreditCustomer({...creditCustomer, notes: e.target.value})}
               />
              <Input 
                label="Expected Payment Date"
                type="date"
                value={creditCustomer.expectedPaymentDate}
                onChange={(e) => 
                  setCreditCustomer({...creditCustomer, expectedPaymentDate: e.target.value})}
                />
              <Button 
                variant="primary" 
                fullWidth
                onClick={handleAddCreditCustomer}
                >
                Add Credit Customer
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDiscountModal(true)}
              className="rounded-xl"
            >
              Apply Discount
            </Button>
            <Button variant="secondary" size="sm" className="rounded-xl">
              Hold Order
            </Button>
            <Button variant="danger" size="sm" className="rounded-xl">
              Clear Cart
            </Button>
          </div>

          {/* Checkout Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-5 rounded-xl text-lg font-semibold shadow-md"
            disabled={cart.length === 0 || loading}
            onClick={handleCheckout}
            loading={loading}
          >
            Complete Sale ({currencyFormatter.format(total)})
          </Button>
        </Card>
      </div>
    </div>

    {/* ===================== */}
    {/* Discount Modal */}
    {/* ===================== */}
    {showDiscountModal && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="max-w-md w-full mx-4 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Apply Discount
          </h3>
          <Input
            label="Discount Amount"
            type="number"
            step="0.01"
            placeholder="Enter discount amount"
            value={discountAmount}
            onChange={(e) =>
              setDiscountAmount(parseFloat(e.target.value) || 0)
            }
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => setShowDiscountModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={applyDiscount}>Apply</Button>
          </div>
        </Card>
      </div>
    )}
  </div>
);
};