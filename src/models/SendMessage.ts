import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Sender from './Sender';
import User from './User';

class SendMessage extends Model {
  public id!: number;
  public recipients!: string[];  // Array of recipient identifiers
  public senderId!: number;
  public userId!: number;
  public content!: string;
  public messageType!: string;
  public recursion!: string; // e.g., 'daily', 'weekly', etc.
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SendMessage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    recipients: {
      type: DataTypes.JSON,  // Use JSON type to store an array of strings or numbers
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Sender,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recursion: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'none',
    },
  },
  {
    sequelize,
    tableName: 'send_messages',
  }
);

// Define associations
SendMessage.belongsTo(Sender, { foreignKey: 'senderId' });
SendMessage.belongsTo(User, { foreignKey: 'userId' });

export default SendMessage;
