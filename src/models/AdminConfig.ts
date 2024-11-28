import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User'; // Import the User model

class AdminConfig extends Model {
  public id!: number;
  public messagingEndpoint!: string;
  public messagingApiKey!: string;
  public emailUser!: string;
  public emailPassword!: string;

  public mailHost!: string;
  public mailport!: string;  
   public contactPerson!: string;
  public userInitialAmount!: number; 

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AdminConfig.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    messagingEndpoint: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    messagingApiKey: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    emailUser: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mailHost: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true,
  },
    mailport: {
        type: DataTypes.STRING,  // Changed 'NUMBER' to 'INTEGER'
        allowNull: true,
    },
    userInitialAmount: {
        type: DataTypes.INTEGER,  // Changed 'NUMBER' to 'INTEGER'
        allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'adminConfig',
  }
);

export default AdminConfig;
