import express from 'express';
import { sendMessageController } from '../Controller/sendMessageController';

const router = express.Router();

router.post('/create', sendMessageController.create);
router.get('/', sendMessageController.getAll);
router.get('/:id', sendMessageController.getById); // This should be after the specific routes.
router.put('/:id', sendMessageController.update);
router.delete('/:id', sendMessageController.delete);
router.get('/user/:userId', sendMessageController.getByUserId);
router.get('/getlist/:userId', sendMessageController.getTotalUserMessagesAndRecipients);
router.get('/getalllist/', sendMessageController.getTotalMessagesAndRecipients); // Place this one last

export default router;
