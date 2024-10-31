import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User'; // Import the User model

class Faq extends Model {
  public id!: number;
  public question!: string;
  public answer!: string;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Faq.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
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
    tableName: 'faq',
  }
);

// Define the association

export default Faq;
