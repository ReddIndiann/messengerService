import express from 'express';
import { contactGroupController } from '../Controller/contactGroupController';

const router = express.Router();

router.post('/', contactGroupController.create);
router.post('/sendtogroups', contactGroupController.createMessageGroups);
router.post('/scheduletogroups', contactGroupController.scheduleMessageGroup);
router.get('/', contactGroupController.getAll);
router.get('/:id', contactGroupController.getById);
router.put('/:id', contactGroupController.update);
router.delete('/:id', contactGroupController.delete);

export default router;




