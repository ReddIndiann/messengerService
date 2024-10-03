import { Request, Response, NextFunction } from 'express';
import Sender from '../models/Sender';
import ApiKeys from '../models/ApiKeys';

export const validateSenderAndApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const { senderid, apikeyvalue } = req.headers;

  // Check if headers are present
  if (!senderid || !apikeyvalue) {
    return res.status(400).json({ message: 'SenderId and API key are required in headers' });
  }

  try {
    // Check if sender exists
    const sender = await Sender.findByPk(senderid as string);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Check if API key is valid and get the associated userId
    const apikey = await ApiKeys.findOne({ where: { keyvalue: apikeyvalue } });
    if (!apikey) {
      return res.status(403).json({ message: 'Invalid API key' });
    }

    // Attach userId from the API key to the request object
    req.body.userId = apikey.userId;

    // Proceed to the next middleware/controller
    next();
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
