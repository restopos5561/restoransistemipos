import { useState, useCallback, useEffect } from 'react';
import { Reservation, CreateReservationInput, UpdateReservationInput } from '../types/reservation.types';
import { ReservationStatus } from '../types/enums';
import reservationsService from '../services/reservations.service';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(localStorage.getItem('branchId'));

  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Aktif şube kontrolü
      const branchId = localStorage.getItem('branchId');
      if (!branchId) {
        throw new Error('Aktif şube bulunamadı');
      }

      const response = await reservationsService.getReservations();
      
      console.log('🔵 [useReservations] Rezervasyonlar yüklendi:', response);

      if (response.success && Array.isArray(response.data)) {
        setReservations(response.data);
      } else if (response.success && response.data.reservations) {
        setReservations(response.data.reservations);
      } else {
        console.error('❌ [useReservations] Beklenmeyen veri formatı:', response);
        setReservations([]);
      }
    } catch (err) {
      console.error('❌ [useReservations] Rezervasyonlar yüklenirken hata:', err);
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

      // Aktif şube kontrolü
      const branchId = localStorage.getItem('branchId');
      if (!branchId) {
        throw new Error('Aktif şube bulunamadı');
      }

      // BranchId'yi ekle
      const reservationData = {
        ...data,
        branchId: Number(branchId)
      };

      const response = await reservationsService.createReservation(reservationData);
      
      console.log('✅ [useReservations] Rezervasyon oluşturuldu:', response);

      if (response.success && response.data) {
        const newReservation = response.data;
        setReservations(prev => [...prev, newReservation]);
        return newReservation;
      }
      throw new Error('Rezervasyon oluşturulamadı');
    } catch (err) {
      console.error('❌ [useReservations] Rezervasyon oluşturulurken hata:', err);
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
      const response = await reservationsService.updateReservation(id, data);
      
      console.log('✅ [useReservations] Rezervasyon güncellendi:', response);

      if (response.success && response.data) {
        setReservations(prev =>
          prev.map(reservation =>
            reservation.id === id ? response.data : reservation
          )
        );
        return response.data;
      }
      throw new Error('Rezervasyon güncellenemedi');
    } catch (err) {
      console.error('❌ [useReservations] Rezervasyon güncellenirken hata:', err);
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
      const response = await reservationsService.updateReservationStatus(id, { status });
      
      console.log('✅ [useReservations] Rezervasyon durumu güncellendi:', response);

      if (response.success && response.data) {
        setReservations(prev =>
          prev.map(reservation =>
            reservation.id === id ? response.data : reservation
          )
        );
        return response.data;
      }
      throw new Error('Rezervasyon durumu güncellenemedi');
    } catch (err) {
      console.error('❌ [useReservations] Rezervasyon durumu güncellenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Rezervasyon durumu güncellenirken bir hata oluştu');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Şube değişikliğini dinle
  useEffect(() => {
    const checkBranchChange = () => {
      const currentBranchId = localStorage.getItem('branchId');
      if (currentBranchId !== activeBranchId) {
        console.log('🔄 [useReservations] Şube değişikliği algılandı:', { 
          önceki: activeBranchId, 
          yeni: currentBranchId 
        });
        setActiveBranchId(currentBranchId);
        fetchReservations();
      }
    };

    // Her 1 saniyede bir kontrol et
    const interval = setInterval(checkBranchChange, 1000);
    
    // Event listener'ı da koru
    const handleBranchChange = () => {
      console.log('🔄 [useReservations] branchChange eventi algılandı');
      checkBranchChange();
    };

    window.addEventListener('branchChange', handleBranchChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('branchChange', handleBranchChange);
    };
  }, [activeBranchId, fetchReservations]);

  // İlk yükleme
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