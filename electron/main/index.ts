import { app, BrowserWindow, shell, ipcMain, Menu } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import crypto from 'crypto';
// 导入数据库模块
import { initDatabase } from './database/index';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

console.log('Preload script path:', preload);

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      nodeIntegration: false,
      contextIsolation: true, // 确保开启上下文隔离
      sandbox: true, // 为渲染进程启用沙箱
    },
  });
  Menu.setApplicationMenu(null); // #344
  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

// 设置IPC事件处理器
function setupIpcHandlers() {
  // 初始化数据库
  ipcMain.handle('init-database', async () => {
    return await initDatabase();
  });
  
  // 商品相关操作
  ipcMain.handle('goods-create', async (_, data) => {
    const { goodsService } = require('./database/serviceExports');
    return await goodsService.create(data);
  });
  
  ipcMain.handle('goods-find-all', async (_, options) => {
    const { goodsService } = require('./database/serviceExports');
    return await goodsService.findAll(options);
  });
  
  ipcMain.handle('goods-find-by-id', async (_, id) => {
    const { goodsService } = require('./database/serviceExports');
    return await goodsService.findById(id);
  });
  
  ipcMain.handle('goods-find-by-page', async (_, { page, pageSize, options }) => {
    const { goodsService } = require('./database/serviceExports');
    return await goodsService.findByPage(page, pageSize, options);
  });
  
  ipcMain.handle('goods-update', async (_, { id, data }) => {
    const { goodsService } = require('./database/serviceExports');
    return await goodsService.update(id, data);
  });
  
  ipcMain.handle('goods-delete', async (_, id) => {
    const { goodsService } = require('./database/serviceExports');
    return await goodsService.delete(id);
  });
  
  ipcMain.handle('goods-search-by-name', async (_, name) => {
    const { goodsService } = require('./database/serviceExports');
    return await goodsService.searchByName(name);
  });
  
  // 包装相关操作
  ipcMain.handle('package-create', async (_, data) => {
    const { packageService } = require('./database/serviceExports');
    return await packageService.create(data);
  });
  
  ipcMain.handle('package-create-with-items', async (_, { packageData, items }) => {
    const { packageService } = require('./database/serviceExports');
    return await packageService.createWithItems(packageData, items);
  });
  
  ipcMain.handle('package-find-all', async (_, options) => {
    const { packageService } = require('./database/serviceExports');
    return await packageService.findAll(options);
  });
  
  ipcMain.handle('package-find-by-id', async (_, id) => {
    const { packageService } = require('./database/serviceExports');
    return await packageService.findById(id);
  });
  
  ipcMain.handle('package-get-with-items', async (_, id) => {
    const { packageService } = require('./database/serviceExports');
    return await packageService.getPackageWithItems(id);
  });
  
  ipcMain.handle('package-find-by-page', async (_, { page, pageSize, options }) => {
    const { packageService } = require('./database/serviceExports');
    return await packageService.findByPage(page, pageSize, options);
  });
  
  ipcMain.handle('package-update', async (_, { id, data }) => {
    const { packageService } = require('./database/serviceExports');
    return await packageService.update(id, data);
  });
  
  ipcMain.handle('package-update-with-items', async (_, { id, packageData, items }) => {
    const { packageService } = require('./database/serviceExports');
    return await packageService.updateWithItems(id, packageData, items);
  });
  
  ipcMain.handle('package-delete', async (_, id) => {
    const { packageService } = require('./database/serviceExports');
    return await packageService.delete(id);
  });
  
  ipcMain.handle('package-delete-with-items', async (_, id) => {
    const { packageService } = require('./database/serviceExports');
    return await packageService.deleteWithItems(id);
  });
  
  // 板车相关操作
  ipcMain.handle('trolley-create', async (_, data) => {
    const { trolleyService } = require('./database/serviceExports');
    return await trolleyService.create(data);
  });
  
  ipcMain.handle('trolley-create-with-items', async (_, { trolleyData, items }) => {
    const { trolleyService } = require('./database/serviceExports');
    return await trolleyService.createWithItems(trolleyData, items);
  });
  
  ipcMain.handle('trolley-find-all', async (_, options) => {
    const { trolleyService } = require('./database/serviceExports');
    return await trolleyService.findAll(options);
  });
  
  ipcMain.handle('trolley-find-by-id', async (_, id) => {
    const { trolleyService } = require('./database/serviceExports');
    return await trolleyService.findById(id);
  });
  
  ipcMain.handle('trolley-get-with-items', async (_, id) => {
    const { trolleyService } = require('./database/serviceExports');
    return await trolleyService.getTrolleyWithItems(id);
  });
  
  ipcMain.handle('trolley-find-by-page', async (_, { page, pageSize, options }) => {
    const { trolleyService } = require('./database/serviceExports');
    return await trolleyService.findByPage(page, pageSize, options);
  });
  
  ipcMain.handle('trolley-update', async (_, { id, data }) => {
    const { trolleyService } = require('./database/serviceExports');
    return await trolleyService.update(id, data);
  });
  
  ipcMain.handle('trolley-update-with-items', async (_, { id, trolleyData, items }) => {
    const { trolleyService } = require('./database/serviceExports');
    return await trolleyService.updateWithItems(id, trolleyData, items);
  });
  
  ipcMain.handle('trolley-delete', async (_, id) => {
    const { trolleyService } = require('./database/serviceExports');
    return await trolleyService.delete(id);
  });
  
  ipcMain.handle('trolley-delete-with-items', async (_, id) => {
    const { trolleyService } = require('./database/serviceExports');
    return await trolleyService.deleteWithItems(id);
  });
  
  ipcMain.handle('trolley-check-capacity', async (_, { id, items }) => {
    const { trolleyService } = require('./database/serviceExports');
    return await trolleyService.checkCapacity(id, items);
  });
}

