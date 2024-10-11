import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User'; // Import the User model

class Packages extends Model {
  public id!: number;
  public name!: string;
  public type!: string;
  public price!: number;
  public expiry!: string;
  public duration!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Packages.init(
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
    // userId: {
    //   type: DataTypes.INTEGER.UNSIGNED,
    //   allowNull: false,
    //   references: {
    //     model: User,
    //     key: 'id',
    //   },
    // },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expiry: {
      type: DataTypes.STRING,
      allowNull: false,
    //   defaultValue: 'pending', // Default status is 'pending'
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
  },
  {
    sequelize,
    tableName: 'packages',
  }
);

// Define the association
// Packages.belongsTo(User, { foreignKey: 'userId' });

export default Packages;
