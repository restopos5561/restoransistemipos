import { z } from 'zod';
import { ReservationStatus } from '@prisma/client';

// Body şemaları
const createReservationBodySchema = z.object({
  restaurantId: z.number(),
  customerId: z.number(),
  branchId: z.number(),
  tableId: z.number().optional(),
  reservationStartTime: z.string().datetime(),
  reservationEndTime: z.string().datetime(),
  partySize: z.number().min(1),
  notes: z.string().optional(),
  status: z.nativeEnum(ReservationStatus).default('PENDING'),
});

const updateReservationBodySchema = z.object({
  tableId: z.number().optional(),
  reservationStartTime: z.string().datetime().optional(),
  reservationEndTime: z.string().datetime().optional(),
  partySize: z.number().min(1).optional(),
  notes: z.string().optional(),
});

// Request şemaları
export const createReservationRequestSchema = z.object({
  body: createReservationBodySchema,
});

export const updateReservationRequestSchema = z.object({
  body: updateReservationBodySchema,
  params: z.object({
    id: z.string().transform(val => Number(val)),
  }),
  query: z.object({}).optional(),
});

export const updateReservationStatusRequestSchema = z.object({
  params: z.object({
    id: z.string().transform(val => Number(val)),
  }),
  body: z.object({
    status: z.nativeEnum(ReservationStatus),
    cancellationReason: z.string().nullable().optional(),
  }),
});

// Export types
export type CreateReservationInput = z.infer<typeof createReservationBodySchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationBodySchema>;
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusRequestSchema>['body'];
