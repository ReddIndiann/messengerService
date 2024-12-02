import { Request, Response } from 'express';
import User from '../models/User';
import axios from 'axios';
import Otp from '../models/Otp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Op } from 'sequelize'; // Ensure you import Op for Sequelize operators
import nodemailer from 'nodemailer';

import { sendSMS } from '../utility/smsService';
import { sendEmail } from '../utility/emailService';


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
      const content =    `Password Reset Verification

      You have requested to reset your password for your K.ALERT account.
            
      Please use the following verification code to reset your password:${otp}.
            
            
      This code will expire in 10 minutes for security reasons.
      If you did not request this password reset, please contact our support team immediately.`
            
      try {
        const response = await sendSMS([user.number], 'Kamak', content);
        
        const otpEntry = await Otp.create({
          userId: user.id,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
        });
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
      // First, attempt to send the OTP

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

      fs.readFile(path.join(__dirname, '../mail/forgotPassword.html'), 'utf8', (err, htmlContent) => {
        if (err) {
          console.error('Error reading HTML file:', err);
          return res.status(500).send('Server error');
        }

        // Replace the placeholder with the actual username
        const personalizedHtml = htmlContent.replace('{{otp}}', otp);


        const subject ='Welcome to Kalert';
        const html =personalizedHtml;
  
        
        // Send the email
        sendEmail(email, subject, html); // Use the sendEmail function here

      });
   
      await Otp.create({
        userId: user.id,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
      });
      res.status(200).json({ msg: 'OTP sent successfully' });
      // First, attempt to send the email





      
      // Read the HTML template
     
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





