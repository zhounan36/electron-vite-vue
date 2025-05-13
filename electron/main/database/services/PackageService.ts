import { Package } from '../models/Package';
import { PackageItem } from '../models/PackageItem';
import { Goods } from '../models/Goods';
import { BaseService } from './BaseService';

export class PackageService extends BaseService<Package> {
  constructor() {
    super(Package);
  }

  /**
   * 获取包装及其包含的货物详情
   * @param id 包装ID
   * @returns 包装及货物详情
   */
  async getPackageWithItems(id: number): Promise<Package | null> {
    try {
      return await this.model.findByPk(id, {
        include: [
          {
            model: PackageItem,
            include: [Goods]
          }
        ]
      });
    } catch (error: any) {
      console.error(`获取包装详情失败: ${error.message}`);
      throw new Error(`获取包装详情失败: ${error.message}`);
    }
  }

  /**
   * 创建包装及其包含的货物项
   * @param packageData 包装数据
   * @param items 货物项数组
   * @returns 创建的包装对象
   */
  async createWithItems(packageData: any, items: any[]): Promise<Package> {
    try {
      // 使用事务确保数据一致性
      const result = await this.model.sequelize!.transaction(async (t) => {
        // 创建包装
        const packageInstance = await this.model.create(packageData, { transaction: t });
        
        // 为每个货物项添加包装ID
        const packageItems = items.map(item => ({
          ...item,
          packageId: packageInstance.id
        }));
        
        // 创建包装项
        await PackageItem.bulkCreate(packageItems, { transaction: t });
        
        return packageInstance;
      });
      
      return result;
    } catch (error: any) {
      console.error(`创建包装及货物项失败: ${error.message}`);
      throw new Error(`创建包装及货物项失败: ${error.message}`);
    }
  }

  /**
   * 更新包装及其货物项
   * @param id 包装ID
   * @param packageData 包装数据
   * @param items 货物项数组
   * @returns 更新后的包装对象
   */
  async updateWithItems(id: number, packageData: any, items: any[]): Promise<Package | null> {
    try {
      return await this.model.sequelize!.transaction(async (t) => {
        // 更新包装
        await this.model.update(packageData, {
          where: { id } as any,
          transaction: t
        });
        
        // 删除原有的包装项
        await PackageItem.destroy({
          where: { packageId: id } as any,
          transaction: t
        });
        
        // 为每个货物项添加包装ID
        const packageItems = items.map(item => ({
          ...item,
          packageId: id
        }));
        
        // 创建新的包装项
        await PackageItem.bulkCreate(packageItems, { transaction: t });
        
        // 返回更新后的包装及货物详情
        return this.getPackageWithItems(id);
      });
    } catch (error: any) {
      console.error(`更新包装及货物项失败: ${error.message}`);
      throw new Error(`更新包装及货物项失败: ${error.message}`);
    }
  }

  /**
   * 删除包装及其货物项
   * @param id 包装ID
   * @returns 删除结果
   */
  async deleteWithItems(id: number): Promise<number> {
    try {
      return await this.model.sequelize!.transaction(async (t) => {
        // 删除包装项
        await PackageItem.destroy({
          where: { packageId: id } as any,
          transaction: t
        });
        
        // 删除包装
        return await this.model.destroy({
          where: { id } as any,
          transaction: t
        });
      });
    } catch (error: any) {
      console.error(`删除包装及货物项失败: ${error.message}`);
      throw new Error(`删除包装及货物项失败: ${error.message}`);
    }
  }
}

// 导出单例实例
export const packageService = new PackageService();