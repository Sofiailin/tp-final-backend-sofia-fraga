import { Router } from 'express';
import { body } from 'express-validator';
import * as historialmController from '../controllers/historialm.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/auth';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize([UserRole.VETERINARIO, UserRole.ADMIN]),
  [
    body('petId').isMongoId().withMessage('ID de mascota inválido'),
    body('descripcion').notEmpty().withMessage('La descripción es obligatoria'),
    body('diagnostico').optional().isString(),
    body('tratamiento').optional().isString()
  ],
  historialmController.createEntry
);


router.get(
  '/:petId',
  authenticate,
  historialmController.getHistoryByPet
);

export default router;