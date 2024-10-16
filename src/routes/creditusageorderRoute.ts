import express from 'express';
import { creditUsageOrderController } from '../Controller/creditUsageOrderController';
const router = express.Router();

router.post('/create', creditUsageOrderController.create);
router.get('/', creditUsageOrderController.getAll);

router.put('/:id', creditUsageOrderController.update);
router.delete('/:id', creditUsageOrderController.delete);

export default router;
