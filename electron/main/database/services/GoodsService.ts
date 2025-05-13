import { Goods } from '../models/Goods';
import { BaseService } from './BaseService';
import { Op } from 'sequelize';

export class GoodsService extends BaseService<Goods> {
  constructor() {
    super(Goods);
  }

  /**
   * 根据名称搜索货物
   * @param name 货物名称
   * @returns 货物列表
   */
  async searchByName(name: string): Promise<Goods[]> {
    try {
      const where: any = {
        name: {
          [Op.like]: `%${name}%`
        }
      };
      return await this.model.findAll({ where });
    } catch (error: any) {
      console.error(`根据名称搜索货物失败: ${error.message}`);
      throw new Error(`根据名称搜索货物失败: ${error.message}`);
    }
  }
}

// 导出单例实例
export const goodsService = new GoodsService();