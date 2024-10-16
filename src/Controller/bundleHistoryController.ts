import { Request, Response } from 'express';
import BundleHistory from '../models/BundleHistory';
import Packages from '../models/packages'; // Import the Packages model for reference
import User from '../models/User'; // Import the User model for reference
import WalletHistory from '../models/WalletHistory'; // Import WalletHistory to manage user wallet

export const bundleHistoryController = {
  // Create a new bundle history entry
  createWithNormalWallet: async (req: Request, res: Response) => {
    const { userId, packageId, package_name, expiry, type, status, creditscore } = req.body;
  
    try {
      // Validate required fields
      if (!userId || !packageId || !package_name || !expiry || !creditscore) {
        return res.status(400).json({ msg: 'User ID, Package ID, Package Name, Expiry, and Credit Score are required' });
      }
  
      // Fetch the user
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Get the package details
      const selectedPackage = await Packages.findByPk(packageId);
      if (!selectedPackage) {
        return res.status(404).json({ msg: 'Package not found' });
      }
  
      // Check if the package price is valid
      const packageCost = selectedPackage.price;
      if (packageCost == null) {
        return res.status(400).json({ msg: 'Invalid package price' });
      }
  
      // Calculate the bonus score (bonusrate as a percentage of smscount)
      const bonusScore = selectedPackage.bonusrate * (selectedPackage.smscount || 0) / 100;
  
      // Update the user's balance based on the type of package
      if (type === 'expiry') {
        user.expirybalance += packageCost; // Add package price to expiry balance
      } else if (type === 'non-expiry') {
        user.nonexpirybalance += packageCost; // Add package price to non-expiry balance
      } else if (type === 'bonus') {
        user.bonusbalance += packageCost; // Continue to add package price to bonus balance
      } else {
        return res.status(400).json({ msg: 'Invalid package type' });
      }
  
      // Regardless of the package type, add the calculated bonus score to the user's bonus balance
      user.bonusbalance += bonusScore;
  
      // Save the updated user balance
      await user.save();
  
      // Create a new BundleHistory record
      const newBundle = await BundleHistory.create({
        userId,
        packageId,
        package_name,
        expiry,
        type,
        creditscore,
        bonusscore: bonusScore, // Save the calculated bonus score
        status: status || 'active', // Default to 'active' if not provided
      });
  
      res.status(201).json(newBundle);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : 'Server error while creating bundle history');
      res.status(500).send('Server error');
    }
  },
  
  



  createWithAppWallet: async (req: Request, res: Response) => {
    const { userId, packageId, package_name, expiry, type, status, creditscore } = req.body;
  
    try {
      // Fetch the user
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Get the package details
      const selectedPackage = await Packages.findByPk(packageId);
      if (!selectedPackage) {
        return res.status(404).json({ msg: 'Package not found' });
      }
  
      // Check if the package price is valid
      const packageCost = selectedPackage.price;
      if (packageCost == null) {
        return res.status(400).json({ msg: 'Invalid package price' });
      }
  
      // Check if the user has enough balance to make the purchase
      if (user.walletbalance < packageCost) {
        return res.status(400).json({ msg: 'Insufficient wallet balance for this purchase' });
      }
  
      // Deduct the package cost from the user's wallet balance
      user.walletbalance -= packageCost;
  
      // Calculate the bonus score (bonusrate as a percentage of smscount)
      const bonusScore = selectedPackage.bonusrate * (selectedPackage.smscount || 0) / 100;
  
      // Update the user's balance based on the type of package
      if (type === 'expiry') {
        user.expirybalance += packageCost; // Add to expiry balance
      } else if (type === 'non-expiry') {
        user.nonexpirybalance += packageCost; // Add to non-expiry balance
      } else if (type === 'bonus') {
        user.bonusbalance += packageCost; // Continue to add package price to bonus balance
      } else {
        return res.status(400).json({ msg: 'Invalid package type' });
      }
  
      // Regardless of the package type, add the calculated bonus score to the user's bonus balance
      user.bonusbalance += bonusScore;
  
      await user.save(); // Save the updated user balance
  
      // Create a new BundleHistory record
      const newBundle = await BundleHistory.create({
        userId,
        packageId,
        package_name,
        expiry,
        type,
        creditscore,
        bonusscore: bonusScore, // Save the calculated bonus score
        status: status || 'active', // Default to 'active' if not provided
      });
  
      res.status(201).json({ newBundle, remainingBalance: user.walletbalance });
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
          { model: User, attributes: ['id', 'username'] },
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
          { model: User, attributes: ['id', 'username'] },
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

  getByUserTypeId: async (req: Request, res: Response) => {
    const { userId } = req.params;
  
    try {
      const bundles = await BundleHistory.findAll({
        where: { userId },
        attributes: ['userId', 'packageId', 'package_name', 'expiry', 'type', 'status', 'creditscore'],
        include: [
          { model: User, attributes: ['id', 'username'] },
          { model: Packages, attributes: ['id', 'name'] }
        ]
      });
  
      if (bundles.length === 0) {
        return res.status(404).json({ msg: 'No bundle history found for this user' });
      }
  
      // Initialize the sums for each type (expiry, non-expiry, and bonus)
      const creditSums = {
        expiry: 0,
        nonExpiry: 0,
        bonus: 0,
        combinedExpiryNonExpiry: 0 // New total for expiry + non-expiry
      };
  
      // Loop through the bundles and sum the credit scores based on type
      bundles.forEach(bundle => {
        const creditScore = Number(bundle.creditscore) || 0; // Ensure creditscore is treated as a number
  
        switch (bundle.type) { // Assuming 'type' holds the values for 'expiry', 'non-expiry', or 'bonus'
          case 'expiry':
            creditSums.expiry += creditScore; // Add the credit score to the expiry sum
            break;
          case 'non-expiry':
            creditSums.nonExpiry += creditScore;
            break;
          case 'bonus':
            creditSums.bonus += creditScore;
            break;
        }
      });
  
      // Calculate the combined total for expiry + non-expiry
      creditSums.combinedExpiryNonExpiry = creditSums.expiry + creditSums.nonExpiry;
  
      // Send the response with the bundle history and the credit score sums
      res.json({
        bundles,
        creditScores: creditSums
      });
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : 'Server error while fetching bundle history by user ID');
      res.status(500).send('Server error');
    }
  },
  
  
  // Update a bundle history entry by ID
  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, packageId, package_name, expiry,type, status ,creditscore} = req.body;

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
      if (type) bundleDetails.type = type;
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
