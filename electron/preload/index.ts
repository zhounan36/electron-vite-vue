import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// 定义电子API
const electronAPI = {
  /* 数据库初始化 */
  initDatabase: () => ipcRenderer.invoke('init-database'),
  
  /* 通用IPC通道 */
  sendMessage: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  onMessage: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    return () => {
      ipcRenderer.removeAllListeners(channel)
    }
  },
  
  /* 商品相关操作 */
  goods: {
    create: (data: any) => ipcRenderer.invoke('goods-create', data),
    findAll: (options: any = {}) => ipcRenderer.invoke('goods-find-all', options),
    findById: (id: number) => ipcRenderer.invoke('goods-find-by-id', id),
    findByPage: (page: number, pageSize: number, options: any = {}) => 
      ipcRenderer.invoke('goods-find-by-page', { page, pageSize, options }),
    update: (id: number, data: any) => ipcRenderer.invoke('goods-update', { id, data }),
    delete: (id: number) => ipcRenderer.invoke('goods-delete', id),
    searchByName: (name: string) => ipcRenderer.invoke('goods-search-by-name', name)
  },
  
  /* 包装相关操作 */
  package: {
    create: (data: any) => ipcRenderer.invoke('package-create', data),
    createWithItems: (packageData: any, items: any[]) => 
      ipcRenderer.invoke('package-create-with-items', { packageData, items }),
    findAll: (options: any = {}) => ipcRenderer.invoke('package-find-all', options),
    findById: (id: number) => ipcRenderer.invoke('package-find-by-id', id),
    getWithItems: (id: number) => ipcRenderer.invoke('package-get-with-items', id),
    findByPage: (page: number, pageSize: number, options: any = {}) => 
      ipcRenderer.invoke('package-find-by-page', { page, pageSize, options }),
    update: (id: number, data: any) => ipcRenderer.invoke('package-update', { id, data }),
    updateWithItems: (id: number, packageData: any, items: any[]) => 
      ipcRenderer.invoke('package-update-with-items', { id, packageData, items }),
    delete: (id: number) => ipcRenderer.invoke('package-delete', id),
    deleteWithItems: (id: number) => ipcRenderer.invoke('package-delete-with-items', id)
  },
  
  /* 板车相关操作 */
  trolley: {
    create: (data: any) => ipcRenderer.invoke('trolley-create', data),
    createWithItems: (trolleyData: any, items: any[]) => 
      ipcRenderer.invoke('trolley-create-with-items', { trolleyData, items }),
    findAll: (options: any = {}) => ipcRenderer.invoke('trolley-find-all', options),
    findById: (id: number) => ipcRenderer.invoke('trolley-find-by-id', id),
    getWithItems: (id: number) => ipcRenderer.invoke('trolley-get-with-items', id),
    findByPage: (page: number, pageSize: number, options: any = {}) => 
      ipcRenderer.invoke('trolley-find-by-page', { page, pageSize, options }),
    update: (id: number, data: any) => ipcRenderer.invoke('trolley-update', { id, data }),
    updateWithItems: (id: number, trolleyData: any, items: any[]) => 
      ipcRenderer.invoke('trolley-update-with-items', { id, trolleyData, items }),
    delete: (id: number) => ipcRenderer.invoke('trolley-delete', id),
    deleteWithItems: (id: number) => ipcRenderer.invoke('trolley-delete-with-items', id),
    checkCapacity: (id: number, items: any[]) => 
      ipcRenderer.invoke('trolley-check-capacity', { id, items })
  },
  
  /* 系统相关操作 */
  system: {
    getMachineId: () => ipcRenderer.invoke('get-machine-id'),
    getRegistryValue: (key: string, valueName: string) => 
      ipcRenderer.invoke('get-registry-value', { key, valueName }),
    setRegistryValue: (key: string, valueName: string, value: string) => 
      ipcRenderer.invoke('set-registry-value', { key, valueName, value }),
    deleteRegistryValue: (key: string, valueName: string) => 
      ipcRenderer.invoke('delete-registry-value', { key, valueName }),
    validateRegistrationCode: (machineId: string, registrationCode: string) => 
      ipcRenderer.invoke('validate-registration-code', { machineId, registrationCode })
  }
}

// 暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// 导出类型定义
export type ElectronAPI = typeof electronAPI

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 500)
