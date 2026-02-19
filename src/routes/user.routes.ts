import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getDuenios } from '../controllers/user.controller';

const router = Router();

router.get('/duenios', authenticate, getDuenios);

export default router;