import { Router } from 'express';
import { ReservationsController } from '../controllers/reservations.controller';
import { validateRequest } from '../middleware/validate-request';
import {
  createReservationSchema,
  updateReservationSchema,
  updateReservationStatusSchema,
} from '../schemas/reservation.schema';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const reservationsController = new ReservationsController();

// Ana CRUD rotaları
router.get('/', requireAuth, reservationsController.getReservations.bind(reservationsController));
router.post(
  '/',
  requireAuth,
  validateRequest(createReservationSchema),
  reservationsController.createReservation.bind(reservationsController)
);
router.get(
  '/:id',
  requireAuth,
  reservationsController.getReservationById.bind(reservationsController)
);
router.put(
  '/:id',
  requireAuth,
  validateRequest(updateReservationSchema),
  reservationsController.updateReservation.bind(reservationsController)
);
router.delete(
  '/:id',
  requireAuth,
  reservationsController.deleteReservation.bind(reservationsController)
);

// Özel rotalar
router.patch(
  '/:id/status',
  requireAuth,
  validateRequest(updateReservationStatusSchema),
  reservationsController.updateReservationStatus.bind(reservationsController)
);
router.get(
  '/date/:date',
  requireAuth,
  reservationsController.getReservationsByDate.bind(reservationsController)
);
router.get(
  '/customer/:customerId',
  requireAuth,
  reservationsController.getReservationsByCustomer.bind(reservationsController)
);

// Eksik rotalar
router.get(
  '/table/:tableId',
  requireAuth,
  reservationsController.getReservationsByTable.bind(reservationsController)
);
router.get(
  '/branch/:branchId',
  requireAuth,
  reservationsController.getReservationsByBranch.bind(reservationsController)
);

export default router;
