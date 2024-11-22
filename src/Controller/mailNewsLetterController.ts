import { Request, Response } from 'express';
import MailSubscription from '../models/mailsubscribed';
import MailNewsLetter from '../models/MailNewsLetter';
import nodemailer from 'nodemailer';

export const sendNewsletter = async (req: Request, res: Response) => {
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
};
