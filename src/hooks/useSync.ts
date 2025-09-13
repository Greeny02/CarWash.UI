import { useState, useEffect } from 'react';
import { SyncStatus } from '../types';
import { getSyncQueue, clearSyncQueue } from '../lib/db';
import { apiClient } from '../lib/api';

export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    pendingSync: 0,
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine,
      }));
    };

    const updatePendingSync = async () => {
      const queue = await getSyncQueue();
      setSyncStatus(prev => ({
        ...prev,
        pendingSync: queue.length,
      }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check pending sync on mount
    updatePendingSync();

    // Listen for background sync messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'BACKGROUND_SYNC') {
          syncPendingData();
        }
      });
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const syncPendingData = async () => {
    if (!navigator.onLine) return;

    // TEMPORARY: Skip sync in development mode
    // Remove this return statement when API is ready
    console.log('Sync skipped in development mode');
    return;

    /* UNCOMMENT WHEN API IS READY:
    try {
      const queue = await getSyncQueue();
      
      for (const item of queue) {
        try {
          if (item.type === 'customer') {
            if (item.action === 'create') {
              await apiClient.createCustomer(item.data);
            } else if (item.action === 'update') {
              await apiClient.updateCustomer(item.data.id, item.data);
            }
          } else if (item.type === 'sale') {
            if (item.action === 'create') {
              await apiClient.createSale(item.data);
            }
          }
        } catch (error) {
          console.error('Failed to sync item:', item, error);
          // Continue with other items even if one fails
        }
      }

      // Clear the sync queue after successful sync
      await clearSyncQueue();
      setSyncStatus(prev => ({
        ...prev,
        pendingSync: 0,
        lastSync: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Sync failed:', error);
    }
    */
  };

  const forcSync = () => {
    if (navigator.onLine) {
      syncPendingData();
    }
  };

  return {
    syncStatus,
    forceSync: forcSync,
  };
}