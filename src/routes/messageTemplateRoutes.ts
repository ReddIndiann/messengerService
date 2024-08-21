import express from 'express';
import { messageTemplateController } from '../Controller/messageTemplateController';
const router = express.Router();

router.post('/create', messageTemplateController.create);
router.get('/', messageTemplateController.getAll);
router.get('/:id', messageTemplateController.getById);
router.put('/:id', messageTemplateController.update);
router.delete('/:id', messageTemplateController.delete);
router.get('/user/:userId', messageTemplateController.getByUserId);

export default router; 
