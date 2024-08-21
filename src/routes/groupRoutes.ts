import express from 'express';
import { groupController } from '../Controller/groupController';
const router = express.Router();

router.post('/', groupController.create);
router.get('/', groupController.getAll);
router.get('/:id', groupController.getById);
router.put('/:id', groupController.update);
router.delete('/:id', groupController.delete);
router.get('/user/:userId', groupController.getByUserId);

router.get('/:groupId/contacts', groupController.getContactsByGroupId);
export default router;
