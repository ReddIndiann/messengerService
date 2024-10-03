import express from 'express';
import { apikeysController } from '../Controller/apiKeysController';
const router = express.Router();

router.post('/create', apikeysController.create);
router.get('/', apikeysController.getAll);
router.get('/:id', apikeysController.getById);
router.put('/:id', apikeysController.update);
router.delete('/:id', apikeysController.delete);
router.get('/user/:userId', apikeysController.getByUserId);

export default router;