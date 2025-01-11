import { useState, useCallback, useEffect } from 'react';
import { Reservation, CreateReservationInput, UpdateReservationInput } from '../types/reservation.types';
import { ReservationStatus } from '../types/enums';
import reservationsService from '../services/reservations.service';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reservationsService.getReservations();
      if (response.success && Array.isArray(response.data)) {
        setReservations(response.data);
      } else if (response.success && response.data.reservations) {
        setReservations(response.data.reservations);
      } else {
        console.error('Beklenmeyen veri formatı:', response);
        setReservations([]);
      }
    } catch (err) {
      console.error('Rezervasyonlar yüklenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Rezervasyonlar yüklenirken bir hata oluştu');
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReservation = async (data: CreateReservationInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reservationsService.createReservation(data);
      if (response.success && response.data) {
        const newReservation = response.data;
        setReservations(prev => [...prev, newReservation]);
        return newReservation;
      }
      throw new Error('Rezervasyon oluşturulamadı');
    } catch (err) {
      console.error('Rezervasyon oluşturulurken hata:', err);
      setError(err instanceof Error ? err.message : 'Rezervasyon oluşturulurken bir hata oluştu');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReservation = async (id: number, data: UpdateReservationInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedReservation = await reservationsService.updateReservation(id, data);
      setReservations(prev =>
        prev.map(reservation =>
          reservation.id === id ? updatedReservation : reservation
        )
      );
      return updatedReservation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rezervasyon güncellenirken bir hata oluştu');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReservationStatus = async (id: number, status: ReservationStatus) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedReservation = await reservationsService.updateReservationStatus(id, { status });
      setReservations(prev =>
        prev.map(reservation =>
          reservation.id === id ? updatedReservation : reservation
        )
      );
      return updatedReservation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rezervasyon durumu güncellenirken bir hata oluştu');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return {
    reservations,
    isLoading,
    error,
    fetchReservations,
    createReservation,
    updateReservation,
    updateReservationStatus
  };
}; 