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
    <div className="h-screen pt-16 pl-[240px] bg-background">
      <div className="h-full grid grid-cols-12 gap-6 p-6">
        {/* Left side - Products */}
        <div className="col-span-7 space-y-4">
          <Card>
            <div className="space-y-4">
              {/* Search and barcode */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button variant="secondary" onClick={() => fetchProducts()}>
                  Refresh
                  </Button>
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-3 gap-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white p-4 rounded-lg border border-secondary-200 hover:border-primary-500 hover:shadow-md transition-all text-left"
                    disabled={product.stock === 0}
                  >
                    <div className="aspect-square bg-secondary-100 rounded-md mb-2 flex items-center justify-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <h3 className="font-medium text-secondary-900">{product.name}</h3>
                    <p className="text-sm text-secondary-500">$ {currencyFormatter.format(Number(product.price))}</p>
                    <p className="text-xs text-secondary-400 mt-1">
                      Stock: {product.stock} {product.sku && `| SKU: ${product.sku}`}
                      </p>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-secondary-400">
                    No products found
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right side - Cart */}
        <div className="col-span-5">
          <Card className="h-full flex flex-col">
            <h2 className="text-lg font-bold text-secondary-900 mb-4">Current Sale</h2>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-secondary-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">{item.name}</p>
                    <p className="text-sm text-secondary-500">${(Number(item.price)).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-secondary-200 rounded"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:bg-secondary-200 rounded"
                      disabled={item.quantity >= item.stock}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 hover:bg-danger-50 text-danger rounded"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-8 text-secondary-400">
                  {/* <ShoppingCartIcon className="w-12 h-12 mx-auto mb-2" /> */}
                  <p>Cart is empty</p>
                  <p className="text-sm mt-1">Click on products to add to cart</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="border-t border-secondary-200 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Subtotal</span>
                <span className="font-medium">${currencyFormatter.format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Tax (10%)</span>
                <span className="font-medium">${currencyFormatter.format(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Discount</span>
                  <span>-${currencyFormatter.format(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Total</span>
                <span>${currencyFormatter.format(total)}</span>
              </div>
            </div>

            {/* Payment methods */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              <Button
                variant={selectedPayment === 'cash' ? 'primary' : 'ghost'}
                onClick={() => setSelectedPayment('cash')}
                className="text-sm"
              >
                💵 Cash
              </Button>
              <Button
                variant={selectedPayment === 'card' ? 'primary' : 'ghost'}
                onClick={() => setSelectedPayment('card')}
                className="text-sm"
              >
                💳 Card
              </Button>
              <Button
                variant={selectedPayment === 'mobile' ? 'primary' : 'ghost'}
                onClick={() => setSelectedPayment('mobile')}
                className="text-sm"
              >
                📱 Mobile
              </Button>
              <Button
                variant={selectedPayment === 'credit' ? 'primary' : 'ghost'}
                onClick={() => setSelectedPayment('credit')}
                className="text-sm"
              >
                📝 Credit
              </Button>
            </div>

            {/* Credit payment details (shown only when credit selected) */}
            {selectedPayment === 'credit' && (
              <div className="mt-4 p-3 bg-warning-50 rounded-lg space-y-3">
                <Input label="Expected Payment Date" type="date" />
                <Input label="Notes" placeholder="Add payment notes..." />
                <Button variant="primary" fullWidth>Add Credit Customer</Button>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button variant="secondary" size="sm" onClick={() => setShowDiscountModal(true)}>
                Apply Discount
              </Button>
              <Button variant="secondary" size="sm">Hold Order</Button>
              <Button variant="danger" size="sm">Clear Cart</Button>
            </div>

            {/* Checkout button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-4"
              disabled={cart.length === 0 || loading}
              onClick={handleCheckout}
              loading={loading}
            >
              Complete Sale (${total.toFixed(2)})
            </Button>
          </Card>
        </div>
      </div>
      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Apply Discount</h3>
            <Input
              label="Discount Amount"
              type="number"
              step="0.01"
              placeholder="Enter discount amount"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowDiscountModal(false)}>Cancel</Button>
              <Button onClick={applyDiscount}>Apply</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};