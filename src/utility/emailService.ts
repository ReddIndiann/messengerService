// emailService.ts

import nodemailer from 'nodemailer';

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'server242.web-hosting.com', // The server from the screenshot
  port: 587, // SMTP port from the screenshot
  secure: false, // Use false for port 587 (TLS)
  auth: {
    user: 'service@kamakgroup.com', // The email address
    pass: 'Oppongbema1', // The password
  },
});

// Function to send email
export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: 'service@kamakgroup.com',
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};
