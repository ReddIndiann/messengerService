import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Group extends Model {
  public id!: number;
  public groupName!: string;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Group.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'groups',
  }
);

Group.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Group, { foreignKey: 'userId' });

export default Group;
