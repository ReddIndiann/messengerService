import { Request, Response } from 'express';
import User from '../models/User';
import OtpReg from '../models/OtpReg';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { sendSMS } from '../utility/smsService';
import { sendEmail } from '../utility/emailService';
// import rateLimit from 'express-rate-limit';
// Setup Nodemailer transporter (example for Gmail)



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
     
      
      res.status(200).json({ msg: 'OTP sent successfully. Please verify it.' });
      fs.readFile(path.join(__dirname, '../mail/sendRegistrationOtp.html'), 'utf8', (err, htmlContent) => {
        if (err) {
          console.error('Error reading HTML file:', err);
          return res.status(500).send('Server error');
        }

        // Replace the placeholder with the actual username
        const personalizedHtml = htmlContent.replace('{{generatedOtp}}', generatedOtp);


        const subject = 'Your Registration code';;
        const html =personalizedHtml;
  
        
        // Send the email
        sendEmail(email, subject, html); // Use the sendEmail function here

      });
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
const content = `Your OTP for password reset is ${otp}.`


try {
  const response = await sendSMS([number], 'Kamak', content);
  
  if (response.status === 200) {
    return res.status(200).json({ message: 'OTP sent successfully' });
  } else {
    return res.status(response.status).json({ 
      message: response.message || 'Failed to send OTP' 
    });
  }
} catch (error) {
  console.error('Error sending OTP:', error);
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
