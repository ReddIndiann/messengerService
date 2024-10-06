import { Request, Response } from 'express';
import Group from '../models/Group';
import Contact from '../models/Contact';
import ContactGroup from '../models/ContactGroup';

export const groupController = {
  create: async (req: Request, res: Response) => {
    const { groupName, userId } = req.body;

    try {
      // Check if a group with the same name already exists for this user
      const existingGroup = await Group.findOne({
        where: {
          groupName,
          userId,
        },
      });

      if (existingGroup) {
        return res.status(400).json({
          msg: 'A group with the same name already exists for this user.',
        });
      }

      // Proceed with creating the group if no duplicate is found
      const group = await Group.create({
        groupName,
        userId,
      });

      res.status(201).json(group);
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
      // Fetch all groups
      const groups = await Group.findAll();

      // For each group, fetch associated contacts
      const groupsWithContacts = await Promise.all(groups.map(async (group) => {
        const contactGroups = await ContactGroup.findAll({ where: { groupId: group.id } });
        const contactIds = contactGroups.map(cg => cg.contactId);
        const contacts = await Contact.findAll({ where: { id: contactIds } });

        return {
          ...group.toJSON(),
          contacts,
        };
      }));

      res.json(groupsWithContacts);
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
      // Fetch a group by ID
      const group = await Group.findByPk(id);
      if (!group) {
        return res.status(404).json({ msg: 'Group not found' });
      }

      // Fetch associated contacts
      const contactGroups = await ContactGroup.findAll({ where: { groupId: id } });
      const contactIds = contactGroups.map(cg => cg.contactId);
      const contacts = await Contact.findAll({ where: { id: contactIds } });

      res.json({
        ...group.toJSON(),
        contacts,
      });
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

  getByUserId: async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      // Fetch all groups for a user
      const groups = await Group.findAll({ where: { userId } });

      // For each group, fetch associated contacts
      const groupsWithContacts = await Promise.all(groups.map(async (group) => {
        const contactGroups = await ContactGroup.findAll({ where: { groupId: group.id } });
        const contactIds = contactGroups.map(cg => cg.contactId);
        const contacts = await Contact.findAll({ where: { id: contactIds } });

        return {
          ...group.toJSON(),
          contacts,
        };
      }));

      res.json(groupsWithContacts);
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
    const { groupName, userId } = req.body;

    try {
      const group = await Group.findByPk(id);
      if (!group) {
        return res.status(404).json({ msg: 'Group not found' });
      }

      if (groupName) group.groupName = groupName;
      if (userId) group.userId = userId;

      await group.save();
      res.json(group);
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
      const group = await Group.findByPk(id);
      if (!group) {
        return res.status(404).json({ msg: 'Group not found' });
      }

      await group.destroy();
      res.json({ msg: 'Group deleted successfully' });
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
};
