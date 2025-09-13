import React, { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Clock } from 'lucide-react';
import { Sale } from '../types';
import { getSales, getSalesByDate } from '../lib/db';
import { SaleForm } from '../components/SaleForm';
import { format } from 'date-fns';

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [view, setView] = useState<'new' | 'history'>('new');

  useEffect(() => {
    if (view === 'history') {
      loadSalesByDate();
    }
  }, [selectedDate, view]);

  const loadSalesByDate = async () => {
    try {
      const data = await getSalesByDate(selectedDate);
      setSales(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to load sales:', error);
    }
  };

  const handleSaleComplete = () => {
    setIsFormOpen(false);
    if (view === 'history') {
      loadSalesByDate();
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setView('new')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              view === 'new'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            New Sale
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              view === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sales History
          </button>
        </div>
      </div>

      {view === 'new' ? (
        <div className="bg-white rounded-xl shadow-md p-8">
          <SaleForm onComplete={handleSaleComplete} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Date Selector and Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-8">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales List */}
          <div className="bg-white rounded-xl shadow-md">
            {sales.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {sales.map((sale) => (
                  <div key={sale.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {sale.customerName || 'Walk-in Customer'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            sale.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                            sale.paymentMethod === 'card' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {sale.paymentMethod.toUpperCase()}
                          </span>
                          {!sale.synced && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Pending sync
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Services</p>
                            <ul className="space-y-1">
                              {sale.services.map((service, index) => (
                                <li key={index} className="text-sm text-gray-700">
                                  {service.quantity}× {service.name} - ${service.price.toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{format(new Date(sale.createdAt), 'HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-2xl font-bold text-gray-900">
                            ${sale.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
                <p className="text-gray-600">No sales were recorded on {format(new Date(selectedDate), 'MMMM d, yyyy')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}