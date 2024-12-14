import nodemailer, { TransportOptions } from 'nodemailer';

// Setup Nodemailer transporter with explicit typing
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST as string, // Explicitly cast to string
  port: parseInt(process.env.MAIL_PORT as string), // Ensure port is a number
  secure: process.env.SECURE_STATUS === 'true', // Make sure this is a boolean
  auth: {
    user: process.env.MAIL_USER as string, // Explicitly cast to string
    pass: process.env.MAIL_PASS as string, // Explicitly cast to string
  },
} as TransportOptions); // Explicitly specify the type

// Function to send email
export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
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
