import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, business } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    
    if (result.success) {
      showToast('Login successful!', 'success');
      navigate('/dashboard');
    } else {
      showToast(result.error || 'Login failed', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">POS System</h1>
          <p className="text-secondary-500 mt-2">Sign in to your business account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@pos.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<EnvelopeIcon className="w-5 h-5" />}
            required
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockClosedIcon className="w-5 h-5" />}
            required
          />

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-secondary-300" />
              <span className="text-secondary-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
          <p className="text-sm text-secondary-600 text-center font-medium mb-2">
            Demo Credentials
          </p>
          <div className="space-y-1 text-xs text-secondary-500">
            <p className="flex justify-between">
              <span>Admin:</span>
              <span className="font-mono">admin@pos.com / admin123</span>
            </p>
            <p className="flex justify-between">
              <span>Cashier:</span>
              <span className="font-mono">cashier@pos.com / cashier123</span>
            </p>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-600">
            Don't have a business account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Start free trial
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};