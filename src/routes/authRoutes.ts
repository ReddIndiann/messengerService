import express from 'express';
import { auth, authorizeRole } from '../middleware/authMiddleware';
import { authController } from '../Controller/authController';

const router = express.Router();

router.post('/signup', authController.register);
router.post('/signin', authController.signin);
router.post('/resetpassword', authController.resetPassword);
router.post('/resetpasswordemail', authController.resetPasswordEmail);
router.get('/',authController.getAll)
router.get('/:id',authController.getById)
router.put('/change-password/:id', authController.changePassword);

// router.put('/update/:id', auth, authorizeRole(['admin', 'user']), authController.updateUser);
router.put('/update/:id', authController.updateUser);
router.delete('/delete/:id',  authController.deleteUser);


export default router;
 