import express from 'express';
import { scheduleMessageController } from '../Controller/scheduleMessageController';

const router = express.Router();

router.post('/create', scheduleMessageController.create);
router.get('/', scheduleMessageController.getAll);
router.get('/:id', scheduleMessageController.getById);
router.put('/:id', scheduleMessageController.update);
router.delete('/:id', scheduleMessageController.delete);
router.get('/user/:userId', scheduleMessageController.getByUserId);

export default router;
 