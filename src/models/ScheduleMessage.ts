import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Sender from './Sender';
import User from './User';

class ScheduleMessage extends Model {
  public id!: number;
  public recipients!: string[]; 
  public senderId!: number;
  public userId!: number;
  public content!: string;
  public messageType!: string;
  public dateScheduled!: Date;
  public timeScheduled!: Date;
  public status!: string;
  public recursion!: string; // e.g., 'daily', 'weekly', etc.
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ScheduleMessage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    recipients: {
      type: DataTypes.JSON, 
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
    dateScheduled: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    timeScheduled: {
      type: DataTypes.TIME,
      allowNull: false,
    },  status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    recursion: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'none', // Default recursion is 'none'
    },
  },
  {
    sequelize,
    tableName: 'schedule_messages',
  }
);

// Define associations
ScheduleMessage.belongsTo(Sender, { foreignKey: 'senderId' });
ScheduleMessage.belongsTo(User, { foreignKey: 'userId' });

export default ScheduleMessage;
