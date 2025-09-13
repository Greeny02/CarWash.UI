import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Users, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../types';
import { getSales } from '../lib/db';
import { format } from 'date-fns';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaysSales: 0,
    todaysTransactions: 0,
    todaysRevenue: 0,
    popularServices: [],
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todaysSales = await getSales();
      const todaysData = todaysSales.filter(sale => 
        sale.createdAt.startsWith(today)
      );

      const revenue = todaysData.reduce((sum, sale) => sum + sale.total, 0);
      const transactions = todaysData.length;

      // Calculate popular services
      const serviceCount: Record<string, number> = {};
      todaysData.forEach(sale => {
        sale.services.forEach(service => {
          serviceCount[service.name] = (serviceCount[service.name] || 0) + service.quantity;
        });
      });

      const popularServices = Object.entries(serviceCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        todaysSales: todaysData.length,
        todaysTransactions: transactions,
        todaysRevenue: revenue,
        popularServices,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

  const statCards = [
    {
      title: "Today's Revenue",
      value: `$${stats.todaysRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: "Today's Transactions",
      value: stats.todaysTransactions.toString(),
      icon: CreditCard,
      color: 'bg-blue-500',
    },
    {
      title: "Today's Sales",
      value: stats.todaysSales.toString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-lg text-gray-600">{format(new Date(), 'MMMM d, yyyy')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Popular Services */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Popular Services Today</h2>
        
        {stats.popularServices.length > 0 ? (
          <div className="space-y-4">
            {stats.popularServices.map((service, index) => (
              <div key={service.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{service.name}</span>
                </div>
                <span className="text-lg font-bold text-gray-600">{service.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No services sold today yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}