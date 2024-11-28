

import { Request, Response, NextFunction } from 'express';

// The hardcoded API key (replace with your actual API key)
const VALID_API_KEY = process.env.DEV_API_KEY;

export const routeProtectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { apikey } = req.headers; 

  // Check if API key exists in the request headers
  if (!apikey) {
    return res.status(400).json({ message: 'API key is required in headers' });
  }

  // Compare the provided API key with the hardcoded value
  if (apikey !== VALID_API_KEY) {
    return res.status(403).json({ message: 'Invalid API key' });
  }

  // Proceed with the next middleware or route handler
  next();
};
