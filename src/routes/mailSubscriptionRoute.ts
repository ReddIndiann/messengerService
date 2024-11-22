import express from 'express';
import { MailSubscriptionController } from '../Controller/mailSubscriptionController';
import { sendNewsletter } from '../Controller/mailNewsLetterController';
const router = express.Router();

router.post('/create', MailSubscriptionController.create);
router.post('/send', MailSubscriptionController.send);
router.post('/unsubscribe', MailSubscriptionController.unsubscribe);
router.get('/', MailSubscriptionController.getAll);
router.get('/:id', MailSubscriptionController.getById);
router.put('/:id', MailSubscriptionController.update);
router.delete('/:id', MailSubscriptionController.delete);




export default router;
