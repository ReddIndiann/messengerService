import { Router } from 'express';
import { bundleHistoryController } from '../Controller/bundleHistoryController';

const router = Router();

// Create a new bundle history entry
router.post('/createoutapp', bundleHistoryController.createWithNormalWallet);
router.post('/createinapp', bundleHistoryController.createWithAppWallet);
router.post('/deduct', bundleHistoryController.deductFromWallet);
// Get all bundle history entries
router.get('/', bundleHistoryController.getAll);

// Get a bundle history entry by ID
router.get('/:id', bundleHistoryController.getById);

// Get bundle history entries by user ID
router.get('/user/:userId', bundleHistoryController.getByUserId); // New route added

// Get bundle history entries/sum by user ID
router.get('/usertype/:userId', bundleHistoryController.getByUserTypeId); // New route added

// Update a bundle history entry by ID
router.put('/:id', bundleHistoryController.update);

// Delete a bundle history entry by ID
router.delete('/:id', bundleHistoryController.delete);

export default router;
