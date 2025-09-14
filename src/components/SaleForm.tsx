import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Minus, Trash2, User, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Customer, Sale, SaleItem } from '../types';
import { getCustomers, addSale } from '../lib/db';
import { carWashServices } from '../lib/services';
import { useAuth } from '../hooks/useAuth.tsx';

const saleSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'digital']),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
  onComplete: () => void;
}

export function SaleForm({ onComplete }: SaleFormProps) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedServices, setSelectedServices] = useState<SaleItem[]>([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      paymentMethod: 'cash',
    },
  });

  const selectedCustomerId = watch('customerId');

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

  const addService = (serviceId: string) => {
    const service = carWashServices.find(s => s.id === serviceId);
    if (!service) return;

    const existingService = selectedServices.find(s => s.id === serviceId);
    if (existingService) {
      setSelectedServices(prev =>
        prev.map(s =>
          s.id === serviceId
            ? { ...s, quantity: s.quantity + 1 }
            : s
        )
      );
    } else {
      setSelectedServices(prev => [
        ...prev,
        {
          id: service.id,
          name: service.name,
          price: service.price,
          quantity: 1,
        },
      ]);
    }
  };

  const updateServiceQuantity = (serviceId: string, change: number) => {
    setSelectedServices(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { ...service, quantity: Math.max(0, service.quantity + change) }
          : service
      ).filter(service => service.quantity > 0)
    );
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const total = selectedServices.reduce((sum, service) => 
    sum + (service.price * service.quantity), 0
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const onSubmit = async (data: SaleFormData) => {
    if (selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }

    if (!user) {
      alert('User not found');
      return;
    }

    try {
      const sale: Sale = {
        id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerId: data.customerId,
        customerName: data.customerId ? selectedCustomer?.name : data.customerName,
        services: selectedServices,
        total,
        paymentMethod: data.paymentMethod,
        cashierId: user.id,
        createdAt: new Date().toISOString(),
        synced: false,
      };

      await addSale(sale);
      
      // Reset form
      reset();
      setSelectedServices([]);
      setShowCustomerSearch(false);
      setCustomerSearch('');
      
      onComplete();
      alert('Sale completed successfully!');
    } catch (error) {
      console.error('Failed to create sale:', error);
      alert('Failed to create sale. Please try again.');
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'card', label: 'Card', icon: CreditCard },
    { value: 'digital', label: 'Digital', icon: Smartphone },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">New Sale</h2>

      {/* Customer Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Customer</h3>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setShowCustomerSearch(!showCustomerSearch)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              showCustomerSearch
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <User className="w-5 h-5 inline-block mr-2" />
            Existing Customer
          </button>
          
          <button
            type="button"
            onClick={() => {
              setShowCustomerSearch(false);
              setValue('customerId', '');
              setValue('customerName', '');
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              !showCustomerSearch
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Walk-in Customer
          </button>
        </div>

        {showCustomerSearch && (
          <div className="bg-gray-50 rounded-lg p-4">
            <input
              type="text"
              placeholder="Search customers by name or phone..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => {
                    setValue('customerId', customer.id);
                    setShowCustomerSearch(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCustomerId === customer.id
                      ? 'bg-blue-100 border border-blue-300'
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.phone}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!showCustomerSearch && (
          <input
            {...register('customerName')}
            type="text"
            placeholder="Customer name (optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Services Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Services</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {carWashServices.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => addService(service.id)}
              className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-lg font-bold text-blue-600">R{service.price.toFixed(2)}</p>
                </div>
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Services */}
      {selectedServices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Selected Services</h3>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-sm text-gray-600">R{service.price.toFixed(2)} each</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateServiceQuantity(service.id, -1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{service.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateServiceQuantity(service.id, 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <span className="font-bold text-gray-900 w-16 text-right">
                    R{(service.price * service.quantity).toFixed(2)}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => removeService(service.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-blue-600">R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
        
        <div className="grid grid-cols-3 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <label
                key={method.value}
                className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  watch('paymentMethod') === method.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  {...register('paymentMethod')}
                  type="radio"
                  value={method.value}
                  className="sr-only"
                />
                <Icon className="w-8 h-8 mb-2 text-gray-600" />
                <span className="font-medium text-gray-900">{method.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={selectedServices.length === 0}
        className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Complete Sale - R{total.toFixed(2)}
      </button>
    </form>
  );
}