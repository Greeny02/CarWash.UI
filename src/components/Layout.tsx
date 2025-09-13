import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, ShoppingCart, LogOut, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useSync } from '../hooks/useSync';

export function Layout() {
  const { user, logout } = useAuth();
  const { syncStatus, forceSync } = useSync();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
  ];

  const getSyncIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-5 h-5 text-red-500" />;
    }
    if (syncStatus.pendingSync > 0) {
      return <RotateCcw className="w-5 h-5 text-yellow-500" />;
    }
    return <Wifi className="w-5 h-5 text-green-500" />;
  };

  const getSyncText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.pendingSync > 0) return `${syncStatus.pendingSync} pending`;
    return 'Online';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">CarWash POS</h1>
            
            <div className="flex items-center space-x-4">
              {/* Sync Status */}
              <button
                onClick={forceSync}
                disabled={!syncStatus.isOnline}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {getSyncIcon()}
                <span>{getSyncText()}</span>
              </button>

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-64">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}