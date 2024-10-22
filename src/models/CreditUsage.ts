import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CreditUsage extends Model {
  public id!: number;
  public usefirst!: string;
  public usesecond!: string;
  public usethird!: string;
  public useforth!: string;
  public usefifth!: string;
  public usesixth!: string;
  public useseveth!: string;
  public useeight!: string;
  public useninth!: string;
  public usetenth!: string;

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
      allowNull: true,
    },
    usesecond: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usethird: {
        type: DataTypes.STRING, // Changed to FLOAT for decimal support
        allowNull: true,
    },
    useforth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usefifth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usesixth: {
        type: DataTypes.STRING, // Changed to FLOAT for decimal support
        allowNull: true,
    },
    useseveth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    useeight: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    useninth: {
        type: DataTypes.STRING, // Changed to FLOAT for decimal support
        allowNull: true,
    },
    usetenth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
   
  },
  {
    sequelize,
    tableName: 'creditusage',
  }
); 

export default CreditUsage;
