import express from 'express';
import { AdminConfigController } from '../Controller/adminConfigController';
const router = express.Router();

router.post('/create', AdminConfigController.create);
router.get('/', AdminConfigController.getAll);
// router.get('/:id', AdminConfigController.getById);
router.put('/:id', AdminConfigController.update);
router.delete('/:id', AdminConfigController.delete);


export default router;
