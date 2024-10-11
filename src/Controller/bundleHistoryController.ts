import { Request, Response } from 'express';
import BundleHistory from '../models/BundleHistory';
import Packages from '../models/packages'; // Import the Packages model for reference
import User from '../models/User'; // Import the User model for reference

export const bundleHistoryController = {
  // Create a new bundle history entry
  create: async (req: Request, res: Response) => {
    const { userId, packageId, package_name, expiry, status,creditscore } = req.body;

    try {
      // Validate required fields
      if (!userId || !packageId || !package_name || !expiry || !creditscore) {
        return res.status(400).json({ msg: 'User ID, Package ID, Package Name, and Expiry are required' });
      }

      // Create a new BundleHistory record
      const newBundle = await BundleHistory.create({
        userId,
        packageId,
        package_name,
        expiry,
        creditscore,
        status: status || 'active', // Default to 'active' if not provided
      });

      res.status(201).json(newBundle);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : 'Server error while creating bundle history');
      res.status(500).send('Server error');
    }
  },

  // Get all bundle history entries
  getAll: async (req: Request, res: Response) => {
    try {
      const bundles = await BundleHistory.findAll({
        include: [
          { model: User, attributes: ['id', 'name'] }, // Include User details
          { model: Packages, attributes: ['id', 'name'] } // Include Package details
        ]
      });
      res.json(bundles);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : 'Server error while fetching bundle history');
      res.status(500).send('Server error');
    }
  },

  // Get a bundle history entry by ID
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const bundleDetails = await BundleHistory.findByPk(id, {
        include: [
          { model: User, attributes: ['id', 'name'] },
          { model: Packages, attributes: ['id', 'name'] }
        ]
      });
      if (!bundleDetails) {
        return res.status(404).json({ msg: 'Bundle history not found' });
      }

      res.json(bundleDetails);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : 'Server error while fetching bundle history by ID');
      res.status(500).send('Server error');
    }
  },

  // Get bundle history entries by user ID
  getByUserId: async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const bundles = await BundleHistory.findAll({
        where: { userId },
        include: [
          { model: User, attributes: ['id', 'name'] },
          { model: Packages, attributes: ['id', 'name'] }
        ]
      });

      if (bundles.length === 0) {
        return res.status(404).json({ msg: 'No bundle history found for this user' });
      }

      res.json(bundles);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : 'Server error while fetching bundle history by user ID');
      res.status(500).send('Server error');
    }
  },

  // Update a bundle history entry by ID
  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, packageId, package_name, expiry, status ,creditscore} = req.body;

    try {
      const bundleDetails = await BundleHistory.findByPk(id);
      if (!bundleDetails) {
        return res.status(404).json({ msg: 'Bundle history not found' });
      }

      // Update the fields if provided
      if (userId) bundleDetails.userId = userId;
      if (packageId) bundleDetails.packageId = packageId;
      if (package_name) bundleDetails.package_name = package_name;
      if (expiry) bundleDetails.expiry = expiry;
      if (creditscore) bundleDetails.creditscore = creditscore;
      if (status) bundleDetails.status = status;

      await bundleDetails.save();

      res.json(bundleDetails);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : 'Server error while updating bundle history');
      res.status(500).send('Server error');
    }
  },

  // Delete a bundle history entry by ID
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const bundleDetails = await BundleHistory.findByPk(id);
      if (!bundleDetails) {
        return res.status(404).json({ msg: 'Bundle history not found' });
      }

      await bundleDetails.destroy();

      res.json({ msg: 'Bundle history deleted successfully' });
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : 'Server error while deleting bundle history');
      res.status(500).send('Server error');
    }
  },
};
