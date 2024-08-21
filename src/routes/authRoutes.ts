import express from 'express';
import { auth, authorizeRole } from '../middleware/authMiddleware';
import { authController } from '../Controller/authController';

const router = express.Router();

router.post('/signup', authController.register);
router.post('/signin', authController.signin);

router.put('/update/:id', auth, authorizeRole(['admin', 'user']), authController.updateUser);
router.delete('/delete/:id',  authController.deleteUser);

export default router;
