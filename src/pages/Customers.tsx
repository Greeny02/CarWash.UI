import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Phone, Mail } from 'lucide-react';
import { Customer } from '../types';
import { getCustomers, addCustomer, updateCustomer } from '../lib/db';
import { CustomerForm } from '../components/CustomerForm';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const handleSaveCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      
      if (editingCustomer) {
        const updatedCustomer: Customer = {
          ...editingCustomer,
          ...customerData,
          updatedAt: now,
          synced: false,
        };
        await updateCustomer(updatedCustomer);
      } else {
        const newCustomer: Customer = {
          id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...customerData,
          createdAt: now,
          updatedAt: now,
          synced: false,
        };
        await addCustomer(newCustomer);
      }
      
      await loadCustomers();
      setIsFormOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const openNewForm = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <button
          onClick={openNewForm}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{customer.name}</h3>
              <button
                onClick={() => openEditForm(customer)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
              
              {customer.email && (
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{customer.email}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Created {new Date(customer.createdAt).toLocaleDateString()}
              </span>
              {!customer.synced && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Pending sync
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No customers found' : 'No customers yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Add your first customer to get started'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={openNewForm}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Customer
            </button>
          )}
        </div>
      )}

      {/* Customer Form Modal */}
      {isFormOpen && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </div>
  );
}