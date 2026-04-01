import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Login } from './pages/Login';
import { SignUp } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { PosCheckout } from './pages/pos/PosCheckout';
import { ProductManagement } from './pages/products/ProductManagement';
import { CustomerManagement } from './pages/customers/CustomerManagement';
import { SalesHistory } from './pages/sales/SalesHistory';
import { Reports } from './pages/reports/Reports';
import { Settings } from './pages/settings/Settings';
import { PricingPlans } from './pages/subscription/PricingPlans';
import { SubscriptionDashboard } from './pages/subscription/SubscriptionDashboard';
import { PaymentScreen } from './pages/subscription/PaymentScreen';
import { InvoiceHistory } from './pages/subscription/InvoiceHistory';
import { UserManagement } from './pages/users/UserManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/pricing" element={<PricingPlans />} />
          
          {/* Protected Routes with Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 ml-[240px]">
                    <Navbar />
                    <main className="pt-16">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/pos" element={<PosCheckout />} />
                        <Route path="/products" element={<ProductManagement />} />
                        <Route path="/customers" element={<CustomerManagement />} />
                        <Route path="/sales" element={<SalesHistory />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/subscription/dashboard" element={<SubscriptionDashboard />} />
                        <Route path="/subscription/checkout" element={<PaymentScreen />} />
                        <Route path="/subscription/invoices" element={<InvoiceHistory />} />
                        <Route path="/users" element={<UserManagement />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;