import express from 'express';
import { packagesController } from '../Controller/packageController';
const router = express.Router();

router.post('/create', packagesController.create);
router.get('/', packagesController.getAll);
router.get('/:id', packagesController.getById);
router.put('/:id', packagesController.update);
router.delete('/:id', packagesController.delete);

export default router;
