import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Contact from '../models/Contact';
import ScheduleMessage from '../models/ScheduleMessage';
import nodemailer from 'nodemailer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import AdminConfig from '../models/AdminConfig';


const transporter = nodemailer.createTransport({
  host: 'server242.web-hosting.com', // The server from the screenshot
  port: 587, // SMTP port from the screenshot
  secure: false, // Use false for port 587 (TLS)
  auth: {
    user: 'service@kamakgroup.com', // The email address
    pass: 'Oppongbema1', // The password
  },
});
import Otp from '../models/Otp';
export const authController = {
  register: async (req: Request, res: Response) => {
    const { username, email, password, number } = req.body;

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    try {
      let user = await User.findOne({ where: { email } });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }
      let usernum = await User.findOne({ where: { number } });
      if (usernum) {
        return res.status(400).json({ msg: 'Number already belongs to a user' });
      }

      const adminConfig = await AdminConfig.findOne();
      const initialBonus = adminConfig ? adminConfig.userInitialAmount : 0;
  

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        username,
        email,
        password: hashedPassword,
        number,
        bonusbalance: initialBonus,
      });

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
        expiresIn: '1h',
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          number: user.number,
          role: user.role,
          walletbalance: user.walletbalance,
          expirybalance: user.expirybalance,
          nonexpirybalance: user.nonexpirybalance,
          bonusbalance: user.bonusbalance,
        },
      });

      // Read the HTML template
      fs.readFile(path.join(__dirname, '../mail/welcomeEmail.html'), 'utf8', (err, htmlContent) => {
        if (err) {
          console.error('Error reading HTML file:', err);
          return res.status(500).send('Server error');
        }

        // Replace the placeholder with the actual username
        const personalizedHtml = htmlContent.replace('{{username}}', user.username);

        const mailOptions = {
          from:  'service@kamakgroup.com',
          to: user.email,
          subject: 'Welcome to Kalert',
          html: personalizedHtml, // Use HTML content
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error); 
            return res.status(500).send('Error sending email');
          }
          res.status(200).json({ message: 'Welcome email sent successfully!' });
        });
      });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },

  signin: async (req: Request, res: Response) => {
    const { number, password } = req.body;

    try {
      const user = await User.findOne({ where: { number } });
      if (!user) {
        return res.status(400).json({ msg: 'Wrong number or Password ' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Wrong number or Password' });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
        expiresIn: '1h',
      });

      res.json({
       
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          number: user.number,
          role: user.role,
          walletbalance: user.walletbalance,
          expirybalance: user.expirybalance,
          nonexpirybalance: user.nonexpirybalance,
          bonusbalance: user.bonusbalance,
        },
      });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },


  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      const getusers = await User.findByPk(id);
      if (!getusers) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Calculate total main balance
      const totalMainBalance = getusers.expirybalance + getusers.nonexpirybalance;
  
      // Prepare response
      const userResponse = {
        id: getusers.id,
        username: getusers.username,
        email: getusers.email,
        number: getusers.number,
        role: getusers.role,
        walletbalance: getusers.walletbalance,
        expirybalance: getusers.expirybalance,
        nonexpirybalance: getusers.nonexpirybalance,
        bonusbalance: getusers.bonusbalance,
        totalMainBalance, // Include the total main balance
        createdAt: getusers.createdAt,
        updatedAt: getusers.updatedAt,
      };
  
      res.json(userResponse);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        res.status(500).send('Server error');
      } else {
        console.error('An unknown error occurred');
        res.status(500).send('Server error');
      }
    }
  }
  
,
  updateUser: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, email, password, number, walletbalance, expirybalance, nonexpirybalance,bonusbalance,role } = req.body;

    try {
      let user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      if (username) user.username = username;
      if (email) user.email = email;
      if (number) user.number = number;
      if (role) user.role = role;
      if (walletbalance !== undefined) user.walletbalance = walletbalance;
      if (expirybalance !== undefined) user.expirybalance = expirybalance;
      if (nonexpirybalance !== undefined) user.nonexpirybalance = nonexpirybalance;
      if (bonusbalance !== undefined) user.bonusbalance = bonusbalance;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }

      await user.save();

      res.json({
        msg: 'User updated successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          number: user.number,
          role: user.role,
          walletbalance: user.walletbalance,
          expirybalance: user.expirybalance,
          nonexpirybalance: user.nonexpirybalance,
          bonusbalance: user.bonusbalance,
        },
      });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },

// getAllByForce: async(){
// try{
// const allusers =await User.findAll()

// const groups = await  Contact.findAll({
//   attributes:['userId']
// })

// }

// },
getAll: async(req:Request,res:Response)=>{
try{
  const users = await User.findAll();
  res.json(users);
} catch(err:unknown){
if(err instanceof Error){
  console.error(err.message);
  res.status(500).send('Server Error');
}else{
  console.error('An unknown error occured');
  res.status(500).send('Serer error')
}

}

},

changePassword: async (req: Request, res: Response) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if the old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    const notSame = await bcrypt.compare(oldPassword, newPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect old password' });
    }
    
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();

    res.json({ msg: 'Password changed successfully' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
},
  deleteUser: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      await user.destroy();

      res.json({ msg: 'User deleted successfully' });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    const { phoneNumber, newPassword } = req.body;
  
    // Validate input
    if (!phoneNumber || !newPassword) {
      return res.status(400).json({ msg: 'Phone number and new password are required' });
    }
  
    try {
      // Find the user by phone number
      const user = await User.findOne({ where: { number: phoneNumber } });
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
  
      await user.save();
  
      // Optionally, delete the OTP entry after successful password reset
      await Otp.destroy({ where: { userId: user.id } });
  
      res.status(200).json({ msg: 'Password reset successfully' });
    } catch (err) {
      console.error('Error resetting password:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  }
  
};
