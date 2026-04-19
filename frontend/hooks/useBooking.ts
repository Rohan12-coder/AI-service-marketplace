'use client';
import { useState, useCallback } from 'react';
import { bookingAPI } from '@/lib/api';
import { IBooking, BookingStatus } from '@/types';

interface UseBookingReturn {
  bookings:       IBooking[];
  loading:        boolean;
  error:          string | null;
  fetchBookings:  (params?: Record<string, unknown>) => Promise<void>;
  cancelBooking:  (id: string, reason?: string) => Promise<void>;
  updateStatus:   (id: string, status: BookingStatus, reason?: string) => Promise<void>;
}

const useBooking = (): UseBookingReturn => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const fetchBookings = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingAPI.getAll(params);
      setBookings(res.data.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string, reason?: string) => {
    await bookingAPI.cancel(id, reason);
    setBookings((prev) =>
      prev.map((b) => b._id === id ? { ...b, status: 'cancelled' as BookingStatus } : b)
    );
  }, []);

  const updateStatus = useCallback(async (id: string, status: BookingStatus, reason?: string) => {
    await bookingAPI.updateStatus(id, { status, rejectionReason: reason });
    setBookings((prev) =>
      prev.map((b) => b._id === id ? { ...b, status } : b)
    );
  }, []);

  return { bookings, loading, error, fetchBookings, cancelBooking, updateStatus };
};

export default useBooking;
