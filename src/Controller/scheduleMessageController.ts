import { Request, Response } from 'express';
import ScheduleMessage from '../models/ScheduleMessage';
import Sender from '../models/Sender';
import User from '../models/User';

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

      const scheduleMessage = await ScheduleMessage.create({
        recipients,
        senderId,
        userId,
        content,
        messageType,
        dateScheduled,
        timeScheduled,
        recursion,
      });

      res.status(201).json(scheduleMessage);
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
