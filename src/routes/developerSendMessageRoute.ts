import express from 'express';
import { developerController } from '../Controller/developerSendMessageController';
import { developergetController } from '../Controller/developergetMessages';
// import { developerTemplateController } from '../Controller/developerTemplateController';

import { validateApiKey } from '../middleware/checkApiKeys';
import { validateSenderAndApiKey } from '../middleware/checkApiKeyAndSenderId';
const router = express.Router();

// Developer API that checks senderId and apikey in headers
router.post('/developer/sendmessage', validateSenderAndApiKey, developerController.sendMessage);
router.post('/developer/schedulemessage', validateSenderAndApiKey, developerController.scheduleMessage);
router.post('/developer/createcontact', validateApiKey, developerController.developerCreateContact);
router.post('/developer/createcontactgroup', validateApiKey, developerController.createcontactgroup); 
router.post('/developer/createmulticontactgroup', validateApiKey, developerController.createmulticontactgroup); 
router.post('/developer/sendtogroup', validateSenderAndApiKey, developerController.createMessageGroups);

router.post('/developer/scheduletogroup', validateSenderAndApiKey, developerController.scheduleMessageGroup);


router.post('/developer/creategroup', validateApiKey, developerController.developerCreateGroup);
router.get('/developer/getsentmessages', validateApiKey, developergetController.getSentMessageByUserId);
router.get('/developer/getschedulemessages', validateApiKey, developergetController.getScheduleMessageByUserId);
router.get('/developer/getcontacts', validateApiKey, developergetController.getContactsByUserId);
router.get('/developer/getcontacts', validateApiKey, developergetController.getContactsByUserId);

// router.post('/developer/createtemplate', validateApiKey, developerTemplateController.developerCreateTemplate);

export default router;