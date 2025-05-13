import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Package } from './Package';
import { Trolley } from './Trolley';

@Table({
  tableName: 'trolley_items',
  timestamps: true
})
export class TrolleyItem extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @ForeignKey(() => Trolley)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '板车ID'
  })
  trolleyId!: number;

  @BelongsTo(() => Trolley)
  trolley?: Trolley;

  @ForeignKey(() => Package)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '包装ID'
  })
  packageId!: number;

  @BelongsTo(() => Package)
  package?: Package;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '包装数量'
  })
  quantity!: number;
}