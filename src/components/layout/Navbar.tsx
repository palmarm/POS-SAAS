import React from 'react';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-[240px] right-0 h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors relative">
          <BellIcon className="w-5 h-5 text-secondary-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>
        
        {/* Subscription badge */}
        <div className="px-3 py-1 bg-primary-50 rounded-full">
          <span className="text-xs font-medium text-primary-600">Pro Plan</span>
        </div>
      </div>
    </header>
  );
};