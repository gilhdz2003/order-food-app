/**
 * useComandaPolling Hook
 *
 * Polls for orders every 30 seconds.
 * Used in Comanda Dashboard to keep orders up-to-date.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { OrderWithItems } from '@/types';
import { getComandaOrders } from '@/lib/supabase/actions';

interface UseComandaPollingOptions {
  interval?: number; // Polling interval in milliseconds (default: 30000)
  enabled?: boolean; // Enable/disable polling (default: true)
}

interface UseComandaPollingReturn {
  orders: OrderWithItems[];
  lastUpdate: Date | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isPolling: boolean;
}

export function useComandaPolling({
  interval = 30000,
  enabled = true,
}: UseComandaPollingOptions = {}): UseComandaPollingReturn {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(enabled);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getComandaOrders();
      setOrders(data);
      setLastUpdate(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar pedidos';
      setError(message);
      console.error('Error fetching comanda orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  // Set up polling
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    // Initial fetch
    fetchOrders();

    // Set up interval
    intervalRef.current = setInterval(() => {
      fetchOrders();
    }, interval);

    // Cleanup on unmount or when enabled changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, fetchOrders]);

  return {
    orders,
    lastUpdate,
    isLoading,
    error,
    refresh,
    isPolling,
  };
}
