import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public number!: string;
  public role!: string;
  public walletbalance!: number;
  public expirybalance!: number;
  public nonexpirybalance!: number;
  public bonusbalance!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'admin', // Default role is set to 'user'
    },
    walletbalance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    expirybalance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    nonexpirybalance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bonusbalance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;
