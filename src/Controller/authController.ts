import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const authController = {
  register: async (req: Request, res: Response) => {
    const { username, email, password, number } = req.body;

    try {
      let user = await User.findOne({ where: { email } });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        username,
        email,
        password: hashedPassword,
        number,
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
          creditbalance: user.creditbalance,
        },
      });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },

  signin: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
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
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          number: user.number,
          role: user.role,
          walletbalance: user.walletbalance,
          creditbalance: user.creditbalance,
        },
      });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },

  updateUser: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, email, password, number, walletbalance, creditbalance, role } = req.body;

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
      if (creditbalance !== undefined) user.creditbalance = creditbalance;
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
          creditbalance: user.creditbalance,
        },
      });
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
};
