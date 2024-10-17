import { Request, Response } from 'express';
import ApiKeys from '../models/ApiKeys';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';  

export const apikeysController = {
  create: async (req: Request, res: Response) => {
    const { name, userId } = req.body; // Removed keyvalue from req.body

    try {
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Generate apikey automatically using UUID
      const apikey = uuidv4(); // Changed keyvalue to apikey

      // Create API key entry with the generated apikey
      const apikeyEntry = await ApiKeys.create({ name, userId, apikey }); // Updated variable name for clarity

      res.status(201).json(apikeyEntry);
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
      const apikeys = await ApiKeys.findAll();
      res.json(apikeys);
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
      const apikeyEntry = await ApiKeys.findByPk(id);
      if (!apikeyEntry) {
        return res.status(404).json({ msg: 'apikey not found' });
      }

      res.json(apikeyEntry);
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
    const { name, userId, apikey, status } = req.body; // Change api_key to apikey

    try {
      const apikeyEntry = await ApiKeys.findByPk(id);
      if (!apikeyEntry) {
        return res.status(404).json({ msg: 'apikey not found' });
      }

      if (name) apikeyEntry.name = name;
      if (userId) apikeyEntry.userId = userId;
      if (apikey) apikeyEntry.apikey = apikey; // Updated to apikey
      if (status) apikeyEntry.status = status;

      await apikeyEntry.save();

      res.json(apikeyEntry);
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
      const apikeyEntry = await ApiKeys.findByPk(id);
      if (!apikeyEntry) {
        return res.status(404).json({ msg: 'apikey not found' });
      }

      await apikeyEntry.destroy();

      res.json({ msg: 'apikey deleted successfully' });
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
      const apikeys = await ApiKeys.findAll({ where: { userId } });
      if (!apikeys.length) {
        return res.status(404).json({ msg: 'No apikeys found for this user' });
      }

      res.json(apikeys);
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
