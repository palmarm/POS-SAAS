import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'POS Checkout', href: '/pos', icon: ShoppingCartIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Sales History', href: '/sales', icon: ClockIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Subscription', href: '/subscription', icon: CreditCardIcon },
  { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-secondary-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-secondary-200">
        <h1 className="text-xl font-bold text-primary-600">POS SaaS</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User menu */}
      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">JD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-900">John Doe</p>
            <p className="text-xs text-secondary-500">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};