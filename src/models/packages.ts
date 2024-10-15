import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Packages extends Model {
  public id!: number;
  public name!: string;
  public type!: string;
  public price!: number;
  public bonusrate!: number;
  public rate!: number;
  public smscount!: number;
  public expiry!: boolean;
  public duration!: number | null;  // Updated to allow null
  public userEntry!: boolean; 
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
      type: DataTypes.FLOAT,
      allowNull: true,  // Allow the field to be null
    },
    bonusrate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },0000000000000000000000000
    rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    smscount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    expiry: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,  // Allow null for duration
    },
    userEntry: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'packages',
  }
);

export default Packages;
