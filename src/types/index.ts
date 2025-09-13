export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'cashier';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  synced?: boolean;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  services: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  cashierId: string;
  createdAt: string;
  synced?: boolean;
}

export interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface DashboardStats {
  todaysSales: number;
  todaysTransactions: number;
  todaysRevenue: number;
  popularServices: Array<{
    name: string;
    count: number;
  }>;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingSync: number;
  lastSync?: string;
}