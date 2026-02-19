import { Router } from 'express';
import { getPets, createPet, updatePet, deletePet } from '../controllers/pet.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/auth';

const router = Router();

// Todas las rutas requieren estar logueado
router.use(authenticate);

// TODOS pueden intentar ver mascotas (el controlador decidirá cuáles ven)
router.get('/', getPets);

// SOLO Admin y Veterinario pueden Crear, Modificar o Eliminar
router.post('/', authorize([UserRole.ADMIN, UserRole.VETERINARIO]), createPet);
router.patch('/:id', authorize([UserRole.ADMIN, UserRole.VETERINARIO]), updatePet);
router.delete('/:id', authorize([UserRole.ADMIN, UserRole.VETERINARIO]), deletePet);

export default router;