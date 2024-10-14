import cron from 'node-cron';
import BundleHistory from '../models/BundleHistory';
import User from '../models/User'; // Your User model
import { Op } from 'sequelize';

const checkExpiredBundles = async () => {
  try {
    // Step 1: Find all bundle history entries that are still active and whose expiry date has passed
    const expiredBundles = await BundleHistory.findAll({
      where: {
        status: 'active',
        expiry: {
          [Op.lt]: new Date(), // Find bundles where expiry is less than the current date
        },
        type: {
          [Op.in]: ['expiry', 'bonus'], // Only check for expiry and bonus types
        },
      },
    });

    if (expiredBundles.length === 0) {
      console.log('No expired bundles found.');
      return;
    }

    // Step 2: Loop through each expired bundle and mark it as inactive
    const updatedUserBalances: Record<string, { bonus: number; expiry: number }> = {}; // Store user balances to update

    for (const bundle of expiredBundles) {
      const userId = bundle.userId;
      const creditscore = Number(bundle.creditscore) || 0; // Ensure creditscore is a number

      // Mark the bundle as inactive
      bundle.status = 'inactive';
      await bundle.save();

      // Update the user's balance
      if (!updatedUserBalances[userId]) {
        updatedUserBalances[userId] = { bonus: 0, expiry: 0 };
      }

      if (bundle.type === 'expiry') {
        updatedUserBalances[userId].expiry -= creditscore;
      } else if (bundle.type === 'bonus') {
        updatedUserBalances[userId].bonus -= creditscore;
      }
    }

    // Step 3: Update users' balances
    for (const [userId, { bonus, expiry }] of Object.entries(updatedUserBalances)) {
      const user = await User.findByPk(userId);

      if (user) {
        // Update bonus and expiry balances
        user.bonusbalance += bonus;
        user.expirybalance += expiry;
        await user.save();
      }
    }

    console.log('Expired bundles processed and user balances updated successfully.');
  } catch (error) {
    console.error('Error checking expired bundles:', error);
  }
};

// Schedule the job to run every day at midnight
cron.schedule('* * * * *', checkExpiredBundles);

export default checkExpiredBundles; 