import express from 'express';
import { sendMessageController } from '../Controller/sendMessageController';

const router = express.Router();

router.post('/create', sendMessageController.create);
router.get('/all', sendMessageController.getAll);
router.get('/:id', sendMessageController.getById); // This should be after the specific routes.
router.put('/:id', sendMessageController.update);
router.get('/all/:userId', sendMessageController.getTCreditCount);
router.delete('/:id', sendMessageController.delete);
router.get('/user/:userId', sendMessageController.getByUserId);
router.get('/getlist/:userId', sendMessageController.getTotalUserMessagesAndRecipients);
router.get('/', sendMessageController.getTotalMessagesAndRecipients); // Place this one last

export default router;
