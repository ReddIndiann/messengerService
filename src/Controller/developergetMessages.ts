import { Request, Response } from 'express';
import SendMessage from '../models/SendMessage';
import Sender from '../models/Sender';
import User from '../models/User';
import Contact from '../models/Contact';
import Group from '../models/Group';
import axios from 'axios';
import cron, { schedule } from 'node-cron';
import moment from 'moment';
import ApiKeys from '../models/ApiKeys';
import ScheduleMessage from '../models/ScheduleMessage';
const endPoint = 'https://api.mnotify.com/api/sms/quick';
const apiKey = process.env.MNOTIFY_APIKEY; // Replace with your actual API key

export const developergetController = {

    getSentMessageByUserId: async (req: Request, res: Response) => {
        const { apikey } = req.headers; // Get the API key from the request headers
    
        try {
          // 1. Find the API key to get the associated user ID
          const apiKey = await ApiKeys.findOne({ where: { apikey: apikey } });
          if (!apiKey) {
            return res.status(403).json({ msg: 'Invalid API key' });
          }
    
          const userId = apiKey.userId;
    
          // 2. Retrieve send messages for the user with messageType 'SMS'
          const sendMessages = await SendMessage.findAll({
            where: { userId, messageType: 'API' },
          });
    
          if (!sendMessages.length) {
            return res.status(404).json({ msg: 'No send messages found for this user' });
          }
    
          res.json(sendMessages);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err.message);
            res.status(500).send('Server error');
          } else {
            console.error('An unknown error occurred');
            res.status(500).send('Server error');
          }
        }
      },
      getScheduleMessageByUserId: async (req: Request, res: Response) => {
        const { apikey } = req.headers; // Get the API key from the request headers
    
        try {
          // 1. Find the API key to get the associated user ID
          const apiKey = await ApiKeys.findOne({ where: { apikey: apikey } });
          if (!apiKey) {
            return res.status(403).json({ msg: 'Invalid API key' });
          }
    
          const userId = apiKey.userId;
    
          // 2. Retrieve send messages for the user with messageType 'SMS'
          const scheduleMessages = await ScheduleMessage.findAll({
            where: { userId, messageType: 'API' },
          });
    
          if (!scheduleMessages.length) {
            return res.status(404).json({ msg: 'No send messages found for this user' });
          }
    
          res.json(scheduleMessages);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err.message);
            res.status(500).send('Server error');
          } else {
            console.error('An unknown error occurred');
            res.status(500).send('Server error');
          }
        }
      },
      getContactsByUserId: async (req: Request, res: Response) => {
        const { apikey } = req.headers; // Get the API key from the request headers
    
        try {
          // 1. Find the API key to get the associated user ID
          const apiKey = await ApiKeys.findOne({ where: { apikey: apikey } });
          if (!apiKey) {
            return res.status(403).json({ msg: 'Invalid API key' });
          }
    
          const userId = apiKey.userId;
    
          // 2. Retrieve send messages for the user with messageType 'SMS'
          const contacts = await  Contact.findAll({
            // where: { userId, messageType: 'API' },
            where: { userId, },
          });
    
          if (!contacts.length) {
            return res.status(404).json({ msg: 'No send contacts found for this user' });
          }
    
          res.json(contacts);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err.message);
            res.status(500).send('Server error');
          } else {
            console.error('An unknown error occurred');
            res.status(500).send('Server error');
          }
        }
      },
};
