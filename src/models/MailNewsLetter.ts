import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User'; // Import the User model

class MailNewsLetter extends Model {
  public id!: number;
  public recipients!: number;
  public message!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MailNewsLetter.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    recipients: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
  },
  {
    sequelize,
    tableName: 'mailNewsLetter',
  }
);

// Define the association

export default MailNewsLetter;
