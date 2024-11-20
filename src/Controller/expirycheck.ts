import cron from 'node-cron';
import BundleHistory from '../models/BundleHistory';
import User from '../models/User';
import { Op } from 'sequelize';

const checkExpiredBundle = async () => {
  try {
    const expiredBundles = await BundleHistory.findAll({
      where: {
        status: 'active',
        expiry: {
          [Op.lt]: new Date(),
        },
        type: {
          [Op.in]: ['expiry', 'bonus'],
        },
      },
    });

    if (expiredBundles.length === 0) {
      console.log('No expired bundles found.');
      return;
    }

    const updatedUserBalances: Record<string, { bonus: number; expiry: number }> = {};

    for (const bundle of expiredBundles) {
      const userId = bundle.userId;
      const creditscore = Number(bundle.creditscore) || 0;
      const bonusscore = Number(bundle.bonusscore) || 0;

      bundle.status = 'inactive';
      await bundle.save();

      if (!updatedUserBalances[userId]) {
        updatedUserBalances[userId] = { bonus: 0, expiry: 0 };
      }

      if (bundle.type === 'expiry') {
        updatedUserBalances[userId].expiry -= creditscore;
      } else if (bundle.type === 'bonus') {
        updatedUserBalances[userId].bonus -= creditscore;
      }

      // Deduct bonusscore for both expiry and bonus types
      updatedUserBalances[userId].bonus -= bonusscore;
    }

    for (const [userId, { bonus, expiry }] of Object.entries(updatedUserBalances)) {
      const user = await User.findByPk(userId);
      if (user) {
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
cron.schedule('* * * * *', checkExpiredBundle);

export default checkExpiredBundle;