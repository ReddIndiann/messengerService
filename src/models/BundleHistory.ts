import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User'; // Import the User model
import Packages from './packages';
class BundleHistory extends Model {
  public id!: number;
//   public date_bought!: Date;
  public userId!: number;
  public packageId!: number;
  public type!: string;
  public package_name!: string;
  public creditscore!: string;
  public bonusscore!: string;
  public expiry!: Date;
  public status!: string;
  public bonusStatus!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BundleHistory.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
   // Inside BundleHistory.init
packageId: { // Corrected naming from packageid to packageId
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
        model: Packages,
        key: 'id',
    },
},
package_name: { // Changed type to STRING
    type: DataTypes.STRING,
    allowNull: false,
},

creditscore: { // Changed type to STRING
    type: DataTypes.INTEGER,
    allowNull: false,
},
bonusscore: { // Changed type to STRING
  type: DataTypes.INTEGER,
  allowNull: true,
},
    expiry: {
      type: DataTypes.DATE,
      allowNull: false,
    //   defaultValue: 'pending', // Default status is 'pending'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active', // Default status is 'pending'
      },
      bonusStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active', // Default status is 'pending'
      },
  },
  {
    sequelize,
    tableName: 'bundleHistory',
  }
);

// Define the association
BundleHistory.belongsTo(User, { foreignKey: 'userId' });
BundleHistory.belongsTo(Packages, { foreignKey: 'packageId' });

export default BundleHistory;
