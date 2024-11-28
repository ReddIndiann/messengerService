import express from 'express';
import { AdminConfigController } from '../Controller/adminConfigController';
import { routeProtectionMiddleware } from '../middleware/NormalRoutesMiddleware';
const router = express.Router();

router.post('/create', AdminConfigController.create);
router.get('/',routeProtectionMiddleware, AdminConfigController.getAll);
// router.get('/:id', AdminConfigController.getById);
router.put('/:id', AdminConfigController.update);
router.delete('/:id', AdminConfigController.delete);


export default router;
