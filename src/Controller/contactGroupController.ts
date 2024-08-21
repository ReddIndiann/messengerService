import { Request, Response } from 'express';
import Contact from '../models/Contact';
import ContactGroup from '../models/ContactGroup';
import Group from '../models/Group';
export const contactGroupController = {
  create: async (req: Request, res: Response) => {
    const { contactId, groupId } = req.body;

    try {
      const contactGroup = await ContactGroup.create({
        contactId,
        groupId,
      });

      res.status(201).json(contactGroup);
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

  getAll: async (req: Request, res: Response) => {
    try {
      const contactGroups = await ContactGroup.findAll();
      res.json(contactGroups);
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

  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const contactGroup = await ContactGroup.findByPk(id);
      if (!contactGroup) {
        return res.status(404).json({ msg: 'ContactGroup not found' });
      }

      res.json(contactGroup);
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

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { contactId, groupId } = req.body;

    try {
      const contactGroup = await ContactGroup.findByPk(id);
      if (!contactGroup) {
        return res.status(404).json({ msg: 'ContactGroup not found' });
      }

      if (contactId) contactGroup.contactId = contactId;
      if (groupId) contactGroup.groupId = groupId;

      await contactGroup.save();
      res.json(contactGroup);
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

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const contactGroup = await ContactGroup.findByPk(id);
      if (!contactGroup) {
        return res.status(404).json({ msg: 'ContactGroup not found' });
      }

      await contactGroup.destroy();
      res.json({ msg: 'ContactGroup deleted successfully' });
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
  getContactsByGroupId: async (req: Request, res: Response) => {
    const { groupId } = req.params;

    try {
      // Find contact IDs associated with the given group
      const contactGroups = await ContactGroup.findAll({ where: { groupId } });

      if (contactGroups.length === 0) {
        return res.status(404).json({ msg: 'No contacts found for this group' });
      }

      const contactIds = contactGroups.map(cg => cg.contactId);

      // Fetch the contact details using the contact IDs
      const contacts = await Contact.findAll({ where: { id: contactIds } });

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
  getGroupsByContactId: async (req: Request, res: Response) => {
    const { contactId } = req.params;

    try {
      // Find group IDs associated with the given contact
      const contactGroups = await ContactGroup.findAll({ where: { contactId } });

      if (contactGroups.length === 0) {
        return res.status(404).json({ msg: 'No groups found for this contact' });
      }

      const groupIds = contactGroups.map(cg => cg.groupId);

      // Fetch the group details using the group IDs
      const groups = await Group.findAll({ where: { id: groupIds } });

      res.json(groups);
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
