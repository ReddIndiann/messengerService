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
    
      // Check if a group with the same name already exists for this user
      const existingGroup = await Group.findOne({
        where: {
          groupName,
          userId,
        },
      });
  
      if (existingGroup) {
        return res.status(400).json({
          msg: 'A group with the same name already exists for this user.',
        });
      }
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

  // createcontactgroup: async (req: Request, res: Response) => {
  //   const { apikeyvalue } = req.headers; // Get the API key from the request headers
  //   const { contactId, groupId } = req.body;

  //   try {
  //     // Validate API key and retrieve associated user ID
  //     const apiKey = await ApiKeys.findOne({ where: { keyvalue: apikeyvalue } });
  //     if (!apiKey) {
  //       return res.status(403).json({ msg: 'Invalid API key' });
  //     }
  //     const userId = apiKey.userId;

  //     // Check if the contact belongs to the user
  //     const contact = await Contact.findOne({ where: { id: contactId, userId } });
  //     if (!contact) {
  //       return res.status(404).json({ msg: 'Contact not found for this user' });
  //     }

  //     // Check if the group belongs to the user
  //     const group = await Group.findOne({ where: { id: groupId, userId } });
  //     if (!group) {
  //       return res.status(404).json({ msg: 'Group not found for this user' });
  //     }

  //     // Create the contact-group association
  //     const contactGroup = await ContactGroup.create({
  //       contactId,
  //       groupId,
  //     });

  //     res.status(201).json(contactGroup);
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
  
  createcontactgroup: async (req: Request, res: Response) => {
    const { apikeyvalue } = req.headers; // Get the API key from the request headers
    const { contactNumber, groupName } = req.body; // Extract contact number and group name from request body
  
    try {
      // Validate API key and retrieve associated user ID
      const apiKey = await ApiKeys.findOne({ where: { keyvalue: apikeyvalue } });
      if (!apiKey) {
        return res.status(403).json({ msg: 'Invalid API key' });
      }
      const userId = apiKey.userId;
  
      // Find contact by phone number for the user
      const contact = await Contact.findOne({ where: { phone: contactNumber, userId } });
      if (!contact) {
        return res.status(404).json({ msg: 'Contact not found for this user' });
      }
  
      // Find group by name for the user
      const group = await Group.findOne({ where: { groupName: groupName, userId } });
      if (!group) {
        return res.status(404).json({ msg: 'Group not found for this user' });
      }
  
      // Create the contact-group association
      const contactGroup = await ContactGroup.create({
        contactId: contact.id, // Use the found contact's ID
        groupId: group.id,     // Use the found group's ID
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
  
  createmulticontactgroup: async (req: Request, res: Response) => {
    const { apikeyvalue } = req.headers; // Get the API key from the request headers
    const { contactNumbers, groupName } = req.body; // Extract an array of contact numbers and group name from the request body
  
    try {
      // Validate API key and retrieve associated user ID
      const apiKey = await ApiKeys.findOne({ where: { keyvalue: apikeyvalue } });
      if (!apiKey) {
        return res.status(403).json({ msg: 'Invalid API key' });
      }
      const userId = apiKey.userId;
  
      // Find group by name for the user
      const group = await Group.findOne({ where: { groupName, userId } });
      if (!group) {
        return res.status(404).json({ msg: 'Group not found for this user' });
      }
  
      // Iterate over each contact number and associate them with the group
      const addedContacts = [];
      for (const contactNumber of contactNumbers) {
        // Find contact by phone number for the user
        const contact = await Contact.findOne({ where: { phone: contactNumber, userId } });
        if (!contact) {
          // Optionally, you could continue to the next contact if one isn't found
          continue;
        }
  
        // Create the contact-group association for each contact
        const contactGroup = await ContactGroup.create({
          contactId: contact.id,
          groupId: group.id,
        });
  
        addedContacts.push(contactGroup); // Store added contact-group associations
      }
  
      // If no contacts were added, return a message indicating so
      if (addedContacts.length === 0) {
        return res.status(404).json({ msg: 'No contacts were added to the group. Ensure contacts exist.' });
      }
  
      // Return the created contact-group associations
      res.status(201).json({ msg: 'Contacts added to the group', addedContacts });
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
    const { groupIds, content, messageType, recursion } = req.body;  // Remove senderId and userId from request body
    const { sender, userId } = req.body;  // Use sender and userId from middleware

    try {
        // Find the user by userId
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if sender is approved
        if (sender.status !== 'approved') {
            return res.status(400).json({ message: 'Sender is not approved' });
        }

        // Fetch all contacts in the provided group(s)
        const contacts = await ContactGroup.findAll({
            where: { groupId: groupIds },  // Fetch contacts in groupIds
            include: [{ model: Contact, attributes: ['phone'] }], // Include only phone numbers from Contact model
        });

        // Extract unique phone numbers
        const recipientList = contacts
            .map((contactGroup: any) => contactGroup.Contact.phone)  // Extract phone numbers
            .filter((phone: string | undefined) => phone);  // Filter out undefined values

        const uniqueRecipients = Array.from(new Set(recipientList));  // Remove duplicates
        const totalRecipients = uniqueRecipients.length;

        if (totalRecipients === 0) {
            return res.status(400).json({ message: 'No valid recipients found in the specified group(s).' });
        }

        // Ensure the user has enough credits for all recipients
        if (user.creditbalance < totalRecipients) {
            return res.status(400).json({
                message: `Insufficient credits. You need ${totalRecipients} credits, but you only have ${user.creditbalance}.`
            });
        }

        // Deduct credits for each unique recipient
        user.creditbalance -= totalRecipients;
        await user.save();

        // Create the message with recipients as an array
        const sendMessage = await SendMessage.create({
            recipients: uniqueRecipients,  // Send to unique recipients
            senderId: sender.id,           // Use sender's ID from middleware
            userId,                        // Use userId from middleware
            content,
            messageType,
            recursion,
        });

        // Prepare data for external API call
        const data = {
            recipient: uniqueRecipients,  // Recipients' phone numbers
            sender: sender.name,          // Use sender's name from middleware
            message: content,
            is_schedule: 'false',         // Send immediately
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

        // Return success response
        res.status(201).json({
            message: 'Message created and sent successfully',
            sendMessage,
            apiResponse: response.data,
            creditbalance: user.creditbalance,  // Updated credit balance
        });

        // Optionally notify user if credits are depleted
        if (user.creditbalance === 0) {
            console.warn(`User ${user.username} has run out of credits.`);
            // Optionally send a notification
        }

    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            handleApiError(err, res);  // Handle external API error
        } else {
            console.error('Server Error:', err);
            res.status(500).send('Server error');
        }
    }
},

scheduleMessageGroup: async (req: Request, res: Response) => {
  const { groupIds, content, messageType, dateScheduled, timeScheduled, recursion } = req.body;  // Remove senderId and userId
  const { sender, userId } = req.body;  // Get sender and userId from middleware

  try {
      // Fetch the user by userId
      const user = await User.findByPk(userId);
      if (!user) {
          return res.status(404).json({ msg: 'User not found' });
      }

      // Check if the sender is approved
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
          .map((contactGroup: any) => contactGroup.Contact.phone)  // Extract phone numbers
          .filter((phone: string | undefined) => phone);  // Filter out any undefined values
      const uniqueRecipients = Array.from(new Set(recipientsArray));  // Remove duplicates

      const totalRecipients = uniqueRecipients.length;

      if (totalRecipients === 0) {
          return res.status(400).json({ msg: 'No valid recipients found in the specified group(s).' });
      }

      // Ensure user has enough credits for all recipients
      if (user.creditbalance < totalRecipients) {
          return res.status(400).json({
              message: `Insufficient credits. You need ${totalRecipients} credits, but you only have ${user.creditbalance}.`
          });
      }

      // Deduct credits based on the number of recipients
      user.creditbalance -= totalRecipients;
      await user.save();

      // Create the schedule message record
      const scheduleMessage = await ScheduleMessage.create({
          recipients: uniqueRecipients.join(','),  // Store recipients as a comma-separated string
          senderId: sender.id,  // Get senderId from the sender object
          userId,  // Get userId from middleware
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
                  recipient: uniqueRecipients,  // Send to all unique recipients
                  sender: sender.name,  // Use sender's name from middleware
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
          creditbalance: user.creditbalance,  // Include updated credit balance in the response
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
