import { User, Customer, Sale, DashboardStats } from '../types';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // TEMPORARY: Mock API responses for development
    // Remove this block when real API is ready
    console.warn('API call intercepted for development:', endpoint);
    throw new Error('API not available in development mode');
    
    /* UNCOMMENT WHEN API IS READY:
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
    */
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/auth/me');
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.request('/customers');
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return this.request('/sales');
  }

  async createSale(sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('/dashboard/stats');
  }
}

export const apiClient = new ApiClient();