import { z } from 'zod';
import { ReservationStatus } from '@prisma/client';

export const createReservationSchema = z.object({
  restaurantId: z.number(),
  customerId: z.number(),
  tableId: z.number().optional(),
  reservationTime: z.string().datetime(),
  partySize: z.number().min(1),
  notes: z.string().optional(),
  status: z.nativeEnum(ReservationStatus).default('PENDING'),
});

export const updateReservationSchema = z.object({
  tableId: z.number().optional(),
  reservationTime: z.string().datetime().optional(),
  partySize: z.number().min(1).optional(),
  notes: z.string().optional(),
});

export const updateReservationStatusSchema = z.object({
  status: z.nativeEnum(ReservationStatus),
  cancellationReason: z.string().nullable().optional(),
});

export const getReservationsByDateSchema = z.object({
  date: z.string().transform((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error('Geçersiz tarih formatı');
    }
    return date;
  }),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusSchema>;
