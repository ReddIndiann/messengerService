import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User'; // Import the User model

class Sender extends Model {
  public id!: number;
  public name!: string;
  public userId!: number;
  public purpose!: string;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Sender.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    purpose: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending', // Default status is 'pending'
    },
  },
  {
    sequelize,
    tableName: 'senders',
  }
);

// Define the association
Sender.belongsTo(User, { foreignKey: 'userId' });

export default Sender;
