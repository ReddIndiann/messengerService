import { Request, Response } from 'express';
import ApiKeys from '../models/ApiKeys';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';  

export const apikeysController = {
  create: async (req: Request, res: Response) => {
    const { name, userId } = req.body;  // Removed keyvalue from req.body

    try {
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Generate keyvalue automatically using UUID
      const keyvalue = uuidv4();

      // Create API key entry with the generated keyvalue
      const apikeys = await ApiKeys.create({ name, userId, keyvalue });

      res.status(201).json(apikeys);
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
        const apikeys = await ApiKeys.findByPk(id);
        if (!apikeys) {
          return res.status(404).json({ msg: 'apikeys not found' });
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
  
    update: async (req: Request, res: Response) => {
      const { id } = req.params;
      const { name, userId, purpose, status } = req.body;
  
      try {
        const apikeys = await ApiKeys.findByPk(id);
        if (!apikeys) {
          return res.status(404).json({ msg: 'apikey not found' });
        }
  
        if (name) apikeys.name = name;
        if (userId) apikeys.userId = userId;
        if (purpose) apikeys.keyvalue = purpose;
        if (status) apikeys.status = status;
  
        await apikeys.save();
  
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
  
    delete: async (req: Request, res: Response) => {
      const { id } = req.params;
  
      try {
        const apikeys = await ApiKeys.findByPk(id);
        if (!apikeys) {
          return res.status(404).json({ msg: 'apikey not found' });
        }
  
        await apikeys.destroy();
  
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
  