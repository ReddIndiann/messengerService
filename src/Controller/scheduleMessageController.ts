import { Request, Response } from 'express';
import ScheduleMessage from '../models/ScheduleMessage';
import Sender from '../models/Sender';
import User from '../models/User';
import axios from 'axios';
import cron from 'node-cron';
import moment from 'moment';  // Use moment.js to handle date and time
import CreditUsage from '../models/CreditUsage';
const endPoint = 'https://api.mnotify.com/api/sms/quick';
const apiKey = process.env.MNOTIFY_APIKEY; // Replace with your actual API key

export const scheduleMessageController = {
  create: async (req: Request, res: Response) => {
    const { recipients, senderId, userId, content, messageType, dateScheduled, timeScheduled, recursion } = req.body;

    try {
      // Check if sender and user exist
      const sender = await Sender.findByPk(senderId);
      const user = await User.findByPk(userId);

      if (!sender) {
        return res.status(404).json({ msg: 'Sender not found' });
      }
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      if (sender.status !== 'approved') {
        return res.status(400).json({ message: 'Sender is not approved' });
      }

      // Handle recipients as an array
      let recipientsArray: string[] = [];
      if (typeof recipients === 'string') {
        recipientsArray = recipients.split(',').map((recipient: string) => recipient.trim());
      } else if (Array.isArray(recipients)) {
        recipientsArray = recipients;
      } else {
        return res.status(400).json({ msg: 'Invalid recipients format' });
      }

      const totalRecipients = recipientsArray.length;

      // Fetch credit usage order
      const creditUsage = await CreditUsage.findOne();
      if (!creditUsage) {
        return res.status(500).json({ message: 'Credit usage order not found' });
      }

      // Array of credit types in the specified order
      const creditTypes = [creditUsage.usefirst, creditUsage.usesecond, creditUsage.usethird];
      let deducted = false;

      // Attempt to deduct credits in the specified order
      for (const type of creditTypes) {
        if (type === 'expiry' && user.expirybalance >= totalRecipients) {
          user.expirybalance -= totalRecipients;
          deducted = true;
          break;
        } else if (type === 'bonus' && user.bonusbalance >= totalRecipients) {
          user.bonusbalance -= totalRecipients;
          deducted = true;
          break;
        } else if (type === 'non-expiry' && user.nonexpirybalance >= totalRecipients) {
          user.nonexpirybalance -= totalRecipients;
          deducted = true;
          break;
        }
      }

      if (!deducted) {
        return res.status(400).json({
          message: `Insufficient credits. You need ${totalRecipients} credits, but have insufficient balance in specified types.`,
        });
      }

      await user.save();

      // Create the schedule message record
      const scheduleMessage = await ScheduleMessage.create({
        recipients: recipientsArray.join(','), // Store as a comma-separated string
        senderId,
        userId,
        content,
        messageType,
        dateScheduled,
        timeScheduled,
        recursion,
        status: 'pending', // Initial status
      });

      // Schedule the cron job
      const scheduleDateTime = moment(`${dateScheduled} ${timeScheduled}`, 'YYYY-MM-DD HH:mm');

      // Set up cron to run at the exact time the message is scheduled
      const cronJob = cron.schedule(scheduleDateTime.format('m H D M *'), async () => {
        try {
          // Prepare data for mNotify API
          const data = {
            recipient: recipientsArray,
            sender: sender.name,
            message: content,
            is_schedule: 'false',
          };

          // Configure the request
          const url = `${endPoint}?key=${apiKey}`;
          const config = {
            method: 'post',
            url: url,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            data: data,
          };

          // Send the message via mNotify API
          const response = await axios(config);
          console.log('mNotify API Response:', response.data);

          // Update the schedule message status after sending
          scheduleMessage.status = 'Sent';
          await scheduleMessage.save();

        } catch (apiError) {
          if (axios.isAxiosError(apiError)) {
            console.error('mNotify API Error:', apiError.response?.data || apiError.message);
          } else {
            console.error('Unknown API Error:', apiError);
          }
        } finally {
          // Stop the cron job once it's executed
          cronJob.stop();
        }
      }, {
        scheduled: true,
      });

      // Start the cron job
      cronJob.start();

      res.status(201).json({
        message: 'Message created and scheduled successfully',
        scheduleMessage,
        creditbalance: {
          expiry: user.expirybalance,
          bonus: user.bonusbalance,
          nonexpiry: user.nonexpirybalance,
        }, // Include updated credit balance in the response
      });

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
      const scheduleMessages = await ScheduleMessage.findAll();
      res.json(scheduleMessages);
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
      const scheduleMessage = await ScheduleMessage.findByPk(id);
      if (!scheduleMessage) {
        return res.status(404).json({ msg: 'ScheduleMessage not found' });
      }

      res.json(scheduleMessage);
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
    const { recipients, senderId, userId, content, messageType, dateScheduled, timeScheduled, recursion } = req.body;

    try {
      const scheduleMessage = await ScheduleMessage.findByPk(id);
      if (!scheduleMessage) {
        return res.status(404).json({ msg: 'ScheduleMessage not found' });
      }

      if (recipients) scheduleMessage.recipients = recipients;
      if (senderId) scheduleMessage.senderId = senderId;
      if (userId) scheduleMessage.userId = userId;
      if (content) scheduleMessage.content = content;
      if (messageType) scheduleMessage.messageType = messageType;
      if (dateScheduled) scheduleMessage.dateScheduled = dateScheduled;
      if (timeScheduled) scheduleMessage.timeScheduled = timeScheduled;
      if (recursion) scheduleMessage.recursion = recursion;

      await scheduleMessage.save();

      res.json(scheduleMessage);
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
      const scheduleMessage = await ScheduleMessage.findByPk(id);
      if (!scheduleMessage) {
        return res.status(404).json({ msg: 'ScheduleMessage not found' });
      }

      await scheduleMessage.destroy();

      res.json({ msg: 'ScheduleMessage deleted successfully' });
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
      const scheduleMessages = await ScheduleMessage.findAll({ where: { userId } });
      if (!scheduleMessages.length) {
        return res.status(404).json({ msg: 'No schedule messages found for this user' });
      }

      res.json(scheduleMessages);
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
