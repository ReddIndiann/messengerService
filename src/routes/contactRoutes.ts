import express from 'express';
import { contactController } from '../Controller/contactController';

const router = express.Router();

router.post('/', contactController.create);
router.get('/', contactController.getAll);
router.get('/:id', contactController.getById);
router.put('/:id', contactController.update);
router.delete('/:id', contactController.delete);
router.get('/user/:userId', contactController.getByUserId);
router.get('/contacts/user/:userId/search', contactController.searchByNameAndUserId);

router.get('/:contactId/groups', contactController.getGroupsByContactId);


export default router;
 