import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User'; // Import the User model

class MailSubscription extends Model {
  public id!: number;
  public email!: string;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MailSubscription.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
  
  

   
  },
  {
    sequelize,
    tableName: 'mailsub',
  }
);

// Define the association

export default MailSubscription;
