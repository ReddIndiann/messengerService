import express from 'express';
import { developerController } from '../Controller/developerSendMessageController';

import { validateSenderAndApiKey } from '../middleware/checkApiKeyAndSenderId';
const router = express.Router();

// Developer API that checks senderId and apikey in headers
router.post('/developer/send', validateSenderAndApiKey, developerController.sendMessage);

export default router;
