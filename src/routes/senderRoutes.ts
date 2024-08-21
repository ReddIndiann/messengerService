import express from 'express';
import { senderController } from '../Controller/SenderController';

const router = express.Router();

router.post('/create', senderController.create);
router.get('/', senderController.getAll);
router.get('/:id', senderController.getById);
router.put('/:id', senderController.update);
router.delete('/:id', senderController.delete);
router.get('/user/:userId', senderController.getByUserId);

export default router;
