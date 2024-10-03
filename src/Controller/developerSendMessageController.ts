import { Request, Response } from 'express';
import SendMessage from '../models/SendMessage';

export const developerController = {
  sendMessage: async (req: Request, res: Response) => {
    const { recipients, content, userId } = req.body;

    try {
      // Assuming senderId is validated in the middleware
      const { senderid } = req.headers;

      // Send message logic
      const sendMessage = await SendMessage.create({
        recipients,
        senderId: senderid,    // SenderId from the header
        userId,                // userId from the middleware
        content,
        messageType: 'SMS',    // Assuming SMS as the type, modify as needed
        recursion: false,      // Example field, adjust as needed
      });

      res.status(201).json({ message: 'Message sent successfully', sendMessage });
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },
};
