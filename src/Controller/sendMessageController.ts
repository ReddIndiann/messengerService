import { Request, Response } from 'express';
import SendMessage from '../models/SendMessage';
import Sender from '../models/Sender';
import User from '../models/User';
import axios from 'axios';

const endPoint = 'https://api.mnotify.com/api/sms/quick';
const apiKey = process.env.MNOTIFY_APIKEY; // Replace with your actual API key


const findSenderAndUser = async (senderId: number, userId: number) => {
  const sender = await Sender.findByPk(senderId);
  const user = await User.findByPk(userId);
  return { sender, user };
};

const handleApiError = (apiError: any, res: Response) => {
  if (axios.isAxiosError(apiError)) {
    console.error('mNotify API Error:', {
      status: apiError.response?.status,
      statusText: apiError.response?.statusText,
      data: apiError.response?.data,
      message: apiError.message,
    });

    res.status(apiError.response?.status || 500).json({
      message: 'Error from mNotify API',
      error: {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: apiError.message,
      },
    });
  } else {
    console.error('Unknown API Error:', apiError);
    res.status(500).send('Server error');
  }
};


export const sendMessageController = {
  // create: async (req: Request, res: Response) => {
  //   const { recipients, senderId, userId, content, messageType, recursion } = req.body;

  //   try {
  //     // Check if sender and user exist
  //     const sender = await Sender.findByPk(senderId);
  //     const user = await User.findByPk(userId);

  //     if (!sender) {
  //       return res.status(404).json({ msg: 'Sender not found' });
  //     }
  //     if (!user) {
  //       return res.status(404).json({ msg: 'User not found' });
  //     }

  //     const sendMessage = await SendMessage.create({
  //       recipients,
  //       senderId,
  //       userId,
  //       content,
  //       messageType,
  //       recursion,
  //     });

  //     res.status(201).json(sendMessage);
  //   } catch (err: unknown) {
  //     if (err instanceof Error) {
  //       console.error(err.message);
  //       res.status(500).send('Server error');
  //     } else {
  //       console.error('An unknown error occurred');
  //       res.status(500).send('Server error');
  //     }
  //   }
  // },
  create: async (req: Request, res: Response) => {
    const { recipients, senderId, userId, content, messageType, recursion } = req.body;

    try {
      const { sender, user } = await findSenderAndUser(senderId, userId);

      if (!sender) {
        return res.status(404).json({ message: 'Sender not found' });
      }
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (sender.status !== 'approved') {
        return res.status(400).json({ message: 'Sender is not approved' });
      }
      if (user.creditbalance <= 0) {
        return res.status(400).json({ message: 'No credits left. Please recharge your account.' });
      }

      // Deduct 1 credit from user's balance
      user.creditbalance -= 1;
      await user.save();

      // Create the message with recipients as an array
      const sendMessage = await SendMessage.create({
        recipients, // Assuming recipients is already an array
        senderId,
        userId,
        content,
        messageType,
        recursion,
      });

      // Prepare data for external API call
      const recipientList = Array.isArray(recipients) ? recipients : [];
      const data = {
        recipient: recipientList,
        sender: sender.name, // Assuming sender.name is correct
        message: content,
        is_schedule: 'false',
        schedule_date: '',
      };

      // Call the external API
      const response = await axios.post(`${endPoint}?key=${apiKey}`, data, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('mNotify API Response:', response.data);

      res.status(201).json({
        message: 'Message created and sent successfully',
        sendMessage,
        apiResponse: response.data,
        creditbalance: user.creditbalance, // Include updated credit balance in the response
      });

      // Notify the user if their credit balance is now zero
      if (user.creditbalance === 0) {
        console.warn(`User ${user.username} has run out of credits.`);
        // Optionally, notify the user via email or SMS
      }

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        handleApiError(err, res);
      } else {
        console.error('Server Error:', err);
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
