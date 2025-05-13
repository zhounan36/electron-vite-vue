import { Trolley } from '../models/Trolley';
import { TrolleyItem } from '../models/TrolleyItem';
import { Package } from '../models/Package';
import { BaseService } from './BaseService';

export class TrolleyService extends BaseService<Trolley> {
  constructor() {
    super(Trolley);
  }

  /**
   * 获取板车及其包含的包装详情
   * @param id 板车ID
   * @returns 板车及包装详情
   */
  async getTrolleyWithItems(id: number): Promise<Trolley | null> {
    try {
      return await this.model.findByPk(id, {
        include: [
          {
            model: TrolleyItem,
            include: [Package]
          }
        ]
      });
    } catch (error: any) {
      console.error(`获取板车详情失败: ${error.message}`);
      throw new Error(`获取板车详情失败: ${error.message}`);
    }
  }

  /**
   * 创建板车及其包含的包装项
   * @param trolleyData 板车数据
   * @param items 包装项数组
   * @returns 创建的板车对象
   */
  async createWithItems(trolleyData: any, items: any[]): Promise<Trolley> {
    try {
      // 使用事务确保数据一致性
      const result = await this.model.sequelize!.transaction(async (t) => {
        // 创建板车
        const trolleyInstance = await this.model.create(trolleyData, { transaction: t });
        
        // 为每个包装项添加板车ID
        const trolleyItems = items.map(item => ({
          ...item,
          trolleyId: trolleyInstance.id
        }));
        
        // 创建板车项
        await TrolleyItem.bulkCreate(trolleyItems, { transaction: t });
        
        return trolleyInstance;
      });
      
      return result;
    } catch (error: any) {
      console.error(`创建板车及包装项失败: ${error.message}`);
      throw new Error(`创建板车及包装项失败: ${error.message}`);
    }
  }

  /**
   * 更新板车及其包装项
   * @param id 板车ID
   * @param trolleyData 板车数据
   * @param items 包装项数组
   * @returns 更新后的板车对象
   */
  async updateWithItems(id: number, trolleyData: any, items: any[]): Promise<Trolley | null> {
    try {
      return await this.model.sequelize!.transaction(async (t) => {
        // 更新板车
        await this.model.update(trolleyData, {
          where: { id } as any,
          transaction: t
        });
        
        // 删除原有的板车项
        await TrolleyItem.destroy({
          where: { trolleyId: id } as any,
          transaction: t
        });
        
        // 为每个包装项添加板车ID
        const trolleyItems = items.map(item => ({
          ...item,
          trolleyId: id
        }));
        
        // 创建新的板车项
        await TrolleyItem.bulkCreate(trolleyItems, { transaction: t });
        
        // 返回更新后的板车及包装详情
        return this.getTrolleyWithItems(id);
      });
    } catch (error: any) {
      console.error(`更新板车及包装项失败: ${error.message}`);
      throw new Error(`更新板车及包装项失败: ${error.message}`);
    }
  }

  /**
   * 删除板车及其包装项
   * @param id 板车ID
   * @returns 删除结果
   */
  async deleteWithItems(id: number): Promise<number> {
    try {
      return await this.model.sequelize!.transaction(async (t) => {
        // 删除板车项
        await TrolleyItem.destroy({
          where: { trolleyId: id } as any,
          transaction: t
        });
        
        // 删除板车
        return await this.model.destroy({
          where: { id } as any,
          transaction: t
        });
      });
    } catch (error: any) {
      console.error(`删除板车及包装项失败: ${error.message}`);
      throw new Error(`删除板车及包装项失败: ${error.message}`);
    }
  }

  /**
   * 检查板车是否超出最大容量
   * @param id 板车ID
   * @param items 待添加的包装项
   * @returns 是否超出最大容量
   */
  async checkCapacity(id: number, items: any[]): Promise<boolean> {
    try {
      const trolley = await this.findById(id);
      if (!trolley || !trolley.maxCapacity) {
        return false; // 如果没有设置最大容量，默认不超出
      }
      
      // 计算当前项目的总数
      const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      
      // 获取现有项目的总数（不包括将要更新的项目）
      const existingItems = await TrolleyItem.findAll({
        where: { trolleyId: id } as any
      });
      
      const existingTotal = existingItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // 检查总数是否超出最大容量
      return (totalQuantity + existingTotal) > trolley.maxCapacity;
    } catch (error: any) {
      console.error(`检查板车容量失败: ${error.message}`);
      throw new Error(`检查板车容量失败: ${error.message}`);
    }
  }
}

// 导出单例实例
export const trolleyService = new TrolleyService();