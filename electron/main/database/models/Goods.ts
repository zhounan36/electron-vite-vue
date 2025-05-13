import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { PackageItem } from './PackageItem';

@Table({
  tableName: 'goods',
  timestamps: true
})
export class Goods extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '货物名称'
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '货物编码'
  })
  code!: string;

  @HasMany(() => PackageItem)
  packageItems?: PackageItem[];
}