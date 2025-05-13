import { Goods } from '../database/models/Goods';

export class WarehouseService {
  /**
   * 获取所有货物列表
   */
  async getAllGoods() {
    try {
      return await Goods.findAll();
    } catch (error) {
      console.error('获取货物列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取货物
   * @param id 货物ID
   */
  async getGoodsById(id: number) {
    try {
      return await Goods.findByPk(id);
    } catch (error) {
      console.error(`获取货物(ID: ${id})失败:`, error);
      throw error;
    }
  }

  /**
   * 添加新货物
   * @param goodsData 货物数据
   */
  async addGoods(goodsData: Partial<Goods>) {
    try {
      return await Goods.create(goodsData);
    } catch (error) {
      console.error('添加货物失败:', error);
      throw error;
    }
  }

  /**
   * 更新货物信息
   * @param id 货物ID
   * @param goodsData 货物数据
   */
  async updateGoods(id: number, goodsData: Partial<Goods>) {
    try {
      const goods = await Goods.findByPk(id);
      if (!goods) {
        throw new Error(`货物(ID: ${id})不存在`);
      }
      return await goods.update(goodsData);
    } catch (error) {
      console.error(`更新货物(ID: ${id})失败:`, error);
      throw error;
    }
  }

  /**
   * 删除货物
   * @param id 货物ID
   */
  async deleteGoods(id: number) {
    try {
      const goods = await Goods.findByPk(id);
      if (!goods) {
        throw new Error(`货物(ID: ${id})不存在`);
      }
      await goods.destroy();
      return true;
    } catch (error) {
      console.error(`删除货物(ID: ${id})失败:`, error);
      throw error;
    }
  }

  /**
   * 入库操作
   * @param id 货物ID
   * @param quantity 入库数量
   */
  async stockIn(id: number, quantity: number) {
    try {
      const goods = await Goods.findByPk(id);
      if (!goods) {
        throw new Error(`货物(ID: ${id})不存在`);
      }
      goods.quantity += quantity;
      await goods.save();
      return goods;
    } catch (error) {
      console.error(`货物入库操作失败(ID: ${id}):`, error);
      throw error;
    }
  }

  /**
   * 出库操作
   * @param id 货物ID
   * @param quantity 出库数量
   */
  async stockOut(id: number, quantity: number) {
    try {
      const goods = await Goods.findByPk(id);
      if (!goods) {
        throw new Error(`货物(ID: ${id})不存在`);
      }
      if (goods.quantity < quantity) {
        throw new Error('库存不足');
      }
      goods.quantity -= quantity;
      await goods.save();
      return goods;
    } catch (error) {
      console.error(`货物出库操作失败(ID: ${id}):`, error);
      throw error;
    }
  }

  /**
   * 根据条件查询货物
   * @param query 查询条件
   */
  async searchGoods(query: any) {
    try {
      return await Goods.findAll({
        where: query
      });
    } catch (error) {
      console.error('查询货物失败:', error);
      throw error;
    }
  }
}