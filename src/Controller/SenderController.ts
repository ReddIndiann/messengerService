import { Request, Response } from 'express';
import Sender from '../models/Sender';
import User from '../models/User';
import ScheduleMessage from '../models/ScheduleMessage';
import SendMessage from '../models/SendMessage';
import { sendSMS } from '../utility/smsService';
import { sendEmail } from '../utility/emailService';

import AdminConfig from '../models/AdminConfig';
export const senderController = {
  create: async (req: Request, res: Response) => {
    const { name, userId, purpose } = req.body;

    try {
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if a sender with the same name already exists for this user
      const existingSender = await Sender.findOne({
        where: {
          name,
          userId,
        },
      });

      if (existingSender) {
        return res.status(400).json({
          msg: 'A sender ID with the same name already exists for this user.',
        });
      }

      // Proceed with creating the sender if no duplicate is found
      const sender = await Sender.create({ name, userId, purpose });
      const adminConfig = await AdminConfig.findOne();
      const contactEmail = adminConfig ? adminConfig.contactPersonEmail : "danielkojo005@gmail.com";
      const contactPersonPhone = adminConfig ? adminConfig.contactPersonPhone : "0536690447";
      const subject = 'New Sender ID pending Approval';
      const html = `A user has created a new Sender ID with name ${name} for ${purpose}`;

      await sendEmail(contactEmail, subject, html); // Use the sendEmail function here
      try {
        const response = await sendSMS([contactPersonPhone], 'Kamak', html);
        
        if (response.status === 200) {
          return res.status(200).json({ message: 'OTP sent successfully' });
        } else {
          return res.status(response.status).json({ 
            message: response.message || 'Failed to send OTP' 
          });
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Error sending OTP, please try again later' });
      }
      res.status(201).json(sender);
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
      const senders = await Sender.findAll();
      res.json(senders);
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
      const sender = await Sender.findByPk(id);
      if (!sender) {
        return res.status(404).json({ msg: 'Sender not found' });
      }

      res.json(sender);
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
      const sender = await Sender.findByPk(id);
      if (!sender) {
        return res.status(404).json({ msg: 'Sender not found' });
      }

      if (name) sender.name = name;
      if (userId) sender.userId = userId;
      if (purpose) sender.purpose = purpose;
      if (status) sender.status = status;

      await sender.save();

      res.json(sender);
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
      const sender = await Sender.findByPk(id);
      if (!sender) {
        return res.status(404).json({ msg: 'Sender not found' });
      }
      await ScheduleMessage.destroy({
        where: { senderId: id }
      });
      await SendMessage.destroy({
        where: { senderId: id }
      });
      await sender.destroy();

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

  getByUserId: async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const senders = await Sender.findAll({ where: { userId } });
      if (!senders.length) {
        return res.status(404).json({ msg: 'No senders found for this user' });
      }

      res.json(senders);
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
