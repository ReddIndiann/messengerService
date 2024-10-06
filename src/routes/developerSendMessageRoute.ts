import express from 'express';
import { developerController } from '../Controller/developerSendMessageController';
import { validateApiKey } from '../middleware/checkApiKeys';
import { validateSenderAndApiKey } from '../middleware/checkApiKeyAndSenderId';
const router = express.Router();

// Developer API that checks senderId and apikey in headers
router.post('/developer/send', validateSenderAndApiKey, developerController.sendMessage);
router.post('/developer/schedule', validateSenderAndApiKey, developerController.scheduleMessage);
router.post('/developer/createcontact', validateApiKey, developerController.developerCreateContact);
router.post('/developer/creategroup', validateApiKey, developerController.developerCreateGroup);

export default router;
