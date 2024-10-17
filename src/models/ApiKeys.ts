import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';


class ApiKeys extends Model {
    public id!: number;
    public name!: string;
    public userId!: number;
    public apikey!: string;
    public status!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }
  

  
ApiKeys.init(
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
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: User,
          key: 'id',
        },
      },
      apikey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'disabled', // Default status is 'pending'
      },
    },
    {
      sequelize,
      tableName: 'apikeys',
    }
  );
  
  // Define the association
  ApiKeys.belongsTo(User, { foreignKey: 'userId' });
  
  export default ApiKeys;
  