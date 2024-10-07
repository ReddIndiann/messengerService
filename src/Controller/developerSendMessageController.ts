import { Request, Response } from 'express';
import SendMessage from '../models/SendMessage';
import Sender from '../models/Sender';
import User from '../models/User';
import Contact from '../models/Contact';
import Group from '../models/Group';
import axios from 'axios';
import cron, { schedule } from 'node-cron';
import ApiKeys from '../models/ApiKeys';
import moment from 'moment';
import ContactGroup from '../models/ContactGroup';
import ScheduleMessage from '../models/ScheduleMessage';
const endPoint = 'https://api.mnotify.com/api/sms/quick';
const apiKey = process.env.MNOTIFY_APIKEY; // Replace with your actual API key

export const developerController = {
  sendMessage: async (req: Request, res: Response) => {
    const { recipients, content } = req.body;
    const { userId, sender } = req.body; // Using sender object from middleware

    try {
      // 1. Validate user
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.creditbalance <= 0) return res.status(400).json({ message: 'No credits left. Please recharge your account.' });
  
      // 2. Deduct 1 credit and save user balance
      user.creditbalance -= 1;
      await user.save();
  
      // 3. Create a new message record
      const sendMessage = await SendMessage.create({
        recipients,
        senderId: sender.id, // Use senderId from the validated sender object
        userId,
        content,
        messageType: 'API', // Assuming SMS
        recursion: false,
      });
  
      // 4. Prepare mNotify API data
      const data = {
        recipient: Array.isArray(recipients) ? recipients : [],
        sender: sender.name, // Use sender's name from validated sender object
        message: content,
        is_schedule: 'false',
      };
  
      // 5. Call mNotify API
      const response = await axios.post(`${endPoint}?key=${apiKey}`, data, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
  
      // 6. Respond with success
      console.log('mNotify API Response:', response.data);
      res.status(201).json({
        message: 'Message sent successfully',
        sendMessage,
        apiResponse: response.data,
        creditbalance: user.creditbalance,
      });
  
      // Optional: Notify the user if they run out of credits
      if (user.creditbalance === 0) {
        console.warn(`User ${user.username} has run out of credits.`);
      }
  
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('mNotify API Error:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
          message: 'Error from mNotify API',
          error: {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message,
          },
        });
      } else {
        console.error('Server Error:', err);
        res.status(500).send('Server error');
      }
    }
  },

  scheduleMessage: async (req: Request, res: Response) => {
    const { recipients, content, dateScheduled, timeScheduled, recursion } = req.body;
    const { userId, sender } = req.body; // Using sender object from middleware
  
    try {
      // Validate user
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.creditbalance <= 0) return res.status(400).json({ message: 'No credits left. Please recharge your account.' });
  
      // Deduct 1 credit and save user balance
      user.creditbalance -= 1;
      await user.save();
  
      // Handle recipients as an array
      const recipientsArray: string[] = Array.isArray(recipients)
        ? recipients
        : recipients.split(',').map((recipient: string) => recipient.trim());
  
      // Create the scheduled message record
      const scheduleMessage = await ScheduleMessage.create({
        recipients: recipientsArray.join(','),
        senderId: sender.id, // Use senderId from validated sender object
        userId,
        content,
        messageType: 'API',
        dateScheduled,
        timeScheduled,
        recursion,
      });
  
      // Schedule the cron job
      const scheduleDateTime = moment(`${dateScheduled} ${timeScheduled}`, 'YYYY-MM-DD HH:mm');
      const cronJob = cron.schedule(scheduleDateTime.format('m H D M *'), async () => {
        try {
          // Prepare data for mNotify API
          const data = {
            recipient: recipientsArray,
            sender: sender.name, // Use sender's name from validated sender object
            message: content,
            is_schedule: 'false', // Send now
          };
  
          // Call mNotify API to send the message
          const response = await axios.post(`${endPoint}?key=${apiKey}`, data, {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          });
  
          // Log and update the message status
          console.log('mNotify API Response:', response.data);
          scheduleMessage.status = 'Sent';
          await scheduleMessage.save();
  
        } catch (apiError) {
          if (axios.isAxiosError(apiError)) {
            console.error('mNotify API Error:', apiError.response?.data || apiError.message);
          } else {
            console.error('Unknown API Error:', apiError);
          }
        } finally {
          // Stop the cron job after execution
          cronJob.stop();
        }
      }, { scheduled: true });
  
      // Start the cron job
      cronJob.start();
  
      // Respond with success
      res.status(201).json({
        message: 'Message scheduled successfully',
        scheduleMessage,
        creditbalance: user.creditbalance,
      });
  
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('mNotify API Error:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
          message: 'Error from mNotify API',
          error: err.response?.data || err.message,
        });
      } else {
        console.error('Server Error:', err);
        res.status(500).send('Server error');
      }
    }
  },
  developerCreateContact: async (req: Request, res: Response) => {
    const { firstname, lastname, birthday, phone, email } = req.body;
    const { userId } = req.body;  // This will be set by the validateApiKey middleware

    try {
      // Create the contact using the userId extracted from the API key
      const contact = await Contact.create({
        firstname,
        lastname,
        birthday,
        phone,
        email,
        userId,
      });

      res.status(201).json(contact);
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
  developerCreateGroup: async (req: Request, res: Response) => {
    const { groupName } = req.body;
    const { userId } = req.body;  // This will be set by the validateApiKey middleware

    try {
      // Create the contact using the userId extracted from the API key
      const group = await Group.create({
        groupName,
        userId,
      });

      res.status(201).json(group);
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

  createcontactgroup: async (req: Request, res: Response) => {
    const { apikeyvalue } = req.headers; // Get the API key from the request headers
    const { contactId, groupId } = req.body;

    try {
      // Validate API key and retrieve associated user ID
      const apiKey = await ApiKeys.findOne({ where: { keyvalue: apikeyvalue } });
      if (!apiKey) {
        return res.status(403).json({ msg: 'Invalid API key' });
      }
      const userId = apiKey.userId;

      // Check if the contact belongs to the user
      const contact = await Contact.findOne({ where: { id: contactId, userId } });
      if (!contact) {
        return res.status(404).json({ msg: 'Contact not found for this user' });
      }

      // Check if the group belongs to the user
      const group = await Group.findOne({ where: { id: groupId, userId } });
      if (!group) {
        return res.status(404).json({ msg: 'Group not found for this user' });
      }

      // Create the contact-group association
      const contactGroup = await ContactGroup.create({
        contactId,
        groupId,
      });

      res.status(201).json(contactGroup);
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
