import express from 'express';
import { developerController } from '../Controller/developerSendMessageController';
import { developergetController } from '../Controller/developergetMessages';
import { validateApiKey } from '../middleware/checkApiKeys';
import { validateSenderAndApiKey } from '../middleware/checkApiKeyAndSenderId';
const router = express.Router();

// Developer API that checks senderId and apikey in headers
router.post('/developer/send', validateSenderAndApiKey, developerController.sendMessage);
router.post('/developer/schedule', validateSenderAndApiKey, developerController.scheduleMessage);
router.post('/developer/createcontact', validateApiKey, developerController.developerCreateContact);
router.post('/developer/createcontactgroup', validateApiKey, developerController.createcontactgroup);
// router.post('/developer/sendtogroup', validateApiKey, developerController.createMessageGroups);

// router.post('/developer/scheduletogroup', validateApiKey, developerController.scheduleMessageGroup);


router.post('/developer/creategroup', validateApiKey, developerController.developerCreateGroup);
router.get('/developer/getsentmessages', validateApiKey, developergetController.getSentMessageByUserId);
router.get('/developer/getschedulemessages', validateApiKey, developergetController.getScheduleMessageByUserId);
router.get('/developer/getcontacts', validateApiKey, developergetController.getContactsByUserId);
router.get('/developer/getcontacts', validateApiKey, developergetController.getContactsByUserId);



export default router;