import { Request, Response } from 'express';
import User from '../models/User';
import OtpReg from '../models/OtpReg';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
// import rateLimit from 'express-rate-limit';
// Setup Nodemailer transporter (example for Gmail)

const endPoint = 'https://api.mnotify.com/api/sms/quick';
const apiKey = process.env.MNOTIFY_APIKEY;
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
const transporter = nodemailer.createTransport({
  host: 'server242.web-hosting.com', // The server from the screenshot
  port: 587, // SMTP port from the screenshot
  secure: false, // Use false for port 587 (TLS)
  auth: {
    user: 'service@kamakgroup.com', // The email address
    pass: 'Oppongbema1', // The password
  },
});
// const otpLimiter = rateLimit({
//     windowMs: 10 * 60 * 1000, // 10 minutes
//     max: 5, // Limit each IP to 5 requests per windowMs
//     message: 'Too many OTP requests from this IP, please try again later.',
//   });
export const UserController = {
  // 1. Send OTP for registration
  sendOtp: async (req: Request, res: Response) => {
    const { email, number } = req.body;

  try {
    // Check if the user already exists by email or number
    let userByEmail = await User.findOne({ where: { email } });
    let userByNumber = await User.findOne({ where: { number } });

    if (userByEmail) {
      return res.status(400).json({ msg: 'Email is already registered' });
    }
    if (userByNumber) {
      return res.status(400).json({ msg: 'Number is already registered' });
    }
      // Generate a 6-digit OTP
      const generatedOtp = crypto.randomInt(100000, 999999).toString();

      // Create OTP entry
      await OtpReg.create({
       email:email,
        otp: generatedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
      });

      // Send OTP to the user's email
      const mailOptions = {
        from:  'service@kamakgroup.com',
        to: email,
        subject: 'Your Registration OTP',
        text: `Your OTP for registration is ${generatedOtp}. `,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ msg: 'OTP sent successfully. Please verify it.' });

    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },

  // 2. Verify OTP
// 2. Verify OTP
verifyOtp: async (req: Request, res: Response) => {
    const { email, otp } = req.body;
  
    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ msg: 'Email and OTP are required' });
    }
  
    try {
      // Find OTP entry
      const otpEntry = await OtpReg.findOne({
        where: {
          email, // Ensure the OTP is tied to the right email
          otp,
          expiresAt: { [Op.gte]: new Date() }, // Check if the OTP is valid
        },
      });
  
      if (!otpEntry) {
        return res.status(400).json({ msg: 'Invalid or expired OTP' });
      }
  
      // Optionally, delete the OTP entry after successful verification
      await otpEntry.destroy(); // or mark as used
  
      res.status(200).json({ msg: 'OTP verified successfully. You can now register.' });
  
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
,  
requestOtp: async (req: Request, res: Response) => {
  const { email, number } = req.body;

  try {
    // Check if the user already exists by email or number
    let userByEmail = await User.findOne({ where: { email } });
    let userByNumber = await User.findOne({ where: { number } });

    if (userByEmail) {
      return res.status(400).json({ msg: 'Email is already registered' });
    }
    if (userByNumber) {
      return res.status(400).json({ msg: 'Number is already registered' }); 
    }
        // Generate a 5-digit OTP
        const otp = crypto.randomInt(10000, 99999).toString();
        await OtpReg.create({
            number: number,
            otp: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
        });

        const data = {
            recipient: [number],
            sender: 'Daniel',
            message: `Your OTP for password reset is ${otp}.`,
            is_schedule: 'false',
            schedule_date: '',
        };

        try {
            const response = await axios.post(`${endPoint}?key=${apiKey}`, data, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                return res.status(200).json({ message: 'OTP sent successfully' });
            } else {
                return res.status(500).json({ message: 'Failed to send OTP, please try again later' });
            }
        } catch (apiError) {
            console.error('Error sending OTP:', apiError);
            return res.status(500).json({ message: 'Error sending OTP, please try again later' });
        }

    } catch (err) {
        console.error('Error requesting OTP:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}
 
  ,
  verifyOtpnumber: async (req: Request, res: Response) => {
    const { number, otp } = req.body;
  
    // Validate input
    if (!number || !otp) {
      return res.status(400).json({ msg: 'Email and OTP are required' });
    }
  
    try {
      // Find OTP entry
      const otpEntry = await OtpReg.findOne({
        where: {
          number, // Ensure the OTP is tied to the right email
          otp,
          expiresAt: { [Op.gte]: new Date() }, // Check if the OTP is valid
        },
      });
  
      if (!otpEntry) {
        return res.status(400).json({ msg: 'Invalid or expired OTP' });
      }
  
      // Optionally, delete the OTP entry after successful verification
      await otpEntry.destroy(); // or mark as used
  
      res.status(200).json({ msg: 'OTP verified successfully. You can now register.' });
  
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
};
