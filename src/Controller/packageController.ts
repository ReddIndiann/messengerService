import { Request, Response } from 'express';
import Packages from '../models/packages';

export const packagesController = {
  // Create a new package
  create: async (req: Request, res: Response) => {
    const { name, type, price, rate, smscount, expiry, duration } = req.body;

    // Basic validation
    if (!name || !type || !price || !rate || !smscount || !expiry || !duration) {
        return res.status(400).json({ msg: 'All fields are required' });
    }

    try {
        // Check if a package with the same name already exists
        const existingPackage = await Packages.findOne({
            where: { name },
        });

        if (existingPackage) {
            return res.status(400).json({ msg: 'A package with the same name already exists' });
        }

        // Proceed with creating the package if no duplicate is found
        const newPackage = await Packages.create({
            name,
            type,
            price,
            rate,
            smscount,
            expiry,
            duration,
        });

        res.status(201).json(newPackage);
    } catch (err: unknown) {
        console.error('Error creating package:', err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send('Server error');
    }
},


  // Get all packages
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

  // Get a package by ID
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const packageDetails = await Packages.findByPk(id);
      if (!packageDetails) {
        return res.status(404).json({ msg: 'Package not found' });
      }

      res.json(packageDetails);
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

  // Update a package by ID
  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, type, price, rate, smscount, expiry, duration } = req.body;

    try {
      const packageDetails = await Packages.findByPk(id);
      if (!packageDetails) {
        return res.status(404).json({ msg: 'Package not found' });
      }

      // Update the package fields if they are provided in the request
      if (name) packageDetails.name = name;
      if (type) packageDetails.type = type;
      if (price) packageDetails.price = price;
      if (rate) packageDetails.rate = rate;
      if (smscount) packageDetails.smscount = smscount;
      if (expiry) packageDetails.expiry = expiry;
      if (duration) packageDetails.duration = duration;

      await packageDetails.save();

      res.json(packageDetails);
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

  // Delete a package by ID
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const packageDetails = await Packages.findByPk(id);
      if (!packageDetails) {
        return res.status(404).json({ msg: 'Package not found' });
      }

      await packageDetails.destroy();

      res.json({ msg: 'Package deleted successfully' });
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
