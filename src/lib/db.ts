import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Customer, Sale } from '../types';

interface CarWashDB extends DBSchema {
  customers: {
    key: string;
    value: Customer;
  };
  sales: {
    key: string;
    value: Sale;
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      type: 'customer' | 'sale';
      action: 'create' | 'update' | 'delete';
      data: any;
      timestamp: string;
    };
  };
}

let db: IDBPDatabase<CarWashDB>;

export async function initDB() {
  db = await openDB<CarWashDB>('carwash-pos', 1, {
    upgrade(db) {
      // Customers store
      if (!db.objectStoreNames.contains('customers')) {
        const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
        customerStore.createIndex('name', 'name');
        customerStore.createIndex('phone', 'phone');
      }

      // Sales store
      if (!db.objectStoreNames.contains('sales')) {
        const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
        salesStore.createIndex('customerId', 'customerId');
        salesStore.createIndex('createdAt', 'createdAt');
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }
    },
  });
  return db;
}

export async function getCustomers(): Promise<Customer[]> {
  if (!db) await initDB();
  return db.getAll('customers');
}

export async function addCustomer(customer: Customer): Promise<void> {
  if (!db) await initDB();
  await db.add('customers', customer);
  
  // Add to sync queue if not already synced
  if (!customer.synced) {
    await addToSyncQueue('customer', 'create', customer);
  }
}

export async function updateCustomer(customer: Customer): Promise<void> {
  if (!db) await initDB();
  await db.put('customers', customer);
  
  if (!customer.synced) {
    await addToSyncQueue('customer', 'update', customer);
  }
}

export async function getSales(): Promise<Sale[]> {
  if (!db) await initDB();
  return db.getAll('sales');
}

export async function addSale(sale: Sale): Promise<void> {
  if (!db) await initDB();
  await db.add('sales', sale);
  
  if (!sale.synced) {
    await addToSyncQueue('sale', 'create', sale);
  }
}

export async function getSalesByDate(date: string): Promise<Sale[]> {
  if (!db) await initDB();
  const sales = await db.getAll('sales');
  return sales.filter(sale => sale.createdAt.startsWith(date));
}

export async function addToSyncQueue(type: 'customer' | 'sale', action: 'create' | 'update' | 'delete', data: any): Promise<void> {
  if (!db) await initDB();
  const id = `${type}_${action}_${data.id}_${Date.now()}`;
  await db.add('sync_queue', {
    id,
    type,
    action,
    data,
    timestamp: new Date().toISOString(),
  });
}

export async function getSyncQueue() {
  if (!db) await initDB();
  return db.getAll('sync_queue');
}

export async function clearSyncQueue(): Promise<void> {
  if (!db) await initDB();
  await db.clear('sync_queue');
}