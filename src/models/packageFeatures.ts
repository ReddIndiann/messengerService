import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Packages from './packages';

class PackagesFeatures extends Model {
  public id!: number;
  public packageid!: string;
  public rate!: number;
  public smscount!: string;
  public duration!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PackagesFeatures.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    packageid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'packages',
        key: 'id',
      },
    },
    rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    smscount: {
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
    tableName: 'packagesfeatures',
  }
);

// Define the association properly
PackagesFeatures.belongsTo(Packages, { foreignKey: 'packageid' });

export default PackagesFeatures;
