import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Package } from './Package';
// 使用前向声明来解决循环依赖问题
import { TrolleyItem } from './TrolleyItem';

@Table({
  tableName: 'trolleys',
  timestamps: true
})
export class Trolley extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '板车编号'
  })
  code!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    comment: '板车描述'
  })
  description?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: '最大容量'
  })
  maxCapacity?: number;

  @HasMany(() => TrolleyItem)
  trolleyItems?: TrolleyItem[];
}