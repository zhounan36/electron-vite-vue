// filepath: c:\Users\Administrator\source\Warehouse\electron-vite-vue\electron\main\database\models\PackageItem.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Goods } from './Goods';
import { Package } from './Package';

@Table({
  tableName: 'package_items',
  timestamps: true
})
export class PackageItem extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @ForeignKey(() => Package)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '包装ID'
  })
  packageId!: number;

  @BelongsTo(() => Package)
  package?: Package;

  @ForeignKey(() => Goods)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '货物ID'
  })
  goodsId!: number;

  @BelongsTo(() => Goods)
  goods?: Goods;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '货物数量'
  })
  quantity!: number;
}