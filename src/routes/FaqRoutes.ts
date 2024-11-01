import express from 'express';
import { faqController } from '../Controller/faqController';
const router = express.Router();

router.post('/create', faqController.create);
router.get('/', faqController.getAll);
router.get('/:id', faqController.getById);
router.put('/:id', faqController.update);
router.delete('/:id', faqController.delete);


export default router;
