import { Request, Response } from 'express';
import Faq from '../models/Faq';
export const faqController = {
  // Create a new package
  create: async (req: Request, res: Response) => {
    const { question, answer, status} = req.body;

  
    if (!question || !answer) {
        return res.status(400).json({ msg: 'question and answer are required' });
    }
//
    try {
        // Check if a package with the same name already exists
       
        // Proceed with creating the package if no duplicate is found
        const newFaq = await Faq.create({
            question,
            answer,
            status
        });

        res.status(201).json(newFaq);
    } catch (err: unknown) {
        console.error('Error creating FAQ:', err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send('Server error');
    }
},


  // Get all packages
  getAll: async (req: Request, res: Response) => {
    try {
      const faq = await Faq.findAll();
      res.json(faq);
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
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const faq = await Faq.findByPk(id);
      if (!faq) {
        return res.status(404).json({ msg: 'FAQ not found' });
      }
//should beon the card
      res.json(faq);
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

  // Update a package by ID
  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { question, answer, status} = req.body;

    try {
      const faq = await Faq.findByPk(id);
      if (!faq) {
        return res.status(404).json({ msg: 'FAQ not found' });
      }

      // Update the package fields if they are provided in the request
      if (question) faq.question = question;
      if (answer) faq.answer = answer;
      if (status) faq.status = status;
      

      await faq.save();

      res.json(faq);
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
      const faq = await Faq.findByPk(id);
      if (!faq) {
        return res.status(404).json({ msg: 'FAQ not found' });
      }

      await faq.destroy();

      res.json({ msg: 'FAQ deleted successfully' });
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
