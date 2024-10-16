import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CreditUsageOrder extends Model {
  public id!: number;
  public name!: string;
  public comment!: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CreditUsageOrder.init(
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
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  
   
  },
  {
    sequelize,
    tableName: 'creditusageorder',
  }
); 

export default CreditUsageOrder;
