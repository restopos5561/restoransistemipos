import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Reservation } from '../types/reservation.types';
import ReservationDialog from '../components/reservations/ReservationDialog';
import { useAuth } from '../hooks/useAuth';

const ReservationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleStatusChange = () => {
    // Dialog'u kapatmadan önce seçili rezervasyonu güncelle
    if (selectedReservation) {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    }
  };

  return (
    <>
      <ReservationDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedReservation(undefined);
        }}
        editData={selectedReservation}
        restaurantId={user?.restaurantId || 0}
        branchId={user?.branchId || 0}
        onStatusChange={handleStatusChange}
      />
    </>
  );
};

export default ReservationsPage; 