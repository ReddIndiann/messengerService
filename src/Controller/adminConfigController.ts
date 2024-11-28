import { Request, Response } from 'express';
import AdminConfig from '../models/AdminConfig';
export const AdminConfigController = {
  // Create a new package
  create: async (req: Request, res: Response) => {
    const { messagingEndpoint, messagingApiKey, emailUser,emailPassword,contactPerson,mailHost,mailport,userInitialAmount} = req.body;

  
 
//
    try {
        // Check if a package with the same name already exists
       
        // Proceed with creating the package if no duplicate is found
        const newConfig = await AdminConfig.create({
            messagingEndpoint, messagingApiKey, emailUser,emailPassword,contactPerson,mailHost,mailport,userInitialAmount
        });

        res.status(201).json(newConfig);
    } catch (err: unknown) {
        console.error('Error creating Admin Config:', err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send('Server error');
    }
},


  // Get all packages
  getAll: async (req: Request, res: Response) => {
    try {
      const adminConfig = await AdminConfig.findAll();
      res.json(adminConfig);
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

  // Get a package by ID
//   getById: async (req: Request, res: Response) => {
//     const { id } = req.params;

//     try {
//       const faq = await Faq.findByPk(id);
//       if (!faq) {
//         return res.status(404).json({ msg: 'FAQ not found' });
//       }
// //should beon the card
//       res.json(faq);
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//       } else {
//         console.error('An unknown error occurred');
//         res.status(500).send('Server error');
//       }
//     }
//   },

  // Update a package by ID
  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { messagingEndpoint, messagingApiKey,contactPerson, emailUser,mailHost,mailport,userIntialAmount} = req.body;


    try {
      const adminConfig = await AdminConfig.findByPk(id);
      if (!adminConfig) {
        return res.status(404).json({ msg: 'Admin Config not found' });
      }

      // Update the package fields if they are provided in the request
      if (messagingEndpoint) adminConfig.messagingEndpoint = messagingEndpoint;
      if (messagingApiKey) adminConfig.messagingApiKey = messagingApiKey;
      if (emailUser) adminConfig.emailUser = emailUser;
      if (messagingEndpoint) adminConfig.messagingEndpoint = messagingEndpoint;
      if (mailHost) adminConfig.mailHost = mailHost;
      if (mailport) adminConfig.mailport = mailport;
      if (contactPerson) adminConfig.contactPerson = contactPerson;
      if (userIntialAmount) adminConfig.userInitialAmount = userIntialAmount;
      

      await adminConfig.save();

      res.json(adminConfig);
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

  // Delete a package by ID
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const adminConfig = await AdminConfig.findByPk(id);
      if (!adminConfig) {
        return res.status(404).json({ msg: 'Admin Config not found' });
      }

      await adminConfig.destroy();

      res.json({ msg: 'Admin Config deleted successfully' });
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
