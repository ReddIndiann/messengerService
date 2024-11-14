import { Request, Response } from 'express';
import Contact from '../models/Contact';
import ContactGroup from '../models/ContactGroup';
import Group from '../models/Group';
import SendMessage from '../models/SendMessage';
import Sender from '../models/Sender';
import User from '../models/User';
import axios from 'axios';
import cron from 'node-cron';
import moment from 'moment';
import ScheduleMessage from '../models/ScheduleMessage';

const endPoint =process.env.MNOTIFY_ENDPOINT ;
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
export const contactGroupController = {
  create: async (req: Request, res: Response) => {
    const { contactId, groupId } = req.body;
  
    try {
      // Check if the contact is already in the group
      const existingContactGroup = await ContactGroup.findOne({
        where: {
          contactId,
          groupId,
        },
      });
  
      if (existingContactGroup) {
        return res.status(400).json({ message: 'Contact is already in this group' });
      }
  
      // If not, create the new contact-group relationship
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
  

  getAll: async (req: Request, res: Response) => {
    try {
      const contactGroups = await ContactGroup.findAll();
      res.json(contactGroups);
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
      const contactGroup = await ContactGroup.findByPk(id);
      if (!contactGroup) {
        return res.status(404).json({ msg: 'ContactGroup not found' });
      }

      res.json(contactGroup);
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
    const { contactId, groupId } = req.body;

    try {
      const contactGroup = await ContactGroup.findByPk(id);
      if (!contactGroup) {
        return res.status(404).json({ msg: 'ContactGroup not found' });
      }

      if (contactId) contactGroup.contactId = contactId;
      if (groupId) contactGroup.groupId = groupId;

      await contactGroup.save();
      res.json(contactGroup);
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
      const contactGroup = await ContactGroup.findByPk(id);
      if (!contactGroup) {
        return res.status(404).json({ msg: 'ContactGroup not found' });
      }

      await contactGroup.destroy();
      res.json({ msg: 'ContactGroup deleted successfully' });
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
  getContactsByGroupId: async (req: Request, res: Response) => {
    const { groupId } = req.params;

    try {
      // Find contact IDs associated with the given group
      const contactGroups = await ContactGroup.findAll({ where: { groupId } });

      if (contactGroups.length === 0) {
        return res.status(404).json({ msg: 'No contacts found for this group' });
      }

      const contactIds = contactGroups.map(cg => cg.contactId);

      // Fetch the contact details using the contact IDs
      const contacts = await Contact.findAll({ where: { id: contactIds } });

      res.json(contacts);
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
  getGroupsByContactId: async (req: Request, res: Response) => {
    const { contactId } = req.params;

    try {
      // Find group IDs associated with the given contact
      const contactGroups = await ContactGroup.findAll({ where: { contactId } });

      if (contactGroups.length === 0) {
        return res.status(404).json({ msg: 'No groups found for this contact' });
      }

      const groupIds = contactGroups.map(cg => cg.groupId);

      // Fetch the group details using the group IDs
      const groups = await Group.findAll({ where: { id: groupIds } });

      res.json(groups);
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
  createMessageGroups: async (req: Request, res: Response) => {
    const { groupIds, senderId, userId, content, messageType, recursion } = req.body;
  
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

        // Fetch all contacts belonging to the provided group(s)
        const contacts = await ContactGroup.findAll({
            where: { groupId: groupIds },  // Get all contacts in the groupIds list
            include: [{ model: Contact, attributes: ['phone'] }], // Include phone numbers from the Contact model
        });

        // Extract unique phone numbers
        const recipientList = contacts
            .map((contactGroup: any) => contactGroup.Contact.phone) // Extract phone numbers from contact group
            .filter((phone: string | undefined) => phone); // Filter out undefined values

        const uniqueRecipients = Array.from(new Set(recipientList)); // Ensure no duplicates
        const totalRecipients = uniqueRecipients.length;

        if (totalRecipients === 0) {
            return res.status(400).json({ message: 'No valid recipients found in the specified group(s).' });
        }

        // Ensure the user has enough credits for all recipients
        if (user.expirybalance < totalRecipients) {
            return res.status(400).json({
                message: `Insufficient credits. You need ${totalRecipients} credits, but you only have ${user.expirybalance}.`
            });
        }

        // Deduct credits based on the number of unique recipients
        user.expirybalance -= totalRecipients;
        await user.save();

        // Create the message with recipients as an array
        const sendMessage = await SendMessage.create({
            recipients: uniqueRecipients, // Using the unique phone numbers array
            senderId,
            userId,
            content,
            messageType,
            recursion,
        });

        // Prepare data for external API call
        const data = {
            recipient: uniqueRecipients, // Send to all unique recipients
            sender: sender.name,         // Assuming sender.name is correct
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
            creditbalance: user.expirybalance, // Include updated credit balance in the response
        });

        // Notify the user if their credit balance is now zero
        if (user.expirybalance === 0) {
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

scheduleMessageGroup: async (req: Request, res: Response) => {
  const { groupIds, senderId, userId, content, messageType, dateScheduled, timeScheduled, recursion } = req.body;

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

      // Fetch all contacts in the specified groups
      const contacts = await ContactGroup.findAll({
          where: { groupId: groupIds },
          include: [{ model: Contact, attributes: ['phone'] }],  // Assuming Contact contains the phone numbers
      });

      // Extract unique phone numbers from the contacts
      const recipientsArray = contacts
          .map((contactGroup: any) => contactGroup.Contact.phone) // Extract phone numbers
          .filter((phone: string | undefined) => phone); // Filter out any undefined values
      const uniqueRecipients = Array.from(new Set(recipientsArray)); // Remove duplicates

      const totalRecipients = uniqueRecipients.length;

      if (totalRecipients === 0) {
          return res.status(400).json({ msg: 'No valid recipients found in the specified group(s).' });
      }

      // Ensure user has enough credits for all recipients
      if (user.expirybalance < totalRecipients) {
          return res.status(400).json({
              message: `Insufficient credits. You need ${totalRecipients} credits, but you only have ${user.expirybalance}.`
          });
      }

      // Deduct credits based on the number of recipients
      user.expirybalance -= totalRecipients;
      await user.save();

      // Create the schedule message record
      const scheduleMessage = await ScheduleMessage.create({
          recipients: uniqueRecipients.join(','), // Store recipients as a comma-separated string
          senderId,
          userId,
          content,
          messageType,
          dateScheduled,
          timeScheduled,
          recursion,
      });

      // Schedule the cron job
      const scheduleDateTime = moment(`${dateScheduled} ${timeScheduled}`, 'YYYY-MM-DD HH:mm');

      // Set up cron to run at the exact time the message is scheduled
      const cronJob = cron.schedule(scheduleDateTime.format('m H D M *'), async () => {
          try {
              // Prepare data for mNotify API
              const data = {
                  recipient: uniqueRecipients, // Send to all unique recipients
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
          creditbalance: user.expirybalance, // Include updated credit balance in the response
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



};
