// filepath: c:\Users\Administrator\source\Warehouse\electron-vite-vue\electron\main\database\models\Package.ts
import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { PackageItem } from './PackageItem';

@Table({
  tableName: 'packages',
  timestamps: true
})
export class Package extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '包装名称'
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '包装描述'
  })
  description?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '包装容量限制'
  })
  capacity!: number;

  @HasMany(() => PackageItem)
  items?: PackageItem[];
}