import { Request, Response } from 'express';
import CreditUsage from '../models/CreditUsage';

const handleError = (res: Response, err: unknown) => {
    if (err instanceof Error) {
        console.error(err.message);
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
    console.error('An unknown error occurred');
    return res.status(500).json({ success: false, msg: 'Server error' });
};

export const creditUsageController = {
    // Create a new package
    create: async (req: Request, res: Response) => {
        const { usefirst, usesecond, usethird ,useforth,
            usefifth,usesixth,useseveth,useeight,useninth,usetenth


        } = req.body;

        // Basic validation
       

        try {
            // Check for duplicates
            const existingPackage = await CreditUsage.findOne({
                where: { usefirst, usesecond, usethird ,useforth,
                    usefifth,usesixth,useseveth,useeight,useninth,usetenth}
            });

            if (existingPackage) {
                return res.status(400).json({ success: false, msg: 'Package already exists' });
            }

            // Create the new credit usage
            const creditusage = await CreditUsage.create({ usefirst, usesecond, usethird ,useforth,
                usefifth,usesixth,useseveth,useeight,useninth,usetenth });
            res.status(201).json({ success: true, creditusage });
        } catch (err: unknown) {
            handleError(res, err);
        }
    },

    // Get all packages
    getAll: async (req: Request, res: Response) => {
        try {
            const creditusage = await CreditUsage.findAll();
            res.json({ success: true, creditusage });
        } catch (err: unknown) {
            handleError(res, err);
        }
    },

    // Update a package by ID
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { usefirst, usesecond, usethird ,useforth,
            usefifth,usesixth,useseveth,useeight,useninth,usetenth } = req.body;

        try {
            const creditusage = await CreditUsage.findByPk(id);
            if (!creditusage) {
                return res.status(404).json({ success: false, msg: 'Credit usage not found' });
            }

            // Update the package fields if they are provided in the request
            if (usefirst) creditusage.usefirst = usefirst;
            if (usesecond) creditusage.usesecond = usesecond;
            if (usethird) creditusage.usethird = usethird;
            if (useforth) creditusage.useforth = useforth;
            if (usefifth) creditusage.usefifth = usefifth;
            if (usesixth) creditusage.usesixth = usesixth;
            if (useseveth) creditusage.useseveth = useseveth;

          
            if (useeight) creditusage.usesecond = usesecond;
            if (useninth) creditusage.useninth = useninth;
            if (usetenth) creditusage.usetenth = usetenth;



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
            const packageDetails = await CreditUsage.findByPk(id);
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
