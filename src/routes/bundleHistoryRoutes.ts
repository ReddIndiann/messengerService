import { Router } from 'express';
import { bundleHistoryController } from '../Controller/bundleHistoryController';

const router = Router();

// Create a new bundle history entry
router.post('/create', bundleHistoryController.create);

// Get all bundle history entries
router.get('/', bundleHistoryController.getAll);

// Get a bundle history entry by ID
router.get('/:id', bundleHistoryController.getById);

// Get bundle history entries by user ID
router.get('/user/:userId', bundleHistoryController.getByUserId); // New route added

// Update a bundle history entry by ID
router.put('/:id', bundleHistoryController.update);

// Delete a bundle history entry by ID
router.delete('/:id', bundleHistoryController.delete);

export default router;
