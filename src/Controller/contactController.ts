import { Request, Response } from 'express';
import Contact from '../models/Contact';
import ContactGroup from '../models/ContactGroup';
import Group from '../models/Group';


export const contactController = {
  create: async (req: Request, res: Response) => {
    const { firstname, lastname, birthday, phone, email, userId } = req.body;

    try {
      const contact = await Contact.create({
        firstname,
        lastname,
        birthday,
        phone,
        email,
        userId,
      });

      res.status(201).json(contact);
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
      const contacts = await Contact.findAll();

      // Fetch all contact-group associations
      const contactGroups = await ContactGroup.findAll({
        attributes: ['contactId', 'groupId'],
      });

      // Extract contactIds and groupIds
      const contactIdToGroups: { [key: number]: number[] } = {};
      contactGroups.forEach(({ contactId, groupId }) => {
        if (!contactIdToGroups[contactId]) {
          contactIdToGroups[contactId] = [];
        }
        contactIdToGroups[contactId].push(groupId);
      });

      // Fetch group details
      const groups = await Group.findAll({
        where: {
          id: Object.values(contactIdToGroups).flat(),
        },
      });

      // Map groups by groupId
      const groupIdToGroup = groups.reduce((map, group) => {
        map[group.id] = group;
        return map;
      }, {} as { [key: number]: Group });

      // Attach groups to contacts
      const contactsWithGroups = contacts.map(contact => ({
        ...contact.toJSON(),
        groups: contactIdToGroups[contact.id]?.map(groupId => groupIdToGroup[groupId]) || [],
      }));

      res.json(contactsWithGroups);
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
      const contact = await Contact.findByPk(id);
      if (!contact) {
        return res.status(404).json({ msg: 'Contact not found' });
      }

      // Fetch contact-group associations
      const contactGroups = await ContactGroup.findAll({
        where: { contactId: id },
        attributes: ['groupId'],
      });

      const groupIds = contactGroups.map(({ groupId }) => groupId);

      // Fetch group details
      const groups = await Group.findAll({
        where: { id: groupIds },
      });

      // Attach groups to contact
      const contactWithGroups = {
        ...contact.toJSON(),
        groups,
      };

      res.json(contactWithGroups);
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
    const { firstname, lastname, birthday, phone, email, userId } = req.body;

    try {
      const contact = await Contact.findByPk(id);
      if (!contact) {
        return res.status(404).json({ msg: 'Contact not found' });
      }

      if (firstname) contact.firstname = firstname;
      if (lastname) contact.lastname = lastname;
      if (birthday) contact.birthday = birthday;
      if (phone) contact.phone = phone;
      if (email) contact.email = email;
      if (userId) contact.userId = userId;

      await contact.save();
      res.json(contact);
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
      const contact = await Contact.findByPk(id);
      if (!contact) {
        return res.status(404).json({ msg: 'Contact not found' });
      }

      await contact.destroy();
      res.json({ msg: 'Contact deleted successfully' });
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
      const contacts = await Contact.findAll({ where: { userId } });

      // Fetch all contact-group associations
      const contactGroups = await ContactGroup.findAll({
        where: { contactId: contacts.map(contact => contact.id) },
        attributes: ['contactId', 'groupId'],
      });

      // Extract contactIds and groupIds
      const contactIdToGroups: { [key: number]: number[] } = {};
      contactGroups.forEach(({ contactId, groupId }) => {
        if (!contactIdToGroups[contactId]) {
          contactIdToGroups[contactId] = [];
        }
        contactIdToGroups[contactId].push(groupId);
      });

      // Fetch group details
      const groups = await Group.findAll({
        where: {
          id: Object.values(contactIdToGroups).flat(),
        },
      });

      // Map groups by groupId
      const groupIdToGroup = groups.reduce((map, group) => {
        map[group.id] = group;
        return map;
      }, {} as { [key: number]: Group });

      // Attach groups to contacts
      const contactsWithGroups = contacts.map(contact => ({
        ...contact.toJSON(),
        groups: contactIdToGroups[contact.id]?.map(groupId => groupIdToGroup[groupId]) || [],
      }));

      res.json(contactsWithGroups);
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

  // O
    // Fetch all contacts under a specific group
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
    
      // Fetch all groups under a specific contact
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
