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
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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
    const { email } = req.body;

    try {
      // Check if the user already exists
      let user = await User.findOne({ where: { email } });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
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
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Registration OTP',
        text: `Your OTP for registration is ${generatedOtp}. It is valid for 10 minutes.`,
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
    const { number } = req.body;

    // Validate phone number format (example regex, adjust as necessary)
    

    try {
        // Check if the user already exists using the correct column name
        const user = await User.findOne({ where: { number: number } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        await OtpReg.create({
            number: number,
            otp: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
        });

        const data = {
            recipient: [number],
            sender: 'Daniel',
            message: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
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
