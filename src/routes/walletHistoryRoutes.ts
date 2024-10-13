import express from 'express';
import { WalletController } from '../Controller/walletHistoryController';
const router = express.Router();

router.post('/create', WalletController.create);
router.get('/', WalletController.getAll);
router.get('/:id', WalletController.getById);
router.put('/:id', WalletController.update);
router.delete('/:id', WalletController.delete);
router.get('/user/:userId', WalletController.getByUserId);
router.get('/useramount/:userId', WalletController.getWalletByUserId);

export default router;
