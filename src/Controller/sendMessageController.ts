import { Request, Response } from 'express';
import SendMessage from '../models/SendMessage';
import Sender from '../models/Sender';
import User from '../models/User';

export const sendMessageController = {
  create: async (req: Request, res: Response) => {
    const { recipients, senderId, userId, content, messageType, recursion } = req.body;

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

      const sendMessage = await SendMessage.create({
        recipients,
        senderId,
        userId,
        content,
        messageType,
        recursion,
      });

      res.status(201).json(sendMessage);
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
      const sendMessages = await SendMessage.findAll();
      res.json(sendMessages);
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
      const sendMessage = await SendMessage.findByPk(id);
      if (!sendMessage) {
        return res.status(404).json({ msg: 'SendMessage not found' });
      }

      res.json(sendMessage);
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
    const { recipients, senderId, userId, content, messageType, recursion } = req.body;

    try {
      const sendMessage = await SendMessage.findByPk(id);
      if (!sendMessage) {
        return res.status(404).json({ msg: 'SendMessage not found' });
      }

      if (recipients) sendMessage.recipients = recipients;
      if (senderId) sendMessage.senderId = senderId;
      if (userId) sendMessage.userId = userId;
      if (content) sendMessage.content = content;
      if (messageType) sendMessage.messageType = messageType;
      if (recursion) sendMessage.recursion = recursion;

      await sendMessage.save();

      res.json(sendMessage);
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
      const sendMessage = await SendMessage.findByPk(id);
      if (!sendMessage) {
        return res.status(404).json({ msg: 'SendMessage not found' });
      }

      await sendMessage.destroy();

      res.json({ msg: 'SendMessage deleted successfully' });
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
      const sendMessages = await SendMessage.findAll({ where: { userId } });
      if (!sendMessages.length) {
        return res.status(404).json({ msg: 'No send messages found for this user' });
      }

      res.json(sendMessages);
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