app.whenReady().then(async () => {
  // 初始化数据库
  await initDatabase();
  
  // 设置IPC处理器
  setupIpcHandlers();
  
  // 创建窗口
  createWindow();
});

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// 处理获取机器ID的请求
ipcMain.handle('get-machine-id', async () => {
  try {
    // 使用操作系统信息生成唯一的机器ID
    const cpus = os.cpus();
    const network = os.networkInterfaces();
    const platform = os.platform();
    const hostname = os.hostname();
    
    // 组合信息并创建简单的哈希
    const systemInfo = JSON.stringify({
      cpus: cpus.length > 0 ? cpus[0].model : '',
      network: network,
      platform,
      hostname
    });
    
    // 创建一个简单的哈希值作为机器ID
    let hash = 0;
    for (let i = 0; i < systemInfo.length; i++) {
      const char = systemInfo.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    // 转换为16进制字符串并确保长度一致
    return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  } catch (error) {
    console.error('获取机器ID时出错:', error);
    throw new Error('获取机器ID失败');
  }
});

// 处理从注册表获取值的请求
ipcMain.handle('get-registry-value', async (_, args) => {
  if (process.platform !== 'win32') {
    throw new Error('注册表操作仅在Windows平台上支持');
  }
  
  try {
    const { key, valueName } = args;
    // 在Windows平台上使用reg.exe查询注册表
    const { execSync } = require('child_process');
    const command = `reg query "${key}" /v "${valueName}"`;
    
    const result = execSync(command, { encoding: 'utf8' });
    
    // 解析注册表查询结果
    const lines = result.split('\n');
    for (const line of lines) {
      if (line.includes(valueName)) {
        const parts = line.trim().split('    '); // 注册表输出通常用多个空格分隔
        if (parts.length >= 3) {
          return parts[parts.length - 1]; // 返回值通常是最后一部分
        }
      }
    }
    throw new Error('找不到指定的注册表值');
  } catch (error) {
    console.error('读取注册表时出错:', error);
    throw new Error('无法读取注册表值');
  }
});

// 处理设置注册表值的请求
ipcMain.handle('set-registry-value', async (_, args) => {
  if (process.platform !== 'win32') {
    throw new Error('注册表操作仅在Windows平台上支持');
  }
  
  try {
    const { key, valueName, value } = args;
    // 在Windows平台上使用reg.exe设置注册表
    const { execSync } = require('child_process');
    
    // 确保注册表键存在
    try {
      execSync(`reg query "${key}"`, { encoding: 'utf8' });
    } catch (error) {
      // 如果键不存在，创建它
      execSync(`reg add "${key}" /f`, { encoding: 'utf8' });
    }
    
    // 设置注册表值
    const command = `reg add "${key}" /v "${valueName}" /d "${value}" /f`;
    execSync(command, { encoding: 'utf8' });
    
    return true;
  } catch (error) {
    console.error('写入注册表时出错:', error);
    throw new Error('无法写入注册表值');
  }
});

// 处理删除注册表值的请求
ipcMain.handle('delete-registry-value', async (_, args) => {
  if (process.platform !== 'win32') {
    throw new Error('注册表操作仅在Windows平台上支持');
  }
  
  try {
    const { key, valueName } = args;
    // 在Windows平台上使用reg.exe删除注册表值
    const { execSync } = require('child_process');
    const command = `reg delete "${key}" /v "${valueName}" /f`;
    
    execSync(command, { encoding: 'utf8' });
    return true;
  } catch (error) {
    console.error('删除注册表值时出错:', error);
    throw new Error('无法删除注册表值');
  }
});

const privateKey =`-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQChvIAIpMNWafMU
OoHrEA8hrZG4AHf/o0aVz5L451dK3h5O8266itPnVgcY5747NAK1u2s0NpSi++6P
XG+vpgZk0w67bHEw7lhRUsMFCtj9auMc1dHgZeudB0SWQorCp2xIxfObXDMx6nQM
d08iH2Xu7KbCBe8UQ/rF4vUITYFsLHQXnoCmfB6A+Rta5Wnqyx4M8FKFuCO8Tujt
nZ9W45BYIjvFlc9+5AZHi8e8xGhuc900ZxqP78Rv2C42dG/YewkZfReuLqcfpZat
QjvTwqaw7aaZzVlGayolVVo+udx5AXT+6uukkj72VS4MImw04YJAujyjh4gHwz9Q
88QW8X63AgMBAAECggEAWJ0RvSqgx8DG6OdhdSvYTohtlVXUaWDI9J3FFdCSeDeY
fYNMwLH9hfsRamjWRlOpxG5KP1JEP8QuoadwndkmGam1oaS5o6iDBROGPEYEO1yL
0KmqEvtkiyWHQ5hztFDMuFaUsSNj/U5KhOX9mmF/lNdeSmG76uuQA0nlHMZySZR2
jM/tRYQQJGfdWrg9fnhISXzLqKHyTzg6GOuzuAsWlCtlQR4TldoH6wqQe7r0MPPi
+u+38t0lEXJxK731ce3cfd8zYvxOo9RlM8COqd/40elpMpfVVG164B6nzu8WmHDs
KKosgTD6YJjyQxP6rwgATVaLloLGHw3k265U2wev+QKBgQDOJmvvJ1qPLmooqIu7
l1xohr5IqVuTvItW+sAcpLZbw1z+wjVcBrFfGkDnnSrfClU8PAMVBubi/CqRL1Xp
0vv1EaAf+7Hd1+q4JHgwa0z0eYPI/X0OP2jkR7KijoOeQWxVjOIy3zlS7wKbSOJK
GJIsfgmIIl9r3H8RBHTEBnn4xQKBgQDI2Kz5gZL6lToAXB1K1dyVf//S/vpunD0w
w9jzQG72t2RCa7yH8i/U1XtUxlIXnJIZYAGdEbxRMFJmoqRQn0G7lz9PeYKruF5/
teZEdJjIYgvlzz1ZuC+oRwq7EhY4dbZxJUoZLHyfY6Iln6pSeFjksN4Vx4eZM2ao
7gOkLSb5SwKBgGSIKCrArlEU+YBKcZpR/iabT0BwFtC9KdaJAhb13FhztW4nl44B
VY5jZzOMWdPbXiW5vmcKrp4TC08yHluhIG4q4kO2os7k9PpIDrTOHwE6ISJrPAku
syBgNqU/isAqd4Jg6g6U/YeMN2Ey8efgg6he7pcM7CvVo8HQwoC2B9VhAoGAJcWB
+kZhAtkvmEO6iolfu4nf7algJY8iftpGIbEbbTCeHVOvmA1261ren9nQNHqQi08f
3o8oUEh7JqwtpK/ep83Q7TxX072PoArwbC1VUlIGFMj9q7LU25vIq9fB8ApLLkop
/kP8h+kv5E17tZjGdvPAQG5O1QPyqZBhhO2s57MCgYAbWf/7q1uEBkYsFypZ+361
2CSgh8gXYsHLrfnfOVz+zvtuZcWN3uHZ05Kb34W5WsCptY8815BFeP1bMMnwSDav
kn3s2oN3LXzHuuIX8r0jPHNRFmr5mYB/KO3UPv9lsfFQAgfrLslFISM3hBFKcIvy
+QXmDXbWRiXtoKAlB2dV6Q==
-----END PRIVATE KEY-----`;

// 验证注册码
ipcMain.handle('validate-registration-code', async (_, args) => {
  try {
    const { machineId, registrationCode } = args;
    
    if (!machineId || !registrationCode) {
      return false;
    }
    
    try {
      // 尝试解密注册码
      const decrypted = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        }, 
        Buffer.from(registrationCode, 'base64')
      );
      
      // 解析解密后的数据
      const licenseData = JSON.parse(decrypted.toString());
      
      // 验证机器码
      if (licenseData.machineId !== machineId) {
        console.log('机器码不匹配');
        return false;
      }
      
      // 验证时间
      const now = Date.now();
      const startTime = new Date(licenseData.startTime).getTime();
      const endTime = new Date(licenseData.endTime).getTime();
      
      if (now < startTime) {
        console.log('许可证尚未生效');
        return false;
      }
      
      if (now > endTime) {
        console.log('许可证已过期');
        return false;
      }
      
      console.log('许可证验证成功');
      return true;
    } catch (error) {
      console.error('注册码验证失败:', error);
      return false;
    }
  } catch (error) {
    console.error('验证过程发生错误:', error);
    return false;
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});