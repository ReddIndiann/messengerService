import { Request, Response } from 'express';
import CreditUsageOrder from '../models/creditUsageOrder';

const handleError = (res: Response, err: unknown) => {
    if (err instanceof Error) {
        console.error(err.message);
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
    console.error('An unknown error occurred');
    return res.status(500).json({ success: false, msg: 'Server error' });
};

export const creditUsageOrderController = {
    // Create a new package
    create: async (req: Request, res: Response) => {
        const { name, comment } = req.body;

        // Basic validation
        if (!name || !comment ) {
            return res.status(400).json({ success: false, msg: 'All fields are required' });
        }

        try {
            // Check for duplicates
            const existingPackage = await CreditUsageOrder.findOne({
                where: { name, comment }
            });

            if (existingPackage) {
                return res.status(400).json({ success: false, msg: 'Package already exists' });
            }

            // Create the new credit usage
            const creditusage = await CreditUsageOrder.create({ name, comment });
            res.status(201).json({ success: true, creditusage });
        } catch (err: unknown) {
            handleError(res, err);
        }
    },

    // Get all packages
    getAll: async (req: Request, res: Response) => {
        try {
            const creditusage = await CreditUsageOrder.findAll();
            res.json({ success: true, creditusage });
        } catch (err: unknown) {
            handleError(res, err);
        }
    },

    // Update a package by ID
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, comment} = req.body;

        try {
            const creditusage = await CreditUsageOrder.findByPk(id);
            if (!creditusage) {
                return res.status(404).json({ success: false, msg: 'Credit usage not found' });
            }

            // Update the package fields if they are provided in the request
            if (name) creditusage.name = name;
            if (comment) creditusage.comment = comment;
           

            await creditusage.save();

            res.json({ success: true, creditusage });
        } catch (err: unknown) {
            handleError(res, err);
        }
    },

    // Delete a package by ID
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const packageDetails = await CreditUsageOrder.findByPk(id);
            if (!packageDetails) {
                return res.status(404).json({ success: false, msg: 'Package not found' });
            }

            await packageDetails.destroy();

            res.json({ success: true, msg: 'Package deleted successfully' });
        } catch (err: unknown) {
            handleError(res, err);
        }
    },
};
