import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User'; // Import the User model

class WalletHistory extends Model {
  public id!: number;
  public transactionid!: string;
  public userId!: number;
  public amount!: number;
  public note!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WalletHistory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    transactionid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: false,
    //   defaultValue: 'pending', // Default status is 'pending'
    },
  },
  {
    sequelize,
    tableName: 'wallethistory',
  }
);

// Define the association
WalletHistory.belongsTo(User, { foreignKey: 'userId' });

export default WalletHistory;
