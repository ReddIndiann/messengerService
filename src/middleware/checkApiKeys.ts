import { Request, Response, NextFunction } from 'express';
import ApiKeys from '../models/ApiKeys';

export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const { apikey } = req.headers; 

  if (!apikey) {
    return res.status(400).json({ message: 'API key is required in headers' });
  }

  try {
    const apiKeyEntry = await ApiKeys.findOne({ where: { apikey } }); // Updated to use 'apikey'
    if (!apiKeyEntry) {
      return res.status(403).json({ message: 'Invalid API key' });
    }
    if (apiKeyEntry.status !== 'enabled') {
      return res.status(403).json({ message: 'API key is not enabled' });
    }
    req.body.userId = apiKeyEntry.userId; // Attach userId from API key to the request body
    next();
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
