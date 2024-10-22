import { Request, Response } from 'express';
import SendMessage from '../models/SendMessage';
import ScheduleMessage from '../models/ScheduleMessage';
import Sender from '../models/Sender';
import User from '../models/User';
import axios from 'axios';
import CreditUsage from '../models/CreditUsage';
const endPoint = 'https://api.mnotify.com/api/sms/quick';
const apiKey = process.env.MNOTIFY_APIKEY; // Replace with your actual API key


interface Message {
  id: number; // Example property, adjust as necessary
  content: string; // Example property, adjust as necessary
  createdAt: Date; // Assuming this is your date field
  // Add any other relevant fields
}


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

      const recipientList = Array.isArray(recipients) ? recipients : [];
      const totalRecipients = recipientList.length;

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

      // Create the message with recipients as an array
      const sendMessage = await SendMessage.create({
        recipients,
        senderId,
        userId,
        content,
        messageType,
        recursion,
      });

      // Prepare data for external API call
      const data = {
        recipient: recipientList,
        sender: sender.name,
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
        creditbalance: {
          expiry: user.expirybalance,
          bonus: user.bonusbalance,
          nonexpiry: user.nonexpirybalance,
        },
      });

      // Notify the user if their credit balance is now zero
      if (user.expirybalance === 0 || user.bonusbalance === 0 || user.nonexpirybalance === 0) {
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


  getTotalMessagesAndRecipients: async (req: Request, res: Response) => {
    try {
      // Fetch all users
      const users = await User.findAll();
  
      // Initialize an object to track counts per user
      const userData: { [key: string]: { totalMessagesSent: number; uniqueRecipients: Set<string> } } = {};
  
      // Fetch all sent and scheduled messages once
      const sentMessages = await SendMessage.findAll();
      const scheduledMessages = await ScheduleMessage.findAll();
  
      // Helper function to process messages
      const processMessages = (messages: any[]) => {
        messages.forEach((message) => {
          const userId = message.userId; // Assuming the message contains the userId
          const date = message.createdAt;
  
          if (!date || isNaN(new Date(date).getTime())) {
            console.warn(`Invalid date encountered for message ID: ${message.id}`);
            return; // Skip processing if the date is invalid
          }
  
          const monthYear = new Date(date).toISOString().slice(0, 7); // Format: YYYY-MM
  
          // Initialize the userData entry if it doesn't exist
          if (!userData[userId]) {
            userData[userId] = { totalMessagesSent: 0, uniqueRecipients: new Set<string>() };
          }
  
          // Increment total messages sent
          userData[userId].totalMessagesSent += 1;
  
          // Add unique recipients if present
          if (Array.isArray(message.recipients)) {
            message.recipients.forEach((recipient: any) => {
              userData[userId].uniqueRecipients.add(recipient);
            });
          }
        });
      };
  
      // Process both sent and scheduled messages
      processMessages(sentMessages);
      processMessages(scheduledMessages);
  
      // Prepare the final response data
      const responseData = Object.entries(userData).map(([userId, data]) => ({
        userId,
        totalMessagesSent: data.totalMessagesSent,
        totalRecipientsCount: data.uniqueRecipients.size,
      }));
  
      // Send response
      res.json(responseData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        res.status(500).send('Server error');
      } else {
        console.error('An unknown error occurred');
        res.status(500).send('Server error');
      }
    }
  }
  

  
,  

getTotalUserMessagesAndRecipients: async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    // Fetch user to ensure they exist
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Fetch all sent messages for this user
    const sentMessages = await SendMessage.findAll({
      where: { userId },
    });

    // Fetch all scheduled messages for this user
    const scheduledMessages = await ScheduleMessage.findAll({
      where: { userId },
    });

    // Initialize an object to track counts per month
    const monthlyData: { [key: string]: { totalMessagesSent: number; uniqueRecipients: Set<string> } } = {};

    // Helper function to process messages
    const processMessages = (messages: any[]) => {
      messages.forEach((message) => {
        // Always use createdAt for date extraction
        const date = message.createdAt;

        // Check if the date is valid
        if (!date || isNaN(new Date(date).getTime())) {
          console.warn(`Invalid date encountered for message ID: ${message.id}`);
          return; // Skip processing this message if date is invalid
        }

        const monthYear = new Date(date).toISOString().slice(0, 7); // Format: YYYY-MM

        // Initialize the monthYear entry if it doesn't exist
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { totalMessagesSent: 0, uniqueRecipients: new Set<string>() };
        }

        // Increment the total messages sent
        monthlyData[monthYear].totalMessagesSent += 1;

        // Add unique recipients to the set
        if (Array.isArray(message.recipients)) {
          message.recipients.forEach((recipient: any) => {
            monthlyData[monthYear].uniqueRecipients.add(recipient);
          });
        }
      });
    };

    // Process sent messages and scheduled messages using the same logic
    processMessages(sentMessages);
    processMessages(scheduledMessages);

    // Prepare the final response data
    const responseData = Object.entries(monthlyData).map(([monthYear, data]) => ({
      monthYear,
      totalMessagesSent: data.totalMessagesSent,
      totalRecipientsCount: data.uniqueRecipients.size,
    }));

    // Send response
    res.json(responseData);
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

 getAllMessages :async (req: Request, res: Response) => {
  try {
    const [sendMessages, scheduleMessages] = await Promise.all([
      SendMessage.findAll(),
      ScheduleMessage.findAll(),
    ]);

    const combinedMessages: Message[] = [...sendMessages, ...scheduleMessages];

    // Function to group messages by month
    const groupByMonth = (messages: Message[]) => {
      return messages.reduce((acc: Record<string, Message[]>, message) => {
        const date = new Date(message.createdAt); // Assuming 'createdAt' is the timestamp field
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }
        acc[monthYear].push(message);
        return acc;
      }, {});
    };

    const messagesByMonth = groupByMonth(combinedMessages);

    res.json(messagesByMonth);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
      res.status(500).send('Server error');
    } else {
      console.error('An unknown error occurred');
      res.status(500).send('Server error');
    }
  }
},};
