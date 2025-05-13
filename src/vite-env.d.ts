/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_SERVER_URL: string
  readonly VITE_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 添加ElectronAPI类型定义
export interface ElectronAPI {
  initDatabase: () => Promise<string>;
  
  sendMessage: (channel: string, ...args: any[]) => void;
  onMessage: (channel: string, callback: Function) => void;
  
  goods: {
    create: (data: any) => Promise<any>;
    findAll: (options?: any) => Promise<any[]>;
    findById: (id: number) => Promise<any>;
    findByPage: (page: number, pageSize: number, options?: any) => Promise<{rows: any[], count: number}>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<number>;
    searchByName: (name: string) => Promise<any[]>;
  };
  
  package: {
    create: (data: any) => Promise<any>;
    createWithItems: (packageData: any, items: any[]) => Promise<any>;
    findAll: (options?: any) => Promise<any[]>;
    findById: (id: number) => Promise<any>;
    getWithItems: (id: number) => Promise<any>;
    findByPage: (page: number, pageSize: number, options?: any) => Promise<{rows: any[], count: number}>;
    update: (id: number, data: any) => Promise<any>;
    updateWithItems: (id: number, packageData: any, items: any[]) => Promise<any>;
    delete: (id: number) => Promise<number>;
    deleteWithItems: (id: number) => Promise<number>;
  };
  
  trolley: {
    create: (data: any) => Promise<any>;
    createWithItems: (trolleyData: any, items: any[]) => Promise<any>;
    findAll: (options?: any) => Promise<any[]>;
    findById: (id: number) => Promise<any>;
    getWithItems: (id: number) => Promise<any>;
    findByPage: (page: number, pageSize: number, options?: any) => Promise<{rows: any[], count: number}>;
    update: (id: number, data: any) => Promise<any>;
    updateWithItems: (id: number, trolleyData: any, items: any[]) => Promise<any>;
    delete: (id: number) => Promise<number>;
    deleteWithItems: (id: number) => Promise<number>;
    checkCapacity: (id: number, items: any[]) => Promise<boolean>;
  };
  
  system: {
    getMachineId: () => Promise<string>;
    getRegistryValue: (key: string, valueName: string) => Promise<string>;
    setRegistryValue: (key: string, valueName: string, value: string) => Promise<boolean>;
    deleteRegistryValue: (key: string, valueName: string) => Promise<boolean>;
    validateRegistrationCode: (machineId: string, registrationCode: string) => Promise<boolean>;
  };
}

interface Window {
  electronAPI: ElectronAPI;
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
}
