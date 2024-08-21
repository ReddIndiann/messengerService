import { Request, Response } from 'express';
import MessageTemplate from '../models/MessageTemplate';
import User from '../models/User';

export const messageTemplateController = {
  create: async (req: Request, res: Response) => {
    const { title, content, userId, messageCategory } = req.body;

    try {
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      const messageTemplate = await MessageTemplate.create({
        title,
        content,
        userId,
        messageCategory,
      });

      res.status(201).json(messageTemplate);
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
      const messageTemplates = await MessageTemplate.findAll();
      res.json(messageTemplates);
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
      const messageTemplate = await MessageTemplate.findByPk(id);
      if (!messageTemplate) {
        return res.status(404).json({ msg: 'MessageTemplate not found' });
      }

      res.json(messageTemplate);
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
    const { title, content, userId, messageCategory } = req.body;

    try {
      const messageTemplate = await MessageTemplate.findByPk(id);
      if (!messageTemplate) {
        return res.status(404).json({ msg: 'MessageTemplate not found' });
      }

      if (title) messageTemplate.title = title;
      if (content) messageTemplate.content = content;
      if (userId) messageTemplate.userId = userId;
      if (messageCategory) messageTemplate.messageCategory = messageCategory;

      await messageTemplate.save();

      res.json(messageTemplate);
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
      const messageTemplate = await MessageTemplate.findByPk(id);
      if (!messageTemplate) {
        return res.status(404).json({ msg: 'MessageTemplate not found' });
      }

      await messageTemplate.destroy();

      res.json({ msg: 'MessageTemplate deleted successfully' });
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
      const messageTemplates = await MessageTemplate.findAll({ where: { userId } });
      if (!messageTemplates.length) {
        return res.status(404).json({ msg: 'No message templates found for this user' });
      }

      res.json(messageTemplates);
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
