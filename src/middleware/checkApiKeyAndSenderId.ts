import { Request, Response, NextFunction } from 'express';
import Sender from '../models/Sender';
import ApiKeys from '../models/ApiKeys';

export const validateSenderAndApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const { sendername, apikeyvalue } = req.headers; // 'sendername' is used instead of 'senderid'

  if (!sendername || !apikeyvalue) {
    return res.status(400).json({ message: 'Sender name and API key are required in headers' });
  }

  try {
    // Find API key and corresponding user
    const apikey = await ApiKeys.findOne({ where: { keyvalue: apikeyvalue } });
    if (!apikey) {
      return res.status(403).json({ message: 'Invalid API key' });
    }
    if (apikey.status !== 'enabled') {
      return res.status(403).json({ message: 'API key is not enabled' });
    }
    // Find the sender by name and check if it belongs to the user (from API key)
    const sender = await Sender.findOne({
      where: { name: sendername as string, userId: apikey.userId },
    });

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found or does not belong to this user' });
    }

    if (sender.status !== 'approved') {
      return res.status(403).json({ message: 'Sender is not approved' });
    }

    req.body.userId = apikey.userId; // Pass the userId to the next handler
    req.body.sender = sender; // Pass the sender object to the next handler
    next();
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
