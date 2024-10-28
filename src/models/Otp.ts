import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Otp extends Model {
  public id!: number;
  public userId!: number;
  public otp!: string;
  public expiresAt!: Date; // Change this to Date type
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Otp.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE, // Change this to DataTypes.DATE
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'otp',
  }
);

// Define the association
Otp.belongsTo(User, { foreignKey: 'userId' });

export default Otp;
