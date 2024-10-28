import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class OtpReg extends Model {
  public id!: number;
  public email!: string;
  public number!: string;
  public otp!: string;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OtpReg.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [4, 6], // Example: OTP should be 4 to 6 characters long
      },
    },
    number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true, // Ensure the email is valid
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'otpreg',
    indexes: [
      { fields: ['email'] },
      { fields: ['number'] },
    ],
  }
);

// Define the association
OtpReg.belongsTo(User, { foreignKey: 'userId' });

export default OtpReg;
