import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BellIcon, 
  MagnifyingGlassIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      navigate('/login');
    } catch (error) {
      showToast('Logout failed', 'error');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setShowProfileMenu(false);
  };

  return (
    <header className="fixed top-0 left-[240px] right-0 h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-6 z-20">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search products, customers, or orders..."
            className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors relative">
          <BellIcon className="w-5 h-5 text-secondary-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>
        
        {/* Subscription badge */}
        <div className="px-3 py-1 bg-primary-50 rounded-full">
          <span className="text-xs font-medium text-primary-600">Pro Plan</span>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-secondary-700 hidden md:inline">
              {user?.name?.split(' ')[0]}
            </span>
            <svg className="w-4 h-4 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-secondary-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-secondary-200">
                <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                <p className="text-xs text-secondary-500">{user?.email}</p>
                <p className="text-xs text-primary-600 mt-1 capitalize">Role: {user?.role}</p>
              </div>

              {/* Menu Items */}
              <button
                onClick={() => handleNavigation('/subscription/dashboard')}
                className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-3"
              >
                <CreditCardIcon className="w-4 h-4" />
                Subscription
              </button>
              <button
                onClick={() => handleNavigation('/subscription/invoices')}
                className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-3"
              >
                <DocumentTextIcon className="w-4 h-4" />
                Invoices
              </button>
              <button
                onClick={() => handleNavigation('/settings')}
                className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-3"
              >
                <Cog6ToothIcon className="w-4 h-4" />
                Settings
              </button>
              
              <div className="border-t border-secondary-200 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 flex items-center gap-3"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};