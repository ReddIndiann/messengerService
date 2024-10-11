import { Request, Response } from 'express';
import Packages from '../models/packages';
import User from '../models/User';

export const packagesController = {
  create: async (req: Request, res: Response) => {
    const { name, type, price, expiry,duration} = req.body;

    try {
      // Check if user exists
     
      // Check if a sender with the same name already exists for this user
      const existingpackage = await Packages.findOne({
        where: {
          name,
       
        },
      });

      if (existingpackage) {
        return res.status(400).json({
          msg: 'A package with the same name already exists ',
        });
      }

      // Proceed with creating the sender if no duplicate is found
      const packages = await Packages.create({ name, type, price, expiry,duration });

      res.status(201).json(packages);
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
      const packages = await Packages.findAll();
      res.json(packages);
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
      const packages = await Packages.findByPk(id);
      if (!packages) {
        return res.status(404).json({ msg: 'Sender not found' });
      }

      res.json(packages);
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
    const { name, type, price, expiry,duration } = req.body;

    try {
      const packages = await Packages.findByPk(id);
      if (!packages) {
        return res.status(404).json({ msg: 'Sender not found' });
      }

      if (name) packages.name = name;
      if (type) packages.type = type;
      if (price) packages.price = price;
      if (expiry) packages.expiry = expiry;
      if (duration) packages.duration = duration;

      await packages.save();

      res.json(packages);
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
      const packages = await Packages.findByPk(id);
      if (!packages) {
        return res.status(404).json({ msg: 'Sender not found' });
      }

      await packages.destroy();

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

//   getByUserId: async (req: Request, res: Response) => {
//     const { userId } = req.params;

//     try {
//       const senders = await Sender.findAll({ where: { userId } });
//       if (!senders.length) {
//         return res.status(404).json({ msg: 'No senders found for this user' });
//       }

//       res.json(senders);
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//       } else {
//         console.error('An unknown error occurred');
//         res.status(500).send('Server error');
//       }
//     }
//   },
};
