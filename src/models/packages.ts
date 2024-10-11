import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Packages extends Model {
  public id!: number;
  public name!: string;
  public type!: string;
  public price!: number;
  public rate!: number;
  public smscount!: string;
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT, // Changed to FLOAT for decimal support
        allowNull: false,
    },
    rate: {
        type: DataTypes.FLOAT, // Changed to FLOAT for decimal support
        allowNull: false,
    },
    smscount: {
        type: DataTypes.INTEGER, // Confirm if this should be INTEGER
        allowNull: false,
    },
    
    expiry:
     {
      type: DataTypes.STRING,
      allowNull: false,
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

export default Packages;
