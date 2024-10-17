import { Request, Response } from 'express';
import WalletHistory from '../models/WalletHistory';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';  
export const WalletController = {
  create: async (req: Request, res: Response) => {
    const { transactionid, userId, amount, note } = req.body;

    try {
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      const transactionid = uuidv4();
      // Create the wallet entry
      const wallet = await WalletHistory.create({ transactionid, userId, amount, note });

      // Update the user's wallet balance
      user.walletbalance += amount; // Increase wallet balance by the amount
      await user.save(); // Save the updated user

      res.status(201).json({ wallet, updatedWalletBalance: user.walletbalance });
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
  getAllAmount: async (req: Request, res: Response) => {
    try {
      // Fetch all wallet histories
      const wallet = await WalletHistory.findAll();
  
      // Calculate the total sum of the 'amount' field
      const totalAmount = await WalletHistory.sum('amount');
  
      // Respond with both wallet histories and the sum of the amounts
      res.json({ wallet, totalAmount });
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

  getWalletByUserId: async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // Fetch all wallet history records for the user
        const wallet = await WalletHistory.findAll({ where: { userId } });

        // Check if any records exist for this user
        if (!wallet.length) {
            return res.status(404).json({ msg: 'No Wallet History found for this user' });
        }

        // Calculate the total amount for this user
        const totalAmount = await WalletHistory.sum('amount', { where: { userId } });

        // Respond with both the wallet history and the total sum of amounts
        res.json({
            wallet,
            totalAmount
        });
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
