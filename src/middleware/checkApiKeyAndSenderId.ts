import { Request, Response, NextFunction } from 'express';
import Sender from '../models/Sender';
import ApiKeys from '../models/ApiKeys';



export const validateSenderAndApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const { senderid, apikeyvalue } = req.headers;

  if (!senderid || !apikeyvalue) {
    return res.status(400).json({ message: 'SenderId and API key are required in headers' });
  }

  try {
    const sender = await Sender.findByPk(senderid as string);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    const apikey = await ApiKeys.findOne({ where: { keyvalue: apikeyvalue } });
    if (!apikey) {
      return res.status(403).json({ message: 'Invalid API key' });
    }

    req.body.userId = apikey.userId;
    next();
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
