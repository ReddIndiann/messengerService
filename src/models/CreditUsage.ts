import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CreditUsage extends Model {
  public id!: number;
  public usefirst!: string;
  public usesecond!: string;
  public usethird!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CreditUsage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    usefirst: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usesecond: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usethird: {
        type: DataTypes.STRING, // Changed to FLOAT for decimal support
        allowNull: false,
    },
   
  },
  {
    sequelize,
    tableName: 'creditusage',
  }
);

export default CreditUsage;
