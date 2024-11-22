import { Request, Response } from 'express';
import MailSubscription from '../models/mailsubscribed';
import { stat } from 'fs';
import MailNewsLetter from '../models/MailNewsLetter';
import nodemailer from 'nodemailer';

export const MailSubscriptionController = {
  // Create a new package
//   create: async (req: Request, res: Response) => {
//     const { email} = req.body;

  
//     if (!email) {
//         return res.status(400).json({ msg: 'email required' });
//     }
//     const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ msg: 'Invalid email format' });
//     }

//     try {
//         // Check if a package with the same name already exists
//         let user = await MailSubscription.findOne({ where: { email ,
//             status:'active'
//         } });
//       if (user) {
//         return res.status(400).json({ msg: 'email already subscribed' });
//       }
//         // Proceed with creating the package if no duplicate is found
//         const newSub = await MailSubscription.create({
//             email,
//             status: 'active',
//         });
          

//         res.status(201).json(newSub);
//     } catch (err: unknown) {
//         console.error('Error Subscribing to newsletter:', err instanceof Error ? err.message : 'Unknown error');
//         res.status(500).send('Server error');
//     }
// },
create: async (req: Request, res: Response) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }
  
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }
  
    try {
      // Step 1: Check if the user exists
      let user = await MailSubscription.findOne({ where: { email } });
  
      // Step 2: If user exists and is inactive, reactivate them
      if (user && user.status === 'inactive') {
        user.status = 'active';
        await user.save();
        return res.status(200).json({ msg: 'User reactivated successfully', user });
      }
  
      // Step 3: If user exists and is already active, send an error
      if (user && user.status === 'active') {
        return res.status(400).json({ msg: 'Email is already subscribed' });
      }
  
      // Step 4: Create a new subscription if the user doesn't exist
      const newSub = await MailSubscription.create({
        email,
        status: 'active',
      });
  
      res.status(201).json(newSub);
    } catch (err: unknown) {
      console.error('Error subscribing to newsletter:', err instanceof Error ? err.message : 'Unknown error');
      res.status(500).send('Server error');
    }
  },
  

  // Get all packages
  getAll: async (req: Request, res: Response) => {
    try {
      const mailsub = await MailSubscription.findAll();
      res.json(mailsub);
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

  // Get a package by ID
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const mailsub = await MailSubscription.findByPk(id);
      if (!mailsub) {
        return res.status(404).json({ msg: 'subscriber not found' });
      }
//should beon the card
      res.json(mailsub);
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

  // Update a package by ID
  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, status} = req.body;

    try {
      const mailsub = await MailSubscription.findByPk(id);
      if (!mailsub) {
        return res.status(404).json({ msg: 'Subscriber not found' });
      }

      // Update the package fields if they are provided in the request
      if (email) mailsub.email = email;
      if (status) mailsub.status = status;
      
      

      await mailsub.save();

      res.json(mailsub);
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

  // Delete a package by ID
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const mailsub = await MailSubscription.findByPk(id);
      if (!mailsub) {
        return res.status(404).json({ msg: 'subscriber not found' });
      }

      await mailsub.destroy();

      res.json({ msg: 'Subscriber deleted successfully' });
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
  send: async (req: Request, res: Response) => {
   
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ msg: 'Message content is required' });
    }
  
    try {
      // Step 1: Retrieve all active subscribers
      const activeSubscribers = await MailSubscription.findAll({
        where: { status: 'active' },
      });
  
      if (activeSubscribers.length === 0) {
        return res.status(400).json({ msg: 'No active subscribers found' });
      }
  
      // Step 2: Configure NodeMailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      // Step 3: Prepare email options
      const recipients = activeSubscribers.map((subscriber) => subscriber.email);
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // You can keep this field for your reference
        bcc: recipients, // BCC ensures privacy of recipients
        subject: 'Newsletter from Kalert',
        html: `<p>${message}</p>`, // The newsletter content
      };
  
      // Step 4: Send the email
      const info = await transporter.sendMail(mailOptions);
  
      // Step 5: Save newsletter details in the MailNewsLetter table
      const newsletterRecord = await MailNewsLetter.create({
        message,
        recipients: recipients.length,
      });
  
      res.status(200).json({
        msg: 'Newsletter sent successfully!',
        info,
        savedNewsletter: newsletterRecord,
      });
    } catch (error) {
      console.error('Error sending newsletter:', error);
      res.status(500).json({ msg: 'Failed to send newsletter', error });
    }
   
  },
  unsubscribe: async (req: Request, res: Response) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ msg: 'Email is required to unsubscribe' });
    }
  
    try {
      // Step 1: Find the subscriber by email
      const subscriber = await MailSubscription.findOne({ where: { email } });
  
      if (!subscriber) {
        return res.status(404).json({ msg: 'Subscriber not found' });
      }
  
      // Step 2: Update the subscriber's status to 'inactive'
      subscriber.status = 'inactive';
      await subscriber.save();
  
      res.status(200).json({ msg: `Email ${email} has been unsubscribed successfully` });
    } catch (error) {
      console.error('Error unsubscribing email:', error);
      res.status(500).json({ msg: 'Failed to unsubscribe', error });
    }
  },
  
};
