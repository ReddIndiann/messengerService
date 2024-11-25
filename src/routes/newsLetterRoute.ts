import express from 'express';
import { MailSubscriptionController } from '../Controller/mailSubscriptionController';
// import { sendNewsletter } from '../Controller/mailNewsLetterController';
const router = express.Router();


router.post('/create', MailSubscriptionController.send);

router.get('/', MailSubscriptionController.getAllNewsletter);



export default router;
