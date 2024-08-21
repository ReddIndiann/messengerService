import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Contact from './Contact';
import Group from './Group';

class ContactGroup extends Model {
  public id!: number;
  public contactId!: number;
  public groupId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ContactGroup.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    contactId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'contacts',
        key: 'id',
      },
    },
    groupId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'contact_groups',
  }
);

ContactGroup.belongsTo(Contact, { foreignKey: 'contactId' });
ContactGroup.belongsTo(Group, { foreignKey: 'groupId' });
Contact.hasMany(ContactGroup, { foreignKey: 'contactId' });
Group.hasMany(ContactGroup, { foreignKey: 'groupId' });

export default ContactGroup;
