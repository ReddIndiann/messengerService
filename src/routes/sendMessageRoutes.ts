import express from 'express';
import { sendMessageController } from '../Controller/sendMessageController';

const router = express.Router();

router.post('/create', sendMessageController.create);
router.get('/', sendMessageController.getAll);
router.get('/:id', sendMessageController.getById);
router.put('/:id', sendMessageController.update);
router.delete('/:id', sendMessageController.delete);
router.get('/user/:userId', sendMessageController.getByUserId);

export default router;
