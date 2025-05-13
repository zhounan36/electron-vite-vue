import { Model, ModelCtor } from 'sequelize-typescript';
import { Op } from 'sequelize';

export class BaseService<T extends Model> {
  protected model: ModelCtor<T>;

  constructor(model: ModelCtor<T>) {
    this.model = model;
  }

  /**
   * 创建记录
   * @param data 数据对象
   * @returns 创建的记录
   */
  async create(data: any): Promise<T> {
    try {
      return await this.model.create(data);
    } catch (error: any) {
      console.error(`创建记录失败: ${error.message}`);
      throw new Error(`创建记录失败: ${error.message}`);
    }
  }

  /**
   * 批量创建记录
   * @param dataArray 数据对象数组
   * @returns 创建的记录数组
   */
  async bulkCreate(dataArray: any[]): Promise<T[]> {
    try {
      return await this.model.bulkCreate(dataArray);
    } catch (error: any) {
      console.error(`批量创建记录失败: ${error.message}`);
      throw new Error(`批量创建记录失败: ${error.message}`);
    }
  }

  /**
   * 根据ID查找记录
   * @param id 记录ID
   * @param options 查询选项，如include关联查询
   * @returns 查找到的记录或null
   */
  async findById(id: number, options: any = {}): Promise<T | null> {
    try {
      return await this.model.findByPk(id, options);
    } catch (error: any) {
      console.error(`查找记录失败: ${error.message}`);
      throw new Error(`查找记录失败: ${error.message}`);
    }
  }

  /**
   * 查找所有记录
   * @param options 查询选项，如条件、排序等
   * @returns 记录数组
   */
  async findAll(options: any = {}): Promise<T[]> {
    try {
      return await this.model.findAll(options);
    } catch (error: any) {
      console.error(`查找所有记录失败: ${error.message}`);
      throw new Error(`查找所有记录失败: ${error.message}`);
    }
  }

  /**
   * 分页查询
   * @param page 页码
   * @param pageSize 每页数量
   * @param options 其他查询选项
   * @returns 分页结果
   */
  async findByPage(page: number = 1, pageSize: number = 10, options: any = {}): Promise<{rows: T[], count: number}> {
    try {
      const offset = (page - 1) * pageSize;
      const { count, rows } = await this.model.findAndCountAll({
        ...options,
        offset,
        limit: pageSize
      });
      return { rows, count };
    } catch (error: any) {
      console.error(`分页查询失败: ${error.message}`);
      throw new Error(`分页查询失败: ${error.message}`);
    }
  }

  /**
   * 更新记录
   * @param id 记录ID
   * @param data 更新的数据
   * @returns 更新结果
   */
  async update(id: number, data: any): Promise<[number]> {
    try {
      const where: any = { id };
      const result = await this.model.update(data, {
        where
      });
      return result;
    } catch (error: any) {
      console.error(`更新记录失败: ${error.message}`);
      throw new Error(`更新记录失败: ${error.message}`);
    }
  }

  /**
   * 删除记录
   * @param id 记录ID
   * @returns 删除的行数
   */
  async delete(id: number): Promise<number> {
    try {
      const where: any = { id };
      return await this.model.destroy({
        where
      });
    } catch (error: any) {
      console.error(`删除记录失败: ${error.message}`);
      throw new Error(`删除记录失败: ${error.message}`);
    }
  }

  /**
   * 批量删除记录
   * @param ids ID数组
   * @returns 删除的行数
   */
  async bulkDelete(ids: number[]): Promise<number> {
    try {
      const where: any = {
        id: {
          [Op.in]: ids
        }
      };
      return await this.model.destroy({
        where
      });
    } catch (error: any) {
      console.error(`批量删除记录失败: ${error.message}`);
      throw new Error(`批量删除记录失败: ${error.message}`);
    }
  }
}