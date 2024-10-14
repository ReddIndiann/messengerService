import express from 'express';
import { creditUsageController } from '../Controller/creditUsageController';
const router = express.Router();

router.post('/create', creditUsageController.create);
router.get('/', creditUsageController.getAll);

router.put('/:id', creditUsageController.update);
router.delete('/:id', creditUsageController.delete);

export default router;
