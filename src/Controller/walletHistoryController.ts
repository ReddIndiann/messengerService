import { Request, Response } from 'express';
import WalletHistory from '../models/WalletHistory';
import User from '../models/User';

export const WalletController = {
  create: async (req: Request, res: Response) => {
    const { transactionid, userId, amount,note } = req.body;

    try {
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if a sender with the same name already exists for this user
    
      // Proceed with creating the sender if no duplicate is found
      const wallet = await WalletHistory.create({ transactionid, userId, amount,note});

      res.status(201).json(wallet);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        res.status(500).send('Server error');
      } else {
        console.error('An unknown error occurred');
        res.status(500).send('Server error');
      }
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const wallet = await WalletHistory.findAll();
      res.json(wallet);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        res.status(500).send('Server error');
      } else {
        console.error('An unknown error occurred');
        res.status(500).send('Server error');
      }
    }
  },

  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const wallet = await WalletHistory.findByPk(id);
      if (!wallet) {
        return res.status(404).json({ msg: 'Wallet History not found' });
      }

      res.json(wallet);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        res.status(500).send('Server error');
      } else {
        console.error('An unknown error occurred');
        res.status(500).send('Server error');
      }
    }
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const {  transactionid, userId, amount,note  } = req.body;

    try {
      const wallet = await WalletHistory.findByPk(id);
      if (!wallet) {
        return res.status(404).json({ msg: 'Wallet History not found' });
      }

      if (transactionid) wallet.transactionid = transactionid;
      if (userId) wallet.userId = userId;
      if (amount) wallet.amount = amount;
      if (note) wallet.note = status;

      await wallet.save();

      res.json(wallet);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        res.status(500).send('Server error');
      } else {
        console.error('An unknown error occurred');
        res.status(500).send('Server error');
      }
    }
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const wallet = await WalletHistory.findByPk(id);
      if (!wallet) {
        return res.status(404).json({ msg: 'Wallet History not found' });
      }

      await wallet.destroy();

      res.json({ msg: 'Wallet History successfully' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        res.status(500).send('Server error');
      } else {
        console.error('An unknown error occurred');
        res.status(500).send('Server error');
      }
    }
  },

  getByUserId: async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const wallet = await WalletHistory.findAll({ where: { userId } });
      if (!wallet.length) {
        return res.status(404).json({ msg: 'No Wallet History found for this user' });
      }

      res.json(wallet);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        res.status(500).send('Server error');
      } else {
        console.error('An unknown error occurred');
        res.status(500).send('Server error');
      }
    }
  },
};
