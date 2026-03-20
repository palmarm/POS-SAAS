import React, { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

export const PosCheckout: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'card' | 'mobile' | 'credit'>('cash');
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Sample products (would come from API)
  const products: Product[] = [
    { id: '1', name: 'Wireless Mouse', price: 29.99, category: 'Electronics', stock: 15 },
    { id: '2', name: 'Mechanical Keyboard', price: 89.99, category: 'Electronics', stock: 8 },
    { id: '3', name: 'USB-C Cable', price: 12.99, category: 'Accessories', stock: 50 },
    { id: '4', name: 'Monitor Stand', price: 45.99, category: 'Furniture', stock: 12 },
  ];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax - discount;

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
                    placeholder="Search products or scan barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="secondary">Scan</Button>
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
                      <span className="text-2xl">📦</span>
                    </div>
                    <h3 className="font-medium text-secondary-900">{product.name}</h3>
                    <p className="text-sm text-secondary-500">${product.price}</p>
                    <p className="text-xs text-secondary-400 mt-1">Stock: {product.stock}</p>
                  </button>
                ))}
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
                    <p className="text-sm text-secondary-500">${item.price}</p>
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
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="border-t border-secondary-200 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
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
              disabled={cart.length === 0}
            >
              Complete Sale (${total.toFixed(2)})
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};