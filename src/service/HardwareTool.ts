// filepath: c:\Users\Administrator\source\Warehouse\electron-vite-vue\src\service\HardwareTool.ts
import { exec } from 'child_process';
import * as os from 'os';
import * as crypto from 'crypto';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 硬件工具类，用于获取机器码和注册表值
 */
export class HardwareTool {
  /**
   * 获取机器的唯一标识码（机器码）
   * @returns 返回机器的唯一标识码
   */
  static async getMachineId(): Promise<string> {
    try {
      const cpuInfo = os.cpus()[0].model;
      const totalMem = os.totalmem();
      const hostname = os.hostname();
      const networkInterfaces = os.networkInterfaces();
      
      // 获取第一个有效的MAC地址
      let macAddress = '';
      for (const name in networkInterfaces) {
        const interfaces = networkInterfaces[name];
        if (interfaces) {
          for (const iface of interfaces) {
            if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
              macAddress = iface.mac;
              break;
            }
          }
          if (macAddress) break;
        }
      }

      // 创建机器码的原始数据
      const rawData = `${cpuInfo}-${totalMem}-${hostname}-${macAddress}`;
      
      // 使用SHA256哈希算法生成机器码
      const hash = crypto.createHash('sha256');
      hash.update(rawData);
      return hash.digest('hex');
    } catch (error) {
      console.error('获取机器码失败:', error);
      throw error;
    }
  }

  /**
   * 从注册表获取值
   * @param key 注册表键路径
   * @param valueName 值名称
   * @returns 返回注册表值
   */
  static async getRegistryValue(key: string, valueName: string): Promise<string> {
    try {
      // 仅在Windows系统上运行
      if (os.platform() !== 'win32') {
        throw new Error('此方法仅适用于Windows系统');
      }

      // 使用REG QUERY命令查询注册表值
      const { stdout } = await execAsync(`reg query "${key}" /v "${valueName}"`);
      
      // 解析输出结果
      const lines = stdout.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        // REG_SZ, REG_DWORD等类型的值通常在第二个位置
        if (parts.length >= 3 && parts[0] === valueName) {
          // 从第三个位置开始是值
          return parts.slice(2).join(' ');
        }
      }
      
      throw new Error(`未找到注册表值: ${key}\\${valueName}`);
    } catch (error) {
      console.error('获取注册表值失败:', error);
      throw error;
    }
  }

  /**
   * 写入注册表值
   * @param key 注册表键路径
   * @param valueName 值名称
   * @param valueType 值类型 (REG_SZ, REG_DWORD等)
   * @param value 要写入的值
   * @returns 是否写入成功
   */
  static async setRegistryValue(key: string, valueName: string, valueType: string, value: string): Promise<boolean> {
    try {
      // 仅在Windows系统上运行
      if (os.platform() !== 'win32') {
        throw new Error('此方法仅适用于Windows系统');
      }

      // 使用REG ADD命令添加或修改注册表值
      await execAsync(`reg add "${key}" /v "${valueName}" /t ${valueType} /d "${value}" /f`);
      return true;
    } catch (error) {
      console.error('写入注册表值失败:', error);
      throw error;
    }
  }
}