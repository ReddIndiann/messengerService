import { Request, Response } from 'express';
import Sender from '../models/Sender';
import User from '../models/User';

export const senderController = {
  create: async (req: Request, res: Response) => {
    const { name, userId, purpose } = req.body;

    try {
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      const sender = await Sender.create({ name, userId, purpose });

      res.status(201).json(sender);
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
      const senders = await Sender.findAll();
      res.json(senders);
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
      const sender = await Sender.findByPk(id);
      if (!sender) {
        return res.status(404).json({ msg: 'Sender not found' });
      }

      res.json(sender);
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
    const { name, userId, purpose, status } = req.body;

    try {
      const sender = await Sender.findByPk(id);
      if (!sender) {
        return res.status(404).json({ msg: 'Sender not found' });
      }

      if (name) sender.name = name;
      if (userId) sender.userId = userId;
      if (purpose) sender.purpose = purpose;
      if (status) sender.status = status;

      await sender.save();

      res.json(sender);
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
      const sender = await Sender.findByPk(id);
      if (!sender) {
        return res.status(404).json({ msg: 'Sender not found' });
      }

      await sender.destroy();

      res.json({ msg: 'Sender deleted successfully' });
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
      const senders = await Sender.findAll({ where: { userId } });
      if (!senders.length) {
        return res.status(404).json({ msg: 'No senders found for this user' });
      }

      res.json(senders);
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
