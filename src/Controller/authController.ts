import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Contact from '../models/Contact';
import ScheduleMessage from '../models/ScheduleMessage';

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

  signin: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ msg: 'Wrong Email or Password ' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Wrong Email or Password' });
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
