import { Request, Response } from 'express';
import User from '../models/User';
import axios from 'axios';
import Otp from '../models/Otp';
import crypto from 'crypto';
import { Op } from 'sequelize'; // Ensure you import Op for Sequelize operators
import nodemailer from 'nodemailer';

const endPoint = 'https://api.mnotify.com/api/sms/quick';
const apiKey = process.env.MNOTIFY_APIKEY;

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });odaniel.ac@st.vvu.edu.gh 
const transporter = nodemailer.createTransport({
  host: 'server242.web-hosting.com', // The server from the screenshot
  port: 587, // SMTP port from the screenshot
  secure: false, // Use false for port 587 (TLS)
  auth: {
    user: 'service@kamakgroup.com', // The email address
    pass: 'Oppongbema1', // The password
  },
});

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
export const OtpController = {
   
  requestOtp: async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;

    try {
      const user = await User.findOne({ where: { number: phoneNumber } });
      if (!user) {
        return res.status(404).json({ msg: 'This number doesnt belong to an account' });
      }

      // Generate a 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();

      const data = {
        recipient: [user.number],
        sender: 'Daniel',
        message: `Your OTP for password reset is ${otp}. `,
        is_schedule: 'false',
        schedule_date: '',
      };

      // First, attempt to send the OTP
      try {
        const response = await axios.post(`${endPoint}?key=${apiKey}`, data, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        // If SMS was successfully sent, then save the OTP
        const otpEntry = await Otp.create({
          userId: user.id,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
        });

        res.status(200).json({ message: 'OTP sent successfully' });
      } catch (apiError) {
        handleApiError(apiError, res);
      }
    } catch (err) {
      console.error('Error requesting OTP:', err);
      res.status(500).send('Server error');
    }
  },

  requestOtpEmail: async (req: Request, res: Response) => {
    const { email } = req.body; // Change to email instead of phone number

    try {
      const user = await User.findOne({ where: { email } }); // Use email to find user
      if (!user) {
        return res.status(404).json({ msg: 'This email doesn\'t belong to an account' });
      }

      // Generate a 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();

      // const mailOptions = {
      //   from: process.env.EMAIL_USER,
      //   to: user.email,
      //   subject: 'Your OTP Code',
      //   text: `Your OTP for password reset is ${otp}..`,
      // };
      const mailOptions = {
        from: 'service@kamakgroup.com',
        to: user.email,
        subject: 'Your OTP Code',
        text: `Your OTP for password reset is ${otp}..`,
      };
      // First, attempt to send the email
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).send('Error sending email');
        }

        // If email was successfully sent, then save the OTP
        await Otp.create({
          userId: user.id,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
        });

        res.status(200).json({ message: 'OTP sent successfully' });
      });
    } catch (err) {
      console.error('Error requesting OTP:', err);
      res.status(500).send('Server error');
    }
  },
      
      verifyOtp : async (req: Request, res: Response) => {
        const { phoneNumber, otp } = req.body; // Use phoneNumber instead of email
      
        // Validate input
        if (!phoneNumber || !otp) {
          return res.status(400).json({ msg: 'Phone number and OTP are required' });
        }
      
        try {
          const user = await User.findOne({ where: { number: phoneNumber } }); // Find user by phone number
          if (!user) {
            return res.status(404).json({ msg: 'User not found' });
          }
      
          const otpEntry = await Otp.findOne({
            where: {
              userId: user.id,
              otp,
              expiresAt: { [Op.gte]: new Date() }, // Check if the OTP is valid and not expired
            },
          });
      
          if (!otpEntry) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
          }
      
          // OTP is valid; proceed to allow the user to reset their password
          // Optionally, mark the OTP as used or delete it
          await otpEntry.destroy(); // Optional: delete the OTP entry after use
      
          res.status(200).json({ msg: 'OTP verified successfully', userId: user.id });
        } catch (err) {
          console.error('Error verifying OTP:', err);
          res.status(500).send('Server error');
        }
      } ,
      verifyOtpEmail: async (req: Request, res: Response) => {
        const { email, otp } = req.body; // Use email instead of phone number
        
        // Validate input
        if (!email || !otp) {
          return res.status(400).json({ msg: 'Email and OTP are required' });
        }
        
        try {
          const user = await User.findOne({ where: { email } }); // Find user by email
          if (!user) {
            return res.status(404).json({ msg: 'User not found' });
          }
    
          const otpEntry = await Otp.findOne({
            where: {
              userId: user.id,
              otp,
              expiresAt: { [Op.gte]: new Date() }, // Check if the OTP is valid and not expired
            },
          });
    
          if (!otpEntry) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
          }
    
          // OTP is valid; proceed to allow the user to reset their password
          await otpEntry.destroy(); // Optional: delete the OTP entry after use
    
          res.status(200).json({ msg: 'OTP verified successfully', userId: user.id });
        } catch (err) {
          console.error('Error verifying OTP:', err);
          res.status(500).send('Server error');
        }
      },
      
  };





