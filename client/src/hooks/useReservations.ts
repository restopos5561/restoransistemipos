import { useState, useCallback, useEffect } from 'react';
import { 
  Reservation, 
  CreateReservationInput, 
  UpdateReservationInput,
  CreateReservationResponse,
  UpdateReservationResponse 
} from '../types/reservation.types';
import { ReservationStatus } from '../types/enums';
import reservationsService from '../services/reservations.service';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
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

      if (response.success && response.data) {
        // Backend'den gelen paginated response'u işle
        const { reservations: reservationData, total: totalCount, page, totalPages: totalPagesCount } = response.data;
        
        if (Array.isArray(reservationData)) {
          setReservations(reservationData);
          setTotal(totalCount);
          setCurrentPage(page);
          setTotalPages(totalPagesCount);
        } else {
          console.error('❌ [useReservations] Beklenmeyen veri formatı:', response);
          setReservations([]);
          setTotal(0);
          setCurrentPage(1);
          setTotalPages(0);
        }
      } else {
        console.error('❌ [useReservations] Geçersiz API yanıtı:', response);
        setReservations([]);
        setTotal(0);
        setCurrentPage(1);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('❌ [useReservations] Rezervasyonlar yüklenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Rezervasyonlar yüklenirken bir hata oluştu');
      setReservations([]);
      setTotal(0);
      setCurrentPage(1);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReservation = async (data: CreateReservationInput): Promise<CreateReservationResponse> => {
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
        // Yeni rezervasyonu listeye ekle ve sırala
        const newReservation: Reservation = response.data;
        setReservations(prev => {
          const updated = [...prev, newReservation];
          return updated.sort((a, b) => 
            new Date(b.reservationStartTime).getTime() - new Date(a.reservationStartTime).getTime()
          );
        });
        return response;
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

  const updateReservation = async (id: number, data: UpdateReservationInput): Promise<UpdateReservationResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!id) {
        throw new Error('Rezervasyon ID gereklidir');
      }

      console.log('🔵 [useReservations] Rezervasyon güncelleme isteği:', { id, data });
      const response = await reservationsService.updateReservation(id, data);
      console.log('✅ [useReservations] Rezervasyon güncellendi:', response);

      if (response.success && response.data) {
        setReservations(prev => {
          const updated = prev.map(reservation =>
            reservation.id === id ? response.data : reservation
          );
          return updated.sort((a, b) => 
            new Date(b.reservationStartTime).getTime() - new Date(a.reservationStartTime).getTime()
          );
        });
        return response;
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
        // Güncellenmiş rezervasyonu listede güncelle ve sırala
        setReservations(prev => {
          const updated = prev.map(reservation =>
            reservation.id === id ? response.data : reservation
          );
          // Tarihe göre sırala (en yeni en üstte)
          return updated.sort((a, b) => 
            new Date(b.reservationStartTime).getTime() - new Date(a.reservationStartTime).getTime()
          );
        });
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

  const deleteReservation = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Aktif şube kontrolü
      const branchId = localStorage.getItem('branchId');
      if (!branchId) {
        throw new Error('Aktif şube bulunamadı');
      }

      console.log('🔵 [useReservations] Rezervasyon silme isteği:', { id, branchId });
      
      const response = await reservationsService.deleteReservation(id);
      console.log('✅ [useReservations] Rezervasyon silme yanıtı:', response);

      // Silinen rezervasyonu listeden kaldır
      setReservations(prev => prev.filter(reservation => reservation.id !== id));
      
      // Listeyi yenile
      try {
        const refreshResponse = await reservationsService.getReservations();
        console.log('🔄 [useReservations] Liste yenileme yanıtı:', refreshResponse);
        
        if (refreshResponse.success) {
          if (Array.isArray(refreshResponse.data)) {
            setReservations(refreshResponse.data);
          } else if (refreshResponse.data?.reservations) {
            setReservations(refreshResponse.data.reservations);
          }
        }
      } catch (refreshError) {
        console.error('❌ [useReservations] Liste yenilenirken hata:', refreshError);
      }

      return true;
    } catch (err) {
      console.error('❌ [useReservations] Rezervasyon silinirken hata:', err);
      setError(err instanceof Error ? err.message : 'Rezervasyon silinirken bir hata oluştu');
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
    total,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchReservations,
    createReservation,
    updateReservation,
    updateReservationStatus,
    deleteReservation
  };
}; 