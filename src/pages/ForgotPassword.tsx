import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSent(true);
      showToast('Password reset link sent to your email', 'success');
    } catch (error) {
      showToast('Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Reset Password</h1>
          <p className="text-secondary-500 mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<EnvelopeIcon className="w-5 h-5" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
            >
              Send Reset Link
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-success-50 text-success-700 p-4 rounded-lg">
              <p>Check your email for password reset instructions.</p>
            </div>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Return to Login
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};