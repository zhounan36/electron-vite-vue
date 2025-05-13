import { Sequelize } from "sequelize-typescript";
import path from "node:path";
import { app } from "electron";
import fs from "fs";
import sqlite3 from "sqlite3";

// 导入模型
import { Goods } from "./models/Goods";
import { Package } from "./models/Package";
import { PackageItem } from "./models/PackageItem";
import { Trolley } from "./models/Trolley";
import { TrolleyItem } from "./models/TrolleyItem";

// 导出服务
export * from './services';

// 导出服务
export * from './services';

// 导出服务
export * from './services';

// 数据库实例
let sequelize: Sequelize | null = null;

/**
 * 初始化数据库
 */
export const initDatabase = async (): Promise<string> => {
  try {
    // 确保数据库目录存在
    const dbDir = path.join(app.getPath("userData"), "database");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }    const dbPath = path.join(dbDir, "database.sqlite");    // 创建Sequelize实例    
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath, 
      models: [Package, PackageItem, Goods, Trolley, TrolleyItem], // 已导入的模型
      dialectModule: sqlite3
    });

    // 同步数据库结构
    await sequelize.sync();

    console.log("数据库初始化成功");
    return "数据库初始化成功";
  } catch (error: any) {
    console.error("数据库初始化错误:", error);
    return `数据库初始化错误: ${error.message}`;
  }
};
