import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'items',
  timestamps: true
})
export class Item extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '物品名称'
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '物品描述'
  })
  description!: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
    comment: '物品数量'
  })
  quantity!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '所在位置'
  })
  location!: string;
}