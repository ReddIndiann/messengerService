import cron from 'node-cron';
import BundleHistory from '../models/BundleHistory';
import User from '../models/User';
import { Op } from 'sequelize';

const checkBonusExpiredBundles = async () => {
  try {
    // Find all active bundles where bonusStatus is 'active' and the expiry date is not passed
    const activeBundles = await BundleHistory.findAll({
      where: {
        bonusStatus: 'active',
     
        bonusExpiry: {
          [Op.lt]: new Date(), // Expiry date is in the future
        },
      },
    });

    if (activeBundles.length === 0) {
      console.log('No  bundles found.');
      return;
    }

    // Initialize a dictionary to track total creditscore for each user
    const totalBonusscoreByUser: { [key: number]: number } = {};

    // Loop through the active bundles to calculate total creditscore per user
    for (const bundle of activeBundles) {
      const userId = bundle.userId;  // userId is expected to be a number
      const bonusStatus = Number(bundle.creditscore) || 0;

      // Sum the totalBonusscore for each user
      if (!totalBonusscoreByUser[userId]) {
        totalBonusscoreByUser[userId] = 0;
      }
      totalBonusscoreByUser[userId] += bonusStatus;
    }

    // Initialize an array to store user updates
    const userUpdates = [];

    // Now loop through each user and update their bonusbalance based on the total creditscore
    for (const [userIdStr, totalBonusscore] of Object.entries(totalBonusscoreByUser)) {
      const userId = Number(userIdStr);  // Convert userId from string to number to match the database type
      const user = await User.findByPk(userId);

      if (user) {
        const difference  = user.expirybalance -    totalBonusscore;  
        console.log(totalBonusscore)
        console.log(user.expirybalance)
        console.log(difference)

        let deductionAmount = difference;  // Always deduct the difference

        // Deduct the amount regardless of whether it is positive or negative
        user.bonusbalance -= deductionAmount;

        // Add the user to the bulk update array
        userUpdates.push(user);  // The user will be updated regardless of the balance
        console.log(`User ${userId} bonusbalance updated. Deducted ${deductionAmount}.`);

        // Update the bonusStatus of the corresponding bundles to 'inactive' after deduction
        const bundlesToUpdate = activeBundles.filter(bundle => bundle.userId === userId);
        for (const bundle of bundlesToUpdate) {
          bundle.bonusStatus = 'inactive';  // Change the bonusStatus to 'inactive'
          await bundle.save();  // Save the updated bundle
          console.log(`Bundle for user ${userId} set to inactive.`);
        }
      }
    }

    // Perform bulk save only if there are updates to users
    if (userUpdates.length > 0) {
      await Promise.all(userUpdates.map(user => user.save()));  // Save all users in parallel
      console.log('All user balances updated successfully.');
    } else {
      console.log('No updates were necessary.');
    }

  } catch (error) {
    console.error('Error checking active bundles:', error);
  }
};

// Schedule this function to run every minute
cron.schedule('* * * * *', checkBonusExpiredBundles);

export default checkBonusExpiredBundles;
